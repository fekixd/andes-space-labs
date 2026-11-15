/**
 * AURA-7 v2.3 — Autonomous Psychological & HRI Inference Engine
 * Zero manual mood surveys: deduces psychological, cognitive, and autonomic states
 * 100% algorithmically from 180-day telemetry streams and Module 5 live tests,
 * mapping every inference to verified NASA HRP & CSA records.
 */

import { resolveKbRecord, resolveKbRecords } from './evaluationEngine.js';

function getEffectiveMetric(dayData, liveDemoOverrides, key) {
  if (
    liveDemoOverrides &&
    Object.prototype.hasOwnProperty.call(liveDemoOverrides, key) &&
    liveDemoOverrides[key] !== null &&
    liveDemoOverrides[key] !== undefined &&
    typeof liveDemoOverrides[key] === 'number'
  ) {
    return liveDemoOverrides[key];
  }
  return dayData?.metrics?.[key];
}

/**
 * Counts consecutive days ending on `selectedDay` with `resting_heart_rate > 88` bpm,
 * plus elevated sympathetic count across the trailing 4-day window.
 */
function analyzeHeartRateOverload(telemetry, selectedDay, currentHr) {
  const index = (telemetry || []).findIndex((d) => d.mission_day === selectedDay);
  if (index === -1) {
    return { consecutiveOver88: currentHr > 88 ? 1 : 0, trailing4Over88Count: currentHr > 88 ? 1 : 0 };
  }

  let consecutiveOver88 = 0;
  for (let i = index; i >= 0; i -= 1) {
    const hr = i === index ? currentHr : telemetry[i].metrics.resting_heart_rate;
    if (hr > 88) {
      consecutiveOver88 += 1;
    } else {
      break;
    }
  }

  let trailing4Over88Count = 0;
  for (let i = index; i >= Math.max(0, index - 3); i -= 1) {
    const hr = i === index ? currentHr : telemetry[i].metrics.resting_heart_rate;
    if (hr > 88) {
      trailing4Over88Count += 1;
    }
  }

  return { consecutiveOver88, trailing4Over88Count };
}

/**
 * Computes progressive isolation severity after Mission Day 60 when Earth delay > 6 min.
 */
function computeIsolationProgression(selectedDay, earthCommDelayMin) {
  if (selectedDay <= 60 || earthCommDelayMin <= 6) return 0;
  const dayFactor = Math.min(1, (selectedDay - 60) / 120);
  const delayFactor = Math.min(1, (earthCommDelayMin - 6) / 13);
  return Math.round((dayFactor * 0.45 + delayFactor * 0.55) * 100);
}

/**
 * Builds verified clinical citations for a list of KB IDs from `unified_nasa_csa_kb.json`.
 */
function buildVerifiedBadgeCitations(knowledgeBase, primaryId, secondaryIds = []) {
  const primaryCitation = resolveKbRecord(knowledgeBase, primaryId);
  const citations = resolveKbRecords(knowledgeBase, [primaryId, ...secondaryIds]);
  return { primaryCitation, citations };
}

/**
 * Infers the astronaut's current psychological/emotional & HRI state without manual questionnaires.
 */
