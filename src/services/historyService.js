import {
  classifyMetric,
  METRIC_DEFINITIONS,
  resolveKbRecord,
} from './evaluationEngine.js';

/**
 * Computes deltas (vs yesterday, 7d average, 30d average) and time-series slices
 * for each of the 6 biomarkers across the 180-day immutable telemetry dataset.
 */
export function computeMetricHistories(telemetry, selectedDay, liveDemoOverrides = {}) {
  const safeDay = Math.max(1, Math.min(telemetry.length, selectedDay));
  const upToSelected = telemetry.slice(0, safeDay);
  const currentEntry = telemetry[safeDay - 1];
  const prevEntry = safeDay > 1 ? telemetry[safeDay - 2] : null;

  const getVal = (entry, key) => {
    if (
      entry.mission_day === safeDay &&
      liveDemoOverrides &&
      Object.prototype.hasOwnProperty.call(liveDemoOverrides, key) &&
      liveDemoOverrides[key] !== null &&
      liveDemoOverrides[key] !== undefined
    ) {
      return liveDemoOverrides[key];
    }
    return entry.metrics[key];
  };

  const result = {};

  Object.keys(METRIC_DEFINITIONS).forEach((key) => {
    const currentValue = getVal(currentEntry, key);
    const prevValue = prevEntry ? getVal(prevEntry, key) : null;
    const prevDelta = prevValue !== null ? Number((currentValue - prevValue).toFixed(2)) : 0;

    const slice7 = upToSelected.slice(-7);
    const avg7d =
      slice7.reduce((sum, item) => sum + getVal(item, key), 0) / slice7.length;
    const delta7d = Number((currentValue - avg7d).toFixed(2));

    const slice30 = upToSelected.slice(-30);
    const avg30d =
      slice30.reduce((sum, item) => sum + getVal(item, key), 0) / slice30.length;
    const delta30d = Number((currentValue - avg30d).toFixed(2));

    const toPoint = (item) => ({
      day: item.mission_day,
      value: getVal(item, key),
      isLiveOverride:
        item.mission_day === safeDay &&
        liveDemoOverrides?.[key] !== null &&
        liveDemoOverrides?.[key] !== undefined,
      aredCompleted: item.ared_workout_completed,
      spe: item.solar_particle_event,
    });

    const series1d = (prevEntry ? [prevEntry, currentEntry] : [currentEntry]).map(toPoint);
    const series7d = slice7.map(toPoint);
    const series30d = slice30.map(toPoint);
    const series180d = telemetry.map((item) => ({
      ...toPoint(item),
      isFuture: item.mission_day > safeDay,
    }));

    result[key] = {
      key,
      currentValue,
      prevValue,
      prevDelta,
      avg7d: Number(avg7d.toFixed(2)),
      delta7d,
      avg30d: Number(avg30d.toFixed(2)),
      delta30d,
      series: {
        '1d': series1d,
        '7d': series7d,
        '30d': series30d,
        '180d': series180d,
      },
    };
  });

  return result;
}

/**
 * Generates the historical alert log from Day 1 up to `selectedDay`,
 * classifying resolution status (`Activa Hoy`, `En Monitoreo`, `Resuelta`)
 * and mapping each record to verified NASA/CSA IDs & URLs.
 */
