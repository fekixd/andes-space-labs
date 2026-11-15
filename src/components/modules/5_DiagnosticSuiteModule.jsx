import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Brain,
  CheckCircle2,
  Compass,
  Crosshair,
  Database,
  Dumbbell,
  ExternalLink,
  Eye,
  FileText,
  Gauge,
  Play,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Sprout,
  Zap,
} from 'lucide-react';
import { STATUS_META, resolveKbRecords } from '../../services/evaluationEngine';

const STATION_META = [
  {
    id: 'pvt',
    code: 'ST-01',
    title: 'Neuro-Cognitiva (PVT)',
    shortTitle: 'Estación PVT 10s',
    evalFocus: 'Fatiga, déficit de sueño y estrés (HRP-RISK-014)',
    hardwareLabel: 'PSYCHOMOTOR VIGILANCE UNIT · 10s',
    durationSec: 10,
    unit: 'ms',
    refLabel: 'Óptimo ≤ 285 ms · Precaución 286–345 ms · Crítico > 345 ms',
    syncTargetLabel: 'pvt_reaction_ms (Cognición)',
    Icon: Brain,
    kbIds: ['HRP-RISK-014', 'HRP-RISK-012', 'HRP-HAZ-003'],
    presets: [
      { label: '235 ms', value: 235, status: 'optimal' },
      { label: '315 ms', value: 315, status: 'warning' },
      { label: '395 ms', value: 395, status: 'critical' },
    ],
  },
  {
    id: 'sans',
    code: 'ST-02',
    title: 'Oftalmológica SANS (Amsler)',
    shortTitle: 'Rejilla de Amsler SANS',
    evalFocus: 'Edema de papila y desplazamiento cefálico ~70% ISS (HRP-RISK-010)',
    hardwareLabel: 'OPHTHALMIC AMSLER SCANNER · 10s',
    durationSec: 10,
    unit: '%',
    refLabel: 'Óptimo ≥ 85% · Precaución 65–84% · Crítico < 65%',
    syncTargetLabel: 'cabin_co2_mmhg (Carga Cefálica)',
    Icon: Eye,
    kbIds: ['HRP-RISK-010', 'CSA-RAD-004'],
    presets: [
      { label: '94%', value: 94, status: 'optimal' },
      { label: '74%', value: 74, status: 'warning' },
      { label: '48%', value: 48, status: 'critical' },
    ],
  },
  {
    id: 'vestibular',
    code: 'ST-03',
    title: 'Vestibular / Sensorimotora',
    shortTitle: 'Tracking Hand-Eye 10s',
    evalFocus: 'Desorientación, mareo espacial y propiocepción (HRP-RISK-002)',
    hardwareLabel: 'NEUROVESTIBULAR LASER TRACKER · 10s',
    durationSec: 10,
    unit: '% ToT',
    refLabel: 'Óptimo ≥ 80% · Precaución 55–79% · Crítico < 55%',
    syncTargetLabel: 'resting_heart_rate (Estrés Vestibular)',
    Icon: Compass,
    kbIds: ['HRP-RISK-002', 'HRP-HAZ-005'],
    presets: [
      { label: '89%', value: 89, status: 'optimal' },
      { label: '68%', value: 68, status: 'warning' },
      { label: '41%', value: 41, status: 'critical' },
    ],
  },
  {
    id: 'grip',
    code: 'ST-04',
    title: 'Dinamómetro Isométrico',
    shortTitle: 'Fuerza de Agarre ISS',
    evalFocus: 'Atrofia muscular y pérdida ósea 1–1.5%/mes (HRP-RISK-009 / 011)',
    hardwareLabel: 'ISS HANDGRIP DYNAMOMETER · 5s',
    durationSec: 5,
    unit: 'KgF',
    refLabel: 'Óptimo ≥ 48 KgF (471 N) · Precaución 35–47 · Crítico < 35 KgF',
    syncTargetLabel: 'bone_density_index (Índice Óseo)',
    Icon: Dumbbell,
    kbIds: ['HRP-RISK-009', 'HRP-RISK-011'],
    presets: [
      { label: '56 KgF', value: 56, status: 'optimal' },
      { label: '41 KgF', value: 41, status: 'warning' },
      { label: '27 KgF', value: 27, status: 'critical' },
    ],
  },
];

function classifyDiagnostic(stationId, value, thresholds) {
  switch (stationId) {
    case 'pvt': {
      const optMax = thresholds?.pvt_reaction_ms?.optimal_max ?? 285;
      const warnMax = thresholds?.pvt_reaction_ms?.warning_max ?? 345;
      if (value > warnMax) return 'critical';
      if (value > optMax) return 'warning';
      return 'optimal';
    }
    case 'sans': {
      if (value < 65) return 'critical';
      if (value < 85) return 'warning';
      return 'optimal';
    }
    case 'vestibular': {
      if (value < 55) return 'critical';
      if (value < 80) return 'warning';
      return 'optimal';
    }
    case 'grip': {
      if (value < 35) return 'critical';
      if (value < 48) return 'warning';
      return 'optimal';
    }
    default:
      return 'optimal';
  }
}

function mapResultsToGlobalTelemetry(resultsMap) {
  const mapped = {};
  if (resultsMap.pvt) {
    mapped.pvt_reaction_ms = Math.round(resultsMap.pvt.value);
  }
  if (resultsMap.sans) {
    const st = resultsMap.sans.status;
    mapped.cabin_co2_mmhg = st === 'critical' ? 3.75 : st === 'warning' ? 2.95 : 2.15;
  }
  if (resultsMap.vestibular) {
    const st = resultsMap.vestibular.status;
    mapped.resting_heart_rate = st === 'critical' ? 94 : st === 'warning' ? 83 : 66;
  }
  if (resultsMap.grip) {
    const st = resultsMap.grip.status;
    mapped.bone_density_index = st === 'critical' ? 92.1 : st === 'warning' ? 95.6 : 98.8;
  }
  return mapped;
}

