import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Bone,
  Brain,
  CheckCircle2,
  Compass,
  Crosshair,
  Dumbbell,
  ExternalLink,
  Eye,
  HeartPulse,
  Orbit,
  Radiation,
  Rocket,
  ShieldAlert,
  Sparkles,
  Sprout,
  Wind,
} from 'lucide-react';
import { resolveKbRecords, STATUS_META } from '../../services/evaluationEngine';

const SEMANTIC_HUD = {
  optimal: {
    hex: '#00FF66',
    lightHex: '#047857',
    label: 'Óptimo / Normal',
    badgeDark: 'bg-[#00FF66]/15 text-[#00FF66] border-[#00FF66]/45',
    badgeLight: 'bg-emerald-500/15 text-emerald-800 border-emerald-600/45',
  },
  warning: {
    hex: '#FFB800',
    lightHex: '#b45309',
    label: 'Precaución / Seguimiento',
    badgeDark: 'bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/45',
    badgeLight: 'bg-amber-500/15 text-amber-800 border-amber-600/50',
  },
  critical: {
    hex: '#FF3366',
    lightHex: '#be123c',
    label: 'Alerta Crítica',
    badgeDark: 'bg-[#FF3366]/18 text-[#FF3366] border-[#FF3366]/55',
    badgeLight: 'bg-rose-500/15 text-rose-800 border-rose-600/50',
  },
};

const MISSION_ENVIRONMENTS = [
  {
    id: 'transit',
    shortLabel: 'Nave en Tránsito',
    label: 'Nave en Tránsito (Espacio Profundo)',
    gravity: '0.0g · Microgravedad',
    shielding: 'Fuera de magnetosfera terrestre',
    summary: 'Exposición continua a rayos cósmicos galácticos (GCR) y tormentas solares (SPE) sin atenuación geomagnética.',
    Icon: Rocket,
    kbIds: ['HRP-HAZ-005', 'HRP-RISK-017'],
  },
  {
    id: 'leo_iss',
    shortLabel: 'Estación LEO / ISS',
    label: 'Estación Espacial Orbital (LEO / ISS)',
    gravity: '0.0g · Órbita Baja',
    shielding: 'Protección parcial magnetosfera',
    summary: 'Atmósfera controlada con 16 ciclos luz/oscuridad al día y paso por la Anomalía del Atlántico Sur.',
    Icon: Orbit,
    kbIds: ['CSA-RAD-003', 'HRP-RISK-017'],
  },
  {
    id: 'eva_rover',
    shortLabel: 'Traje / Rover (EVA)',
    label: 'Traje / Rover de Exploración (EVA)',
    gravity: 'EVA · Baja Presión',
    shielding: 'Blindaje de traje · Pre-respiración O₂',
    summary: 'Blindaje liviano frente a protones/electrones; exige protocolo pre-respiración O₂ contra descompresión (DCS) y dosimetría EVARM.',
    Icon: ShieldAlert,
    kbIds: ['HRP-RISK-004', 'HRP-RISK-006', 'HRP-RISK-008', 'CSA-RAD-009'],
  },
  {
    id: 'lunar_mars',
    shortLabel: 'Base Lunar / Marciana',
    label: 'Base Lunar / Marciana',
    gravity: '0.16g / 0.38g · 3/8 Tierra',
    shielding: 'Transición gravitacional + regolito',
    summary: 'Readaptación neurovestibular y carga ortostática parcial en superficie lunar (0.16g) o marciana (0.38g).',
    Icon: Compass,
    kbIds: ['HRP-HAZ-005', 'HRP-RISK-016'],
  },
];

const ANATOMICAL_REGIONS = [
  {
    id: 'head_eyes',
    shortLabel: 'Cabeza y Ojos',
    title: 'Cabeza, Ojos y Cristalino (SANS y Dosimetría Ocular)',
    badge: '13x EVARM',
    nodeBadge: '13x',
    cx: 160,
    cy: 46,
    rx: 34,
    Icon: Eye,
    primaryMetricKey: 'cumulative_radiation_msv',
    trendLabel: 'Radiación Acumulada (mSv)',
    kbIds: ['HRP-RISK-010', 'CSA-RAD-004', 'CSA-RAD-009', 'CSA-RAD-006', 'HRP-RISK-002'],
  },
  {
    id: 'cardio_thorax',
    shortLabel: 'Cardiovascular',
    title: 'Sistema Cardiovascular y Torácico',
    badge: 'ECG / PULSO',
    nodeBadge: 'ECG',
    cx: 170,
    cy: 128,
    rx: 26,
    Icon: HeartPulse,
    primaryMetricKey: 'resting_heart_rate',
    trendLabel: 'Frecuencia Cardíaca en Reposo (bpm)',
    kbIds: ['HRP-RISK-003', 'HRP-RISK-009', 'HRP-HAZ-005'],
  },
  {
    id: 'musculoskeletal_marrow',
    shortLabel: 'Óseo y Médula',
    title: 'Sistema Músculo-Esquelético, Columna y Médula Ósea',
    badge: '25x EVARM',
    nodeBadge: '25x',
    cx: 160,
    cy: 212,
    rx: 30,
    Icon: Bone,
    primaryMetricKey: 'bone_density_index',
    trendLabel: 'Índice de Densidad Ósea (%)',
    kbIds: ['HRP-RISK-011', 'HRP-RES-011', 'HRP-RISK-009', 'HRP-HAZ-005', 'CSA-RAD-008', 'CSA-RAD-009', 'CSA-RAD-010'],
  },
  {
    id: 'torso_lungs_skin',
    shortLabel: 'Pulmones y Piel',
    title: 'Torso, Pulmones y Piel (Radiación, Neutrones y Cabina)',
    badge: '6x EVARM',
    nodeBadge: '6x',
    cx: 122,
    cy: 146,
    rx: 24,
    Icon: Wind,
    primaryMetricKey: 'cabin_co2_mmhg',
    trendLabel: 'CO₂ Parcial de Cabina (mmHg)',
    kbIds: ['CSA-RAD-005', 'CSA-RAD-006', 'CSA-RAD-008', 'CSA-RAD-009', 'CSA-RAD-010', 'HRP-RISK-004', 'HRP-RISK-006'],
  },
  {
    id: 'neuro_immune',
    shortLabel: 'Neuro e Inmune',
    title: 'Sistema Neuropsicológico e Inmunitario (Estrés, Sueño y Defensas)',
    badge: 'SNC / PVT',
    nodeBadge: 'PVT',
    cx: 198,
    cy: 76,
    rx: 22,
    Icon: Brain,
    primaryMetricKey: 'pvt_reaction_ms',
    trendLabel: 'Vigilancia Psicomotora PVT (ms)',
    kbIds: ['HRP-RISK-014', 'HRP-RISK-001', 'HRP-RES-007', 'HRP-HAZ-002', 'HRP-RISK-005', 'HRP-RISK-012', 'HRP-RES-010', 'HRP-RES-009'],
  },
];

