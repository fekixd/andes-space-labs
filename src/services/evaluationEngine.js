/**
 * AURA-7 Evaluation Engine (Non-Diagnostic Clinical Support)
 * Evaluates immutable telemetry dynamically against `clinical_thresholds`
 * and traces every recommendation to verified NASA HRP & CSA records.
 */

export const STATUS_META = {
  optimal: {
    id: 'optimal',
    label: 'Óptimo',
    badgeClass: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/35',
    dotClass: 'bg-emerald-500',
    ringClass: 'border-emerald-500/30',
    hex: '#10b981',
  },
  warning: {
    id: 'warning',
    label: 'Precaución',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
    dotClass: 'bg-amber-500',
    ringClass: 'border-amber-500/45',
    hex: '#f59e0b',
  },
  critical: {
    id: 'critical',
    label: 'Crítico',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/45',
    dotClass: 'bg-rose-500',
    ringClass: 'border-rose-500/60',
    hex: '#fb7185',
  },
};

export const METRIC_DEFINITIONS = {
  bone_density_index: {
    key: 'bone_density_index',
    label: 'Índice de Densidad Ósea',
    shortLabel: 'Densidad Ósea',
    decimals: 2,
    targetModule: 'wellness',
  },
  resting_heart_rate: {
    key: 'resting_heart_rate',
    label: 'Frecuencia Cardíaca en Reposo',
    shortLabel: 'Pulso Reposo',
    decimals: 0,
    targetModule: 'health',
  },
  cumulative_radiation_msv: {
    key: 'cumulative_radiation_msv',
    label: 'Radiación Acumulada',
    shortLabel: 'Radiación Acum.',
    decimals: 2,
    targetModule: 'radiation',
  },
  cabin_co2_mmhg: {
    key: 'cabin_co2_mmhg',
    label: 'Presión Parcial de CO₂',
    shortLabel: 'CO₂ Cabina',
    decimals: 2,
    targetModule: 'ecosystem',
  },
  sleep_hours: {
    key: 'sleep_hours',
    label: 'Duración de Sueño',
    shortLabel: 'Horas Sueño',
    decimals: 1,
    targetModule: 'wellness',
  },
  pvt_reaction_ms: {
    key: 'pvt_reaction_ms',
    label: 'Vigilancia Psicomotora (PVT)',
    shortLabel: 'Reacción PVT',
    decimals: 0,
    targetModule: 'cognition',
  },
};

export function resolveKbRecord(knowledgeBase, id) {
  return (knowledgeBase || []).find((r) => r.id === id) || null;
}