export function buildMissionAlertLog(
  telemetry,
  selectedDay,
  thresholds,
  knowledgeBase,
  liveDemoOverrides = {}
) {
  const safeDay = Math.max(1, Math.min(telemetry.length, selectedDay));
  const upToSelected = telemetry.slice(0, safeDay);
  const currentEntry = telemetry[safeDay - 1];

  const kbMap = {
    spe: resolveKbRecord(knowledgeBase, 'CSA-RAD-009') || resolveKbRecord(knowledgeBase, 'CSA-RAD-006'),
    radWarn: resolveKbRecord(knowledgeBase, 'CSA-RAD-005'),
    ared: resolveKbRecord(knowledgeBase, 'HRP-RISK-011'),
    co2: resolveKbRecord(knowledgeBase, 'HRP-HAZ-006'),
    sleep: resolveKbRecord(knowledgeBase, 'HRP-RISK-014'),
    pvt: resolveKbRecord(knowledgeBase, 'HRP-RISK-014'),
    hr: resolveKbRecord(knowledgeBase, 'HRP-RISK-003'),
  };

  // Helper to check if a given stressor is still active on `selectedDay`
  const currentEffectivePvt =
    liveDemoOverrides?.pvt_reaction_ms ?? currentEntry.metrics.pvt_reaction_ms;

  const isTypeActiveToday = {
    spe: currentEntry.solar_particle_event === true,
    radWarn:
      !currentEntry.solar_particle_event &&
      classifyMetric(
        'cumulative_radiation_msv',
        currentEntry.metrics.cumulative_radiation_msv,
        thresholds,
        currentEntry
      ) !== 'optimal',
    ared: currentEntry.ared_workout_completed === false,
    co2:
      classifyMetric('cabin_co2_mmhg', currentEntry.metrics.cabin_co2_mmhg, thresholds) !==
      'optimal',
    sleep:
      classifyMetric('sleep_hours', currentEntry.metrics.sleep_hours, thresholds) !== 'optimal',
    pvt: classifyMetric('pvt_reaction_ms', currentEffectivePvt, thresholds) !== 'optimal',
    hr:
      classifyMetric('resting_heart_rate', currentEntry.metrics.resting_heart_rate, thresholds) !==
      'optimal',
  };

  const logs = [];

  upToSelected.forEach((entry) => {
    const d = entry.mission_day;
    const isToday = d === safeDay;
    const m = entry.metrics;
    const pvtVal = isToday ? currentEffectivePvt : m.pvt_reaction_ms;

    const resolveStatus = (typeKey) => {
      if (isToday) return 'Activa Hoy';
      if (isTypeActiveToday[typeKey]) return 'En Monitoreo';
      return 'Resuelta';
    };

    if (entry.solar_particle_event) {
      logs.push({
        id: `d${d}-spe`,
        day: d,
        typeKey: 'spe',
        indicator: 'Tormenta Solar SPE / Neutrones',
        valueText: `${m.cumulative_radiation_msv.toFixed(1)} mSv · Radi-N2 ${m.daily_neutron_msv.toFixed(
          2
        )} mSv/d`,
        severity: 'critical',
        status: resolveStatus('spe'),
        kbRecord: kbMap.spe,
        note: 'Protocolo ALARA activado; evitar EVA y reforzar blindaje interno.',
      });
    } else if (m.cumulative_radiation_msv > thresholds.cumulative_radiation_msv.warning_max) {
      // Log milestone days when crossing threshold or on today / every 10d to keep log clear & useful
      const prevRad = d > 1 ? telemetry[d - 2].metrics.cumulative_radiation_msv : 0;
      if (prevRad <= thresholds.cumulative_radiation_msv.warning_max || isToday) {
        logs.push({
          id: `d${d}-rad`,
          day: d,
          typeKey: 'radWarn',
          indicator: 'Radiación Acumulada (>120 mSv)',
          valueText: `${m.cumulative_radiation_msv.toFixed(2)} mSv`,
          severity:
            m.cumulative_radiation_msv >= thresholds.cumulative_radiation_msv.critical_max
              ? 'critical'
              : 'warning',
          status: resolveStatus('radWarn'),
          kbRecord: kbMap.radWarn,
          note: 'Seguimiento de límites de exposición CSA/ICRP en tránsito profundo.',
        });
      }
    }

    if (!entry.ared_workout_completed) {
      logs.push({
        id: `d${d}-ared`,
        day: d,
        typeKey: 'ared',
        indicator: 'Entrenamiento ARED Omitido',
        valueText: `BMD ${m.bone_density_index.toFixed(2)}%`,
        severity: 'warning',
        status: resolveStatus('ared'),
        kbRecord: kbMap.ared,
        note: 'Riesgo de desmineralización ósea progresiva sin carga resistiva.',
      });
    }

    const co2St = classifyMetric('cabin_co2_mmhg', m.cabin_co2_mmhg, thresholds);
    if (co2St !== 'optimal') {
      logs.push({
        id: `d${d}-co2`,
        day: d,
        typeKey: 'co2',
        indicator: 'CO₂ Elevado en Cabina',
        valueText: `${m.cabin_co2_mmhg.toFixed(2)} mmHg`,
        severity: co2St,
        status: resolveStatus('co2'),
        kbRecord: kbMap.co2,
        note: 'Revisar depuradores CDRA y ventilación en módulos habitables.',
      });
    }

    const sleepSt = classifyMetric('sleep_hours', m.sleep_hours, thresholds);
    if (sleepSt !== 'optimal') {
      logs.push({
        id: `d${d}-sleep`,
        day: d,
        typeKey: 'sleep',
        indicator: 'Déficit de Sueño',
        valueText: `${m.sleep_hours.toFixed(1)} h`,
        severity: sleepSt,
        status: resolveStatus('sleep'),
        kbRecord: kbMap.sleep,
        note: 'Reforzar iluminación circadiana ámbar/nocturna y bloque de descanso.',
      });
    }

    const pvtSt = classifyMetric('pvt_reaction_ms', pvtVal, thresholds);
    if (pvtSt !== 'optimal') {
      logs.push({
        id: `d${d}-pvt`,
        day: d,
        typeKey: 'pvt',
        indicator:
          isToday && liveDemoOverrides?.pvt_reaction_ms != null
            ? 'Fatiga Cognitiva PVT (Demo en Vivo)'
            : 'Fatiga Cognitiva (PVT)',
        valueText: `${Math.round(pvtVal)} ms`,
        severity: pvtSt,
        status: resolveStatus('pvt'),
        kbRecord: kbMap.pvt,
        note: 'Posponer tareas críticas de precisión hasta recuperar latencia ≤ 285 ms.',
      });
    }

    const hrSt = classifyMetric('resting_heart_rate', m.resting_heart_rate, thresholds);
    if (hrSt !== 'optimal') {
      logs.push({
        id: `d${d}-hr`,
        day: d,
        typeKey: 'hr',
        indicator: 'Pulso en Reposo Elevado',
        valueText: `${m.resting_heart_rate} bpm`,
        severity: hrSt,
        status: resolveStatus('hr'),
        kbRecord: kbMap.hr,
        note: 'Correlacionado con estrés de cabina o ausencia de ARED; hidratar y monitorear.',
      });
    }
  });

  // Sort most recent mission day first, critical before warning
  const sevRank = { critical: 0, warning: 1, optimal: 2 };
  return logs.sort((a, b) => {
    if (b.day !== a.day) return b.day - a.day;
    return sevRank[a.severity] - sevRank[b.severity];
  });
}
