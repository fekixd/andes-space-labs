export const HAZARD_META = {
  radiation: {
    id: 'radiation',
    label: 'Radiación Espacial',
    shortLabel: 'Radiación',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  },
  altered_gravity: {
    id: 'altered_gravity',
    label: 'Gravedad Alterada',
    shortLabel: 'Gravedad / ARED',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  hostile_environment: {
    id: 'hostile_environment',
    label: 'Ambiente Hostil / CO₂',
    shortLabel: 'Cabina / CO₂',
    badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  },
  isolation_behavioral: {
    id: 'isolation_behavioral',
    label: 'Aislamiento y Ritmo Circadiano',
    shortLabel: 'Sueño / Cognición',
    badgeClass: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  },
  distance: {
    id: 'distance',
    label: 'Distancia de la Tierra',
    shortLabel: 'Autonomía / Retardo',
    badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  },
  general_human_research: {
    id: 'general_human_research',
    label: 'Investigación Humana',
    shortLabel: 'Ciencia ISS',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
};

export const DEMO_MILESTONES = [
  {
    day: 25,
    label: 'Día 25 (Nominal)',
    shortTag: 'Día 25',
    badge: 'Óptimo',
    tone: 'emerald',
    description: 'Línea base saludable con ARED completo y sueño normal.',
  },
  {
    day: 98,
    label: 'Día 98 (Sin Ejercicio ARED / Riesgo Óseo)',
    shortTag: 'Día 98',
    badge: 'Riesgo Óseo',
    tone: 'amber',
    description: '14 días sin carga resistiva ARED y frecuencia cardíaca en aumento.',
  },
  {
    day: 112,
    label: 'Día 112 (Tormenta Solar SPE / Alerta Radiación)',
    shortTag: 'Día 112',
    badge: 'Tormenta SPE',
    tone: 'rose',
    description: 'Evento de partículas solares activo y pico de neutrones Radi-N2.',
  },
  {
    day: 145,
    label: 'Día 145 (Pico CO2 + Déficit de Sueño + Fatiga Cognitiva)',
    shortTag: 'Día 145',
    badge: 'Crisis Multi-Factor',
    tone: 'orange',
    description: 'Hipercapnia en cabina (4.19 mmHg), 5.8h de sueño y PVT 396 ms.',
  },
];

// Priority KB record IDs to surface at the top when specific stressors trigger
const PRIORITY_IDS_BY_STRESSOR = {
  spe: ['CSA-RAD-009', 'CSA-RAD-010', 'CSA-RAD-006', 'CSA-RAD-004', 'HRP-HAZ-002', 'HRP-RISK-017'],
  radiation: ['CSA-RAD-005', 'CSA-RAD-008', 'CSA-RAD-009', 'CSA-RAD-010', 'HRP-RISK-017', 'HRP-HAZ-002'],
  boneAred: ['HRP-RISK-011', 'HRP-RISK-009', 'HRP-RES-011', 'HRP-RISK-003', 'HRP-HAZ-005'],
  co2: ['HRP-HAZ-006', 'HRP-RISK-006', 'HRP-RISK-008', 'HRP-RES-003'],
  sleepPvt: ['HRP-RISK-014', 'HRP-RISK-012', 'HRP-RES-010', 'HRP-RES-009', 'HRP-RES-008', 'HRP-HAZ-003'],
  distance: ['HRP-HAZ-004', 'CSA-SCI-003', 'HRP-RISK-015'],
  nominal: ['HRP-HAZ-001', 'HRP-RES-010', 'HRP-RES-009', 'HRP-RISK-009', 'HRP-RISK-014', 'CSA-RAD-006'],
};

/**
 * Evaluates a single mission day against official NASA/CSA clinical thresholds.
 */
export function evaluateTelemetryDay(dayData, thresholds, knowledgeBase, livePvtMs = null) {
  if (!dayData || !thresholds) {
    return null;
  }

  const rawMetrics = dayData.metrics;
  const effectivePvt = livePvtMs !== null ? livePvtMs : rawMetrics.pvt_reaction_ms;
  const isLivePvtOverride = livePvtMs !== null;

  // 1. Bone Density Index (%): optimal_min 97.0, warning_min 93.0
  // Note: If ARED workout is skipped, flag warning proactively because resorption accelerates (-0.04%/day)
  let boneStatus = 'optimal';
  let boneNote = 'Carga mecánica ARED cumplida · Remodelación ósea estable';
  if (rawMetrics.bone_density_index < thresholds.bone_density_index.warning_min) {
    boneStatus = 'critical';
    boneNote = 'Pérdida ósea crítica (< 93%) · Riesgo severo de fractura';
  } else if (
    rawMetrics.bone_density_index < thresholds.bone_density_index.optimal_min ||
    !dayData.ared_workout_completed
  ) {
    boneStatus = 'warning';
    boneNote = !dayData.ared_workout_completed
      ? 'ARED omitido hoy · Desmineralización acelerada (-0.04%/día)'
      : 'Por debajo del umbral óptimo (97.0%) · Reforzar protocolo ARED';
  }

  // 2. Resting Heart Rate (bpm): optimal_max 78, warning_max 88
  let hrStatus = 'optimal';
  let hrNote = 'Tono autonómico cardiovascular en rango nominal';
  if (rawMetrics.resting_heart_rate > thresholds.resting_heart_rate.warning_max) {
    hrStatus = 'critical';
    hrNote = 'Taquicardia de reposo (> 88 bpm) · Estrés fisiológico o deshidratación';
  } else if (rawMetrics.resting_heart_rate > thresholds.resting_heart_rate.optimal_max) {
    hrStatus = 'warning';
    hrNote = 'Pulso en reposo elevado (> 78 bpm) · Posible desacondicionamiento';
  }

  // 3. Cumulative Radiation (mSv) + SPE + Neutron dose
  let radStatus = 'optimal';
  let radNote = `Flujo neutrónico diario: ${rawMetrics.daily_neutron_msv.toFixed(2)} mSv (~30% GCR)`;
  if (
    dayData.solar_particle_event ||
    rawMetrics.cumulative_radiation_msv >= thresholds.cumulative_radiation_msv.critical_max
  ) {
    radStatus = 'critical';
    radNote = dayData.solar_particle_event
      ? `¡TORMENTA SOLAR SPE ACTIVA! Neutrones Radi-N2 en ${rawMetrics.daily_neutron_msv.toFixed(2)} mSv/día`
      : 'Dosis acumulada supera límite crítico (250 mSv)';
  } else if (rawMetrics.cumulative_radiation_msv > thresholds.cumulative_radiation_msv.warning_max) {
    radStatus = 'warning';
    radNote = `Dosis acumulada en zona de precaución (> 120 mSv) · Neutrones: ${rawMetrics.daily_neutron_msv.toFixed(2)} mSv`;
  }

  // 4. Cabin CO2 (mmHg): optimal_max 2.5, warning_max 3.5
  let co2Status = 'optimal';
  let co2Note = 'Depuradores CDRA nominales · Ventilación limpia';
  if (rawMetrics.cabin_co2_mmhg > thresholds.cabin_co2_mmhg.warning_max) {
    co2Status = 'critical';
    co2Note = 'Hipercapnia de cabina (> 3.5 mmHg) · Produce cefalea y lentitud cognitiva';
  } else if (rawMetrics.cabin_co2_mmhg > thresholds.cabin_co2_mmhg.optimal_max) {
    co2Status = 'warning';
    co2Note = 'CO₂ en ascenso (> 2.5 mmHg) · Revisar flujo de aire en módulo';
  }

  // 5. Sleep Hours (h): optimal_min 7.0, warning_min 6.0
  let sleepStatus = 'optimal';
  let sleepNote = 'Arquitectura de sueño reparador sincronizada (≥ 7.0 h)';
  if (rawMetrics.sleep_hours < thresholds.sleep_hours.warning_min) {
    sleepStatus = 'critical';
    sleepNote = 'Déficit agudo de sueño (< 6.0 h) · Deuda circadiana acumulada';
  } else if (rawMetrics.sleep_hours < thresholds.sleep_hours.optimal_min) {
    sleepStatus = 'warning';
    sleepNote = 'Sueño insuficiente (< 7.0 h) · Reforzar fase LED ámbar/nocturna';
  }

  // 6. PVT Reaction Time (ms): optimal_max 285, warning_max 345
  let pvtStatus = 'optimal';
  let pvtNote = isLivePvtOverride
    ? 'Medición en vivo (Micro-Test 10s) dentro de rango de alerta óptima'
    : 'Vigilancia psicomotora óptima (≤ 285 ms)';
  if (effectivePvt > thresholds.pvt_reaction_ms.warning_max) {
    pvtStatus = 'critical';
    pvtNote = isLivePvtOverride
      ? 'Test en vivo (> 345 ms): Fatiga cognitiva significativa detectada'
      : 'Fatiga cognitiva severa (> 345 ms) · No apto para EVA o maniobras críticas';
  } else if (effectivePvt > thresholds.pvt_reaction_ms.optimal_max) {
    pvtStatus = 'warning';
    pvtNote = isLivePvtOverride
      ? 'Test en vivo (> 285 ms): Leve desaceleración psicomotora'
      : 'Latencia psicomotora en precaución (> 285 ms) · Micro-pausa recomendada';
  }

  const biomarkers = [
    {
      key: 'bone_density_index',
      title: 'Densidad Ósea (BMD)',
      value: rawMetrics.bone_density_index,
      formattedValue: rawMetrics.bone_density_index.toFixed(2),
      unit: thresholds.bone_density_index.unit,
      status: boneStatus,
      hazard: thresholds.bone_density_index.hazard,
      thresholdLabel: `Óptimo ≥ ${thresholds.bone_density_index.optimal_min}% · Alerta < ${thresholds.bone_density_index.warning_min}%`,
      note: boneNote,
      progressPct: Math.min(100, Math.max(8, ((rawMetrics.bone_density_index - 90) / 10) * 100)),
      extraTag: dayData.ared_workout_completed ? 'ARED OK' : 'ARED OMITIDO',
    },
    {
      key: 'resting_heart_rate',
      title: 'Frecuencia Cardíaca Reposo',
      value: rawMetrics.resting_heart_rate,
      formattedValue: String(rawMetrics.resting_heart_rate),
      unit: thresholds.resting_heart_rate.unit,
      status: hrStatus,
      hazard: thresholds.resting_heart_rate.hazard,
      thresholdLabel: `Óptimo ≤ ${thresholds.resting_heart_rate.optimal_max} bpm · Crítico > ${thresholds.resting_heart_rate.warning_max} bpm`,
      note: hrNote,
      progressPct: Math.min(100, Math.max(10, ((rawMetrics.resting_heart_rate - 45) / 55) * 100)),
      extraTag: hrStatus === 'optimal' ? 'Vagal Estable' : 'Estrés Cardíaco',
    },
    {
      key: 'cumulative_radiation_msv',
      title: 'Radiación Acumulada & Neutrones',
      value: rawMetrics.cumulative_radiation_msv,
      formattedValue: rawMetrics.cumulative_radiation_msv.toFixed(2),
      unit: thresholds.cumulative_radiation_msv.unit,
      status: radStatus,
      hazard: thresholds.cumulative_radiation_msv.hazard,
      thresholdLabel: `Precaución > ${thresholds.cumulative_radiation_msv.warning_max} mSv · Crítico ≥ ${thresholds.cumulative_radiation_msv.critical_max} mSv`,
      note: radNote,
      progressPct: Math.min(
        100,
        Math.max(5, (rawMetrics.cumulative_radiation_msv / thresholds.cumulative_radiation_msv.critical_max) * 100)
      ),
      extraTag: `Radi-N2: ${rawMetrics.daily_neutron_msv.toFixed(2)} mSv/d`,
    },
    {
      key: 'cabin_co2_mmhg',
      title: 'CO₂ en Cabina (ppCO₂)',
      value: rawMetrics.cabin_co2_mmhg,
      formattedValue: rawMetrics.cabin_co2_mmhg.toFixed(2),
      unit: thresholds.cabin_co2_mmhg.unit,
      status: co2Status,
      hazard: thresholds.cabin_co2_mmhg.hazard,
      thresholdLabel: `Óptimo ≤ ${thresholds.cabin_co2_mmhg.optimal_max} mmHg · Crítico > ${thresholds.cabin_co2_mmhg.warning_max} mmHg`,
      note: co2Note,
      progressPct: Math.min(100, Math.max(10, (rawMetrics.cabin_co2_mmhg / 5.0) * 100)),
      extraTag: co2Status === 'critical' ? 'Hipercapnia' : 'CDRA Activo',
    },
    {
      key: 'sleep_hours',
      title: 'Sueño Nocturno Terrestre',
      value: rawMetrics.sleep_hours,
      formattedValue: rawMetrics.sleep_hours.toFixed(1),
      unit: thresholds.sleep_hours.unit,
      status: sleepStatus,
      hazard: thresholds.sleep_hours.hazard,
      thresholdLabel: `Óptimo ≥ ${thresholds.sleep_hours.optimal_min} h · Crítico < ${thresholds.sleep_hours.warning_min} h`,
      note: sleepNote,
      progressPct: Math.min(100, Math.max(10, (rawMetrics.sleep_hours / 9.0) * 100)),
      extraTag: sleepStatus === 'optimal' ? 'Circadiano OK' : 'Déficit Sueño',
    },
    {
      key: 'pvt_reaction_ms',
      title: 'Vigilancia Cognitiva (PVT)',
      value: effectivePvt,
      formattedValue: String(Math.round(effectivePvt)),
      unit: thresholds.pvt_reaction_ms.unit,
      status: pvtStatus,
      hazard: thresholds.pvt_reaction_ms.hazard,
      thresholdLabel: `Óptimo ≤ ${thresholds.pvt_reaction_ms.optimal_max} ms · Crítico > ${thresholds.pvt_reaction_ms.warning_max} ms`,
      note: pvtNote,
      progressPct: Math.min(100, Math.max(10, ((effectivePvt - 150) / 300) * 100)),
      extraTag: isLivePvtOverride ? 'LIVE TEST OVERRIDE' : `Base: ${rawMetrics.pvt_reaction_ms} ms`,
      isLiveOverride: isLivePvtOverride,
    },
  ];

  // Collect active hazard categories based on anomalous biomarkers + mission state
  // Push critical stressors before warning stressors so top countermeasures match the sharpest acute crisis
  const activeHazardsSet = new Set();
  const criticalPriorityIds = [];
  const warningPriorityIds = [];

  if (dayData.solar_particle_event || radStatus !== 'optimal') {
    activeHazardsSet.add('radiation');
    if (dayData.solar_particle_event || radStatus === 'critical') {
      criticalPriorityIds.push(...PRIORITY_IDS_BY_STRESSOR.spe);
    } else {
      warningPriorityIds.push(...PRIORITY_IDS_BY_STRESSOR.radiation);
    }
  }

  if (co2Status !== 'optimal') {
    activeHazardsSet.add('hostile_environment');
    if (co2Status === 'critical') {
      criticalPriorityIds.push(...PRIORITY_IDS_BY_STRESSOR.co2);
    } else {
      warningPriorityIds.push(...PRIORITY_IDS_BY_STRESSOR.co2);
    }
  }

  if (sleepStatus !== 'optimal' || pvtStatus !== 'optimal') {
    activeHazardsSet.add('isolation_behavioral');
    if (sleepStatus === 'critical' || pvtStatus === 'critical') {
      criticalPriorityIds.push(...PRIORITY_IDS_BY_STRESSOR.sleepPvt);
    } else {
      warningPriorityIds.push(...PRIORITY_IDS_BY_STRESSOR.sleepPvt);
    }
  }

  if (!dayData.ared_workout_completed || boneStatus !== 'optimal' || hrStatus !== 'optimal') {
    activeHazardsSet.add('altered_gravity');
    if (boneStatus === 'critical' || hrStatus === 'critical') {
      criticalPriorityIds.push(...PRIORITY_IDS_BY_STRESSOR.boneAred);
    } else {
      warningPriorityIds.push(...PRIORITY_IDS_BY_STRESSOR.boneAred);
    }
  }

  if (dayData.earth_comm_delay_min >= 10.0) {
    activeHazardsSet.add('distance');
    warningPriorityIds.push(...PRIORITY_IDS_BY_STRESSOR.distance);
  }

  const priorityRecordIds = [...criticalPriorityIds, ...warningPriorityIds];

  // Overall system state
  const criticalCount = biomarkers.filter((b) => b.status === 'critical').length;
  const warningCount = biomarkers.filter((b) => b.status === 'warning').length;

  let overallStatus = 'optimal';
  if (criticalCount > 0) overallStatus = 'critical';
  else if (warningCount > 0) overallStatus = 'warning';

  // Sprout-Bot visual posture mode
  // Priority: shield (SPE) > weights (no ARED) > veggie (fatigue/CO2/sleep) > nominal
  let mascotPosture = 'nominal';
  if (dayData.solar_particle_event) {
    mascotPosture = 'shield';
  } else if (!dayData.ared_workout_completed) {
    mascotPosture = 'weights';
  } else if (co2Status !== 'optimal' || sleepStatus !== 'optimal' || pvtStatus !== 'optimal') {
    mascotPosture = 'veggie';
  }

  // Filter & rank knowledge base records dynamically
  const activeHazards = Array.from(activeHazardsSet);
  const effectiveFilterHazards =
    activeHazards.length > 0
      ? activeHazards
      : ['altered_gravity', 'isolation_behavioral', 'radiation', 'hostile_environment', 'distance'];

  const priorityRankMap = new Map();
  priorityRecordIds.forEach((id, idx) => {
    if (!priorityRankMap.has(id)) {
      priorityRankMap.set(id, idx);
    }
  });
  if (activeHazards.length === 0) {
    PRIORITY_IDS_BY_STRESSOR.nominal.forEach((id, idx) => priorityRankMap.set(id, idx));
  }

  const recommendedRecords = (knowledgeBase || [])
    .filter((rec) => {
      if (activeHazards.length === 0) {
        return true;
      }
      return rec.hazard_categories.some((cat) => effectiveFilterHazards.includes(cat));
    })
    .map((rec) => {
      const matchCount = rec.hazard_categories.filter((c) => effectiveFilterHazards.includes(c)).length;
      const priorityRank = priorityRankMap.has(rec.id) ? priorityRankMap.get(rec.id) : 999;
      return {
        ...rec,
        matchCount,
        priorityRank,
      };
    })
    .sort((a, b) => {
      if (a.priorityRank !== b.priorityRank) return a.priorityRank - b.priorityRank;
      if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
      return a.id.localeCompare(b.id);
    });

  // Generate empathetic first-person Sprout-Bot clinical narrative
  const narrative = buildSproutBotNarrative({
    dayData,
    effectivePvt,
    isLivePvtOverride,
    boneStatus,
    hrStatus,
    radStatus,
    co2Status,
    sleepStatus,
    pvtStatus,
    mascotPosture,
  });

  return {
    dayData,
    effectivePvt,
    isLivePvtOverride,
    biomarkers,
    activeHazards,
    overallStatus,
    criticalCount,
    warningCount,
    mascotPosture,
    recommendedRecords,
    narrative,
    isSpeWindow: dayData.mission_day >= 110 && dayData.mission_day <= 114,
  };
}

function buildSproutBotNarrative({
  dayData,
  effectivePvt,
  isLivePvtOverride,
  hrStatus,
  radStatus,
  co2Status,
  sleepStatus,
  pvtStatus,
  mascotPosture,
}) {
  const day = dayData.mission_day;
  const delay = dayData.earth_comm_delay_min;
  const m = dayData.metrics;

  if (mascotPosture === 'shield') {
    return {
      headline: `¡Alerta SPE Activa en el Día ${day}! Escudo de Polietileno Desplegado`,
      greeting: `Comandante, he activado el escudo protector ALARA de inmediato. Houston está a ${delay.toFixed(
        1
      )} min de señal (${(delay * 2).toFixed(
        1
      )} min ida y vuelta), así que tomo el control autónomo aquí contigo.`,
      clinicalConnection: `Detecto una Tormenta de Partículas Solares (SPE) que disparó los neutrones Radi-N2 a ${m.daily_neutron_msv.toFixed(
        2
      )} mSv/día y elevó tu dosis acumulada a ${m.cumulative_radiation_msv.toFixed(
        2
      )} mSv. Además, al no haberse completado la sesión ARED de hoy, tu pulso en reposo subió a ${
        m.resting_heart_rate
      } bpm. Según EVARM (CSA-RAD-009), el cristalino (13x) y la médula ósea (25x) requieren refugio inmediato en la zona blindada.`,
      actionPrompt:
        'Permanece en el módulo de mayor masa de agua/polietileno, suspende cualquier EVA y mantén hidratación antioxidante.',
      quickTips: [
        'Protocolo ALARA: Posponer salidas EVA hasta que Radi-N2 caiga por debajo de 0.5 mSv/día.',
        'Refugio interno: Los tanques de agua potable atenúan la radiación neutrónica secundaria.',
        'Suplementar licopeno y flavonoides para reducir estrés oxidativo celular.',
      ],
    };
  }

  if (mascotPosture === 'weights') {
    return {
      headline: `Día ${day}: ¡Extrañamos la Barra ARED! Protejamos tus Huesos`,
      greeting: `Hola Comandante, saqué mis pesas de resistencia para recordarte nuestro entrenamiento. Con ${delay.toFixed(
        1
      )} min de retraso hacia Houston, cuidemos tu densidad ósea hoy mismo.`,
      clinicalConnection: `Hoy no se registró ejercicio ARED y tu índice óseo descendió a ${m.bone_density_index.toFixed(
        2
      )}% (~0.04% perdido por día sin carga). Esto se conecta directamente con tu frecuencia cardíaca de reposo en ${
        m.resting_heart_rate
      } bpm: sin estímulo mecánico diario (HRP-RISK-009 y HRP-RISK-011), el músculo cardíaco y los osteoblastos pierden tono rápidamente.`,
      actionPrompt:
        'Completemos al menos 45 minutos de sentadillas resistivas y peso muerto en ARED + 30 min aeróbicos para frenar la resorción ósea.',
      quickTips: [
        'HRP-RISK-011: La microgravedad reduce 1–1.5% la densidad ósea mensual en cadera y columna.',
        'Hidratación constante: evita cálculos renales por liberación de calcio óseo (HRP-HAZ-005).',
        'Combina ARED con Omega-3 para preservar la masa muscular y la función vascular.',
      ],
    };
  }

  if (mascotPosture === 'veggie') {
    const pvtLabel = isLivePvtOverride
      ? `tu prueba PVT en vivo marcó ${Math.round(effectivePvt)} ms`
      : `tu reflejo PVT subió a ${Math.round(effectivePvt)} ms`;

    return {
      headline: `Día ${day}: Sobrecarga Ambiental (CO₂ + Déficit de Sueño)`,
      greeting: `Aquí estoy cuidando nuestras hojas de mostaza mizuna en el módulo Veggie para darte un respiro. Con ${delay.toFixed(
        1
      )} min de retardo a la Tierra, ajustemos tu entorno de cabina ahora.`,
      clinicalConnection: `Tus métricas muestran una cadena fisiológica clara: el CO₂ de cabina subió a ${m.cabin_co2_mmhg.toFixed(
        2
      )} mmHg (>3.5 mmHg crítico), lo que fragmentó tu sueño a solo ${m.sleep_hours.toFixed(
        1
      )} h, elevó tu pulso en reposo a ${m.resting_heart_rate} bpm y provocó que ${pvtLabel}. La hipercapnia y la deuda circadiana se retroalimentan (HRP-HAZ-006 y HRP-RISK-014).`,
      actionPrompt:
        'Purga los depuradores de CO₂, inicia luz cálida de transición y tómate 15 min junto al jardín Veggie para bajar el cortisol.',
      quickTips: [
        'Ventilación: Verifica el flujo del depurador CDRA en tu dormitorio antes de dormir.',
        'Jardín Veggie (HRP-RES-010): Cuidar la mostaza mizuna reduce la fatiga por confinamiento.',
        'Pospón tareas de alta precisión hasta que tu PVT baje de 285 ms y recuperes ≥7.0 h de sueño.',
      ],
    };
  }

  // Nominal (including live PVT reaction if user intentionally simulated fatigue on a nominal day)
  if (isLivePvtOverride && pvtStatus !== 'optimal') {
    return {
      headline: `Día ${day}: Fatiga Detectada en tu PVT en Vivo (${Math.round(effectivePvt)} ms)`,
      greeting: `¡Atención! Aunque tus sensores de cabina estaban nominales hoy, tu Micro-Test PVT en vivo acaba de marcar ${Math.round(
        effectivePvt
      )} ms.`,
      clinicalConnection: `Tu entorno (CO₂ en ${m.cabin_co2_mmhg.toFixed(
        2
      )} mmHg y ${m.sleep_hours.toFixed(
        1
      )} h de sueño) está estable, pero esta desaceleración psicomotora indica fatiga cognitiva temprana o carga mental acumulada. Incluso con ${delay.toFixed(
        1
      )} min de retraso a Houston, AURA-7 reajusta tu carga de trabajo al instante.`,
      actionPrompt:
        'Realiza una micro-pausa de hidratación, exposición a luz azul 480nm si es horario diurno y repite el test en 20 minutos.',
      quickTips: [
        'Autonomía AURA-7: Los umbrales cognitivos (HRP-RISK-014) priorizan seguridad sobre agenda.',
        'Evita operar brazos robóticos o escotillas mientras el PVT supere los 285 ms.',
      ],
    };
  }

  return {
    headline: `Día ${day}: Fisiología en Armonía Terrestre (${
      radStatus === 'warning' ? 'Dosis Acumulada Vigilada' : 'Estado Nominal'
    })`,
    greeting: `¡Buen trabajo, Comandante! Estoy sincronizado contigo a ${delay.toFixed(
      1
    )} minutos-luz de Houston, manteniendo tu reloj biológico firme frente a los 16 amaneceres orbitales diarios.`,
    clinicalConnection: `Completaste tu sesión ARED, mantienes una densidad ósea sólida (${m.bone_density_index.toFixed(
      2
    )}%), frecuencia cardíaca tranquila (${m.resting_heart_rate} bpm), aire limpio (${m.cabin_co2_mmhg.toFixed(
      2
    )} mmHg CO₂), ${m.sleep_hours.toFixed(1)} h de sueño reparador y un PVT ágil de ${Math.round(
      effectivePvt
    )} ms.${
      hrStatus === 'optimal' && radStatus === 'warning'
        ? ` Solo mantenemos vigilancia pasiva sobre tu radiación acumulada (${m.cumulative_radiation_msv.toFixed(
            1
          )} mSv) según el principio ALARA.`
        : ''
    }`,
    actionPrompt:
      'Sigue respetando la transición lumínica circadiana y disfruta una cosecha fresca del módulo Veggie.',
    quickTips: [
      'Luz circadiana: 480nm en el día inhibe melatonina; 590nm al atardecer prepara el sueño profundo.',
      'Nutrición preventiva: Añade hojas frescas de mizuna y omega-3 a tu menú para evitar fatiga de menú.',
      'Prueba el Micro-Test PVT de 10 segundos o explora los hitos críticos de la misión arriba.',
    ],
  };
}