function buildSproutDiagnosticAdvice(stationId, result, dayData) {
  const st = result.status;
  const val = result.value;
  switch (stationId) {
    case 'pvt':
      if (st === 'optimal') {
        return {
          posture: 'nominal',
          headline: 'Reflejos Psicomotores Óptimos',
          message: `¡Excelente velocidad de respuesta (${val} ms)! Tu latencia está dentro de los ≤ 285 ms requeridos por NASA HRP. Sigue respetando el espectro LED circadiano del módulo para compensar los 16 amaneceres orbitales.`,
        };
      }
      return {
        posture: 'veggie',
        headline: st === 'critical' ? 'Fatiga Neuro-Cognitiva Crítica' : 'Vigilancia Psicomotora Disminuida',
        message: `Detecté ${val} ms en la prueba PVT (sobre el umbral óptimo de 285 ms). Recomiendo pausa de descanso inmediata, ajustar las luces LED de cabina a modo cálido/nocturno y tomar unos minutos de desconexión en el jardín Veggie para mitigar el estrés por aislamiento (HRP-RISK-014).`,
      };
    case 'sans':
      if (st === 'optimal') {
        return {
          posture: 'nominal',
          headline: 'Agudeza Macular y Papila Estables',
          message: `¡Vista nítida (${val}% de precisión en Rejilla de Amsler)! No observo signos de distorsión metamorfópsica compatibles con edema de papila. Mantén el seguimiento periódico SANS.`,
        };
      }
      return {
        posture: 'shield',
        headline: 'Alerta Temprana SANS (Desplazamiento Cefálico)',
        message: `Tu precisión en la Rejilla de Amsler bajó a ${val}%. El Síndrome Neuro-ocular (SANS) afecta a ~70% de los astronautas por acumulación de fluidos en la cabeza. Sugiero activar protocolo de presión negativa corporal inferior (LBNP) para redistribuir fluidos hacia las piernas y reportar el hallazgo al equipo médico (HRP-RISK-010).`,
      };
    case 'vestibular':
      if (st === 'optimal') {
        return {
          posture: 'nominal',
          headline: 'Coordinación Ojo-Mano y Propiocepción Nominales',
          message: `¡Precisión láser de ${val}% Time-on-Target! Tu integración vestibular y sensorimotora responde con estabilidad ante microgravedad o transición gravitacional.`,
        };
      }
      return {
        posture: 'shield',
        headline: 'Alteración Vestibular / Sensorimotora Detectada',
        message: `El seguimiento dinámico marcó ${val}% Time-on-Target (< 80%). Esto puede reflejar desorientación espacial o mareo sensorial por cambio de campo gravitacional. Recomiendo evitar maniobras EVA de precisión, evaluar medicación antimareo espacial y completar ejercicios de readaptación neurovestibular (HRP-RISK-002).`,
      };
    case 'grip': {
      const nVal = Math.round(val * 9.81);
      const aredOk = dayData?.ared_workout_completed;
      if (st === 'optimal') {
        return {
          posture: 'nominal',
          headline: 'Fuerza Isométrica Preservada',
          message: `¡Potente registro de ${val} KgF (${nVal} N) en el dinamómetro ISS! Tu carga mecánica diaria ${aredOk ? 'con sesión ARED completada ' : ''}está protegiendo tu masa muscular y ósea.`,
        };
      }
      return {
        posture: 'weights',
        headline: 'Déficit de Fuerza Isométrica · Urgencia ARED',
        message: `Saqué mis pesas de inmediato: registraste ${val} KgF (${nVal} N, debajo de 48 KgF) y hoy la telemetría marca ${
          aredOk ? 'sesión ARED completada pero con fatiga acumulada' : 'SESIÓN ARED OMITIDA'
        }. Ordeno retomar ejercicio resistivo urgente en la máquina ARED para frenar la atrofia muscular y evitar la pérdida ósea de 1%–1.5% mensual (HRP-RISK-009, HRP-RISK-011).`,
      };
    }
    default:
      return { posture: 'nominal', headline: 'Diagnóstico Activo', message: '' };
  }
}

/**
 * Semicircular 3-Zone Clinical Speedometer Gauge (Green / Amber / Red)
 */
function SpeedometerGauge({ stationId, value, status, isDark }) {
  // Normalize 0..1 from left (0 deg) to right (180 deg) where right or green zone shows optimal direction cleanly:
  // For simplicity and universal readability: Left=Red (0..0.33), Center=Amber (0.33..0.67), Right=Green (0.67..1.0)
  // Higher ratio on gauge = healthier/faster-score!
  let norm = 0.5;
  if (stationId === 'pvt') {
    // Invert so <=220ms is far right (green ~0.92), 285ms is boundary (~0.68), 345ms is (~0.35), >=430ms is far left (red ~0.08)
    norm = Math.max(0.05, Math.min(0.95, (440 - value) / 240));
  } else if (stationId === 'grip') {
    // 15 KgF -> 0.05, 35 -> 0.34, 48 -> 0.67, 65 -> 0.95
    norm = Math.max(0.05, Math.min(0.95, (value - 15) / 52));
  } else {
    // % scale (SANS / Vestibular): 20% -> 0.05, 55/65 -> 0.35, 80/85 -> 0.68, 100 -> 0.96
    norm = Math.max(0.05, Math.min(0.95, (value - 15) / 85));
  }

  const angleDeg = -90 + norm * 180; // -90 = far left, +90 = far right
  const statusHex = STATUS_META[status]?.hex || '#10b981';

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 220 125" className="w-48 h-28 overflow-visible">
        {/* Red Zone Arc (Left third) */}
        <path
          d="M 24 106 A 86 86 0 0 1 67 31.5"
          fill="none"
          stroke="#FF3366"
          strokeWidth="14"
          strokeLinecap="butt"
          opacity="0.88"
        />
        {/* Amber Zone Arc (Middle third) */}
        <path
          d="M 70 30 A 86 86 0 0 1 150 30"
          fill="none"
          stroke="#FFB800"
          strokeWidth="14"
          strokeLinecap="butt"
          opacity="0.9"
        />
        {/* Green Zone Arc (Right third) */}
        <path
          d="M 153 31.5 A 86 86 0 0 1 196 106"
          fill="none"
          stroke="#00FF66"
          strokeWidth="14"
          strokeLinecap="butt"
          opacity="0.9"
        />

        {/* Subtle Inner Scale Track */}
        <path
          d="M 38 106 A 72 72 0 0 1 182 106"
          fill="none"
          stroke={isDark ? 'rgba(148,163,184,0.28)' : 'rgba(15,23,42,0.18)'}
          strokeWidth="2"
          strokeDasharray="3 5"
        />

        {/* Needle */}
        <g transform={`translate(110, 106) rotate(${angleDeg})`} style={{ transition: 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1)' }}>
          <polygon points="-3.5,0 0,-74 3.5,0" fill={statusHex} />
          <circle cx="0" cy="0" r="8" fill={isDark ? '#0f172a' : '#ffffff'} stroke={statusHex} strokeWidth="3" />
        </g>

        <text x="20" y="121" fontSize="8" fontFamily="monospace" fill={isDark ? '#FF3366' : '#be123c'} fontWeight="bold">CRÍTICO</text>
        <text x="88" y="14" fontSize="8" fontFamily="monospace" fill={isDark ? '#FFB800' : '#b45309'} fontWeight="bold">PRECAUCIÓN</text>
        <text x="166" y="121" fontSize="8" fontFamily="monospace" fill={isDark ? '#00FF66' : '#047857'} fontWeight="bold">ÓPTIMO</text>
      </svg>
    </div>
  );
}

/**
 * Compact Expressive SVG Sprout-Bot for Diagnostic Feedback
 */