export function inferPsychologicalState({
  telemetry,
  selectedDay,
  evaluation,
  liveDemoOverrides = {},
  knowledgeBase = [],
  circadianMode = 'day',
}) {
  const dayData =
    evaluation?.dayData ||
    (telemetry || []).find((d) => d.mission_day === selectedDay) ||
    telemetry?.[0];

  if (!dayData) return null;

  const metrics = {
    bone_density_index: getEffectiveMetric(dayData, liveDemoOverrides, 'bone_density_index'),
    resting_heart_rate: getEffectiveMetric(dayData, liveDemoOverrides, 'resting_heart_rate'),
    cumulative_radiation_msv: getEffectiveMetric(dayData, liveDemoOverrides, 'cumulative_radiation_msv'),
    daily_neutron_msv: getEffectiveMetric(dayData, liveDemoOverrides, 'daily_neutron_msv'),
    cabin_co2_mmhg: getEffectiveMetric(dayData, liveDemoOverrides, 'cabin_co2_mmhg'),
    sleep_hours: getEffectiveMetric(dayData, liveDemoOverrides, 'sleep_hours'),
    pvt_reaction_ms: getEffectiveMetric(dayData, liveDemoOverrides, 'pvt_reaction_ms'),
  };

  // Also reflect unsynced live PVT test ticket if just completed in Module 5
  const livePvtTicket = liveDemoOverrides?.diag_pvt;
  const effectivePvtMs =
    livePvtTicket?.isLiveDemo && typeof livePvtTicket?.value === 'number'
      ? livePvtTicket.value
      : metrics.pvt_reaction_ms;

  const delayMin = dayData.earth_comm_delay_min;
  const aredDone = dayData.ared_workout_completed === true;
  const isSpe = dayData.solar_particle_event === true;
  const criticalCount = evaluation?.criticalCount ?? 0;

  const { consecutiveOver88, trailing4Over88Count } = analyzeHeartRateOverload(
    telemetry,
    selectedDay,
    metrics.resting_heart_rate
  );

  const liveGripIssue =
    liveDemoOverrides?.diag_grip && liveDemoOverrides.diag_grip.status !== 'optimal';
  const liveSansIssue =
    liveDemoOverrides?.diag_sans && liveDemoOverrides.diag_sans.status !== 'optimal';
  const liveVestibularCritical = liveDemoOverrides?.diag_vestibular?.status === 'critical';
  const liveVestibularWarning = liveDemoOverrides?.diag_vestibular?.status === 'warning';
  const livePvtCritical =
    (livePvtTicket?.isLiveDemo && livePvtTicket.status === 'critical') || effectivePvtMs > 345;
  const livePvtWarning = livePvtTicket?.isLiveDemo && livePvtTicket.status === 'warning';

  // Exact rules from AURA-7 v2.3 specification
  const isSolarAlert =
    isSpe || metrics.cumulative_radiation_msv >= 250 || metrics.daily_neutron_msv >= 1.5;

  const isCognitiveFatigueExact =
    metrics.sleep_hours < 6.0 &&
    effectivePvtMs > 345 &&
    metrics.cabin_co2_mmhg > 3.5;

  const isCognitiveFatigueLive =
    livePvtCritical &&
    (metrics.sleep_hours < 6.8 || metrics.cabin_co2_mmhg > 3.0 || livePvtTicket?.isLiveDemo);

  const isAnxietyOverload =
    (metrics.resting_heart_rate > 88 &&
      (consecutiveOver88 >= 3 ||
        (consecutiveOver88 >= 2 && trailing4Over88Count >= 2) ||
        typeof liveDemoOverrides?.resting_heart_rate === 'number')) ||
    liveVestibularCritical;

  const isMedicalAssistant =
    !aredDone ||
    metrics.bone_density_index < 97.5 ||
    liveGripIssue ||
    liveSansIssue ||
    liveVestibularWarning ||
    livePvtWarning;

  const isIsolationDisconnect =
    selectedDay > 60 &&
    delayMin > 6.0 &&
    criticalCount === 0 &&
    aredDone &&
    !isSolarAlert;

  // Priority 1: Solar Storm / Radiation Protector Shield
  if (isSolarAlert) {
    const { primaryCitation, citations } = buildVerifiedBadgeCitations(
      knowledgeBase,
      'CSA-RAD-006',
      ['CSA-RAD-009', 'HRP-HAZ-002']
    );
    return {
      stateId: 'solar_shield',
      stateLabel: 'Alerta Protectora · Escudo Radiación',
      shortBadge: 'Alerta / Protector SPE',
      visualExpression: 'alert_protector',
      severity: 'critical',
      accentHex: '#00F0FF',
      toneTag: 'Protocolo ALARA Autónomo',
      confidencePct: 98,
      autoOpenBubble: true,
      telemetrySignature: `SPE Activo · Neutrones ${metrics.daily_neutron_msv.toFixed(2)} mSv/d · Acum. ${metrics.cumulative_radiation_msv.toFixed(1)} mSv`,
      proactiveGreeting: `Atención. Detecto un Evento de Partículas Solares activo en el Día ${selectedDay} con ${metrics.daily_neutron_msv.toFixed(
        2
      )} mSv diarios en neutrones y ${metrics.cumulative_radiation_msv.toFixed(
        1
      )} mSv acumulados. A ${delayMin.toFixed(
        1
      )} min-luz de la Tierra he desplegado mi escudo energético y priorizado el refugio ALARA.`,
      actionPrompts: [
        {
          id: 'open_evarm',
          question:
            '¿Abrimos el Escáner EVARM para auditar dosis en piel (6x), cristalino (13x) y médula ósea (25x) (CSA-RAD-009)?',
          buttonLabel: 'Abrir Escáner EVARM',
          actionType: 'navigate',
          targetModule: 'radiation',
          variant: 'cyan',
        },
        {
          id: 'attenuate_lights',
          question:
            '¿Quieres atenuar la cabina a espectro de reposo para conservar energía biológica mientras permanece el refugio?',
          buttonLabel: circadianMode === 'night' ? 'Modo Noche Activo' : 'Activar Atenuación',
          activeDoneLabel: 'Luz de Cabina Atenuada',
          actionType: 'attenuate_lights',
          variant: 'amber',
        },
      ],
      primaryCitation,
      citations,
    };
  }

  // Priority 2: Cognitive Fatigue / Mild Depression (Exact Day 145 Scenario + Live PVT Fatigue)
  if (isCognitiveFatigueExact || isCognitiveFatigueLive) {
    const { primaryCitation, citations } = buildVerifiedBadgeCitations(
      knowledgeBase,
      'HRP-RISK-014',
      ['HRP-RISK-012', 'HRP-HAZ-006']
    );
    return {
      stateId: 'cognitive_fatigue',
      stateLabel: 'Fatiga Cognitiva / Depresión Leve',
      shortBadge: 'Fatiga Cognitiva Aguda',
      visualExpression: 'worried_empathetic',
      severity: 'critical',
      accentHex: '#FFB800',
      toneTag: 'Inferencia Empática Neuronal',
      confidencePct: 96,
      autoOpenBubble: true,
      telemetrySignature: `PVT ${Math.round(effectivePvtMs)} ms · Sueño ${metrics.sleep_hours.toFixed(
        1
      )} h · CO₂ ${metrics.cabin_co2_mmhg.toFixed(2)} mmHg · HR ${Math.round(metrics.resting_heart_rate)} bpm`,
      proactiveGreeting: `Hola. He notado en tus últimos test que tus reflejos están lentos (${Math.round(
        effectivePvtMs
      )} ms) y tu pulso en reposo es de ${Math.round(
        metrics.resting_heart_rate
      )} bpm. Mi red neuronal detecta fatiga cognitiva aguda (sueño ${metrics.sleep_hours.toFixed(
        1
      )} h · CO₂ ${metrics.cabin_co2_mmhg.toFixed(2)} mmHg). Como estamos a ${delayMin.toFixed(
        1
      )} minutos de la Tierra, he tomado la iniciativa.`,
      actionPrompts: [
        {
          id: 'attenuate_lights',
          question:
            '¿Quieres que atenúe las luces de cabina a espectro cálido para preparar tu ciclo de sueño (HRP-RISK-014)?',
          buttonLabel: circadianMode === 'sunset' || circadianMode === 'night' ? 'Luz Cálida Activa' : 'Activar Atenuación',
          activeDoneLabel: 'Espectro Cálido Activado',
          actionType: 'attenuate_lights',
          variant: 'amber',
        },
        {
          id: 'open_veggie',
          question:
            'Tus niveles de estrés sugieren que necesitas desconexión. ¿Activamos el panel de la cámara Veggie para tu sesión de jardinería terapéutica (HRP-RISK-012)?',
          buttonLabel: 'Ver Cultivo Veggie',
          actionType: 'navigate',
          targetModule: 'wellness',
          variant: 'emerald',
        },
      ],
      primaryCitation,
      citations,
    };
  }

  // Priority 3: Anxiety / Physical Overload (Resting HR > 88 bpm streak regardless of ARED)
  if (isAnxietyOverload) {
    const { primaryCitation, citations } = buildVerifiedBadgeCitations(
      knowledgeBase,
      'HRP-RISK-012',
      ['HRP-RISK-003', 'HRP-RISK-014']
    );
    return {
      stateId: 'anxiety_overload',
      stateLabel: 'Ansiedad / Sobrecarga Física',
      shortBadge: 'Sobrecarga Autonómica',
      visualExpression: 'worried_empathetic',
      severity: 'warning',
      accentHex: '#FFB800',
      toneTag: 'Regulación Simpática HRI',
      confidencePct: 93,
      autoOpenBubble: true,
      telemetrySignature: `HR ${Math.round(
        metrics.resting_heart_rate
      )} bpm (${consecutiveOver88}d > 88 bpm) · ARED: ${aredDone ? 'Completado' : 'Omitido'}`,
      proactiveGreeting: liveVestibularCritical
        ? `He detectado desregulación sensorimotora en tu prueba vestibular reciente y pulso en ${Math.round(
            metrics.resting_heart_rate
          )} bpm. Mi modelo infiere sobrecarga de estrés. A ${delayMin.toFixed(
            1
          )} min de Houston, te acompaño en una pausa de descompresión.`
        : `Hola. Tu frecuencia cardíaca en reposo permanece elevada en ${Math.round(
            metrics.resting_heart_rate
          )} bpm (racha sostenida > 88 bpm, con entrenamiento ARED ${
            aredDone ? 'completado' : 'omitido'
          }). Mi red neuronal infiere ansiedad y sobrecarga fisiológica. He tomado la iniciativa para ayudarte a desacelerar.`,
      actionPrompts: [
        {
          id: 'open_veggie',
          question:
            'Tus niveles de estrés sugieren que necesitas desconexión. ¿Activamos el panel de la cámara Veggie para tu sesión de jardinería terapéutica (HRP-RISK-012)?',
          buttonLabel: 'Ver Cultivo Veggie',
          actionType: 'navigate',
          targetModule: 'wellness',
          variant: 'emerald',
        },
        {
          id: 'attenuate_lights',
          question:
            '¿Quieres que atenúe las luces de cabina a espectro cálido para estabilizar tu ritmo cardíaco y sueño (HRP-RISK-014)?',
          buttonLabel: circadianMode === 'sunset' || circadianMode === 'night' ? 'Luz Cálida Activa' : 'Activar Atenuación',
          activeDoneLabel: 'Espectro Cálido Activado',
          actionType: 'attenuate_lights',
          variant: 'amber',
        },
      ],
      primaryCitation,
      citations,
    };
  }

  // Priority 4: Medical Assistant (Missed ARED / Bone Remodeling / Grip / SANS Warning)
  if (isMedicalAssistant) {
    const { primaryCitation, citations } = buildVerifiedBadgeCitations(
      knowledgeBase,
      'HRP-RISK-009',
      ['HRP-RISK-011', 'HRP-RISK-010']
    );
    return {
      stateId: 'medical_assistant',
      stateLabel: 'Auxiliar Médico · Soporte Osteomuscular',
      shortBadge: 'Auxiliar Médico ARED',
      visualExpression: 'medical_assistant',
      severity: 'warning',
      accentHex: '#00F0FF',
      toneTag: 'Escáner Preventivo Activo',
      confidencePct: 94,
      autoOpenBubble: true,
      telemetrySignature: `ARED: ${aredDone ? 'OK' : 'Omitido'} · Densidad Ósea ${metrics.bone_density_index.toFixed(
        2
      )}% · HR ${Math.round(metrics.resting_heart_rate)} bpm`,
      proactiveGreeting: liveGripIssue
        ? `Activando modo Auxiliar Médico: tu prueba en dinamómetro isométrico registró ${liveDemoOverrides.diag_grip.value} kg-f (${liveDemoOverrides.diag_grip.status}), señal de fatiga o desuso muscular en microgravedad. Aquí estoy para guiarte.`
        : !aredDone
        ? `Hola, activé mi visor de Auxiliar Médico en el Día ${selectedDay}: detecto sesión ARED omitida y densidad ósea en ${metrics.bone_density_index.toFixed(
            2
          )}% con pulso en ${Math.round(
            metrics.resting_heart_rate
          )} bpm. A ${delayMin.toFixed(
            1
          )} min de la Tierra, protejamos hoy tu masa muscular y ósea.`
        : `Mi escáner preventivo detecta descenso progresivo óseo (${metrics.bone_density_index.toFixed(
            2
          )}%) o desvío en test médico reciente. Activé protocolo de refuerzo físico.`,
      actionPrompts: [
        {
          id: 'open_diagnostic',
          question:
            '¿Validamos tu fuerza muscular isométrica o agudeza ocular SANS en la Suite de Diagnóstico (HRP-RISK-009)?',
          buttonLabel: 'Abrir Suite Diagnóstica',
          actionType: 'navigate',
          targetModule: 'cognition',
          variant: 'cyan',
        },
        {
          id: 'open_veggie',
          question:
            '¿Revisamos tu soporte nutricional (calcio, vitamina D y vegetales Veggie) y la meta de carga ARED (HRP-RISK-011)?',
          buttonLabel: 'Ver Cultivo Veggie',
          actionType: 'navigate',
          targetModule: 'wellness',
          variant: 'emerald',
        },
      ],
      primaryCitation,
      citations,
    };
  }

  // Priority 5: Isolation / Disconnection (> Day 60, no critical anomalies, Earth delay > 6 min)
  if (isIsolationDisconnect) {
    const isolationPct = computeIsolationProgression(selectedDay, delayMin);
    const { primaryCitation, citations } = buildVerifiedBadgeCitations(
      knowledgeBase,
      'HRP-RISK-012',
      ['HRP-HAZ-003', 'HRP-RISK-019']
    );
    return {
      stateId: 'isolation_disconnect',
      stateLabel: 'Aislamiento / Desconexión Progresiva',
      shortBadge: `Aislamiento D${selectedDay} (${isolationPct}%)`,
      visualExpression: 'worried_empathetic',
      severity: 'warning',
      accentHex: '#FFB800',
      toneTag: 'Acompañamiento Psicosocial Autónomo',
      confidencePct: Math.max(76, Math.min(97, 74 + Math.round(isolationPct * 0.22))),
      autoOpenBubble: true,
      isolationProgressPct: isolationPct,
      telemetrySignature: `Día ${selectedDay} (>60) · Retardo Tierra ${delayMin.toFixed(
        1
      )} min (>6m) · Carga física estable`,
      proactiveGreeting: `Tus signos físicos están estables en el Día ${selectedDay}, pero la latencia con la Tierra alcanzó ${delayMin.toFixed(
        1
      )} minutos por sentido (${(delayMin * 2).toFixed(
        1
      )} min ida y vuelta). Tras superar los 60 días de confinamiento, mi motor detecta ${isolationPct}% de riesgo progresivo de desconexión.`,
      actionPrompts: [
        {
          id: 'open_veggie',
          question:
            'El contacto con vida terrestre reduce la fatiga de confinamiento. ¿Activamos la cámara Veggie para tu sesión de jardinería terapéutica (HRP-RISK-012)?',
          buttonLabel: 'Ver Cultivo Veggie',
          actionType: 'navigate',
          targetModule: 'wellness',
          variant: 'emerald',
        },
        {
          id: 'attenuate_lights',
          question:
            '¿Quieres armonizar las luces de cabina a espectro cálido para proteger tu ánimo y anclaje circadiano (HRP-HAZ-003)?',
          buttonLabel: circadianMode === 'sunset' || circadianMode === 'night' ? 'Luz Cálida Activa' : 'Activar Atenuación',
          activeDoneLabel: 'Espectro Cálido Activado',
          actionType: 'attenuate_lights',
          variant: 'amber',
        },
      ],
      primaryCitation,
      citations,
    };
  }

  // Priority 6: Optimal / Motivated (All biomarkers green and ARED workout completed)
  const { primaryCitation, citations } = buildVerifiedBadgeCitations(
    knowledgeBase,
    'HRP-RISK-012',
    ['HRP-RISK-014', 'HRP-RISK-009']
  );
  return {
    stateId: 'optimal_motivated',
    stateLabel: 'Óptimo / Motivado',
    shortBadge: 'Óptimo / Motivado',
    visualExpression: 'optimal_motivated',
    severity: 'optimal',
    accentHex: '#00FF66',
    toneTag: 'Homeostasis & Alto Rendimiento',
    confidencePct: 97,
    autoOpenBubble: false,
    telemetrySignature: `PVT ${Math.round(effectivePvtMs)} ms · Sueño ${metrics.sleep_hours.toFixed(
      1
    )} h · HR ${Math.round(metrics.resting_heart_rate)} bpm · ARED OK`,
    proactiveGreeting: `¡Excelente equilibrio en el Día ${selectedDay}! Todos tus biomarcadores están en verde (PVT ${Math.round(
      effectivePvtMs
    )} ms, sueño ${metrics.sleep_hours.toFixed(1)} h, pulso ${Math.round(
      metrics.resting_heart_rate
    )} bpm) y completaste tu entrenamiento ARED. Tu resiliencia psicológica y circadiana es óptima.`,
    actionPrompts: [
      {
        id: 'open_veggie',
        question:
          'Momento ideal para reforzar bienestar positivo. ¿Quieres inspeccionar el crecimiento de mostaza Mizuna en Veggie (HRP-RISK-012)?',
        buttonLabel: 'Ver Cultivo Veggie',
        actionType: 'navigate',
        targetModule: 'wellness',
        variant: 'emerald',
      },
      {
        id: 'attenuate_lights',
        question:
          'Cuando finalices tu turno, ¿deseas preparar la transición circadiana a espectro cálido terrestre (HRP-RISK-014)?',
        buttonLabel: circadianMode === 'sunset' || circadianMode === 'night' ? 'Luz Cálida Activa' : 'Activar Atenuación',
        activeDoneLabel: 'Espectro Cálido Activado',
        actionType: 'attenuate_lights',
        variant: 'amber',
      },
    ],
    primaryCitation,
    citations,
  };
}