export function resolveKbRecords(knowledgeBase, ids) {
  const byId = new Map((knowledgeBase || []).map((r) => [r.id, r]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}

/**
 * Evaluates a single metric dynamically against `clinical_thresholds`.
 */
export function classifyMetric(key, value, thresholds, dayFlags = {}) {
  const cfg = thresholds?.[key];
  if (!cfg) return 'optimal';

  switch (key) {
    case 'bone_density_index': {
      if (value < cfg.warning_min) return 'critical';
      if (value < cfg.optimal_min || dayFlags.ared_workout_completed === false) return 'warning';
      return 'optimal';
    }
    case 'resting_heart_rate': {
      if (value > cfg.warning_max) return 'critical';
      if (value > cfg.optimal_max) return 'warning';
      return 'optimal';
    }
    case 'cumulative_radiation_msv': {
      if (dayFlags.solar_particle_event === true || value >= cfg.critical_max) return 'critical';
      if (value > cfg.warning_max) return 'warning';
      return 'optimal';
    }
    case 'cabin_co2_mmhg': {
      if (value > cfg.warning_max) return 'critical';
      if (value > cfg.optimal_max) return 'warning';
      return 'optimal';
    }
    case 'sleep_hours': {
      if (value < cfg.warning_min) return 'critical';
      if (value < cfg.optimal_min) return 'warning';
      return 'optimal';
    }
    case 'pvt_reaction_ms': {
      if (value > cfg.warning_max) return 'critical';
      if (value > cfg.optimal_max) return 'warning';
      return 'optimal';
    }
    default:
      return 'optimal';
  }
}

function getEffectiveValue(dayData, key, liveDemoOverrides = {}) {
  if (
    liveDemoOverrides &&
    Object.prototype.hasOwnProperty.call(liveDemoOverrides, key) &&
    liveDemoOverrides[key] !== null &&
    liveDemoOverrides[key] !== undefined
  ) {
    return {
      value: liveDemoOverrides[key],
      isLiveOverride: true,
    };
  }
  return {
    value: dayData.metrics[key],
    isLiveOverride: false,
  };
}

function computeReadinessScore(statuses, dayData) {
  let score = 100;
  Object.values(statuses).forEach((st) => {
    if (st === 'warning') score -= 9;
    if (st === 'critical') score -= 22;
  });
  if (dayData.ared_workout_completed === false) score -= 6;
  if (dayData.solar_particle_event === true) score -= 12;
  return Math.max(12, Math.min(100, Math.round(score)));
}

/**
 * Full clinical assessment for `dayData` with optional `prevDayData` and `liveDemoOverrides`.
 */
export function evaluateDay({
  dayData,
  prevDayData = null,
  thresholds,
  knowledgeBase,
  liveDemoOverrides = {},
}) {
  if (!dayData || !thresholds) return null;

  const metricKeys = Object.keys(METRIC_DEFINITIONS);
  const statuses = {};
  const metrics = [];

  metricKeys.forEach((key) => {
    const def = METRIC_DEFINITIONS[key];
    const cfg = thresholds[key];
    const { value, isLiveOverride } = getEffectiveValue(dayData, key, liveDemoOverrides);
    const status = classifyMetric(key, value, thresholds, {
      ared_workout_completed: dayData.ared_workout_completed,
      solar_particle_event: dayData.solar_particle_event,
    });
    statuses[key] = status;

    const prevValue = prevDayData ? prevDayData.metrics[key] : null;
    const deltaPrev = prevValue !== null ? Number((value - prevValue).toFixed(2)) : null;

    metrics.push({
      ...def,
      value,
      formattedValue: def.decimals > 0 ? Number(value).toFixed(def.decimals) : String(Math.round(value)),
      unit: cfg.unit,
      hazard: cfg.hazard,
      threshold: cfg,
      status,
      statusMeta: STATUS_META[status],
      prevValue,
      deltaPrev,
      dataSource: isLiveOverride ? 'live_demo' : 'historical_audited',
      sourceBadge: isLiveOverride
        ? '[Medición Demo en Vivo]'
        : '[Telemetría Histórica Auditada]',
      isLiveOverride,
    });
  });

  // Readiness Score & Delta vs Yesterday
  const readinessScore = computeReadinessScore(statuses, dayData);
  let prevReadinessScore = null;
  let readinessDelta = null;
  if (prevDayData) {
    const prevStatuses = {};
    metricKeys.forEach((key) => {
      prevStatuses[key] = classifyMetric(key, prevDayData.metrics[key], thresholds, {
        ared_workout_completed: prevDayData.ared_workout_completed,
        solar_particle_event: prevDayData.solar_particle_event,
      });
    });
    prevReadinessScore = computeReadinessScore(prevStatuses, prevDayData);
    readinessDelta = readinessScore - prevReadinessScore;
  }

  const optimalCount = metrics.filter((m) => m.status === 'optimal').length;
  const warningCount = metrics.filter((m) => m.status === 'warning').length;
  const criticalCount = metrics.filter((m) => m.status === 'critical').length;

  const overallStatus =
    criticalCount > 0 ? 'critical' : warningCount > 0 ? 'warning' : 'optimal';

  // Build active traceable alerts (never diagnosing, always explaining correlations + citations)
  const activeAlerts = buildActiveAlerts({
    dayData,
    prevDayData,
    metrics,
    statuses,
    thresholds,
    knowledgeBase,
  });

  // Mascot posture rules:
  // 1) Acute SPE or critical radiation -> shield
  // 2) Missed ARED workout -> weights
  // 3) Fatigue / sleep deficit / high CO2 -> veggie
  // 4) Elevated radiation (warning) when other wellness/ARED systems are nominal -> shield
  // 5) Otherwise -> nominal
  let mascotPosture = 'nominal';
  if (dayData.solar_particle_event || statuses.cumulative_radiation_msv === 'critical') {
    mascotPosture = 'shield';
  } else if (!dayData.ared_workout_completed) {
    mascotPosture = 'weights';
  } else if (
    statuses.pvt_reaction_ms !== 'optimal' ||
    statuses.sleep_hours !== 'optimal' ||
    statuses.cabin_co2_mmhg !== 'optimal'
  ) {
    mascotPosture = 'veggie';
  } else if (statuses.cumulative_radiation_msv === 'warning') {
    mascotPosture = 'shield';
  }

  const pvtMetric = metrics.find((m) => m.key === 'pvt_reaction_ms');
  const narrative = buildSproutBotNarrative({
    dayData,
    statuses,
    metrics,
    mascotPosture,
    pvtMetric,
  });

  const hasAnyLiveOverride = metrics.some((m) => m.isLiveOverride);

  return {
    dayData,
    prevDayData,
    metrics,
    statuses,
    readinessScore,
    prevReadinessScore,
    readinessDelta,
    optimalCount,
    warningCount,
    criticalCount,
    overallStatus,
    overallMeta: STATUS_META[overallStatus],
    activeAlerts,
    mascotPosture,
    narrative,
    hasAnyLiveOverride,
    isSpeWindow: dayData.mission_day >= 110 && dayData.mission_day <= 114,
  };
}

function buildActiveAlerts({ dayData, prevDayData, metrics, statuses, thresholds, knowledgeBase }) {
  const alerts = [];
  const byKey = Object.fromEntries(metrics.map((m) => [m.key, m]));

  // 1. Solar Particle Event / Radiation Alert
  if (dayData.solar_particle_event || statuses.cumulative_radiation_msv !== 'optimal') {
    const rad = byKey.cumulative_radiation_msv;
    const isSpe = dayData.solar_particle_event === true;
    const citations = resolveKbRecords(
      knowledgeBase,
      isSpe
        ? ['CSA-RAD-009', 'CSA-RAD-010', 'CSA-RAD-006', 'HRP-HAZ-002']
        : ['CSA-RAD-005', 'CSA-RAD-010', 'HRP-RISK-017']
    );
    alerts.push({
      id: 'alert-radiation',
      severity: rad.status,
      title: isSpe
        ? 'Tormenta Solar (SPE) y Pico de Neutrones Radi-N2'
        : 'Vigilancia de Dosis Acumulada de Radiación',
      metricChanged: `Radiación acumulada en ${rad.formattedValue} mSv (Neutrones diarios: ${dayData.metrics.daily_neutron_msv.toFixed(
        2
      )} mSv)`,
      correlations: isSpe
        ? 'El incremento agudo de partículas solares eleva el flujo neutrónico (~30% de contribución biológica) y coincide con la suspensión temporal de ejercicio ARED, incrementando el estrés sistémico.'
        : 'La exposición sostenida a rayos cósmicos galácticos y neutrones secundarios se acumula a lo largo del tránsito fuera de la magnetosfera terrestre.',
      documentedRisk:
        'Exposición diferencial en tejidos sensibles documentada por CSA EVARM (Piel 6x, Cristalino 13x, Médula Ósea 25x), riesgo de cataratas y efectos degenerativos a largo plazo.',
      countermeasure:
        'Aplicar el principio ALARA (As Low As Reasonably Achievable): posponer actividades EVA, permanecer en zonas con mayor blindaje de agua/polietileno y notificar al equipo médico SRAG/Flight Surgeons.',
      citations,
      targetModule: 'radiation',
      targetLabel: 'Abrir Escáner EVARM & Radi-N2',
    });
  }

  // 2. Missed ARED / Bone & Cardiovascular Risk
  if (!dayData.ared_workout_completed || statuses.bone_density_index !== 'optimal') {
    const bone = byKey.bone_density_index;
    const hr = byKey.resting_heart_rate;
    const citations = resolveKbRecords(knowledgeBase, [
      'HRP-RISK-011',
      'HRP-RISK-009',
      'HRP-RISK-003',
      'HRP-RES-011',
    ]);
    alerts.push({
      id: 'alert-ared-bone',
      severity: bone.status === 'critical' ? 'critical' : 'warning',
      title: !dayData.ared_workout_completed
        ? 'Sesión ARED Omitida y Desacondicionamiento'
        : 'Descenso en Índice de Densidad Ósea',
      metricChanged: `Índice óseo en ${bone.formattedValue}% (${
        bone.deltaPrev !== null ? `${bone.deltaPrev >= 0 ? '+' : ''}${bone.deltaPrev}% vs ayer` : 'sin delta'
      }) · ARED: ${dayData.ared_workout_completed ? 'Completado' : 'Omitido'}`,
      correlations: `La falta de carga resistiva coincide con una frecuencia cardíaca en reposo de ${hr.formattedValue} bpm y contribuye a la pérdida progresiva de masa ósea y fuerza muscular en microgravedad.`,
      documentedRisk:
        'En microgravedad los huesos que soportan peso pierden en promedio 1% a 1.5% de densidad al mes si no hay contramedidas mecánicas, elevando riesgo de fracturas y cálculos renales por liberación de calcio.',
      countermeasure:
        'Retomar protocolo de 1.5 horas/día combinando ejercicio resistivo (ARED) y aeróbico, mantener hidratación adecuada y revisar seguimiento osteomuscular con Flight Surgeons.',
      citations,
      targetModule: 'wellness',
      targetLabel: 'Ver Seguimiento ARED & Bienestar',
    });
  }

  // 3. Elevated Cabin CO2
  if (statuses.cabin_co2_mmhg !== 'optimal') {
    const co2 = byKey.cabin_co2_mmhg;
    const sleep = byKey.sleep_hours;
    const pvt = byKey.pvt_reaction_ms;
    const citations = resolveKbRecords(knowledgeBase, ['HRP-HAZ-006', 'HRP-RISK-006', 'HRP-RISK-008']);
    alerts.push({
      id: 'alert-co2',
      severity: co2.status,
      title: 'Elevación de CO₂ Ambiental en Cabina',
      metricChanged: `ppCO₂ en ${co2.formattedValue} mmHg (umbral óptimo ≤ ${thresholds.cabin_co2_mmhg.optimal_max} mmHg)`,
      correlations: `El aumento de CO₂ coincide con ${sleep.formattedValue} h de sueño y una latencia PVT de ${pvt.formattedValue} ms, patrón consistente con carga ambiental cerrada sobre la alerta cognitiva.`,
      documentedRisk:
        'Ambientes cerrados con ventilación comprometida y acumulación de CO₂ pueden asociarse con cefalea, fatiga y disminución del rendimiento en tareas operativas o EVA.',
      countermeasure:
        'Verificar flujo de aire en los módulos de descanso, inspeccionar depuradores ambientales y evitar maniobras complejas mientras el indicador supere 3.5 mmHg.',
      citations,
      targetModule: 'ecosystem',
      targetLabel: 'Inspeccionar Cabina & HUD EVA',
    });
  }

  // 4. Sleep Deficit / Circadian & Behavioral Risk
  if (statuses.sleep_hours !== 'optimal' || statuses.pvt_reaction_ms !== 'optimal') {
    const sleep = byKey.sleep_hours;
    const pvt = byKey.pvt_reaction_ms;
    const worstStatus =
      sleep.status === 'critical' || pvt.status === 'critical' ? 'critical' : 'warning';
    const citations = resolveKbRecords(knowledgeBase, [
      'HRP-RISK-014',
      'HRP-RISK-012',
      'HRP-RES-010',
      'HRP-RES-007',
    ]);
    alerts.push({
      id: 'alert-sleep-pvt',
      severity: worstStatus,
      title: 'Déficit de Sueño y Fatiga Neuroconductual (PVT)',
      metricChanged: `Sueño: ${sleep.formattedValue} h · PVT: ${pvt.formattedValue} ms ${pvt.sourceBadge}`,
      correlations: `La reducción del descanso por debajo de ${thresholds.sleep_hours.optimal_min} h se correlaciona directamente con la desaceleración psicomotora (${pvt.formattedValue} ms) y con la elevación del pulso de reposo (${byKey.resting_heart_rate.formattedValue} bpm).`,
      documentedRisk:
        'La pérdida crónica de sueño y la desincronización circadiana (16 amaneceres/atardeceres diarios) degradan el rendimiento psicomotor, el estado de ánimo y pueden alterar respuestas inmunológicas.',
      countermeasure:
        'Aplicar higiene lumínica circadiana (luz ámbar 590nm al atardecer, bajo brillo nocturno), priorizar bloque de descanso antes de actividades críticas y dedicar tiempo de autocuidado en el jardín Veggie.',
      citations,
      targetModule: 'cognition',
      targetLabel: 'Ir a Módulo Cognición (PVT)',
    });
  }

  // 5. Elevated Resting Heart Rate (if not already explained solely by ARED)
  if (statuses.resting_heart_rate !== 'optimal' && dayData.ared_workout_completed) {
    const hr = byKey.resting_heart_rate;
    const citations = resolveKbRecords(knowledgeBase, ['HRP-RISK-003', 'HRP-RISK-001', 'HRP-RES-009']);
    alerts.push({
      id: 'alert-heart-rate',
      severity: hr.status,
      title: 'Frecuencia Cardíaca de Reposo Elevada',
      metricChanged: `Pulso en reposo: ${hr.formattedValue} bpm (óptimo ≤ ${thresholds.resting_heart_rate.optimal_max} bpm)`,
      correlations: `Acompaña cambios de sueño (${byKey.sleep_hours.formattedValue} h) y ambiente de cabina (CO₂ ${byKey.cabin_co2_mmhg.formattedValue} mmHg), reflejando mayor carga fisiológica autonómica.`,
      documentedRisk:
        'La microgravedad y el estrés de vuelo espacial modifican la regulación cardiovascular y la distribución de fluidos corporales.',
      countermeasure:
        'Reforzar hidratación, alimentación rica en omega-3 y antioxidantes (flavonoides/licopeno) y compartir tendencia con el Flight Surgeon asignado.',
      citations,
      targetModule: 'health',
      targetLabel: 'Analizar Tendencias Biomédicas',
    });
  }

  // 6. Distance / Autonomy awareness when comm delay >= 10 min
  if (dayData.earth_comm_delay_min >= 10.0) {
    const citations = resolveKbRecords(knowledgeBase, ['HRP-HAZ-004', 'CSA-SCI-003', 'HRP-RISK-015']);
    alerts.push({
      id: 'alert-distance',
      severity: 'warning',
      title: `Autonomía Operativa por Retardo Tierra (${dayData.earth_comm_delay_min.toFixed(1)} min)`,
      metricChanged: `Latencia unidireccional de ${dayData.earth_comm_delay_min.toFixed(1)} min (${(
        dayData.earth_comm_delay_min * 2
      ).toFixed(1)} min ida y vuelta con Houston)`,
      correlations:
        'A medida que aumenta la distancia a la Tierra, las consultas médicas en tiempo real dejan de ser inmediatas y los protocolos preventivos locales adquieren prioridad.',
      documentedRisk:
        'La distancia limita la asistencia médica instantánea y el reabastecimiento rápido de suministros.',
      countermeasure:
        'Operar en Local Autonomous Mode y encolar el paquete telemétrico comprimido para revisión asíncrona del Flight Surgeon en Houston.',
      citations,
      targetModule: 'mission',
      targetLabel: 'Ver Bitácora & Envío a Tierra',
    });
  }

  // Nominal day fallback preventive guidance
  if (alerts.length === 0) {
    const citations = resolveKbRecords(knowledgeBase, ['HRP-HAZ-001', 'HRP-RES-010', 'HRP-RES-009']);
    alerts.push({
      id: 'alert-nominal',
      severity: 'optimal',
      title: 'Parámetros Dentro de Ventana Óptima de Misión',
      metricChanged: `Todos los biomarcadores en rango óptimo · ARED completado · Sin eventos SPE`,
      correlations:
        'La adherencia al ejercicio ARED, el aire limpio en cabina y el bloque de sueño ≥ 7.0 h sostienen tiempos de reacción PVT ágiles y estabilidad cardiovascular.',
      documentedRisk:
        'Incluso en días nominales, los 16 amaneceres orbitales y la monotonía alimentaria exigen prevención continua frente a los cinco peligros de NASA HRP.',
      countermeasure:
        'Mantener el ciclo de iluminación circadiana terrestre, completar cosecha/cuidado en Veggie y sostener dieta enriquecida preventiva.',
      citations,
      targetModule: 'wellness',
      targetLabel: 'Explorar Jardín Veggie & Nutrición',
    });
  }

  // Keep prevDayData referenced for future enhancements
  void prevDayData;

  return alerts;
}

function buildSproutBotNarrative({ dayData, statuses, metrics, mascotPosture, pvtMetric }) {
  const byKey = Object.fromEntries(metrics.map((m) => [m.key, m]));
  const delay = dayData.earth_comm_delay_min;
  const co2 = byKey.cabin_co2_mmhg.formattedValue;
  const sleep = byKey.sleep_hours.formattedValue;
  const pvt = byKey.pvt_reaction_ms.formattedValue;
  const hr = byKey.resting_heart_rate.formattedValue;
  const bone = byKey.bone_density_index.formattedValue;
  const rad = byKey.cumulative_radiation_msv.formattedValue;

  if (mascotPosture === 'shield') {
    if (dayData.solar_particle_event) {
      return {
        toneLabel: 'Alerta de Radiación Solar (SPE)',
        summaryLine: `¡He activado mi escudo energético! Hoy en el Día ${dayData.mission_day} detectamos un evento de partículas solares (SPE) con flujo de neutrones de ${dayData.metrics.daily_neutron_msv.toFixed(
          2
        )} mSv/día y dosis acumulada de ${rad} mSv.`,
        correlationBody: `Como estamos a ${delay.toFixed(
          1
        )} min-luz de Houston y tu sesión ARED no se registró hoy (pulso en ${hr} bpm), mi prioridad no diagnóstica es ayudarte a reducir exposición. Según datos EVARM (CSA-RAD-009), tejidos como el cristalino (13x) y la médula ósea (25x) son más sensibles fuera del blindaje principal. Te sugiero permanecer en la zona protegida de cabina, posponer actividades EVA bajo el principio ALARA y compartir este paquete con los Flight Surgeons.`,
        disclaimer:
          'Orientación preventiva autónoma basada en umbrales NASA HRP/CSA. No sustituye evaluación médica de los Flight Surgeons.',
      };
    }

    return {
      toneLabel: 'Escudo Preventivo ALARA',
      summaryLine: `Mantengo el escudo preventivo activo en el Día ${dayData.mission_day}: tu dosis acumulada alcanzó ${rad} mSv (zona de precaución > 120 mSv).`,
      correlationBody: `Tus demás indicadores están estables (sueño ${sleep} h, CO₂ ${co2} mmHg y PVT ${pvt} ms), lo cual es positivo. Sin embargo, los neutrones diarios (${dayData.metrics.daily_neutron_msv.toFixed(
        2
      )} mSv) requieren vigilancia continua según CSA Radi-N2 para proteger cristalino y médula ósea a largo plazo.`,
      disclaimer:
        'Orientación preventiva autónoma basada en umbrales NASA HRP/CSA. No sustituye evaluación médica de los Flight Surgeons.',
    };
  }

  if (mascotPosture === 'weights') {
    return {
      toneLabel: 'Recordatorio de Carga Mecánica ARED',
      summaryLine: `Saqué mis pesas de entrenamiento en el Día ${dayData.mission_day}: observo que hoy no se completó la sesión ARED y tu índice óseo marca ${bone}%.`,
      correlationBody: `Este cambio coincide con un pulso en reposo de ${hr} bpm. La evidencia de NASA HRP (HRP-RISK-011 y HRP-RISK-009) documenta que sin carga resistiva diaria en microgravedad el tejido óseo pierde entre 1% y 1.5% mensual. Te recomiendo programar tu bloque de 1.5 horas de ejercicio resistivo y aeróbico hoy, mantener buena hidratación y revisar la evolución con tu equipo médico.`,
      disclaimer:
        'Orientación preventiva autónoma basada en umbrales NASA HRP/CSA. No sustituye evaluación médica de los Flight Surgeons.',
    };
  }

  if (mascotPosture === 'veggie') {
    return {
      toneLabel: 'Cuidado Circadiano, Aire y Veggie',
      summaryLine: `He observado que hoy dormiste ${sleep} h, el CO₂ subió a ${co2} mmHg y tu tiempo de reacción ${
        pvtMetric.isLiveOverride ? '(medición en vivo)' : ''
      } marcó ${pvt} ms.`,
      correlationBody: `Estos cambios combinados (junto a un pulso en reposo de ${hr} bpm) pueden relacionarse con fatiga neuroconductual e inmunidad alterada descritas en HRP-RISK-014 y HRP-HAZ-006. No se trata de un diagnóstico médico, pero sí de una señal clara para descansar antes de tu siguiente actividad crítica, ventilar tu área de descanso, pasar unos minutos cuidando la mostaza mizuna en Veggie y revisar las recomendaciones oficiales con los Flight Surgeons.`,
      disclaimer:
        'Orientación preventiva autónoma basada en umbrales NASA HRP/CSA. No sustituye evaluación médica de los Flight Surgeons.',
    };
  }

  return {
    toneLabel: 'Estado General Óptimo',
    summaryLine: `¡Excelente jornada en el Día ${dayData.mission_day}! Tus 6 indicadores se mantienen dentro de los umbrales óptimos: sueño de ${sleep} h, CO₂ limpio en ${co2} mmHg, pulso en ${hr} bpm y PVT ágil en ${pvt} ms.`,
    correlationBody: `Aunque estamos a ${delay.toFixed(
      1
    )} min-luz de la Tierra, tu disciplina con el entrenamiento ARED (índice óseo ${bone}%) y el respeto al ciclo lumínico terrestre están protegiendo tu reloj biológico frente a los 16 amaneceres orbitales diarios. Te sugiero continuar con la transición circadiana y disfrutar hojas frescas del jardín Veggie.`,
    disclaimer:
      'Orientación preventiva autónoma basada en umbrales NASA HRP/CSA. No sustituye evaluación médica de los Flight Surgeons.',
  };
}