function SproutBotDiagnosticAvatar({ posture, circadianMode }) {
  const isShield = posture === 'shield';
  const isWeights = posture === 'weights';
  const isVeggie = posture === 'veggie';
  const eyeColor = isShield ? '#FF3366' : isWeights ? '#FFB800' : isVeggie ? '#38bdf8' : '#00FF66';
  const chassisBg =
    circadianMode === 'sunset' ? '#431407' : circadianMode === 'night' ? '#0f172a' : '#0c4a6e';

  return (
    <svg viewBox="0 0 120 110" className="w-24 h-24 shrink-0">
      <defs>
        <radialGradient id="sbDiagHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={eyeColor} stopOpacity="0.32" />
          <stop offset="100%" stopColor={eyeColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="56" r="50" fill="url(#sbDiagHalo)" />

      {/* Protective Shield Ring for SANS / Vestibular alerts */}
      {isShield && (
        <circle
          cx="60"
          cy="56"
          r="44"
          fill="none"
          stroke="#FF3366"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
      )}

      {/* ARED Barbells when isometric grip fails */}
      {isWeights && (
        <g stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round">
          <line x1="16" y1="74" x2="104" y2="74" />
          <rect x="10" y="64" width="7" height="20" rx="2" fill="#FFB800" stroke="#78350f" strokeWidth="1.2" />
          <rect x="103" y="64" width="7" height="20" rx="2" fill="#FFB800" stroke="#78350f" strokeWidth="1.2" />
        </g>
      )}

      {/* Sprout Leaf Antenna */}
      <line x1="60" y1="22" x2="60" y2="33" stroke="#94a3b8" strokeWidth="2.5" />
      <path d="M 60 22 C 50 11 40 16 47 24 C 52 28 58 26 60 22 Z" fill="#22c55e" />
      <path d="M 60 22 C 70 10 81 15 73 24 C 68 28 62 26 60 22 Z" fill="#4ade80" />

      {/* Head & Visor */}
      <rect x="28" y="33" width="64" height="46" rx="18" fill={chassisBg} stroke={eyeColor} strokeWidth="2.2" />
      <rect x="35" y="41" width="50" height="28" rx="11" fill="#040b18" />

      {/* Eyes */}
      <circle cx="48" cy="54" r="5.5" fill={eyeColor} />
      <circle cx="72" cy="54" r="5.5" fill={eyeColor} />
      <circle cx="49.5" cy="52.5" r="1.6" fill="#ffffff" />
      <circle cx="73.5" cy="52.5" r="1.6" fill="#ffffff" />

      {/* Mouth */}
      {posture === 'nominal' ? (
        <path d="M 52 63 Q 60 68 68 63" fill="none" stroke={eyeColor} strokeWidth="2" strokeLinecap="round" />
      ) : (
        <line x1="53" y1="64" x2="67" y2="64" stroke={eyeColor} strokeWidth="2" strokeLinecap="round" />
      )}

      {/* Veggie mini plant for PVT fatigue */}
      {isVeggie && (
        <g transform="translate(80, 68)">
          <rect x="0" y="14" width="22" height="12" rx="3" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" />
          <path d="M 11 14 C 5 4 1 8 6 14" fill="#22c55e" />
          <path d="M 11 14 C 17 4 21 8 16 14" fill="#4ade80" />
        </g>
      )}
    </svg>
  );
}

/* --------------------------------------------------------------------------
 * STATION 1: NEURO-COGNITIVE PVT (10s · Dark Screen + Red Stimulus + Spacebar)
 * -------------------------------------------------------------------------- */
function PvtMiniGame({ onComplete, onCancel }) {
  const [phase, setPhase] = useState('waiting'); // 'waiting' | 'go' | 'false_start'
  const [secondsLeft, setSecondsLeft] = useState(10.0);
  const [liveMs, setLiveMs] = useState(0);
  const [trials, setTrials] = useState([]);
  const [feedback, setFeedback] = useState('Pantalla en espera... Pulsa clic o [ESPACIO] apenas aparezca el estímulo ROJO.');

  const trialsRef = useRef([]);
  const phaseRef = useRef('waiting');
  const goStartRef = useRef(0);
  const endTimeRef = useRef(Date.now() + 10000);
  const timeoutRef = useRef(null);
  const rafRef = useRef(null);
  const finishedRef = useRef(false);

  const scheduleNext = useCallback(() => {
    if (finishedRef.current || Date.now() >= endTimeRef.current) return;
    phaseRef.current = 'waiting';
    setPhase('waiting');
    setLiveMs(0);
    const delay = 850 + Math.random() * 1250;
    timeoutRef.current = setTimeout(() => {
      if (finishedRef.current || Date.now() >= endTimeRef.current) return;
      goStartRef.current = performance.now();
      phaseRef.current = 'go';
      setPhase('go');
    }, delay);
  }, []);

  const triggerHit = useCallback(() => {
    if (finishedRef.current) return;
    if (phaseRef.current === 'go') {
      const rt = Math.round(performance.now() - goStartRef.current);
      const updated = [...trialsRef.current, rt];
      trialsRef.current = updated;
      setTrials(updated);
      setFeedback(`Estímulo #${updated.length} capturado: ${rt} ms`);
      if (Date.now() + 800 < endTimeRef.current) {
        scheduleNext();
      } else {
        phaseRef.current = 'waiting';
        setPhase('waiting');
      }
    } else if (phaseRef.current === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      phaseRef.current = 'false_start';
      setPhase('false_start');
      setFeedback('¡Salida en falso! Espera al estímulo ROJO brillante.');
      timeoutRef.current = setTimeout(() => {
        if (!finishedRef.current && Date.now() < endTimeRef.current) {
          scheduleNext();
        }
      }, 600);
    }
  }, [scheduleNext]);

  useEffect(() => {
    endTimeRef.current = Date.now() + 10000;
    scheduleNext();

    const timer = setInterval(() => {
      const rem = Math.max(0, (endTimeRef.current - Date.now()) / 1000);
      setSecondsLeft(rem);
      if (rem <= 0 && !finishedRef.current) {
        finishedRef.current = true;
        clearInterval(timer);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        const list = trialsRef.current;
        const avg = list.length > 0 ? Math.round(list.reduce((a, b) => a + b, 0) / list.length) : 420;
        onComplete(avg, {
          samples: list.length,
          note: list.length > 0 ? `${list.length} respuestas capturadas` : 'Sin respuesta en ventana (420 ms asignados)',
        });
      }
    }, 60);

    const tickMs = () => {
      if (phaseRef.current === 'go') {
        setLiveMs(Math.round(performance.now() - goStartRef.current));
      }
      rafRef.current = requestAnimationFrame(tickMs);
    };
    rafRef.current = requestAnimationFrame(tickMs);

    const onKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!e.repeat) triggerHit();
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      finishedRef.current = true;
      clearInterval(timer);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKey);
    };
  }, [onComplete, scheduleNext, triggerHit]);

  return (
    <div className="rounded-2xl border border-[#FF3366]/45 bg-[#040711] text-slate-100 p-5 space-y-4 shadow-2xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
            ST-01 · PVT NEURO-COGNITIVO (10 SEGUNDOS)
          </span>
          <h3 className="text-base font-extrabold">Reacciona al Estímulo Rojo (Clic o Barra Espaciadora)</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 font-mono text-sm font-black text-cyan-300">
            {secondsLeft.toFixed(1)}s
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-bold hover:bg-slate-800 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Salir
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-6 bg-[#02040a] rounded-2xl border border-slate-800/80">
        <button
          type="button"
          onClick={triggerHit}
          className={`w-52 h-52 rounded-full border-4 flex flex-col items-center justify-center transition-transform duration-75 cursor-pointer select-none ${
            phase === 'go'
              ? 'bg-[#FF3366] border-rose-200 text-white shadow-[0_0_55px_#FF3366] scale-105'
              : phase === 'false_start'
              ? 'bg-amber-600/30 border-amber-400 text-amber-200'
              : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'
          }`}
        >
          {phase === 'go' ? (
            <>
              <Zap className="w-10 h-10 mb-1 animate-bounce" />
              <span className="text-xl font-black tracking-wide">¡PULSA AHORA!</span>
              <span className="font-mono text-lg font-bold mt-1">{liveMs} ms</span>
            </>
          ) : phase === 'false_start' ? (
            <>
              <AlertCircle className="w-9 h-9 mb-1" />
              <span className="text-sm font-black">SALIDA EN FALSO</span>
            </>
          ) : (
            <>
              <span className="text-xs font-mono uppercase tracking-widest opacity-80">ESPERA EL ROJO</span>
              <span className="text-[11px] font-mono opacity-55 mt-1">[Clic o Barra Espaciadora]</span>
            </>
          )}
        </button>

        <p className="text-xs font-mono text-slate-300 mt-4">{feedback}</p>
        {trials.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {trials.map((t, i) => (
              <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                #{i + 1}: {t} ms
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * STATION 2: OPHTHALMIC SANS (Amsler Grid Metamorphopsia / Papilledema 10s)
 * -------------------------------------------------------------------------- */
function SansAmslerMiniGame({ onComplete, onCancel }) {
  const [secondsLeft, setSecondsLeft] = useState(10.0);
  const [warpCenter, setWarpCenter] = useState(null); // { gx, gy, spawnedAt } in grid 1..7 x 1..7
  const [roundInfo, setRoundInfo] = useState({ hits: 0, attempts: 0, scoreSum: 0 });
  const [feedback, setFeedback] = useState('Fija la vista en el punto central. Haz clic rápido en cuanto veas una zona de la rejilla distorsionarse.');

  const statsRef = useRef({ hits: 0, attempts: 0, scoreSum: 0 });
  const warpRef = useRef(null);
  const finishedRef = useRef(false);
  const warpTimerRef = useRef(null);

  const spawnWarp = useCallback(() => {
    if (finishedRef.current) return;
    // Choose an off-center spot (avoid exact center (4,4))
    let gx = 4;
    let gy = 4;
    while (gx === 4 && gy === 4) {
      gx = 1 + Math.floor(Math.random() * 7); // 1..7
      gy = 1 + Math.floor(Math.random() * 7); // 1..7
    }
    const next = { gx, gy, spawnedAt: performance.now() };
    warpRef.current = next;
    setWarpCenter(next);
  }, []);

  useEffect(() => {
    const endTime = Date.now() + 10000;
    warpTimerRef.current = setTimeout(spawnWarp, 900);

    const timer = setInterval(() => {
      const rem = Math.max(0, (endTime - Date.now()) / 1000);
      setSecondsLeft(rem);
      if (rem <= 0 && !finishedRef.current) {
        finishedRef.current = true;
        clearInterval(timer);
        if (warpTimerRef.current) clearTimeout(warpTimerRef.current);
        const st = statsRef.current;
        const pct =
          st.attempts > 0
            ? Math.round(st.scoreSum / Math.max(st.attempts, 3))
            : 45; // If no distortions detected/clicked during 10s, low acuity alert
        onComplete(Math.max(25, Math.min(99, pct)), {
          hits: st.hits,
          attempts: st.attempts,
          note: `${st.hits} focos de edema detectados (${st.attempts} clics)`,
        });
      }
    }, 80);

    return () => {
      finishedRef.current = true;
      clearInterval(timer);
      if (warpTimerRef.current) clearTimeout(warpTimerRef.current);
    };
  }, [onComplete, spawnWarp]);

  const handleGridClick = (e) => {
    if (finishedRef.current) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const normX = ((e.clientX - rect.left) / rect.width) * 8; // 0..8
    const normY = ((e.clientY - rect.top) / rect.height) * 8; // 0..8

    const w = warpRef.current;
    if (!w) {
      statsRef.current.attempts += 1;
      setRoundInfo({ ...statsRef.current });
      setFeedback('Aún no hay distorsión macular; espera la ondulación en la cuadrícula.');
      return;
    }

    const dist = Math.hypot(normX - w.gx, normY - w.gy);
    const rt = performance.now() - w.spawnedAt;
    statsRef.current.attempts += 1;

    if (dist <= 1.45) {
      // Accurate localization! Combine spatial precision + response speed
      const spatialScore = Math.max(70, 100 - dist * 16);
      const speedPenalty = rt > 2200 ? 18 : rt > 1400 ? 8 : 0;
      const hitScore = Math.max(60, Math.round(spatialScore - speedPenalty));
      statsRef.current.hits += 1;
      statsRef.current.scoreSum += hitScore;
      setRoundInfo({ ...statsRef.current });
      setFeedback(`¡Edema simulado localizado! (${Math.round(rt)} ms · Precisión ${hitScore}%)`);
      warpRef.current = null;
      setWarpCenter(null);
      warpTimerRef.current = setTimeout(spawnWarp, 650);
    } else {
      statsRef.current.scoreSum += 35;
      setRoundInfo({ ...statsRef.current });
      setFeedback('Clic desviado de la zona distorsionada. Observa dónde se curvan las líneas.');
    }
  };

  // Build SVG Amsler lines (9 horizontal, 9 vertical over 0..320 viewBox, cell=40)
  // Any vertex near (warpCenter.gx * 40, warpCenter.gy * 40) bends subtly outwards (pincushion edema warp)
  const buildAmslerPaths = () => {
    const paths = [];
    const wx = warpCenter ? warpCenter.gx * 40 : -999;
    const wy = warpCenter ? warpCenter.gy * 40 : -999;

    const displace = (x, y) => {
      if (!warpCenter) return [x, y];
      const dx = x - wx;
      const dy = y - wy;
      const d = Math.hypot(dx, dy);
      if (d > 78 || d === 0) return [x, y];
      const factor = Math.pow(1 - d / 78, 1.5) * 11;
      return [x + (dx / d) * factor, y + (dy / d) * factor];
    };

    for (let i = 0; i <= 8; i++) {
      // Horizontal line y = i*40
      let dH = '';
      for (let step = 0; step <= 32; step++) {
        const [px, py] = displace(step * 10, i * 40);
        dH += `${step === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)} `;
      }
      paths.push({ key: `h-${i}`, d: dH });

      // Vertical line x = i*40
      let dV = '';
      for (let step = 0; step <= 32; step++) {
        const [px, py] = displace(i * 40, step * 10);
        dV += `${step === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)} `;
      }
      paths.push({ key: `v-${i}`, d: dV });
    }
    return paths;
  };

  const gridPaths = buildAmslerPaths();

  return (
    <div className="rounded-2xl border border-cyan-500/45 bg-[#050c18] text-slate-100 p-5 space-y-4 shadow-2xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
            ST-02 · OFTALMOLOGÍA SANS · REJILLA DE AMSLER (10 SEGUNDOS)
          </span>
          <h3 className="text-base font-extrabold">Identifica la Zona Distorsionada (&ldquo;Edema de Papila&rdquo;)</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-lg bg-slate-900 border border-cyan-500/40 font-mono text-sm font-black text-cyan-300">
            {secondsLeft.toFixed(1)}s
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-bold hover:bg-slate-800 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Salir
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-3 bg-[#02060f] rounded-2xl border border-cyan-500/20">
        <svg
          viewBox="0 0 320 320"
          onClick={handleGridClick}
          className="w-64 h-64 sm:w-72 sm:h-72 border border-cyan-400/50 bg-[#040a16] cursor-crosshair select-none touch-none rounded-lg"
        >
          {warpCenter && (
            <circle
              cx={warpCenter.gx * 40}
              cy={warpCenter.gy * 40}
              r="34"
              fill="#FFB800"
              fillOpacity="0.1"
            />
          )}
          {gridPaths.map((p) => (
            <path
              key={p.key}
              d={p.d}
              fill="none"
              stroke="#7dd3fc"
              strokeOpacity="0.72"
              strokeWidth="1.2"
            />
          ))}
          {/* Central Fixation Point */}
          <circle cx="160" cy="160" r="4.5" fill="#00F0FF" stroke="#ffffff" strokeWidth="1.2" />
        </svg>

        <div className="mt-3 flex items-center gap-4 text-xs font-mono text-cyan-300">
          <span>Detecciones: <strong>{roundInfo.hits}</strong></span>
          <span>Clics: <strong>{roundInfo.attempts}</strong></span>
        </div>
        <p className="text-xs font-medium text-slate-300 mt-1 text-center px-3">{feedback}</p>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * STATION 3: VESTIBULAR / SENSORIMOTOR TRACKING (10s · Mouse / Touch Laser)
 * -------------------------------------------------------------------------- */
function VestibularTrackingMiniGame({ onComplete, onCancel }) {
  const [secondsLeft, setSecondsLeft] = useState(10.0);
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 }); // 0..100 %
  const [pointerPos, setPointerPos] = useState({ x: 50, y: 50 });
  const [onTarget, setOnTarget] = useState(true);
  const [liveTotPct, setLiveTotPct] = useState(100);

  const stageRef = useRef(null);
  const pointerRef = useRef({ x: 50, y: 50 });
  const statsRef = useRef({ onTargetFrames: 0, totalFrames: 0 });
  const finishedRef = useRef(false);

  useEffect(() => {
    const startMs = performance.now();
    const endMs = startMs + 10000;
    let rafId = null;

    const loop = (now) => {
      if (finishedRef.current) return;
      const elapsed = (now - startMs) / 1000;
      const rem = Math.max(0, (endMs - now) / 1000);
      setSecondsLeft(rem);

      // Chaotic erratic multi-harmonic trajectory bounded cleanly within 14..86%
      const tx =
        50 +
        24 * Math.sin(elapsed * 1.65 + 0.4) +
        11 * Math.cos(elapsed * 3.35) +
        4 * Math.sin(elapsed * 5.2);
      const ty =
        50 +
        22 * Math.cos(elapsed * 1.45) +
        12 * Math.sin(elapsed * 2.95 + 1.1) +
        4 * Math.cos(elapsed * 4.7);

      const clampedTarget = {
        x: Math.max(14, Math.min(86, tx)),
        y: Math.max(14, Math.min(86, ty)),
      };
      setTargetPos(clampedTarget);

      // Euclidean check in normalized % (target circle radius ~11%)
      const dist = Math.hypot(pointerRef.current.x - clampedTarget.x, pointerRef.current.y - clampedTarget.y);
      const inside = dist <= 12.0;
      setOnTarget(inside);

      statsRef.current.totalFrames += 1;
      if (inside) statsRef.current.onTargetFrames += 1;
      const pct = Math.round((statsRef.current.onTargetFrames / statsRef.current.totalFrames) * 100);
      setLiveTotPct(pct);

      if (rem <= 0) {
        finishedRef.current = true;
        onComplete(pct, {
          note: `${statsRef.current.onTargetFrames} de ${statsRef.current.totalFrames} muestras dentro del objetivo`,
        });
        return;
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => {
      finishedRef.current = true;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [onComplete]);

  const updatePointer = (clientX, clientY) => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(2, Math.min(98, ((clientY - rect.top) / rect.height) * 100));
    pointerRef.current = { x, y };
    setPointerPos({ x, y });
  };

  return (
    <div className="rounded-2xl border border-amber-500/45 bg-[#060d1b] text-slate-100 p-5 space-y-4 shadow-2xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
            ST-03 · EVALUACIÓN VESTIBULAR Y SENSORIMOTORA (10 SEGUNDOS)
          </span>
          <h3 className="text-base font-extrabold">Mantén el Puntero Láser dentro del Círculo Móvil</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 font-mono text-xs font-bold">
            ToT:{' '}
            <span style={{ color: liveTotPct >= 80 ? '#00FF66' : liveTotPct >= 55 ? '#FFB800' : '#FF3366' }}>
              {liveTotPct}%
            </span>
          </div>
          <div className="px-3 py-1 rounded-lg bg-slate-900 border border-amber-500/40 font-mono text-sm font-black text-amber-300">
            {secondsLeft.toFixed(1)}s
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-bold hover:bg-slate-800 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Salir
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        onMouseMove={(e) => updatePointer(e.clientX, e.clientY)}
        onTouchMove={(e) => {
          if (e.touches[0]) updatePointer(e.touches[0].clientX, e.touches[0].clientY);
        }}
        className="relative w-full h-72 rounded-2xl border border-cyan-500/30 bg-[#030712] overflow-hidden cursor-none touch-none select-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(0,240,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,240,255,0.08) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      >
        {/* Chaotic Target Circle */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 flex items-center justify-center transition-colors duration-100"
          style={{
            left: `${targetPos.x}%`,
            top: `${targetPos.y}%`,
            width: '74px',
            height: '74px',
            borderColor: onTarget ? '#00FF66' : '#FF3366',
            backgroundColor: onTarget ? 'rgba(0,255,102,0.16)' : 'rgba(255,51,102,0.14)',
            boxShadow: onTarget ? '0 0 22px rgba(0,255,102,0.45)' : '0 0 18px rgba(255,51,102,0.35)',
          }}
        >
          <span className="w-2 h-2 rounded-full bg-white/80" />
        </div>

        {/* Spacecraft Laser Pointer */}
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${pointerPos.x}%`, top: `${pointerPos.y}%` }}
        >
          <Crosshair className="w-6 h-6 text-[#00F0FF] drop-shadow-[0_0_8px_#00F0FF]" />
        </div>
      </div>
      <p className="text-xs font-mono text-slate-300 text-center">
        Desliza el cursor o el dedo sobre el área HUD para seguir el vector orbital durante 10 segundos.
      </p>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * STATION 4: MUSCULOSKELETAL ISOMETRIC DYNAMOMETER (5s · Spacebar / Rapid Tap)
 * -------------------------------------------------------------------------- */
function IsometricDynamometerMiniGame({ onComplete, onCancel }) {
  const [secondsLeft, setSecondsLeft] = useState(5.0);
  const [forceKgf, setForceKgf] = useState(12);
  const [peakKgf, setPeakKgf] = useState(12);
  const [taps, setTaps] = useState(0);

  const forceRef = useRef(12);
  const peakRef = useRef(12);
  const tapsRef = useRef(0);
  const finishedRef = useRef(false);

  const applySqueeze = useCallback(() => {
    if (finishedRef.current) return;
    tapsRef.current += 1;
    setTaps(tapsRef.current);
    const boosted = Math.min(72, forceRef.current + 6.4);
    forceRef.current = boosted;
    setForceKgf(boosted);
    if (boosted > peakRef.current) {
      peakRef.current = boosted;
      setPeakKgf(boosted);
    }
  }, []);

  useEffect(() => {
    const startMs = performance.now();
    const endMs = startMs + 5000;
    let prev = startMs;
    let rafId = null;

    const loop = (now) => {
      if (finishedRef.current) return;
      const dt = (now - prev) / 1000;
      prev = now;

      // Elastic dynamometer resistance decay
      const decayed = Math.max(8, forceRef.current - dt * 21);
      forceRef.current = decayed;
      setForceKgf(decayed);

      const rem = Math.max(0, (endMs - now) / 1000);
      setSecondsLeft(rem);

      if (rem <= 0) {
        finishedRef.current = true;
        const finalKgf = Math.round(peakRef.current);
        onComplete(finalKgf, {
          newtons: Math.round(finalKgf * 9.81),
          taps: tapsRef.current,
          note: `Pico máximo: ${finalKgf} KgF (${Math.round(finalKgf * 9.81)} N) en ${tapsRef.current} impulsos`,
        });
        return;
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    const onKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!e.repeat) applySqueeze();
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      finishedRef.current = true;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKey);
    };
  }, [applySqueeze, onComplete]);

  const pctBar = Math.min(100, Math.round((forceKgf / 68) * 100));
  const peakPct = Math.min(100, Math.round((peakKgf / 68) * 100));
  const curColor = forceKgf >= 48 ? '#00FF66' : forceKgf >= 35 ? '#FFB800' : '#FF3366';

  return (
    <div className="rounded-2xl border border-emerald-500/45 bg-[#07111e] text-slate-100 p-5 space-y-4 shadow-2xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
            ST-04 · DINAMÓMETRO DE FUERZA ISOMÉTRICA ISS (5 SEGUNDOS)
          </span>
          <h3 className="text-base font-extrabold">Presiona Rápidamente [ESPACIO] o Toca el Agarre</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-lg bg-slate-900 border border-emerald-500/40 font-mono text-sm font-black text-emerald-300">
            {secondsLeft.toFixed(1)}s
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-bold hover:bg-slate-800 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Salir
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#040914] p-5 space-y-5">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[11px] font-mono text-slate-400">POTENCIA INSTANTÁNEA</div>
            <div className="text-3xl font-black font-mono" style={{ color: curColor }}>
              {Math.round(forceKgf)} <span className="text-sm font-bold">KgF</span>{' '}
              <span className="text-sm text-slate-400">({Math.round(forceKgf * 9.81)} N)</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-mono text-slate-400">PICO MÁXIMO REGISTRADO</div>
            <div className="text-xl font-black font-mono text-cyan-300">
              {Math.round(peakKgf)} KgF ({Math.round(peakKgf * 9.81)} N)
            </div>
          </div>
        </div>

        {/* Grip Force Bar */}
        <div className="relative h-9 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden">
          {/* Optimal threshold marker at 48 KgF (~71%) */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/80 z-20"
            style={{ left: `${Math.round((48 / 68) * 100)}%` }}
            title="Umbral óptimo 48 KgF"
          />
          {/* Peak marker */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-cyan-400 z-10 transition-all duration-75"
            style={{ left: `${peakPct}%` }}
          />
          <div
            className="h-full transition-all duration-75 rounded-l-xl"
            style={{
              width: `${pctBar}%`,
              background: `linear-gradient(90deg, #FF3366, #FFB800 50%, #00FF66)`,
            }}
          />
        </div>

        <div className="flex flex-col items-center gap-2 pt-1">
          <button
            type="button"
            onClick={applySqueeze}
            className="w-full sm:w-80 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-base shadow-[0_0_25px_rgba(16,185,129,0.45)] active:scale-95 transition select-none cursor-pointer"
          >
            ¡APRETAR DINAMÓMETRO! ({taps} impulsos)
          </button>
          <span className="text-[11px] font-mono text-slate-400">
            Objetivo ISS: superar la marca blanca de 48 KgF (471 N)
          </span>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * MAIN MODULE 5: INTERACTIVE DIAGNOSTIC SUITE (v2.2)
 * -------------------------------------------------------------------------- */
export default function DiagnosticSuiteModule({
  evaluation,
  knowledgeBase,
  liveDemoOverrides = {},
  onApplyLivePvt,
  onResetLivePvt,
  onSyncLiveOverrides,
  onResetAllLiveOverrides,
  circadianMode = 'day',
  theme,
}) {
  const [activeGameId, setActiveGameId] = useState(null); // null | 'pvt' | 'sans' | 'vestibular' | 'grip'
  const [selectedTicketId, setSelectedTicketId] = useState('pvt');
  const [stationResults, setStationResults] = useState(() => {
    const initial = {};
    if (liveDemoOverrides?.diag_pvt) initial.pvt = liveDemoOverrides.diag_pvt;
    if (liveDemoOverrides?.diag_sans) initial.sans = liveDemoOverrides.diag_sans;
    if (liveDemoOverrides?.diag_vestibular) initial.vestibular = liveDemoOverrides.diag_vestibular;
    if (liveDemoOverrides?.diag_grip) initial.grip = liveDemoOverrides.diag_grip;
    return initial;
  });
  const [isSyncedGlobal, setIsSyncedGlobal] = useState(() =>
    Object.keys(liveDemoOverrides || {}).some((k) => !k.startsWith('diag_'))
  );

  const { dayData, metrics } = evaluation;
  const thresholds = evaluation.metrics.find((x) => x.key === 'pvt_reaction_ms')?.threshold
    ? Object.fromEntries(metrics.map((m) => [m.key, m.threshold]))
    : {};
  const auditedPvt = dayData.metrics.pvt_reaction_ms;

  // Keep synced in case liveDemoOverrides already holds diagnostic overrides
  const hasAnyGlobalSync =
    evaluation.hasAnyLiveOverride || Object.keys(liveDemoOverrides || {}).some((k) => !k.startsWith('diag_'));

  const handleStationComplete = useCallback(
    (stationId, rawValue, extra = {}) => {
      const status = classifyDiagnostic(stationId, rawValue, thresholds);
      const record = {
        stationId,
        value: rawValue,
        status,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isLiveDemo: true,
        ...extra,
      };
      setStationResults((prev) => ({ ...prev, [stationId]: record }));
      setSelectedTicketId(stationId);
      setActiveGameId(null);
      setIsSyncedGlobal(false);

      // Persist diagnostic ticket inside `liveDemoOverrides` without altering JSON files
      const overrideKey = `diag_${stationId}`;
      if (onSyncLiveOverrides) {
        onSyncLiveOverrides({ [overrideKey]: record });
      } else if (stationId === 'pvt' && onApplyLivePvt) {
        onApplyLivePvt(rawValue);
      }
    },
    [thresholds, onSyncLiveOverrides, onApplyLivePvt]
  );

  const handleSyncToGlobalTelemetry = () => {
    const allResults = { ...stationResults };
    // If PVT hasn't been explicitly played yet, allow syncing the currently displayed PVT or completed tests
    const mapped = mapResultsToGlobalTelemetry(allResults);
    if (Object.keys(mapped).length === 0) {
      return;
    }
    if (onSyncLiveOverrides) {
      onSyncLiveOverrides(mapped);
    } else if (mapped.pvt_reaction_ms && onApplyLivePvt) {
      onApplyLivePvt(mapped.pvt_reaction_ms);
    }
    setIsSyncedGlobal(true);
  };

  const handleRestoreAll = () => {
    setStationResults({});
    setIsSyncedGlobal(false);
    setActiveGameId(null);
    if (onResetAllLiveOverrides) {
      onResetAllLiveOverrides();
    } else if (onResetLivePvt) {
      onResetLivePvt();
    }
  };

  const ticketStation =
    STATION_META.find((s) => s.id === selectedTicketId) || STATION_META[0];
  const ticketResult = stationResults[ticketStation.id] || (
    ticketStation.id === 'pvt'
      ? {
          stationId: 'pvt',
          value: auditedPvt,
          status: classifyDiagnostic('pvt', auditedPvt, thresholds),
          isLiveDemo: false,
          timestamp: `Día ${dayData.mission_day}`,
          note: 'Registro histórico base del día seleccionado',
        }
      : null
  );

  const completedCount = Object.keys(stationResults).length;
  const ticketCitations = useMemo(
    () => resolveKbRecords(knowledgeBase, ticketStation.kbIds),
    [knowledgeBase, ticketStation.kbIds]
  );

  const sproutAdvice = ticketResult
    ? buildSproutDiagnosticAdvice(ticketStation.id, ticketResult, dayData)
    : null;

  const isDark = theme?.isDark ?? circadianMode !== 'day';
  const cyanInk = isDark ? 'text-cyan-400' : 'text-cyan-700';
  const skyInk = isDark ? 'text-sky-400' : 'text-sky-700';

  return (
    <div className="space-y-5">
      {/* Top Diagnostic Suite Header + Sync Bar */}
      <section className={`rounded-2xl border p-5 circadian-transition ${theme.cardBg}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Activity className={`w-5 h-5 ${theme.accentText}`} />
              <h2 className="text-lg font-extrabold">
                Suite de Diagnóstico Médico Interactivo (AURA-7 v2.2)
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border inline-flex items-center gap-1 ${
                  completedCount > 0 || hasAnyGlobalSync
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50'
                      : 'bg-cyan-500/15 text-cyan-800 border-cyan-600/40'
                    : 'bg-slate-500/15 text-slate-500 border-slate-500/30'
                }`}
              >
                {completedCount > 0 || hasAnyGlobalSync ? (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>[Medición Demo en Vivo]</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3 h-3" />
                    <span>[Telemetría Histórica Auditada]</span>
                  </>
                )}
              </span>
            </div>
            <p className={`text-xs mt-1 ${theme.textMuted}`}>
              4 estaciones médicas de 5–10 segundos en memoria sin alterar los JSON auditados · Día de Misión {dayData.mission_day}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSyncToGlobalTelemetry}
              disabled={completedCount === 0}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold border transition ${
                completedCount === 0
                  ? 'opacity-45 cursor-not-allowed bg-slate-500/10 border-slate-500/30'
                  : isSyncedGlobal
                  ? isDark
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60 shadow-sm'
                    : 'bg-emerald-500/15 text-emerald-800 border-emerald-600/50 shadow-sm'
                  : 'bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 border-transparent shadow-lg shadow-cyan-500/25 hover:brightness-110'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncedGlobal ? (isDark ? 'text-emerald-300' : 'text-emerald-700') : ''}`} />
              <span>
                {isSyncedGlobal
                  ? 'Telemetría General Sincronizada'
                  : 'Sincronizar resultados con telemetría general'}
              </span>
            </button>

            {(completedCount > 0 || hasAnyGlobalSync) && (
              <button
                type="button"
                onClick={handleRestoreAll}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                  isDark
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                    : 'bg-amber-500/15 text-amber-800 border-amber-600/40 hover:bg-amber-500/25'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Telemetría Auditada</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ACTIVE MINI-GAME VIEWPORT (Replaces Hub Temporarily While Testing) */}
      {activeGameId === 'pvt' && (
        <PvtMiniGame
          onComplete={(val, extra) => handleStationComplete('pvt', val, extra)}
          onCancel={() => setActiveGameId(null)}
        />
      )}
      {activeGameId === 'sans' && (
        <SansAmslerMiniGame
          onComplete={(val, extra) => handleStationComplete('sans', val, extra)}
          onCancel={() => setActiveGameId(null)}
        />
      )}
      {activeGameId === 'vestibular' && (
        <VestibularTrackingMiniGame
          onComplete={(val, extra) => handleStationComplete('vestibular', val, extra)}
          onCancel={() => setActiveGameId(null)}
        />
      )}
      {activeGameId === 'grip' && (
        <IsometricDynamometerMiniGame
          onComplete={(val, extra) => handleStationComplete('grip', val, extra)}
          onCancel={() => setActiveGameId(null)}
        />
      )}

      {/* CENTRAL HUB: 4 TEST STATIONS (Shown when not actively running a test) */}
      {!activeGameId && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STATION_META.map((st) => {
            const Icon = st.Icon;
            const res = stationResults[st.id];
            const isSelected = selectedTicketId === st.id;
            const meta = res ? STATUS_META[res.status] : null;

            return (
              <div
                key={st.id}
                className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 circadian-transition ${
                  theme.cardBg
                } ${isSelected ? 'ring-2 ring-cyan-500/70' : ''}`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl border ${theme.cardSubtleBg}`}>
                        <Icon className={`w-5 h-5 ${theme.accentText}`} />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono font-bold opacity-70">{st.hardwareLabel}</div>
                        <h3 className="text-sm font-extrabold">{st.title}</h3>
                      </div>
                    </div>

                    {res ? (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${meta.badgeClass}`}>
                        {res.value} {st.unit} · {meta.label}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono border border-slate-500/30 opacity-70">
                        Sin probar hoy
                      </span>
                    )}
                  </div>

                  <p className={`text-xs leading-snug ${theme.textSecondary}`}>{st.evalFocus}</p>

                  {res && (
                    <div className="flex items-center justify-between gap-2 text-[11px] font-mono pt-1 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded border font-bold ${
                          isDark
                            ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40'
                            : 'bg-cyan-500/15 text-cyan-800 border-cyan-600/35'
                        }`}
                      >
                        [Medición Demo en Vivo]
                      </span>
                      <span className={theme.textMuted}>Impacta: {st.syncTargetLabel}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-500/15">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveGameId(st.id)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${theme.accentBg}`}
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{res ? `Repetir (${st.durationSec}s)` : `Iniciar Test (${st.durationSec}s)`}</span>
                    </button>
                    {res && (
                      <button
                        type="button"
                        onClick={() => setSelectedTicketId(st.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border ${theme.cardSubtleBg} hover:border-cyan-500`}
                      >
                        Ver Ticket
                      </button>
                    )}
                  </div>

                  {/* Quick Demo Simulation Presets for Judges */}
                  <div className="flex items-center gap-1">
                    {st.presets.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() =>
                          handleStationComplete(st.id, p.value, {
                            note: 'Simulación rápida para demostración',
                          })
                        }
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border transition ${
                          p.status === 'optimal'
                            ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border-emerald-500/35 hover:bg-emerald-500/20'
                            : p.status === 'warning'
                            ? 'bg-amber-500/12 text-amber-600 border-amber-500/35 hover:bg-amber-500/20'
                            : 'bg-rose-500/12 text-rose-600 border-rose-500/35 hover:bg-rose-500/20'
                        }`}
                        title={`Simular ${p.label}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* MEDICAL PRESCRIPTION TICKET REPORT + SPROUT-BOT CLINICAL COUNTERMEASURES */}
      {!activeGameId && ticketResult && (
        <section className={`rounded-2xl border p-5 circadian-transition ${theme.cardBg}`}>
          {/* Station Ticket Selector Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-500/20">
            <div className="flex items-center gap-2">
              <FileText className={`w-4 h-4 ${theme.accentText}`} />
              <span className="text-sm font-extrabold">Reporte Clínico / Receta Médica AURA-7</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STATION_META.map((s) => {
                const hasRes = Boolean(stationResults[s.id]) || s.id === 'pvt';
                const active = selectedTicketId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={!hasRes}
                    onClick={() => setSelectedTicketId(s.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition ${
                      active
                        ? isDark
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                          : 'bg-cyan-500/15 text-cyan-800 border-cyan-600'
                        : hasRes
                        ? `${theme.cardSubtleBg} opacity-85 hover:opacity-100`
                        : 'opacity-35 cursor-not-allowed border-transparent'
                    }`}
                  >
                    {s.code} · {s.title.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* LEFT: Aerospace Medical Ticket + Speedometer Gauge */}
            <div className={`lg:col-span-5 rounded-2xl border-2 border-dashed p-4 flex flex-col justify-between gap-3 ${theme.cardSubtleBg}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-mono opacity-70">
                    TICKET #{ticketStation.code}-D{dayData.mission_day} · {ticketResult.timestamp}
                  </div>
                  <h4 className="text-sm font-extrabold mt-0.5">{ticketStation.title}</h4>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                    ticketResult.isLiveDemo
                      ? isDark
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50'
                        : 'bg-cyan-500/15 text-cyan-800 border-cyan-600/40'
                      : 'bg-slate-500/15 text-slate-500 border-slate-500/30'
                  }`}
                >
                  {ticketResult.isLiveDemo ? '[Medición Demo en Vivo]' : '[Telemetría Histórica Auditada]'}
                </span>
              </div>

              {/* Speedometer Gauge */}
              <div className="flex flex-col items-center py-1">
                <SpeedometerGauge
                  stationId={ticketStation.id}
                  value={ticketResult.value}
                  status={ticketResult.status}
                  isDark={isDark}
                />
                <div className="flex items-baseline gap-2 -mt-1">
                  <span
                    className="text-3xl font-black font-mono"
                    style={{
                      color:
                        !isDark && ticketResult.status === 'optimal'
                          ? '#047857'
                          : !isDark && ticketResult.status === 'warning'
                          ? '#b45309'
                          : STATUS_META[ticketResult.status].hex,
                    }}
                  >
                    {ticketResult.value}
                  </span>
                  <span className="text-xs font-bold opacity-75">
                    {ticketStation.unit}
                    {ticketStation.id === 'grip' ? ` (${Math.round(ticketResult.value * 9.81)} N)` : ''}
                  </span>
                </div>
                <span className={`mt-1 px-3 py-0.5 rounded-full text-xs font-extrabold border ${STATUS_META[ticketResult.status].badgeClass}`}>
                  Clasificación: {STATUS_META[ticketResult.status].label}
                </span>
              </div>

              {/* Reference & Sync Readout */}
              <div className="space-y-1.5 pt-2 border-t border-slate-500/20 text-[11px]">
                <div className="flex items-center justify-between gap-2">
                  <span className={theme.textMuted}>Referencia NASA/CSA:</span>
                  <span className="font-mono font-bold text-right">{ticketStation.refLabel}</span>
                </div>
                {ticketResult.note && (
                  <div className="flex items-center justify-between gap-2">
                    <span className={theme.textMuted}>Detalle captura:</span>
                    <span className="font-mono text-right">{ticketResult.note}</span>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Sprout-Bot Copiloto Empático & Official Countermeasure Card */}
            <div className={`lg:col-span-7 rounded-2xl border p-4 flex flex-col justify-between gap-4 ${theme.cardSubtleBg}`}>
              {sproutAdvice && (
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex flex-col items-center shrink-0">
                    <SproutBotDiagnosticAvatar
                      posture={sproutAdvice.posture}
                      circadianMode={circadianMode}
                    />
                    <span className={`text-[10px] font-mono font-bold mt-1 flex items-center gap-1 ${cyanInk}`}>
                      <Sprout className="w-3 h-3 text-emerald-500" />
                      Sprout-Bot
                    </span>
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {ticketResult.status === 'optimal' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <h4 className="text-sm font-extrabold">{sproutAdvice.headline}</h4>
                    </div>
                    <p className={`text-xs leading-relaxed ${theme.textSecondary}`}>
                      {sproutAdvice.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Official NASA HRP & CSA Knowledge Base Cards */}
              <div className="space-y-2 pt-3 border-t border-slate-500/20">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                  <Gauge className={`w-3.5 h-3.5 ${cyanInk}`} />
                  <span>Contramedidas Oficiales (unified_nasa_csa_kb.json)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ticketCitations.map((rec) => (
                    <div
                      key={rec.id}
                      className={`rounded-xl border p-3 flex flex-col justify-between gap-2 ${theme.cardBg}`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                              isDark
                                ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                                : 'bg-sky-500/12 text-sky-800 border-sky-600/30'
                            }`}
                          >
                            {rec.id}
                          </span>
                          <a
                            href={rec.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold hover:underline ${skyInk}`}
                          >
                            <span>Fuente Oficial</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                        <div className="text-xs font-bold mt-1.5 leading-snug">{rec.title}</div>
                        {rec.summary && (
                          <p className={`text-[10.5px] mt-1 line-clamp-2 ${theme.textMuted}`}>
                            {rec.summary}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