function worstStatus(list) {
  if (list.includes('critical')) return 'critical';
  if (list.includes('warning')) return 'warning';
  return 'optimal';
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function RadialGauge({
  value,
  max,
  color,
  size = 64,
  strokeWidth = 6,
  displayText,
  subText,
  trackColor = 'rgba(148,163,184,0.22)',
  textClass = 'text-white',
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = clamp(max > 0 ? value / max : 0, 0, 1);
  const offset = circumference * (1 - pct);

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 450ms ease, stroke 300ms ease',
            filter: `drop-shadow(0 0 6px ${color}66)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none text-center">
        <span className={`font-mono text-[11px] font-black ${textClass}`}>{displayText}</span>
        {subText && <span className="font-mono text-[8px] opacity-70 mt-0.5">{subText}</span>}
      </div>
    </div>
  );
}

function LiveEcgWave({ bpm, color, compact = false }) {
  const beatDuration = clamp(60 / Math.max(40, bpm || 68), 0.45, 1.5).toFixed(2);
  const width = compact ? 92 : 210;
  const height = compact ? 26 : 42;
  const pathD = compact
    ? 'M 0 14 L 18 14 L 23 9 L 27 17 L 33 3 L 38 23 L 43 14 L 54 14 L 60 10 L 65 14 L 92 14'
    : 'M 0 22 L 26 22 L 33 15 L 39 27 L 47 4 L 55 37 L 62 22 L 78 22 L 87 16 L 94 22 L 128 22 L 135 15 L 141 27 L 149 4 L 157 37 L 164 22 L 180 22 L 189 16 L 196 22 L 210 22';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeOpacity="0.22"
        strokeWidth="1.5"
      />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={compact ? '1.8' : '2.2'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={compact ? '42 60' : '90 130'}
        style={{
          animation: `hudEcgSweep ${beatDuration}s linear infinite`,
          filter: `drop-shadow(0 0 4px ${color})`,
        }}
      />
    </svg>
  );
}

function MiniSparkline({ points = [], color, label, currentDisplay, avgDisplay, isDark }) {
  if (!points.length) return null;
  const vals = points.map((p) => p.value);
  const minVal = Math.min(...vals);
  const maxVal = Math.max(...vals);
  const span = maxVal - minVal || 1;
  const W = 240;
  const H = 56;
  const PAD = 6;

  const coords = points.map((p, idx) => {
    const x =
      points.length === 1
        ? W / 2
        : PAD + (idx / (points.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((p.value - minVal) / span) * (H - PAD * 2);
    return { x, y, day: p.day, value: p.value };
  });

  const linePath = coords
    .map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ');
  const areaPath =
    coords.length > 1
      ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${H} L ${coords[0].x.toFixed(1)} ${H} Z`
      : '';
  const last = coords[coords.length - 1];

  return (
    <div
      className={`rounded-xl border p-2.5 ${
        isDark
          ? 'bg-slate-950/55 border-cyan-500/20'
          : 'bg-sky-50/75 border-cyan-600/25'
      }`}
    >
      <div className="flex items-center justify-between gap-2 text-[10px] mb-1">
        <span className="font-semibold opacity-80 truncate">{label}</span>
        <div className="font-mono flex items-center gap-2 shrink-0">
          <span className="opacity-65">Prom: {avgDisplay}</span>
          <span className="font-bold" style={{ color }}>
            Hoy: {currentDisplay}
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-12 overflow-visible">
        <defs>
          <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {areaPath && (
          <path d={areaPath} fill={`url(#spark-${color.replace('#', '')})`} />
        )}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {last && (
          <circle
            cx={last.x}
            cy={last.y}
            r="3.5"
            fill={color}
            stroke="#ffffff"
            strokeWidth="1.2"
          />
        )}
      </svg>
    </div>
  );
}

function EvarmComparativeBars({ highlightKey, isDark }) {
  const items = [
    { key: 'skin', label: '6x Piel', mult: 6, max: 25, desc: 'Superficial EVA', color: isDark ? '#00F0FF' : '#0284c7' },
    { key: 'eyes', label: '13x Ojos / Cristalino', mult: 13, max: 25, desc: 'Riesgo cataratas', color: isDark ? '#FFB800' : '#d97706' },
    { key: 'marrow', label: '25x Médula Ósea', mult: 25, max: 25, desc: 'Órganos hematopoyéticos', color: isDark ? '#FF3366' : '#e11d48' },
  ];

  return (
    <div
      className={`rounded-xl border p-2.5 space-y-2 ${
        isDark ? 'bg-slate-950/60 border-cyan-500/20' : 'bg-white/80 border-cyan-600/25'
      }`}
    >
      <div className="flex items-center justify-between text-[10px]">
        <span className={`font-mono font-bold uppercase tracking-wider ${isDark ? 'text-cyan-400' : 'text-cyan-800'}`}>
          EVARM vs Trabajador Nuclear (CSA-RAD-009)
        </span>
        <span className="font-mono opacity-70">6x · 13x · 25x</span>
      </div>
      <div className="space-y-1.5">
        {items.map((it) => {
          const focused = highlightKey === it.key;
          const pct = Math.round((it.mult / it.max) * 100);
          return (
            <div key={it.key} className={`transition-opacity ${highlightKey && !focused ? 'opacity-65' : 'opacity-100'}`}>
              <div className="flex items-center justify-between text-[10px] mb-0.5">
                <span className="font-bold flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ background: it.color, boxShadow: focused ? `0 0 8px ${it.color}` : 'none' }}
                  />
                  {it.label}
                  {focused && (
                    <span
                      className={`px-1 py-0.2 rounded text-[8px] font-mono border ${
                        isDark
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                          : 'bg-cyan-500/15 text-cyan-800 border-cyan-600/35'
                      }`}
                    >
                      FOCO
                    </span>
                  )}
                </span>
                <span className="font-mono text-[9px] opacity-75">{it.desc}</span>
              </div>
              <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: it.color,
                    boxShadow: focused ? `0 0 10px ${it.color}` : 'none',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KbCitationLinks({ records, isDark }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {records.map((rec) => (
        <a
          key={rec.id}
          href={rec.source_url}
          target="_blank"
          rel="noopener noreferrer"
          title={rec.title}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition ${
            isDark
              ? 'bg-cyan-500/12 text-cyan-300 border-cyan-400/35 hover:bg-cyan-500/25'
              : 'bg-sky-500/12 text-sky-800 border-sky-600/30 hover:bg-sky-500/20'
          }`}
        >
          <span>{rec.id}</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-80" />
        </a>
      ))}
    </div>
  );
}

export default function RadiationEvarmModule({
  evaluation,
  knowledgeBase,
  histories = {},
  selectedDay,
  thresholds = {},
  circadianMode = 'day',
  theme,
}) {
  const [selectedEnvId, setSelectedEnvId] = useState('transit');
  const [selectedRegionId, setSelectedRegionId] = useState('musculoskeletal_marrow');
  const [trendWindow, setTrendWindow] = useState('30d');

  const isDark = theme?.isDark ?? circadianMode !== 'day';
  const { dayData, statuses, metrics, isSpeWindow } = evaluation;
  const m = dayData.metrics;
  const missionDay = selectedDay || dayData.mission_day;
  const speActive = dayData.solar_particle_event === true || isSpeWindow;

  const byKey = useMemo(
    () => Object.fromEntries((metrics || []).map((item) => [item.key, item])),
    [metrics]
  );

  // Thresholds read directly from `unified_nasa_csa_kb.json`
  const radWarnMax = thresholds?.cumulative_radiation_msv?.warning_max ?? 120;
  const radCritMax = thresholds?.cumulative_radiation_msv?.critical_max ?? 250;
  const co2OptMax = thresholds?.cabin_co2_mmhg?.optimal_max ?? 2.5;
  const co2WarnMax = thresholds?.cabin_co2_mmhg?.warning_max ?? 3.5;
  const hrOptMax = thresholds?.resting_heart_rate?.optimal_max ?? 78;
  const hrWarnMax = thresholds?.resting_heart_rate?.warning_max ?? 88;
  const boneOptMin = thresholds?.bone_density_index?.optimal_min ?? 97.0;
  const sleepOptMin = thresholds?.sleep_hours?.optimal_min ?? 7.0;
  const pvtOptMax = thresholds?.pvt_reaction_ms?.optimal_max ?? 285;

  // Dynamic semantic status per anatomical region
  const regionStatuses = useMemo(
    () => ({
      head_eyes: worstStatus([
        statuses.cumulative_radiation_msv,
        statuses.cabin_co2_mmhg,
        speActive ? 'critical' : 'optimal',
      ]),
      cardio_thorax: statuses.resting_heart_rate,
      musculoskeletal_marrow: worstStatus([
        statuses.bone_density_index,
        statuses.cumulative_radiation_msv,
        dayData.ared_workout_completed ? 'optimal' : 'warning',
        speActive ? 'critical' : 'optimal',
      ]),
      torso_lungs_skin: worstStatus([
        statuses.cabin_co2_mmhg,
        statuses.cumulative_radiation_msv,
        speActive ? 'critical' : 'optimal',
      ]),
      neuro_immune: worstStatus([statuses.sleep_hours, statuses.pvt_reaction_ms]),
    }),
    [statuses, dayData.ared_workout_completed, speActive]
  );

  const activeEnv =
    MISSION_ENVIRONMENTS.find((e) => e.id === selectedEnvId) || MISSION_ENVIRONMENTS[0];
  const activeRegion =
    ANATOMICAL_REGIONS.find((r) => r.id === selectedRegionId) || ANATOMICAL_REGIONS[2];

  const activeRegionStatus = regionStatuses[activeRegion.id] || 'optimal';
  const activeSemantic = SEMANTIC_HUD[activeRegionStatus];

  const envCitations = useMemo(
    () => resolveKbRecords(knowledgeBase, activeEnv.kbIds),
    [knowledgeBase, activeEnv.kbIds]
  );
  const regionCitations = useMemo(
    () => resolveKbRecords(knowledgeBase, activeRegion.kbIds),
    [knowledgeBase, activeRegion.kbIds]
  );
  const speCitations = useMemo(
    () => resolveKbRecords(knowledgeBase, ['CSA-RAD-006', 'CSA-RAD-009', 'CSA-RAD-010']),
    [knowledgeBase]
  );

  // Radi-N2 neutron fraction (~30% per CSA-RAD-010)
  const estimatedDailyTotal = speActive
    ? Math.max(m.daily_neutron_msv / 0.3, 18.0)
    : Math.max(m.daily_neutron_msv / 0.3, 0.78);
  const neutronPct = clamp(Math.round((m.daily_neutron_msv / estimatedDailyTotal) * 100), 18, 42);

  // Circadian-adaptive HUD container styling
  const hudPanelCls = isDark
    ? circadianMode === 'sunset'
      ? 'bg-[#251008]/80 backdrop-blur-md border-amber-400/25 text-amber-50 shadow-xl shadow-black/35'
      : 'bg-[#071124]/82 backdrop-blur-md border-[#00F0FF]/28 text-slate-100 shadow-xl shadow-black/45'
    : 'bg-white/82 backdrop-blur-md border-cyan-500/35 text-slate-900 shadow-lg shadow-cyan-900/10';

  const hudSubCardCls = isDark
    ? circadianMode === 'sunset'
      ? 'bg-[#1a0a05]/70 border-amber-400/20'
      : 'bg-slate-950/60 border-cyan-400/20'
    : 'bg-sky-50/80 border-cyan-500/25';

  const visorBg =
    circadianMode === 'sunset'
      ? 'from-[#1a0b07] via-[#120912] to-[#080e1a]'
      : circadianMode === 'night'
      ? 'from-[#030916] via-[#061328] to-[#020712]'
      : 'from-[#041426] via-[#071e36] to-[#041120]';

  // Sprout-Bot 1-sentence contextual comment for selected region on selectedDay
  const sproutRegionComment = useMemo(() => {
    switch (activeRegion.id) {
      case 'head_eyes':
        return speActive
          ? `Día ${missionDay}: Tormenta SPE eleva riesgo ocular (13x EVARM); protege cristalino tras blindaje interno.`
          : `Día ${missionDay}: Dosimetría MOSFET y vigilancia SANS estables (CO₂ ${m.cabin_co2_mmhg.toFixed(2)} mmHg · ${m.cumulative_radiation_msv.toFixed(1)} mSv).`;
      case 'cardio_thorax':
        return m.resting_heart_rate > hrWarnMax
          ? `Día ${missionDay}: Pulso elevado en ${m.resting_heart_rate} bpm (>${hrWarnMax}); refuerza hidratación y 1.5h aeróbica/resistiva.`
          : m.resting_heart_rate > hrOptMax
          ? `Día ${missionDay}: Pulso en vigilancia (${m.resting_heart_rate} bpm); mantén rutina aeróbica para prevenir pérdida del 10–12%.`
          : `Día ${missionDay}: Respuesta cardiovascular nominal en ${m.resting_heart_rate} bpm; reserva ortostática protegida.`;
      case 'musculoskeletal_marrow':
        return !dayData.ared_workout_completed
          ? `Día ${missionDay}: Sesión ARED omitida; reactiva carga resistiva para frenar el 1–1.5% de pérdida ósea mensual.`
          : speActive
          ? `Día ${missionDay}: Médula ósea (25x EVARM) bajo alerta SPE (${m.daily_neutron_msv.toFixed(2)} mSv/d neutrones); prioridad refugio ALARA.`
          : `Día ${missionDay}: Índice óseo en ${m.bone_density_index.toFixed(2)}% con ARED completado; columna y médula bajo seguimiento.`;
      case 'torso_lungs_skin':
        return m.cabin_co2_mmhg > co2WarnMax
          ? `Día ${missionDay}: Pico crítico de CO₂ (${m.cabin_co2_mmhg.toFixed(2)} mmHg); optimiza depuración ECLSS y aire de cabina.`
          : `Día ${missionDay}: Atmósfera en ${m.cabin_co2_mmhg.toFixed(2)} mmHg y fracción de neutrones Radi-N2 en ${neutronPct}%.`;
      case 'neuro_immune':
        return m.sleep_hours < sleepOptMin || m.pvt_reaction_ms > pvtOptMax
          ? `Día ${missionDay}: Déficit de sueño (${m.sleep_hours.toFixed(1)}h) y PVT ${Math.round(m.pvt_reaction_ms)} ms; activa LED circadiano y jardín Veggie.`
          : `Día ${missionDay}: Sueño (${m.sleep_hours.toFixed(1)}h) y reflejos PVT (${Math.round(m.pvt_reaction_ms)} ms) sincronizados frente a 16 amaneceres/día.`;
      default:
        return '';
    }
  }, [activeRegion.id, missionDay, speActive, m, dayData.ared_workout_completed, hrWarnMax, hrOptMax, co2WarnMax, sleepOptMin, pvtOptMax, neutronPct]);

  // Environmental scenario interpretation tailored to selected environment + region
  const operationalScenarioCopy = useMemo(() => {
    const map = {
      transit: {
        head_eyes: 'En Tránsito Profundo (0.0g, sin magnetosfera): flujo continuo GCR exige vigilancia ocular MOSFET (13x) y seguimiento SANS.',
        cardio_thorax: 'En Tránsito Profundo (0.0g): descarga hidrostática sostenida tiende a volver el corazón más esférico; crucial mantener 1.5h/día de ejercicio.',
        musculoskeletal_marrow: 'En Tránsito Profundo (0.0g): descarga axial completa exige carga ARED diaria contra 1–1.5%/mes de pérdida ósea y protección de médula (25x).',
        torso_lungs_skin: 'En Tránsito Profundo: blindaje de agua/polietileno atenúa neutrones secundarios (~30% Radi-N2); ECLSS debe mantener CO₂ ≤ 2.5 mmHg.',
        neuro_immune: 'En Tránsito Profundo: aislamiento prolongado y ausencia de ciclos solares requieren iluminación circadiana LED, dieta omega-3 y soporte Veggie.',
      },
      leo_iss: {
        head_eyes: 'En Órbita Baja LEO/ISS (0.0g): protección geomagnética parcial pero exposición a 16 ciclos luz/día y desplazamiento cefálico (SANS ~70%).',
        cardio_thorax: 'En Órbita Baja LEO/ISS (0.0g): adaptación cardiovascular en microgravedad; prendas de compresión e hidratación listas para retorno a 1g.',
        musculoskeletal_marrow: 'En Órbita Baja LEO/ISS (0.0g): elongación espinal hasta 3% y control ARED para preservar densidad ósea y calcio renal.',
        torso_lungs_skin: 'En Órbita Baja LEO/ISS: límites MMOP a 30 días y 1 año; detectores Radi-N2 cuantifican neutrones al cruzar Anomalía del Atlántico Sur.',
        neuro_immune: 'En Órbita Baja LEO/ISS: los 16 amaneceres/atardeceres diarios alteran melatonina, inmunidad y reactivación viral sin protocolo LED circadiano.',
      },
      eva_rover: {
        head_eyes: 'En Traje/Rover EVA: menor blindaje aumenta exposición de cristalino (13x EVARM); dosimetría MOSFET obligatoria y verificación vestibular.',
        cardio_thorax: 'En Traje/Rover EVA: trabajo metabólico presurizado demanda reserva aeróbica óptima y control de pulso en tiempo real.',
        musculoskeletal_marrow: 'En Traje/Rover EVA: exposición 25x en médula ósea fuera del casco; posponer EVA inmediatamente ante alerta NOAA/SRAG o SPE.',
        torso_lungs_skin: 'En Traje/Rover EVA: riesgo de descompresión (DCS) e hipoxia leve por baja presión de traje; pre-respiración O₂ y piel 6x EVARM.',
        neuro_immune: 'En Traje/Rover EVA: carga cognitiva y fatiga operativa alta; exige descansos ≥ 7.0h y tiempo PVT ≤ 285 ms antes de autorizar caminata.',
      },
      lunar_mars: {
        head_eyes: 'En Base Lunar/Marciana (0.16g/0.38g): transición gravitacional desafía el sistema vestibular y sensorimotor al pasar de 0g a gravedad parcial.',
        cardio_thorax: 'En Base Lunar/Marciana (0.16g/0.38g): riesgo de intolerancia ortostática al reintroducir carga gravitacional de 3/8 terrestres (Marte).',
        musculoskeletal_marrow: 'En Base Lunar/Marciana (0.16g/0.38g): carga parcial en fémur y columna requiere transición progresiva para evitar fracturas o hernias discales.',
        torso_lungs_skin: 'En Base Lunar/Marciana: hábitat presurizado con regolito como escudo ante neutrones/GCR y estricto control ECLSS de O₂/CO₂.',
        neuro_immune: 'En Base Lunar/Marciana: retardos de comunicación con Tierra elevan autonomía emocional; jardín Veggie e inmunovigilancia sostienen al equipo.',
      },
    };
    return map[selectedEnvId]?.[activeRegion.id] || activeEnv.summary;
  }, [selectedEnvId, activeRegion.id, activeEnv.summary]);

  // History slice for active region primary metric
  const activeHistory = histories?.[activeRegion.primaryMetricKey];
  const sparkPoints = activeHistory?.series?.[trendWindow] || [];
  const primaryMetricObj = byKey[activeRegion.primaryMetricKey];

  // Region-specific Clinical Facts & Protocols (structured, non-verbose cards)
  const regionClinicalContent = useMemo(() => {
    switch (activeRegion.id) {
      case 'head_eyes':
        return {
          gauges: [
            {
              label: 'Dosis Acumulada',
              value: m.cumulative_radiation_msv,
              max: radCritMax,
              displayText: `${m.cumulative_radiation_msv.toFixed(1)}`,
              subText: 'mSv',
              color: SEMANTIC_HUD[statuses.cumulative_radiation_msv].hex,
              ref: `Umbral: ≤${radWarnMax} / ${radCritMax}`,
            },
            {
              label: 'CO₂ Cabina (Cefalea/SANS)',
              value: m.cabin_co2_mmhg,
              max: 5.0,
              displayText: `${m.cabin_co2_mmhg.toFixed(2)}`,
              subText: 'mmHg',
              color: SEMANTIC_HUD[statuses.cabin_co2_mmhg].hex,
              ref: `Óptimo ≤ ${co2OptMax} mmHg`,
            },
          ],
          facts: [
            { tag: '~70% ISS', text: 'El Síndrome Neuro-Ocular (SANS) afecta a ~70% de astronautas en la ISS por desplazamiento cefálico de fluidos (HRP-RISK-010).' },
            { tag: '13x EVARM', text: 'Exposición ocular/cristalino 13 veces mayor que trabajadores nucleares en Tierra, con riesgo de cataratas (CSA-RAD-004, CSA-RAD-009).' },
            { tag: 'Vestibular', text: 'Transiciones gravitacionales y microgravedad alteran orientación espacial y equilibrio sensorimotor (HRP-RISK-002).' },
          ],
          protocols: [
            { code: 'HRP-RISK-010', title: 'Mitigación SANS', detail: 'Suplementación nutricional e intervenciones mecánicas contra desplazamiento cefálico de fluidos.' },
            { code: 'CSA-RAD-006 / 009', title: 'Dosimetría MOSFET Ocular', detail: 'Sensores MOSFET en cabeza/ojos y resguardo inmediato durante ventanas SPE.' },
            { code: 'HRP-RISK-002', title: 'Adaptación Sensorimotora', detail: 'Evaluación vestibular previa a maniobras críticas y aterrizaje.' },
          ],
        };
      case 'cardio_thorax':
        return {
          gauges: [
            {
              label: 'Frecuencia Reposo',
              value: m.resting_heart_rate,
              max: 110,
              displayText: `${Math.round(m.resting_heart_rate)}`,
              subText: 'bpm',
              color: SEMANTIC_HUD[statuses.resting_heart_rate].hex,
              ref: `Óptimo ≤ ${hrOptMax} · Alerta > ${hrWarnMax}`,
            },
            {
              label: 'Reserva Cardiorresp.',
              value: m.resting_heart_rate <= hrOptMax ? 92 : m.resting_heart_rate <= hrWarnMax ? 76 : 58,
              max: 100,
              displayText: `${m.resting_heart_rate <= hrOptMax ? 92 : m.resting_heart_rate <= hrWarnMax ? 76 : 58}%`,
              subText: 'índ.',
              color: SEMANTIC_HUD[statuses.resting_heart_rate].hex,
              ref: dayData.ared_workout_completed ? 'ARED Completado' : 'Sin ARED hoy',
            },
          ],
          facts: [
            { tag: 'Corazón Esférico', text: 'En microgravedad el corazón adopta una geometría más esférica y genera intolerancia ortostática al reingreso (HRP-RISK-003, HRP-HAZ-005).' },
            { tag: '10%–12% Pérdida', text: 'Desacondicionamiento cardiorrespiratorio promedio del 10% al 12% sin contramedidas diarias (HRP-RISK-009).' },
            { tag: 'Umbrales Clínicos', text: `Evaluación en vivo frente a clinical_thresholds: Óptimo ≤ ${hrOptMax} bpm, Precaución ≤ ${hrWarnMax} bpm.` },
          ],
          protocols: [
            { code: 'HRP-RISK-009', title: 'Rutina 1.5 h/día', detail: 'Entrenamiento aeróbico y resistivo combinado de 1.5 horas diarias en estación.' },
            { code: 'HRP-RISK-003', title: 'Compresión e Hidratación', detail: 'Prendas de compresión del tren inferior e hidratación pre-aterrizaje contra desmayos.' },
          ],
        };
      case 'musculoskeletal_marrow':
        return {
          gauges: [
            {
              label: 'Densidad Ósea',
              value: m.bone_density_index,
              max: 100,
              displayText: `${m.bone_density_index.toFixed(1)}%`,
              subText: 'índice',
              color: SEMANTIC_HUD[statuses.bone_density_index].hex,
              ref: `Óptimo ≥ ${boneOptMin}%`,
            },
            {
              label: 'Neutrones Médula',
              value: m.daily_neutron_msv,
              max: speActive ? 8.0 : 1.0,
              displayText: `${m.daily_neutron_msv.toFixed(2)}`,
              subText: 'mSv/d',
              color: speActive ? '#FF3366' : '#FFB800',
              ref: 'EVARM Médula 25x',
            },
          ],
          facts: [
            { tag: '1%–1.5%/mes', text: 'Pérdida de densidad mineral ósea de 1% a 1.5% mensual en huesos de carga y columna (HRP-RISK-011, HRP-RES-011).' },
            { tag: '3% Columna', text: 'Elongación espinal de hasta 3% en microgravedad con dolor lumbar y riesgo de hernia discal (HRP-RISK-011) + litiasis renal por calcio (HRP-HAZ-005).' },
            { tag: '25x Médula EVARM', text: 'Exposición 25 veces superior en médula ósea y órganos formadores de sangre medida por EVARM y Radi-N2 (CSA-RAD-009, CSA-RAD-010).' },
          ],
          protocols: [
            { code: 'HRP-RISK-009 / 011', title: 'Protocolo Diario ARED', detail: `Ejercicio resistivo de alta carga en ARED (Estado hoy: ${dayData.ared_workout_completed ? 'Completado' : 'PENDIENTE / OMITIDO'}).` },
            { code: 'CSA-RAD-008 / 009', title: 'Vigilancia Hematológica y Ósea', detail: 'Escaneos óseos y conteo hematológico tras picos de radiación solar/neutrones.' },
          ],
        };
      case 'torso_lungs_skin':
        return {
          gauges: [
            {
              label: 'CO₂ en Cabina',
              value: m.cabin_co2_mmhg,
              max: 5.0,
              displayText: `${m.cabin_co2_mmhg.toFixed(2)}`,
              subText: 'mmHg',
              color: SEMANTIC_HUD[statuses.cabin_co2_mmhg].hex,
              ref: `Óptimo ≤ ${co2OptMax} · Crít > ${co2WarnMax}`,
            },
            {
              label: 'Fracción Neutrones',
              value: neutronPct,
              max: 100,
              displayText: `${neutronPct}%`,
              subText: 'Radi-N2',
              color: speActive ? '#FF3366' : '#FFB800',
              ref: `${m.daily_neutron_msv.toFixed(2)} mSv/día`,
            },
          ],
          facts: [
            { tag: '6x Piel EVARM', text: 'Exposición cutánea 6 veces superior en caminatas espaciales EVA documentada con sensores EVARM (CSA-RAD-009).' },
            { tag: '~30% Neutrones', text: 'Aproximadamente 30% de la dosis espacial en ISS proviene de neutrones medidos con detectores de burbuja Radi-N2 (CSA-RAD-010).' },
            { tag: 'ISS MMOP / DCS', text: 'Límites a 30 días y 1 año (ISS MMOP, CSA-RAD-005) más control de hipoxia leve y descompresión DCS (HRP-RISK-004, HRP-RISK-006).' },
          ],
          protocols: [
            { code: 'CSA-RAD-006', title: 'Principio ALARA + NOAA/SRAG', detail: 'Planificación EVA con pronósticos NOAA/SRAG y refugio interno de agua/polietileno ante SPE.' },
            { code: 'HRP-RISK-004 / 006', title: 'Balance O₂ / CO₂ (ECLSS)', detail: 'Pre-respiración O₂ pre-EVA y regulación estricta de presión parcial en cabina.' },
          ],
        };
      case 'neuro_immune':
      default:
        return {
          gauges: [
            {
              label: 'Sueño Diario',
              value: m.sleep_hours,
              max: 9.0,
              displayText: `${m.sleep_hours.toFixed(1)}h`,
              subText: 'sueño',
              color: SEMANTIC_HUD[statuses.sleep_hours].hex,
              ref: `Meta ≥ ${sleepOptMin}h/día`,
            },
            {
              label: 'Reacción PVT',
              value: m.pvt_reaction_ms,
              max: 450,
              displayText: `${Math.round(m.pvt_reaction_ms)}`,
              subText: 'ms',
              color: SEMANTIC_HUD[statuses.pvt_reaction_ms].hex,
              ref: `Óptimo ≤ ${pvtOptMax} ms`,
            },
          ],
          facts: [
            { tag: '16 Ciclos/Día', text: 'En órbita ocurren 16 amaneceres y atardeceres cada 24h, desincronizando el ritmo circadiano y el sueño (HRP-RISK-014).' },
            { tag: 'Inmunidad / Virus', text: 'Alteración inmunitaria, reactivación de virus latentes (HRP-RISK-001, HRP-RES-007) y cambios en el microbioma intestinal (HRP-RISK-005).' },
            { tag: 'SNC / Radiación', text: 'Estrés oxidativo en Sistema Nervioso Central (HRP-HAZ-002) y carga conductual por aislamiento (HRP-RISK-012).' },
          ],
          protocols: [
            { code: 'HRP-RISK-014', title: 'Iluminación LED Circadiana', detail: 'Espectro 480nm de día y luz cálida/oscura nocturna para proteger melatonina orbital.' },
            { code: 'HRP-RISK-012 / RES-010', title: 'Cultivo Terapéutico Veggie', detail: 'Cuidado de Mizuna fresca para bienestar psicológico y regulación de estrés.' },
            { code: 'HRP-RES-009', title: 'Dieta Funcional Mejorada', detail: 'Aporte enriquecido con omega-3, licopeno y flavonoides para inmunidad y salud cardiovascular.' },
          ],
        };
    }
  }, [
    activeRegion.id,
    m,
    statuses,
    radCritMax,
    radWarnMax,
    co2OptMax,
    co2WarnMax,
    hrOptMax,
    hrWarnMax,
    boneOptMin,
    sleepOptMin,
    pvtOptMax,
    dayData.ared_workout_completed,
    speActive,
    neutronPct,
  ]);

  const ecgBeatSec = clamp(60 / Math.max(40, m.resting_heart_rate || 68), 0.45, 1.5).toFixed(2);
  const eclssStatus = statuses.cabin_co2_mmhg;
  const eclssSemantic = SEMANTIC_HUD[eclssStatus];
  const radSemantic = SEMANTIC_HUD[statuses.cumulative_radiation_msv];
  const pickColor = (sem) => (isDark ? sem.hex : sem.lightHex);
  const cyanInk = isDark ? 'text-[#00F0FF]' : 'text-cyan-800';
  const cyanIconInk = isDark ? 'text-[#00F0FF]' : 'text-cyan-700';
  const telemetrySourceLabel = primaryMetricObj?.isLiveOverride
    ? `[Medición Demo en Vivo · Día ${missionDay}]`
    : `[Telemetría Histórica Día ${missionDay}]`;

  return (
    <div className="space-y-3">
      {/* Scoped HUD Keyframes (Laser Sweep + Synced ECG Sweep + Subtle Reticle Spin) */}
      <style>{`
        @keyframes hudLaserSweep {
          0% { transform: translateY(18px); opacity: 0.9; }
          50% { transform: translateY(426px); opacity: 1; }
          100% { transform: translateY(18px); opacity: 0.9; }
        }
        @keyframes hudEcgSweep {
          0% { stroke-dashoffset: 220; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes hudSpinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Immediate Solar Particle Event Alert Ribbon (Days 110-114) */}
      {speActive && (
        <div className="rounded-xl border border-[#FF3366]/70 bg-gradient-to-r from-[#2c0612]/95 via-[#3d0a1a]/95 to-[#2c0612]/95 text-rose-50 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-lg shadow-[#FF3366]/20">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-5 h-5 text-[#FF3366] shrink-0 animate-pulse" />
            <div className="text-xs leading-snug">
              <span className="font-black text-[#FF3366] mr-1.5">
                ALERTA TORMENTA SOLAR (SPE · DÍAS 110–114):
              </span>
              Suspender EVA, activar principio ALARA (CSA-RAD-006) y trasladar tripulación a refugio de agua/polietileno. Vulnerabilidad elevada en Médula (25x) y Cristalino (13x).
            </div>
          </div>
          <KbCitationLinks records={speCitations} isDark />
        </div>
      )}

      {/* A. TOP SUB-BAR: 4 Mission Environments + Global Environmental Micro-Indicators */}
      <section className={`rounded-2xl border p-3 circadian-transition ${hudPanelCls}`}>
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Left: 4 Mission Environments Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <Crosshair className={`w-4 h-4 ${cyanIconInk}`} />
                <span className={`text-[11px] font-mono font-extrabold uppercase tracking-wider ${cyanInk}`}>
                  Módulo 3 HUD · Escáner EVARM y Fisiología Sistémica
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                    primaryMetricObj?.isLiveOverride
                      ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/45'
                      : isDark
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35'
                      : 'bg-cyan-500/12 text-cyan-800 border-cyan-600/35'
                  }`}
                >
                  {telemetrySourceLabel}
                </span>
              </div>
              <KbCitationLinks records={envCitations} isDark={isDark} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {MISSION_ENVIRONMENTS.map((env) => {
                const EnvIcon = env.Icon;
                const active = env.id === selectedEnvId;
                return (
                  <button
                    key={env.id}
                    type="button"
                    onClick={() => setSelectedEnvId(env.id)}
                    className={`px-2.5 py-1.5 rounded-xl border text-left transition flex items-start gap-2 ${
                      active
                        ? isDark
                          ? 'bg-[#00F0FF]/15 border-[#00F0FF]/70 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                          : 'bg-cyan-500/15 border-cyan-600 shadow-sm'
                        : `${hudSubCardCls} hover:border-cyan-400/60 opacity-85 hover:opacity-100`
                    }`}
                  >
                    <EnvIcon
                      className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                        active ? cyanIconInk : 'opacity-70'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold leading-tight truncate">
                        {env.shortLabel}
                      </div>
                      <div className="text-[9px] font-mono opacity-75 truncate">
                        {env.gravity}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: 4 Global Environmental Micro-Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 xl:max-w-[540px] w-full shrink-0">
            {/* 1. Cumulative Radiation */}
            <div className={`rounded-xl border px-2.5 py-1.5 ${hudSubCardCls}`}>
              <div className="text-[9px] font-mono uppercase opacity-75 flex items-center justify-between">
                <span>Dosis Acum.</span>
                <Radiation className="w-3 h-3" style={{ color: pickColor(radSemantic) }} />
              </div>
              <div className="font-mono text-sm font-black mt-0.5" style={{ color: pickColor(radSemantic) }}>
                {m.cumulative_radiation_msv.toFixed(2)}{' '}
                <span className="text-[10px] font-normal opacity-80">mSv</span>
              </div>
              <div className="text-[9px] font-mono opacity-70">Límite: {radWarnMax}/{radCritMax}</div>
            </div>

            {/* 2. Daily Neutron Fraction */}
            <div className={`rounded-xl border px-2.5 py-1.5 ${hudSubCardCls}`}>
              <div className="text-[9px] font-mono uppercase opacity-75 flex items-center justify-between">
                <span>Neutrones Radi-N2</span>
                <Sparkles className={`w-3 h-3 ${isDark ? 'text-amber-400' : 'text-amber-700'}`} />
              </div>
              <div className={`font-mono text-sm font-black mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                {m.daily_neutron_msv.toFixed(2)}{' '}
                <span className="text-[10px] font-normal opacity-80">mSv/d</span>
              </div>
              <div className="text-[9px] font-mono opacity-70">~{neutronPct}% (CSA-RAD-010)</div>
            </div>

            {/* 3. Cabin CO2 & ECLSS */}
            <div className={`rounded-xl border px-2.5 py-1.5 ${hudSubCardCls}`}>
              <div className="text-[9px] font-mono uppercase opacity-75 flex items-center justify-between">
                <span>CO₂ Cabina / ECLSS</span>
                <Wind className="w-3 h-3" style={{ color: pickColor(eclssSemantic) }} />
              </div>
              <div className="font-mono text-sm font-black mt-0.5" style={{ color: pickColor(eclssSemantic) }}>
                {m.cabin_co2_mmhg.toFixed(2)}{' '}
                <span className="text-[10px] font-normal opacity-80">mmHg</span>
              </div>
              <div className="text-[9px] font-mono opacity-75">
                ECLSS: {eclssStatus === 'optimal' ? 'Nominal' : eclssStatus === 'warning' ? 'Depurar' : 'Crítico'}
              </div>
            </div>

            {/* 4. Solar Particle Event Status */}
            <div
              className={`rounded-xl border px-2.5 py-1.5 ${
                speActive
                  ? isDark
                    ? 'bg-[#FF3366]/18 border-[#FF3366]/70 text-rose-100 animate-pulse'
                    : 'bg-rose-600/15 border-rose-600 text-rose-900 animate-pulse'
                  : hudSubCardCls
              }`}
            >
              <div className="text-[9px] font-mono uppercase opacity-75 flex items-center justify-between">
                <span>Clima Solar SPE</span>
                <ShieldAlert
                  className={`w-3 h-3 ${
                    speActive
                      ? isDark
                        ? 'text-[#FF3366]'
                        : 'text-rose-700'
                      : isDark
                      ? 'text-[#00FF66]'
                      : 'text-emerald-700'
                  }`}
                />
              </div>
              <div
                className="font-mono text-xs font-black mt-1"
                style={{
                  color: speActive
                    ? isDark
                      ? '#FF3366'
                      : '#be123c'
                    : isDark
                    ? '#00FF66'
                    : '#047857',
                }}
              >
                {speActive ? 'SPE ACTIVO' : 'SIN TORMENTA'}
              </div>
              <div className="text-[9px] font-mono opacity-75">
                {speActive ? 'Ventana Días 110–114' : `Retardo Tierra ${dayData.earth_comm_delay_min}m`}
              </div>
            </div>
          </div>
        </div>

        {/* 5 Anatomical Region Quick-Select Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 mt-2.5 pt-2.5 border-t border-cyan-500/20">
          {ANATOMICAL_REGIONS.map((reg, index) => {
            const RegIcon = reg.Icon;
            const st = regionStatuses[reg.id];
            const sem = SEMANTIC_HUD[st];
            const active = reg.id === activeRegion.id;
            return (
              <button
                key={reg.id}
                type="button"
                onClick={() => setSelectedRegionId(reg.id)}
                className={`px-2.5 py-1.5 rounded-xl border text-left transition flex items-center justify-between gap-2 ${
                  active
                    ? isDark
                      ? 'bg-cyan-500/18 border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                      : 'bg-cyan-500/15 border-cyan-600 shadow-sm'
                    : `${hudSubCardCls} opacity-85 hover:opacity-100`
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <RegIcon
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: active ? (isDark ? '#00F0FF' : '#0369a1') : pickColor(sem) }}
                  />
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold truncate">
                      {index + 1}. {reg.shortLabel}
                    </div>
                    <div className="text-[8px] font-mono opacity-70 truncate">{reg.badge}</div>
                  </div>
                </div>
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: sem.hex, boxShadow: `0 0 8px ${sem.hex}` }}
                  title={sem.label}
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* B, C & D. SINGLE-VIEW 3-COLUMN HUD SCANNER WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* C-LEFT: Telemetry, Radial Gauges, EVARM Comparative Bars, Sparkline & Operational Scenario */}
        <section className={`lg:col-span-4 rounded-2xl border p-3.5 flex flex-col justify-between gap-3 circadian-transition ${hudPanelCls}`}>
          <div className="space-y-2.5">
            {/* Explicit Traceability Label */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span
                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${
                  isDark
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35'
                    : 'bg-cyan-500/12 text-cyan-800 border-cyan-600/35'
                }`}
              >
                [Dato Telemetría Día Actual]
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border inline-flex items-center gap-1 ${
                  isDark ? activeSemantic.badgeDark : activeSemantic.badgeLight
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: activeSemantic.hex }}
                />
                {STATUS_META[activeRegionStatus]?.label || activeSemantic.label}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-extrabold leading-snug flex items-center gap-2">
                <activeRegion.Icon className={`w-4 h-4 shrink-0 ${cyanIconInk}`} />
                <span>{activeRegion.title}</span>
              </h3>
            </div>

            {/* Dual Radial Gauges for Active Region */}
            <div className="grid grid-cols-2 gap-2">
              {regionClinicalContent.gauges.map((g) => (
                <div
                  key={g.label}
                  className={`rounded-xl border p-2 flex items-center gap-2 ${hudSubCardCls}`}
                >
                  <RadialGauge
                    value={g.value}
                    max={g.max}
                    color={!isDark && g.color === '#00FF66' ? '#059669' : !isDark && g.color === '#FFB800' ? '#d97706' : g.color}
                    size={54}
                    strokeWidth={5}
                    displayText={g.displayText}
                    subText={g.subText}
                    trackColor={isDark ? 'rgba(148,163,184,0.22)' : 'rgba(15,23,42,0.12)'}
                    textClass={isDark ? 'text-white' : 'text-slate-900'}
                  />
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold leading-tight">{g.label}</div>
                    <div className="text-[9px] font-mono opacity-75 mt-0.5 leading-tight">
                      {g.ref}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Synced ECG Wave (featured on Cardio) or EVARM 6x/13x/25x Comparative Bars */}
            {activeRegion.id === 'cardio_thorax' ? (
              <div className={`rounded-xl border p-2.5 ${hudSubCardCls}`}>
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className={`font-mono font-bold uppercase ${cyanInk}`}>
                    Onda ECG Sincronizada en Vivo
                  </span>
                  <span
                    className="font-mono font-bold"
                    style={{ color: pickColor(SEMANTIC_HUD[statuses.resting_heart_rate]) }}
                  >
                    {Math.round(m.resting_heart_rate)} bpm · {ecgBeatSec}s/ciclo
                  </span>
                </div>
                <div className="h-10">
                  <LiveEcgWave
                    bpm={m.resting_heart_rate}
                    color={pickColor(SEMANTIC_HUD[statuses.resting_heart_rate])}
                  />
                </div>
              </div>
            ) : (
              <EvarmComparativeBars
                highlightKey={
                  activeRegion.id === 'head_eyes'
                    ? 'eyes'
                    : activeRegion.id === 'musculoskeletal_marrow'
                    ? 'marrow'
                    : activeRegion.id === 'torso_lungs_skin'
                    ? 'skin'
                    : null
                }
                isDark={isDark}
              />
            )}

            {/* 7d / 30d Mini Trend Curve from History Service */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase opacity-75">
                  Tendencia Histórica Biomarcador
                </span>
                <div className="inline-flex rounded-lg border border-cyan-500/35 overflow-hidden text-[9px] font-mono">
                  {['7d', '30d'].map((win) => (
                    <button
                      key={win}
                      type="button"
                      onClick={() => setTrendWindow(win)}
                      className={`px-2 py-0.5 font-bold transition ${
                        trendWindow === win
                          ? isDark
                            ? 'bg-[#00F0FF] text-slate-950'
                            : 'bg-cyan-700 text-white'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {win.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <MiniSparkline
                points={sparkPoints}
                color={pickColor(activeSemantic)}
                label={activeRegion.trendLabel}
                currentDisplay={primaryMetricObj ? `${primaryMetricObj.formattedValue} ${primaryMetricObj.unit}` : ''}
                avgDisplay={
                  activeHistory
                    ? `${trendWindow === '7d' ? activeHistory.avg7d : activeHistory.avg30d}`
                    : '-'
                }
                isDark={isDark}
              />
            </div>
          </div>

          {/* Explicit Operational Scenario Context Card */}
          <div className={`rounded-xl border p-2.5 space-y-1 ${hudSubCardCls}`}>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                  isDark
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/35'
                    : 'bg-indigo-500/12 text-indigo-800 border-indigo-500/35'
                }`}
              >
                [Escenario Operativo]
              </span>
              <span className={`text-[10px] font-mono font-bold ${cyanInk}`}>
                {activeEnv.shortLabel} · {activeEnv.gravity}
              </span>
            </div>
            <p className="text-[11px] leading-snug opacity-90">{operationalScenarioCopy}</p>
          </div>
        </section>

        {/* B-CENTER: 1:1 Multi-Layer Interactive Vector Body Hologram + 4 Corner HUD Markers */}
        <section
          className={`lg:col-span-4 rounded-2xl border relative overflow-hidden p-3 flex flex-col justify-between min-h-[500px] bg-gradient-to-b ${visorBg} ${
            speActive ? 'border-[#FF3366]/80 shadow-[0_0_28px_rgba(255,51,102,0.25)]' : 'border-[#00F0FF]/40 shadow-[0_0_26px_rgba(0,240,255,0.14)]'
          } text-slate-100`}
        >
          {/* Subtle Aerospace Technical HUD Grid Overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(0,240,255,0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,240,255,0.16) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Top 2 Floating Corner Markers */}
          <div className="relative z-20 grid grid-cols-2 gap-2">
            {/* Corner 1 (Top-Left): Heart Rate + Live Synced ECG */}
            <button
              type="button"
              onClick={() => setSelectedRegionId('cardio_thorax')}
              className="rounded-xl border border-[#00F0FF]/35 bg-[#04101e]/85 backdrop-blur-md p-2 text-left hover:border-[#00F0FF] transition"
            >
              <div className="flex items-center justify-between text-[9px] font-mono text-cyan-300">
                <span>CARDIO / PULSO</span>
                <HeartPulse
                  className="w-3 h-3"
                  style={{ color: SEMANTIC_HUD[statuses.resting_heart_rate].hex }}
                />
              </div>
              <div className="flex items-baseline justify-between gap-1 mt-0.5">
                <span
                  className="font-mono text-base font-black"
                  style={{ color: SEMANTIC_HUD[statuses.resting_heart_rate].hex }}
                >
                  {Math.round(m.resting_heart_rate)}{' '}
                  <span className="text-[10px] font-semibold">bpm</span>
                </span>
                <span className="text-[8px] font-mono text-slate-400">{ecgBeatSec}s</span>
              </div>
              <div className="h-5 mt-0.5">
                <LiveEcgWave
                  bpm={m.resting_heart_rate}
                  color={SEMANTIC_HUD[statuses.resting_heart_rate].hex}
                  compact
                />
              </div>
            </button>

            {/* Corner 2 (Top-Right): Radiation Dose + Radi-N2 Neutrons + Progress Gauge */}
            <button
              type="button"
              onClick={() => setSelectedRegionId('torso_lungs_skin')}
              className="rounded-xl border border-[#00F0FF]/35 bg-[#04101e]/85 backdrop-blur-md p-2 text-left hover:border-[#00F0FF] transition flex items-center justify-between gap-1.5"
            >
              <div className="min-w-0">
                <div className="text-[9px] font-mono text-cyan-300">EVARM / DOSIS</div>
                <div
                  className="font-mono text-sm font-black leading-tight mt-0.5"
                  style={{ color: radSemantic.hex }}
                >
                  {m.cumulative_radiation_msv.toFixed(1)}{' '}
                  <span className="text-[9px] font-normal">mSv</span>
                </div>
                <div className="text-[9px] font-mono text-amber-300 truncate">
                  N₂: {m.daily_neutron_msv.toFixed(2)} mSv/d
                </div>
              </div>
              <RadialGauge
                value={m.cumulative_radiation_msv}
                max={radCritMax}
                color={radSemantic.hex}
                size={42}
                strokeWidth={4.5}
                displayText={`${Math.round((m.cumulative_radiation_msv / radCritMax) * 100)}%`}
                trackColor="rgba(0,240,255,0.16)"
              />
            </button>
          </div>

          {/* Center 1:1 Multi-Layer Interactive Vector Anatomy SVG */}
          <div className="relative z-10 flex-1 flex items-center justify-center my-1">
            {/* Vertical Animated Scan Laser Ring / Plane */}
            <div
              className="pointer-events-none absolute left-6 right-6 z-20 flex items-center"
              style={{
                top: 0,
                animation: 'hudLaserSweep 4.8s ease-in-out infinite',
              }}
            >
              <div
                className="w-full h-[2px]"
                style={{
                  background: speActive
                    ? 'linear-gradient(90deg, transparent, #FF3366, #ffffff, #FF3366, transparent)'
                    : 'linear-gradient(90deg, transparent, #00F0FF, #ffffff, #00F0FF, transparent)',
                  boxShadow: speActive ? '0 0 14px #FF3366' : '0 0 14px #00F0FF',
                }}
              />
            </div>

            <svg
              viewBox="0 0 320 460"
              className="w-full max-w-[305px] h-[360px] select-none"
              aria-label="Escáner Corporal Anatómico Interactivo AURA-7"
            >
              <defs>
                <radialGradient id="speSolarAura" cx="50%" cy="45%" r="52%">
                  <stop offset="0%" stopColor="#FF3366" stopOpacity="0.34" />
                  <stop offset="65%" stopColor="#FF3366" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#FF3366" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="hudCoreGlow" cx="50%" cy="45%" r="50%">
                  <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Background Hologram Core Glow or SPE Solar Alert Aura */}
              <ellipse
                cx="160"
                cy="225"
                rx="132"
                ry="205"
                fill={speActive ? 'url(#speSolarAura)' : 'url(#hudCoreGlow)'}
              />

              {/* SPE Concentric Alert Waves (Days 110-114) */}
              {speActive && (
                <g stroke="#FF3366" fill="none" strokeDasharray="5 4" opacity="0.7">
                  <ellipse cx="160" cy="225" rx="122" ry="198" strokeWidth="1.3">
                    <animate attributeName="opacity" values="0.25;0.85;0.25" dur="1.6s" repeatCount="indefinite" />
                  </ellipse>
                  <ellipse cx="160" cy="225" rx="108" ry="182" strokeWidth="1" />
                </g>
              )}

              {/* Calibration Scale Bars (Left & Right HUD Telemetry Rulers) */}
              <g stroke="#00F0FF" strokeOpacity="0.38" strokeWidth="1" fontFamily="monospace" fontSize="7" fill="#00F0FF">
                <line x1="16" y1="28" x2="16" y2="432" />
                <line x1="304" y1="28" x2="304" y2="432" />
                {[45, 115, 185, 255, 325, 395].map((yPos) => (
                  <g key={yPos}>
                    <line x1="16" y1={yPos} x2="25" y2={yPos} />
                    <line x1="295" y1={yPos} x2="304" y2={yPos} />
                  </g>
                ))}
                <text x="20" y="20" fillOpacity="0.8">1:1 HUD // {activeEnv.gravity.split(' ')[0]}</text>
                <text x="235" y="20" fillOpacity="0.8">EVA-SCAN</text>
              </g>

              {/* LAYER 1: 1:1 Anatomical Hologram Body Contour */}
              <g
                fill={speActive ? 'rgba(255,51,102,0.09)' : 'rgba(0,240,255,0.08)'}
                stroke={speActive ? '#FF668C' : '#00F0FF'}
                strokeOpacity="0.85"
                strokeWidth="1.75"
                strokeLinejoin="round"
              >
                {/* Head & Neck */}
                <path d="M 160 18 C 141 18 132 31 132 47 C 132 61 139 71 146 76 L 146 89 L 174 89 L 174 76 C 181 71 188 61 188 47 C 188 31 179 18 160 18 Z" />
                {/* Shoulders, Torso, Waist & Pelvis */}
                <path d="M 146 89 L 106 99 C 96 102 91 111 89 124 L 74 205 L 67 238 C 66 245 71 250 77 248 L 86 218 L 105 148 L 111 196 L 115 248 L 154 252 L 160 256 L 166 252 L 205 248 L 209 196 L 215 148 L 234 218 L 243 248 C 249 250 254 245 253 238 L 246 205 L 231 124 C 229 111 224 102 214 99 L 174 89 Z" />
                {/* Left & Right Legs (Thighs, Knees, Calves, Feet) */}
                <path d="M 115 248 L 110 330 L 115 418 L 106 436 L 130 438 L 134 416 L 144 330 L 156 264 Z" />
                <path d="M 205 248 L 210 330 L 205 418 L 214 436 L 190 438 L 186 416 L 176 330 L 164 264 Z" />
              </g>

              {/* LAYER 2: Load-Bearing Skeletal Structure & Bone Marrow Core */}
              <g stroke="#94a3b8" strokeOpacity="0.65" fill="none" strokeLinecap="round">
                {/* Clavicles */}
                <path d="M 115 104 Q 138 97 160 103 Q 182 97 205 104" strokeWidth="2.2" />
                {/* Ribcage Wireframe Arcs */}
                {[114, 125, 136, 147, 158].map((ry, i) => (
                  <path
                    key={ry}
                    d={`M ${126 + i * 2} ${ry} Q 160 ${ry + 7} ${194 - i * 2} ${ry}`}
                    strokeWidth="1.2"
                    strokeOpacity="0.45"
                  />
                ))}
                {/* Segmented Vertebral Column */}
                {[92, 102, 112, 122, 132, 142, 152, 162, 174, 186, 198, 210, 222].map((vy) => (
                  <rect
                    key={vy}
                    x="154"
                    y={vy}
                    width="12"
                    height="6"
                    rx="2"
                    fill={regionStatuses.musculoskeletal_marrow === 'optimal' ? '#00FF66' : SEMANTIC_HUD[regionStatuses.musculoskeletal_marrow].hex}
                    fillOpacity="0.28"
                    stroke={SEMANTIC_HUD[regionStatuses.musculoskeletal_marrow].hex}
                    strokeWidth="0.9"
                  />
                ))}
                {/* Pelvic Crest & Femoral Marrow */}
                <path
                  d="M 125 224 Q 160 242 195 224 L 188 244 Q 160 250 132 244 Z"
                  fill={SEMANTIC_HUD[regionStatuses.musculoskeletal_marrow].hex}
                  fillOpacity="0.18"
                  stroke={SEMANTIC_HUD[regionStatuses.musculoskeletal_marrow].hex}
                  strokeWidth="1.4"
                />
                <line x1="130" y1="246" x2="124" y2="338" stroke="#e2e8f0" strokeOpacity="0.55" strokeWidth="3.5" />
                <line x1="190" y1="246" x2="196" y2="338" stroke="#e2e8f0" strokeOpacity="0.55" strokeWidth="3.5" />
                {/* Inner Medullary Cavity Highlight */}
                <line x1="130" y1="252" x2="125" y2="328" stroke={SEMANTIC_HUD[regionStatuses.musculoskeletal_marrow].hex} strokeWidth="1.4" strokeDasharray="4 3" />
                <line x1="190" y1="252" x2="195" y2="328" stroke={SEMANTIC_HUD[regionStatuses.musculoskeletal_marrow].hex} strokeWidth="1.4" strokeDasharray="4 3" />
              </g>

              {/* LAYER 3: Pulmonary Lobes & Cardiac Silhouette */}
              <g>
                {/* Lungs */}
                <path
                  d="M 152 108 C 134 108 122 126 122 150 C 122 162 134 166 150 162 Z"
                  fill={SEMANTIC_HUD[regionStatuses.torso_lungs_skin].hex}
                  fillOpacity="0.16"
                  stroke={SEMANTIC_HUD[regionStatuses.torso_lungs_skin].hex}
                  strokeWidth="1.3"
                />
                <path
                  d="M 168 108 C 186 108 198 126 198 150 C 198 162 186 166 170 162 Z"
                  fill={SEMANTIC_HUD[regionStatuses.torso_lungs_skin].hex}
                  fillOpacity="0.16"
                  stroke={SEMANTIC_HUD[regionStatuses.torso_lungs_skin].hex}
                  strokeWidth="1.3"
                />
                {/* Anatomical Heart Pulse */}
                <path
                  d="M 160 124 C 154 116 144 121 147 132 C 150 142 164 150 172 152 C 178 143 182 130 175 121 C 170 116 163 119 160 124 Z"
                  fill={SEMANTIC_HUD[statuses.resting_heart_rate].hex}
                  fillOpacity="0.48"
                  stroke="#ffffff"
                  strokeWidth="1.1"
                >
                  <animate
                    attributeName="fill-opacity"
                    values="0.32;0.78;0.32"
                    dur={`${ecgBeatSec}s`}
                    repeatCount="indefinite"
                  />
                </path>
              </g>

              {/* LAYER 4: Central Nervous System, Brain & Ocular Tracts */}
              <g fill="none">
                <ellipse
                  cx="160"
                  cy="38"
                  rx="18"
                  ry="13"
                  fill={SEMANTIC_HUD[regionStatuses.neuro_immune].hex}
                  fillOpacity="0.22"
                  stroke={SEMANTIC_HUD[regionStatuses.neuro_immune].hex}
                  strokeWidth="1.3"
                />
                {/* Eyes / Ocular Lens Nodes */}
                <circle cx="151" cy="46" r="3" fill={SEMANTIC_HUD[regionStatuses.head_eyes].hex} />
                <circle cx="169" cy="46" r="3" fill={SEMANTIC_HUD[regionStatuses.head_eyes].hex} />
                {/* Spinal Nerve Axis */}
                <line
                  x1="160"
                  y1="52"
                  x2="160"
                  y2="232"
                  stroke="#00F0FF"
                  strokeWidth="1.8"
                  strokeDasharray="3 3"
                  strokeOpacity="0.75"
                />
              </g>

              {/* Dynamic Targeting Reticle Locked on Selected Anatomical Region */}
              <g
                transform={`translate(${activeRegion.cx}, ${activeRegion.cy})`}
                className="pointer-events-none"
                style={{ transition: 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1)' }}
              >
                <circle
                  r={activeRegion.rx + 8}
                  fill="none"
                  stroke="#00F0FF"
                  strokeWidth="1.2"
                  strokeDasharray="6 4"
                  style={{ animation: 'hudSpinSlow 10s linear infinite' }}
                />
                <path
                  d={`M -${activeRegion.rx + 12} 0 L -${activeRegion.rx + 4} 0 M ${activeRegion.rx + 4} 0 L ${activeRegion.rx + 12} 0 M 0 -${activeRegion.rx + 12} L 0 -${activeRegion.rx + 4} M 0 ${activeRegion.rx + 4} L 0 ${activeRegion.rx + 12}`}
                  stroke="#00F0FF"
                  strokeWidth="1.5"
                />
              </g>

              {/* LAYER 5: 5 Interactive Clickable Anatomical Region Hotspots */}
              {ANATOMICAL_REGIONS.map((reg) => {
                const st = regionStatuses[reg.id];
                const hex = SEMANTIC_HUD[st].hex;
                const active = reg.id === activeRegion.id;
                return (
                  <g
                    key={reg.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedRegionId(reg.id)}
                    onMouseEnter={() => setSelectedRegionId(reg.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedRegionId(reg.id);
                      }
                    }}
                    className="cursor-pointer outline-none"
                  >
                    <circle
                      cx={reg.cx}
                      cy={reg.cy}
                      r={active ? 19 : 14}
                      fill={hex}
                      fillOpacity={active ? '0.24' : '0.14'}
                    >
                      {(active || st !== 'optimal') && (
                        <animate
                          attributeName="r"
                          values={active ? '16;24;16' : '13;18;13'}
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      )}
                    </circle>
                    <circle
                      cx={reg.cx}
                      cy={reg.cy}
                      r={11.5}
                      fill="#04101f"
                      fillOpacity="0.88"
                      stroke={active ? '#00F0FF' : hex}
                      strokeWidth={active ? '2.4' : '1.8'}
                    />
                    <text
                      x={reg.cx}
                      y={reg.cy + 3}
                      textAnchor="middle"
                      fill={hex}
                      fontSize="7.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {reg.nodeBadge}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Bottom 2 Floating Corner Markers */}
          <div className="relative z-20 grid grid-cols-2 gap-2">
            {/* Corner 3 (Bottom-Left): Bone Density Index + ARED Status */}
            <button
              type="button"
              onClick={() => setSelectedRegionId('musculoskeletal_marrow')}
              className="rounded-xl border border-[#00F0FF]/35 bg-[#04101e]/85 backdrop-blur-md p-2 text-left hover:border-[#00F0FF] transition"
            >
              <div className="flex items-center justify-between text-[9px] font-mono text-cyan-300">
                <span>ÓSEO / ARED</span>
                <Bone
                  className="w-3 h-3"
                  style={{ color: SEMANTIC_HUD[regionStatuses.musculoskeletal_marrow].hex }}
                />
              </div>
              <div
                className="font-mono text-sm font-black mt-0.5"
                style={{ color: SEMANTIC_HUD[statuses.bone_density_index].hex }}
              >
                {m.bone_density_index.toFixed(2)}%
              </div>
              <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border bg-slate-900/90 border-cyan-500/30">
                <Dumbbell className="w-2.5 h-2.5" />
                <span
                  style={{
                    color: dayData.ared_workout_completed ? '#00FF66' : '#FFB800',
                  }}
                >
                  {dayData.ared_workout_completed ? 'ARED OK' : 'SIN ARED'}
                </span>
              </div>
            </button>

            {/* Corner 4 (Bottom-Right): PVT & Sleep + Sprout-Bot Micro-Copilot */}
            <button
              type="button"
              onClick={() => setSelectedRegionId('neuro_immune')}
              className="rounded-xl border border-[#00F0FF]/35 bg-[#04101e]/85 backdrop-blur-md p-2 text-left hover:border-[#00F0FF] transition"
            >
              <div className="flex items-center justify-between text-[9px] font-mono text-cyan-300">
                <span>PVT · SUEÑO</span>
                <span
                  className="font-bold"
                  style={{ color: SEMANTIC_HUD[regionStatuses.neuro_immune].hex }}
                >
                  {Math.round(m.pvt_reaction_ms)}ms · {m.sleep_hours.toFixed(1)}h
                </span>
              </div>
              <div className="mt-1 flex items-start gap-1.5">
                <span className="w-5 h-5 rounded-lg bg-[#00FF66]/15 border border-[#00FF66]/45 flex items-center justify-center shrink-0 mt-0.5">
                  <Sprout className="w-3 h-3 text-[#00FF66]" />
                </span>
                <p className="text-[9.5px] leading-tight text-slate-200 line-clamp-3">
                  <strong className="text-cyan-300">Sprout-Bot:</strong> {sproutRegionComment}
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* D-RIGHT: Scientific NASA/CSA Correlations, Protocols & Verified Clickable Sources */}
        <section className={`lg:col-span-4 rounded-2xl border p-3.5 flex flex-col justify-between gap-3 circadian-transition ${hudPanelCls}`}>
          <div className="space-y-2.5">
            {/* Explicit Traceability Label */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span
                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${
                  isDark
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/35'
                    : 'bg-indigo-500/12 text-indigo-800 border-indigo-500/35'
                }`}
              >
                [Referencia Científica NASA/CSA]
              </span>
              <span className={`text-[10px] font-mono font-semibold ${cyanInk}`}>
                {regionCitations.length} registros verificados
              </span>
            </div>

            {/* Compact Physiological & Radiation Correlations */}
            <div className="space-y-1.5">
              {regionClinicalContent.facts.map((fact) => (
                <div
                  key={fact.tag}
                  className={`rounded-xl border p-2.5 flex items-start gap-2 ${hudSubCardCls}`}
                >
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-black shrink-0 border ${
                      isDark
                        ? 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/35'
                        : 'bg-cyan-500/15 text-cyan-800 border-cyan-600/35'
                    }`}
                  >
                    {fact.tag}
                  </span>
                  <p className="text-[11px] leading-snug opacity-90">{fact.text}</p>
                </div>
              ))}
            </div>

            {/* Active Operational Countermeasure Protocols */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                <Activity className={`w-3.5 h-3.5 ${isDark ? 'text-[#00FF66]' : 'text-emerald-700'}`} />
                <span>Protocolos y Contramedidas Activas</span>
              </div>
              {regionClinicalContent.protocols.map((proto) => (
                <div
                  key={proto.code}
                  className={`rounded-xl border p-2.5 flex items-start gap-2 ${hudSubCardCls}`}
                >
                  {activeRegionStatus === 'critical' ? (
                    <AlertTriangle
                      className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                        isDark ? 'text-[#FF3366]' : 'text-rose-700'
                      }`}
                    />
                  ) : (
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                        isDark ? 'text-[#00FF66]' : 'text-emerald-700'
                      }`}
                    />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-extrabold">{proto.title}</span>
                      <span className={`text-[9px] font-mono font-bold ${cyanInk}`}>
                        {proto.code}
                      </span>
                    </div>
                    <p className="text-[10.5px] leading-snug opacity-80 mt-0.5">
                      {proto.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clickable Official NASA HRP & CSA Knowledge Base Cards */}
          <div className={`rounded-xl border p-2.5 space-y-2 ${hudSubCardCls}`}>
            <div className="flex items-center justify-between text-[10px]">
              <span className={`font-mono font-bold uppercase ${cyanInk}`}>
                Fuentes Oficiales NASA HRP / CSA
              </span>
              <span className="font-mono opacity-65">Clic para abrir URL</span>
            </div>
            <KbCitationLinks records={regionCitations} isDark={isDark} />
            {regionCitations[0] && (
              <p className="text-[10px] leading-tight opacity-75">
                <strong>{regionCitations[0].id}:</strong> {regionCitations[0].title}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
