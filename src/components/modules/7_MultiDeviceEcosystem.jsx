import React, { useEffect, useMemo, useState } from 'react';
import {
  Watch,
  Eye,
  Lightbulb,
  Bell,
  HeartPulse,
  Radio,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  User,
  Music,
  Calendar,
  CalendarHeart,
  Video,
  Wind,
  Volume2,
  Play,
  Pause,
  SkipForward,
  CloudRain,
  Mountain,
  Trees,
  Waves,
  Brain,
  RotateCcw,
  Send,
  Activity,
  Crown,
  Guitar,
  Siren,
  Headphones,
  AppWindow,
  Cpu,
  Home,
} from 'lucide-react';
import { resolveKbRecords } from '../../services/evaluationEngine';
import SproutBotAvatarSvg from '../copilot/SproutBotAvatarSvg';

/* ------------------------------------------------------------------ */
/* Perfil Psicológico DEMO (simulado, NO proviene de los JSON auditados) */
/* ------------------------------------------------------------------ */
const CREW_PROFILE = {
  name: 'Cmdr. Elena Ríos',
  firstName: 'Elena',
  role: 'Comandante · Especialista de Misión',
  origin: 'Santiago de Chile',
  hobbies: [
    { label: 'Ajedrez', Icon: Crown },
    { label: 'Guitarra acústica', Icon: Guitar },
    { label: 'Fotografía de la Tierra', Icon: Mountain },
  ],
  playlistName: 'Tierra y Raíces',
  playlist: [
    { title: 'Gracias a la Vida', artist: 'Violeta Parra', durationSec: 268 },
    { title: 'Todo Cambia', artist: 'Mercedes Sosa', durationSec: 222 },
    { title: 'Volver a los 17', artist: 'Violeta Parra', durationSec: 255 },
  ],
  favoriteMeal: 'Pastel de choclo (reserva termoestabilizada)',
  family: 'Tomás (esposo) · Sofía (hija)',
};

const EMOTIONAL_CALENDAR = [
  {
    day: 25,
    Icon: CalendarHeart,
    title: 'Aniversario de bodas con Tomás',
    phrase: 'tu aniversario de bodas',
    watchText:
      '¡Feliz Aniversario, Elena! He ajustado las luces del comedor a modo cálido y programé tu comida favorita de la reserva para la cena.',
    action: 'Luces del comedor en modo cálido y cena favorita programada',
  },
  {
    day: 136,
    Icon: Video,
    title: 'Cumpleaños de tu hija Sofía',
    phrase: 'el cumpleaños de tu hija Sofía',
    watchText: 'Hoy cumple años Sofía. Tu video-mensaje ya está en cola para Houston.',
    action: 'Video-mensaje de bajo ancho de banda pre-empaquetado para Houston',
  },
  {
    day: 145,
    Icon: CalendarHeart,
    title: 'Cumpleaños de tu esposo Tomás',
    phrase: 'el cumpleaños de tu esposo',
    watchText: 'Hoy cumple años Tomás. Preparé tu módulo de descanso y un canal de audio para Houston.',
    action: 'Módulo de descanso preparado y canal de audio optimizado para Houston',
  },
  {
    day: 170,
    Icon: Calendar,
    title: 'Fiestas Patrias de Chile',
    phrase: 'Fiestas Patrias',
    watchText: '¡Felices Fiestas Patrias! Agregué cuecas a tu playlist y empanadas de la reserva al menú.',
    action: 'Playlist festiva y menú especial de la reserva',
  },
];

const AR_LANDSCAPES = [
  { id: 'andes', label: 'Cordillera de los Andes', Icon: Mountain },
  { id: 'bosque', label: 'Bosque Valdiviano', Icon: Trees },
  { id: 'mar', label: 'Costa del Pacífico', Icon: Waves },
];

const STAR_FIELD = [
  [12, 14], [34, 52], [58, 22], [77, 96], [96, 38], [118, 70], [139, 18], [152, 104],
  [171, 46], [188, 84], [204, 26], [223, 62], [241, 110], [259, 34], [276, 78], [298, 20],
  [306, 58], [24, 88], [66, 116], [132, 92], [214, 98], [287, 102], [46, 30], [252, 8],
];

const BREATH_WAVE_PATH = (() => {
  let d = '';
  for (let x = 0; x <= 480; x += 4) {
    const y = 18 + 11 * Math.sin((2 * Math.PI * x) / 120);
    d += `${x === 0 ? 'M' : 'L'} ${x} ${y.toFixed(2)} `;
  }
  return d.trim();
})();

const formatClock = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

/* ------------------------------------------------------------------ */
/* Sub-componentes de presentación                                     */
/* ------------------------------------------------------------------ */
function KbChips({ records, isDark }) {
  return (
    <div className="flex flex-wrap justify-end gap-1">
      {records.map((r) => (
        <a
          key={r.id}
          href={r.source_url}
          target="_blank"
          rel="noopener noreferrer"
          title={r.title}
          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border hover:underline ${
            isDark
              ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
              : 'bg-sky-100 text-sky-900 border-sky-400/60'
          }`}
        >
          <span>{r.id}</span>
          <ExternalLink className="w-2 h-2" />
        </a>
      ))}
    </div>
  );
}

function QuadrantCard({ index, title, subtitle, Icon, refs, theme, isDark, children }) {
  return (
    <article
      className={`rounded-2xl border p-4 sm:p-5 flex flex-col gap-4 backdrop-blur-md circadian-transition ${theme.cardBg}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div
            className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
              isDark ? 'text-cyan-300' : 'text-cyan-800'
            }`}
          >
            Cuadrante {index}
          </div>
          <h3 className="text-sm font-extrabold flex items-center gap-2 mt-0.5">
            <Icon className={`w-4 h-4 shrink-0 ${theme.accentText}`} />
            <span>{title}</span>
          </h3>
          {subtitle && <p className={`text-[11px] mt-0.5 ${theme.textMuted}`}>{subtitle}</p>}
        </div>
        <KbChips records={refs} isDark={isDark} />
      </header>
      {children}
    </article>
  );
}

function MiniSprout({ eyeColor, sleeping = false, className = 'w-14 h-14' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M32 16 V9" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 11 Q24 3 21 9 Q22 14 32 13 Z" fill="#22c55e" />
      <path d="M32 11 Q40 3 43 9 Q42 14 32 13 Z" fill="#4ade80" />
      <rect x="13" y="16" width="38" height="30" rx="12" fill="#e2e8f0" />
      <rect x="17" y="21" width="30" height="19" rx="8" fill="#0f172a" />
      {sleeping ? (
        <g stroke={eyeColor} strokeWidth="1.8" fill="none" strokeLinecap="round">
          <path d="M22 30 Q26 33 30 30" />
          <path d="M34 30 Q38 33 42 30" />
        </g>
      ) : (
        <g>
          <circle cx="26" cy="29" r="3" fill={eyeColor} />
          <circle cx="38" cy="29" r="3" fill={eyeColor} />
          <path d="M28 35 Q32 38 36 35" stroke={eyeColor} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
      )}
      <rect x="22" y="47" width="20" height="10" rx="5" fill="#cbd5e1" />
    </svg>
  );
}

function ArViewportScene({ scene, shieldOn }) {
  return (
    <svg viewBox="0 0 320 130" className="w-full h-auto block" role="img" aria-label="Ventana AR de cabina">
      <defs>
        <linearGradient id="ami-andes-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="55%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id="ami-forest-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
        <linearGradient id="ami-sea-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#be185d" />
          <stop offset="50%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id="ami-sea-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e7490" />
          <stop offset="100%" stopColor="#082f49" />
        </linearGradient>
      </defs>

      {!shieldOn && (
        <g>
          <rect width="320" height="130" fill="#01030a" />
          {STAR_FIELD.map(([x, y], i) => (
            <circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r={i % 5 === 0 ? 1.4 : 0.8}
              fill="#e2e8f0"
              className="animate-star-twinkle"
              style={{ animationDelay: `${(i % 7) * 0.4}s` }}
            />
          ))}
        </g>
      )}

      {shieldOn && scene === 'andes' && (
        <g>
          <rect width="320" height="130" fill="url(#ami-andes-sky)" />
          <circle cx="240" cy="80" r="18" fill="#fef3c7" opacity="0.95" />
          <polygon
            points="0,130 0,88 40,60 75,82 115,40 150,74 190,48 230,80 270,52 320,84 320,130"
            fill="#475569"
          />
          <polygon points="105,50 115,40 126,51 118,48 111,52" fill="#f8fafc" />
          <polygon points="181,56 190,48 200,57 193,55 186,58" fill="#f8fafc" />
          <polygon points="261,60 270,52 280,61 273,58 266,62" fill="#f8fafc" />
          <polygon points="0,130 0,104 60,92 120,108 180,94 250,110 320,96 320,130" fill="#1e293b" />
        </g>
      )}

      {shieldOn && scene === 'bosque' && (
        <g>
          <rect width="320" height="130" fill="url(#ami-forest-sky)" />
          <circle cx="60" cy="30" r="14" fill="#fef9c3" />
          <rect y="104" width="320" height="26" fill="#14532d" />
          {[10, 42, 74, 106, 138, 170, 202, 234, 266, 298].map((x, i) => (
            <g key={x}>
              <rect x={x + 9} y="96" width="4" height="12" fill="#422006" />
              <polygon
                points={`${x},${100} ${x + 11},${i % 2 ? 50 : 60} ${x + 22},${100}`}
                fill={i % 3 === 0 ? '#166534' : i % 3 === 1 ? '#15803d' : '#22c55e'}
              />
            </g>
          ))}
        </g>
      )}

      {shieldOn && scene === 'mar' && (
        <g>
          <rect width="320" height="130" fill="url(#ami-sea-sky)" />
          <circle cx="160" cy="84" r="22" fill="#fef3c7" />
          <rect y="84" width="320" height="46" fill="url(#ami-sea-water)" />
          {[92, 100, 108, 116].map((y, i) => (
            <line
              key={y}
              x1={160 - (18 - i * 3)}
              y1={y}
              x2={160 + (18 - i * 3)}
              y2={y}
              stroke="#fde68a"
              strokeWidth="2"
              strokeLinecap="round"
              opacity={0.85 - i * 0.18}
            />
          ))}
        </g>
      )}

      {/* Window frame & mullion */}
      <rect x="1.5" y="1.5" width="317" height="127" rx="14" fill="none" stroke="#94a3b8" strokeWidth="3" />
      <line x1="160" y1="2" x2="160" y2="128" stroke="#94a3b8" strokeWidth="2.5" opacity="0.8" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Módulo 7 · Inteligencia Ambiental (AmI)                             */
/* ------------------------------------------------------------------ */
export default function MultiDeviceEcosystem({
  evaluation,
  psychInference,
  selectedDay,
  circadianMode,
  knowledgeBase,
  theme,
}) {
  const isDark = theme?.isDark ?? circadianMode !== 'day';
  const { dayData, metrics, overallMeta, narrative } = evaluation;
  const day = selectedDay ?? dayData.mission_day;
  const stateId = psychInference?.stateId || 'optimal_motivated';

  const v = useMemo(() => Object.fromEntries(metrics.map((x) => [x.key, x.value])), [metrics]);
  const hr = Math.round(v.resting_heart_rate);
  const pvt = Math.round(v.pvt_reaction_ms);
  const sleep = Number(v.sleep_hours).toFixed(1);
  const co2 = Number(v.cabin_co2_mmhg).toFixed(2);
  const evarm = Number(v.cumulative_radiation_msv).toFixed(1);
  const delay = dayData.earth_comm_delay_min.toFixed(1);
  const isSpe = dayData.solar_particle_event === true;
  const hrElevated = hr > 88;
  const autoPlaylist = stateId === 'cognitive_fatigue';
  const playlist = CREW_PROFILE.playlist;
  const favorite = playlist[0];

  const [earthClock, setEarthClock] = useState(() =>
    new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  );
  const [notifFeedback, setNotifFeedback] = useState(null);
  const [toastAlert, setToastAlert] = useState(null);
  const [intervention, setIntervention] = useState(false);
  const [windowShieldManual, setWindowShieldManual] = useState(null);
  const [landscape, setLandscape] = useState('andes');
  const [evaStressSim, setEvaStressSim] = useState(false);
  const [playback, setPlayback] = useState({ trackIdx: 0, isPlaying: autoPlaylist, elapsed: 0 });

  useEffect(() => {
    const id = setInterval(() => {
      setEarthClock(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(id);
  }, []);

  // Reset demo devices whenever the mission day (or inferred state) changes
  useEffect(() => {
    setIntervention(false);
    setWindowShieldManual(null);
    setEvaStressSim(false);
    setPlayback({ trackIdx: 0, isPlaying: autoPlaylist, elapsed: 0 });
  }, [day, autoPlaylist]);

  // Music player clock
  useEffect(() => {
    if (!playback.isPlaying) return undefined;
    const id = setInterval(() => {
      setPlayback((p) => {
        const track = playlist[p.trackIdx];
        if (p.elapsed + 1 >= track.durationSec) {
          return { ...p, trackIdx: (p.trackIdx + 1) % playlist.length, elapsed: 0 };
        }
        return { ...p, elapsed: p.elapsed + 1 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playback.isPlaying, playlist]);

  /* ---------- KB citations (verified IDs from unified_nasa_csa_kb.json) ---------- */
  const profileRefs = resolveKbRecords(knowledgeBase, ['HRP-RISK-012', 'HRP-RISK-019', 'HRP-HAZ-004']);
  const watchRefs = resolveKbRecords(knowledgeBase, ['HRP-RISK-012', 'HRP-RISK-014']);
  const evaRefs = resolveKbRecords(knowledgeBase, ['HRP-RISK-008', 'HRP-RISK-006', 'CSA-RAD-009']);
  const cabinRefs = resolveKbRecords(knowledgeBase, ['HRP-RISK-014', 'HRP-RISK-019', 'HRP-HAZ-003']);
  const interventionRef = resolveKbRecords(knowledgeBase, ['HRP-RISK-012'])[0];

  /* ---------- Emotional calendar ---------- */
  const todayEvent = EMOTIONAL_CALENDAR.find((e) => e.day === day) || null;
  const nextEvent = EMOTIONAL_CALENDAR.find((e) => e.day > day) || null;

  const relativeLabel = (eventDay) => {
    const diff = eventDay - day;
    if (diff === 0) return 'HOY';
    if (diff === 1) return 'Mañana';
    if (diff > 1) return `En ${diff} días`;
    return `Hace ${Math.abs(diff)} días`;
  };

  /* ---------- Derived device states ---------- */
  const autoShield =
    intervention || stateId === 'isolation_disconnect' || stateId === 'cognitive_fatigue';
  const shieldOn = windowShieldManual ?? autoShield;
  const hapticActive = intervention || hrElevated;
  const evaStress = !isSpe && (hrElevated || evaStressSim);
  const evaHr = evaStressSim && !hrElevated ? 112 : hr;

  const stateEye = psychInference?.accentHex || '#00FF66';
  const isolationPct = psychInference?.isolationProgressPct;

  const watchBg =
    circadianMode === 'day'
      ? 'linear-gradient(160deg, #075985 0%, #0284c7 55%, #38bdf8 100%)'
      : circadianMode === 'sunset'
      ? 'linear-gradient(160deg, #431407 0%, #9a3412 55%, #f59e0b 100%)'
      : 'linear-gradient(160deg, #020617 0%, #1e1b4b 60%, #312e81 100%)';

  const watchNotification = intervention
    ? {
        title: 'Sprout-Bot · Intervención',
        text: `Preparé tu módulo de descanso, ${CREW_PROFILE.firstName}. Respira conmigo.`,
      }
    : todayEvent
    ? { title: todayEvent.title, text: todayEvent.watchText }
    : hrElevated
    ? { title: 'Respira conmigo', text: `Pulso ${hr} bpm. Inhala 4 s · exhala 6 s siguiendo la vibración.` }
    : { title: psychInference?.shortBadge || 'Sprout-Bot', text: 'Todo en orden. Estoy contigo.' };

  const audioStatus = intervention
    ? {
        kind: 'music',
        label: `Módulo de Descanso: "${favorite.title}" (${favorite.artist}) a 40 dB`,
        sub: `Canal de audio priorizado hacia Houston · retardo ${delay} min`,
      }
    : stateId === 'isolation_disconnect'
    ? {
        kind: 'rain',
        label: 'Módulo 3: Reproduciendo sonido de lluvia terrestre',
        sub: `Paisaje sonoro a 38 dB · índice de aislamiento ${isolationPct ?? 0}%`,
      }
    : stateId === 'cognitive_fatigue'
    ? {
        kind: 'music',
        label: `Módulos de descanso: playlist "${CREW_PROFILE.playlistName}" a 40 dB`,
        sub: `Respuesta a PVT ${pvt} ms y sueño de ${sleep} h`,
      }
    : stateId === 'anxiety_overload'
    ? {
        kind: 'forest',
        label: 'Ruido blanco de bosque terrestre a 35 dB',
        sub: `Estabilización autonómica · pulso ${hr} bpm`,
      }
    : stateId === 'solar_shield'
    ? {
        kind: 'alert',
        label: 'Canal de alertas ALARA prioritario',
        sub: 'Audio ambiental silenciado durante el refugio SPE',
      }
    : {
        kind: 'idle',
        label: 'Ambiente acústico nominal de cabina',
        sub: 'Sin intervención sonora requerida',
      };

  const melatoninMetric =
    circadianMode === 'day'
      ? { pct: 12, label: 'Supresión diurna de melatonina (alerta 480 nm)' }
      : circadianMode === 'sunset'
      ? { pct: 60, label: 'Transición ámbar: la melatonina comienza a subir (590 nm)' }
      : { pct: 95, label: 'Protección nocturna: sin azul, melatonina preservada' };

  /* ---------- Sprout-Bot integration log (how the profile is used) ---------- */
  const integrationLog = useMemo(() => {
    const log = [];
    if (intervention) {
      log.push({
        tone: 'cyan',
        text: `Intervención de aislamiento severo: luz azul 480 nm, "${favorite.title}" a 40 dB y canal de audio a Houston priorizado.`,
        tag: 'HRP-RISK-012',
      });
    }
    if (todayEvent) {
      log.push({
        tone: 'rose',
        text: `${todayEvent.title}: ${todayEvent.action} (retardo Tierra ${delay} min).`,
        tag: 'HRP-RISK-019',
      });
    }
    if (stateId === 'cognitive_fatigue') {
      log.push({
        tone: 'amber',
        text: `PVT ${pvt} ms detectado → Activando playlist "${CREW_PROFILE.playlistName}" a 40dB en módulos de descanso.`,
        tag: 'HRP-RISK-014',
      });
    }
    if (stateId === 'isolation_disconnect') {
      log.push({
        tone: 'amber',
        text: `Aislamiento progresivo (${isolationPct ?? 0}%) → Lluvia terrestre en Módulo 3 y paisaje andino en ventanas AR.`,
        tag: 'HRP-RISK-019',
      });
    }
    if (hrElevated) {
      log.push({
        tone: 'rose',
        text: `Pulso ${hr} bpm (> 88) → Guía háptica de respiración en el smartwatch.`,
        tag: 'HRP-RISK-012',
      });
    }
    if (stateId === 'solar_shield') {
      log.push({
        tone: 'cyan',
        text: 'Refugio SPE activo → Propongo una partida de ajedrez dentro de la zona blindada para sostener el ánimo.',
        tag: 'CSA-RAD-009',
      });
    }
    if (stateId === 'medical_assistant') {
      log.push({
        tone: 'cyan',
        text: 'Déficit osteomuscular → Recompensa tras el ARED: 20 min de guitarra acústica.',
        tag: 'HRP-RISK-009',
      });
    }
    if (stateId === 'optimal_motivated') {
      log.push({
        tone: 'emerald',
        text: 'Estado óptimo → Sugiero 20 min de guitarra y una foto de la Tierra desde la cúpula.',
        tag: 'HRP-RISK-012',
      });
    }
    log.push({
      tone: 'slate',
      text: `Memoria emocional cargada: ${CREW_PROFILE.hobbies.length} hobbies, playlist "${CREW_PROFILE.playlistName}" y ${EMOTIONAL_CALENDAR.length} fechas críticas.`,
      tag: 'Perfil Demo',
    });
    return log;
  }, [intervention, todayEvent, stateId, pvt, delay, isolationPct, hrElevated, hr, favorite.title]);

  const toneCls = (tone) => {
    const map = {
      cyan: isDark ? 'border-cyan-400/40 text-cyan-200' : 'border-cyan-500/50 text-cyan-900',
      rose: isDark ? 'border-rose-400/40 text-rose-200' : 'border-rose-500/50 text-rose-900',
      amber: isDark ? 'border-amber-400/40 text-amber-200' : 'border-amber-500/50 text-amber-900',
      emerald: isDark ? 'border-emerald-400/40 text-emerald-200' : 'border-emerald-500/50 text-emerald-900',
      slate: isDark ? 'border-slate-600 text-slate-300' : 'border-slate-300 text-slate-700',
    };
    return map[tone] || map.slate;
  };

  /* ---------- Actions ---------- */
  const handleToggleIntervention = () => {
    if (intervention) {
      setIntervention(false);
      setWindowShieldManual(null);
      setPlayback({ trackIdx: 0, isPlaying: autoPlaylist, elapsed: 0 });
      return;
    }
    setIntervention(true);
    setWindowShieldManual(null);
    setPlayback({ trackIdx: 0, isPlaying: true, elapsed: 0 });
  };

  const interventionMessage = `Cmdr. ${CREW_PROFILE.firstName}, sé que llevamos ${day} días lejos de casa y ${
    todayEvent ? `hoy es ${todayEvent.phrase}` : 'sé cuánto extrañas a Tomás y a Sofía'
  }. He preparado el módulo de descanso con tu música, luz cálida y un canal de audio optimizado para Houston. Tómate tu tiempo.`;

  const triggerNativeNotification = async () => {
    const title = `AURA-7 · Día ${dayData.mission_day} (${overallMeta.label})`;
    const body = `${narrative.toneLabel}: HR ${hr} bpm · CO₂ ${co2} mmHg · PVT ${pvt} ms.`;
    setToastAlert({ title, body, time: new Date().toLocaleTimeString('es-ES') });

    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotifFeedback('Aviso sincronizado en consola (Notification API no disponible).');
      return;
    }
    try {
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }
      if (permission === 'granted') {
        new Notification(title, { body, tag: 'aura7-ecosystem-alert' });
        setNotifFeedback('Notificación nativa del navegador enviada y sincronizada al reloj.');
      } else {
        setNotifFeedback('Permiso de notificaciones denegado; aviso reflejado en consola.');
      }
    } catch {
      setNotifFeedback('Aviso reflejado en consola y dispositivos.');
    }
  };

  const currentTrack = playlist[playback.trackIdx];
  const progressPct = Math.min(100, (playback.elapsed / currentTrack.durationSec) * 100);

  const interventionSteps = [
    { Icon: Watch, label: 'Smartwatch: vibración háptica suave' },
    { Icon: Lightbulb, label: 'Cabina: Terapia de Luz Azul (480 nm)' },
    { Icon: Music, label: `Audio: "${favorite.title}" iniciando` },
    { Icon: Sparkles, label: 'Sprout-Bot: mensaje empático' },
  ];

  return (
    <div className="space-y-5">
      {/* ================= HEADER ================= */}
      <section
        className={`rounded-2xl border p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 circadian-transition ${theme.cardBg}`}
      >
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Cpu className={`w-5 h-5 ${theme.accentText}`} />
            <h2 className="text-lg font-extrabold">Inteligencia Ambiental (AmI) · AURA-7 v2.4</h2>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                isDark
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40'
                  : 'bg-cyan-100 text-cyan-900 border-cyan-500/50'
              }`}
            >
              IoT de Nave · D{day} · {psychInference?.shortBadge || 'Nominal'}
            </span>
          </div>
          <p className={`text-xs mt-1 ${theme.textMuted}`}>
            Sprout-Bot orquesta smartwatch, casco EVA, luces, audio y ventanas AR usando tu telemetría y tu memoria
            emocional para combatir el aislamiento.
          </p>
        </div>

        <button
          type="button"
          onClick={triggerNativeNotification}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition shrink-0 ${theme.accentBg}`}
        >
          <Bell className="w-4 h-4" />
          <span>Enviar Notificación Nativa (Notification API)</span>
        </button>
      </section>

      {notifFeedback && (
        <div className={`rounded-xl border px-4 py-2.5 text-xs flex items-center gap-2 ${theme.cardSubtleBg}`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notifFeedback}</span>
        </div>
      )}

      {toastAlert && (
        <div className="rounded-xl border border-sky-400/50 bg-slate-950 text-slate-100 p-4 shadow-xl flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-sky-300">
                {toastAlert.title} <span className="font-mono text-[10px] opacity-60">{toastAlert.time}</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{toastAlert.body}</p>
            </div>
          </div>
          <button type="button" onClick={() => setToastAlert(null)} className="text-xs text-slate-400 hover:text-white">
            Cerrar
          </button>
        </div>
      )}

      {/* ================= WOW: SEVERE ISOLATION INTERVENTION ================= */}
      <section
        className={`rounded-2xl border p-5 relative overflow-hidden circadian-transition ${theme.cardBg}`}
        style={intervention ? { boxShadow: '0 0 0 2px rgba(56,189,248,0.55), 0 0 40px rgba(59,130,246,0.25)' } : undefined}
      >
        <div className="flex flex-col items-center text-center gap-3">
          <button
            type="button"
            onClick={handleToggleIntervention}
            className={`inline-flex items-center justify-center gap-3 px-6 sm:px-10 py-4 rounded-2xl text-sm sm:text-base font-black tracking-tight border-2 transition shadow-xl hover:scale-[1.02] ${
              intervention
                ? isDark
                  ? 'bg-slate-900 text-amber-200 border-amber-400/70'
                  : 'bg-white text-amber-900 border-amber-500'
                : 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white border-sky-300 shadow-blue-500/30'
            }`}
          >
            {intervention ? <RotateCcw className="w-5 h-5" /> : <Siren className="w-5 h-5" />}
            <span>{intervention ? 'Finalizar Intervención y Restaurar Cabina' : 'Simular Intervención de Aislamiento Severo'}</span>
          </button>
          <p className={`text-[11px] max-w-2xl ${theme.textMuted}`}>
            Demostración: un solo disparo coordina reloj, luces, audio y Sprout-Bot. No modifica los JSON auditados;
            todo vive en el estado local del Módulo 7.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 w-full max-w-4xl">
            {interventionSteps.map(({ Icon, label }, i) => (
              <div
                key={label}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-semibold text-left transition-all duration-500 ${
                  intervention
                    ? isDark
                      ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-200'
                      : 'bg-emerald-50 border-emerald-500/50 text-emerald-900'
                    : `${theme.cardSubtleBg} opacity-70`
                }`}
                style={{ transitionDelay: intervention ? `${i * 120}ms` : '0ms' }}
              >
                {intervention ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <Icon className="w-4 h-4 shrink-0" />
                )}
                <span>
                  {i + 1}. {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {intervention && (
          <div
            className={`animate-bubble-in mt-5 mx-auto max-w-3xl rounded-2xl border p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4 ${
              isDark ? 'bg-slate-950/85 border-sky-500/40 text-slate-100' : 'bg-white border-sky-300 text-slate-900'
            }`}
          >
            <SproutBotAvatarSvg
              visualExpression="worried_empathetic"
              circadianMode={circadianMode}
              earthCommDelayMin={dayData.earth_comm_delay_min}
              isDark={isDark}
              compact
              className="w-24 h-24 shrink-0"
            />
            <div className="space-y-2.5 min-w-0">
              <div className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                Sprout-Bot · Intervención Psicosocial Autónoma
              </div>
              <p className="text-sm sm:text-base font-bold leading-snug">“{interventionMessage}”</p>
              {interventionRef && (
                <a
                  href={interventionRef.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition ${
                    isDark
                      ? 'bg-slate-900/80 border-cyan-500/35 text-cyan-300 hover:border-cyan-400'
                      : 'bg-cyan-50 border-cyan-300 text-cyan-900 hover:border-cyan-500'
                  }`}
                >
                  <span>
                    Basado en: {interventionRef.id} ({interventionRef.title})
                  </span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ================= 4 QUADRANTS ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* ---------- 1. Psychological Profile & Emotional Memory ---------- */}
        <QuadrantCard
          index={1}
          title="Perfil Psicológico y Memoria Emocional"
          subtitle="El “alma” del tripulante que Sprout-Bot usa para empatizar"
          Icon={User}
          refs={profileRefs}
          theme={theme}
          isDark={isDark}
        >
          <div className={`rounded-xl border p-3 flex items-center gap-3 ${theme.cardSubtleBg}`}>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-black text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
            >
              ER
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-extrabold">{CREW_PROFILE.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${
                    isDark ? 'border-slate-600 text-slate-400' : 'border-slate-300 text-slate-600'
                  }`}
                >
                  Perfil Demo Simulado
                </span>
              </div>
              <div className={`text-[11px] ${theme.textMuted}`}>
                {CREW_PROFILE.role} · {CREW_PROFILE.origin}
              </div>
              <div className={`text-[11px] ${theme.textMuted}`}>Familia: {CREW_PROFILE.family}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={`rounded-xl border p-3 space-y-2 ${theme.cardSubtleBg}`}>
              <div className={`text-[10px] font-mono font-bold uppercase ${theme.textMuted}`}>Hobbies</div>
              <div className="flex flex-wrap gap-1.5">
                {CREW_PROFILE.hobbies.map(({ label, Icon }) => (
                  <span
                    key={label}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-semibold ${
                      isDark ? 'border-slate-600 bg-slate-900/50' : 'border-slate-300 bg-white'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </span>
                ))}
              </div>
              <div className={`text-[10px] font-mono font-bold uppercase pt-1 ${theme.textMuted}`}>Playlist favorita</div>
              <div className="flex items-center gap-2 text-[11px] font-semibold">
                <Headphones className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`} />
                <span>
                  “{CREW_PROFILE.playlistName}” · {playlist.length} temas
                </span>
              </div>
              <div className={`text-[10px] ${theme.textMuted}`}>Comida favorita: {CREW_PROFILE.favoriteMeal}</div>
            </div>

            {/* Emotional Calendar */}
            <div className={`rounded-xl border p-3 space-y-2 ${theme.cardSubtleBg}`}>
              <div className={`text-[10px] font-mono font-bold uppercase flex items-center gap-1 ${theme.textMuted}`}>
                <Calendar className="w-3 h-3" /> Calendario Emocional · Fechas Críticas
              </div>
              <ul className="space-y-1.5">
                {EMOTIONAL_CALENDAR.map((ev) => {
                  const isToday = ev.day === day;
                  const isNext = nextEvent && ev.day === nextEvent.day && !todayEvent;
                  return (
                    <li
                      key={ev.day}
                      className={`flex items-center justify-between gap-2 px-2 py-1 rounded-lg border text-[11px] ${
                        isToday
                          ? isDark
                            ? 'border-rose-400/60 bg-rose-500/15 text-rose-100'
                            : 'border-rose-400 bg-rose-50 text-rose-900'
                          : isNext
                          ? isDark
                            ? 'border-amber-400/40 text-amber-200'
                            : 'border-amber-400/60 text-amber-900'
                          : `${isDark ? 'border-slate-700' : 'border-slate-200'} ${ev.day < day ? 'opacity-55' : ''}`
                      }`}
                    >
                      <span className="flex items-center gap-1.5 min-w-0">
                        <ev.Icon className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          D{ev.day} · {ev.title}
                        </span>
                      </span>
                      <span className="font-mono font-bold text-[10px] shrink-0">{relativeLabel(ev.day)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {todayEvent && (
            <div
              className={`rounded-xl border p-3 flex items-start gap-2.5 text-[11px] leading-relaxed ${
                isDark ? 'border-rose-400/50 bg-rose-500/10 text-rose-100' : 'border-rose-400 bg-rose-50 text-rose-900'
              }`}
            >
              <Send className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Hoy es: {todayEvent.title}.</strong> Sprout-Bot pre-empaquetó un video-mensaje de bajo ancho de
                banda y lo dejó en cola para la próxima ventana de enlace con Houston, compensando el retardo de{' '}
                <strong>{delay} min</strong>.
              </span>
            </div>
          )}

          {/* Integration log */}
          <div className="space-y-1.5">
            <div className={`text-[10px] font-mono font-bold uppercase flex items-center gap-1 ${theme.textMuted}`}>
              <Brain className="w-3 h-3" /> Bitácora de uso del perfil por Sprout-Bot
            </div>
            <ul className="space-y-1">
              {integrationLog.map((entry) => (
                <li
                  key={entry.text}
                  className={`flex items-start justify-between gap-2 pl-2.5 border-l-2 text-[11px] leading-snug ${toneCls(entry.tone)}`}
                >
                  <span className="font-mono">› {entry.text}</span>
                  <span className="text-[9px] font-mono font-bold opacity-75 shrink-0">{entry.tag}</span>
                </li>
              ))}
            </ul>
          </div>
        </QuadrantCard>

        {/* ---------- 2. Smartwatch ---------- */}
        <QuadrantCard
          index={2}
          title="Smartwatch · Compañero Táctil y Háptico"
          subtitle="Esfera sincronizada al ciclo circadiano terrestre con interacción humana"
          Icon={Watch}
          refs={watchRefs}
          theme={theme}
          isDark={isDark}
        >
          <div className="flex flex-col items-center py-2">
            <div className="relative flex items-center justify-center w-72 h-[19rem]">
              {/* Haptic ripple waves */}
              {hapticActive &&
                [0, 0.85, 1.7].map((delaySec) => (
                  <span
                    key={delaySec}
                    className="absolute w-56 h-64 rounded-[2.6rem] border-2 border-sky-400/70 animate-haptic-ripple pointer-events-none"
                    style={{ animationDelay: `${delaySec}s` }}
                  />
                ))}

              <div className={`relative flex flex-col items-center ${hapticActive ? 'animate-watch-buzz' : ''}`}>
                <div className="w-24 h-5 rounded-t-xl bg-slate-800 border-x border-t border-slate-700" />
                <div
                  className="w-52 h-60 rounded-[2.2rem] border-4 border-slate-700 p-3.5 shadow-2xl relative flex flex-col justify-between text-white overflow-hidden transition-all duration-700"
                  style={{ background: watchBg, boxShadow: `0 0 28px ${stateEye}40` }}
                >
                  <div className="absolute -right-2.5 top-16 w-2 h-8 rounded-r bg-slate-600" />
                  <div className="flex items-center justify-between text-[10px] font-mono text-white/80">
                    <span>TIERRA {earthClock}</span>
                    <span className="font-bold">D{day}</span>
                  </div>

                  <div className="flex flex-col items-center -mt-1">
                    <div className="w-16 h-16 rounded-full bg-black/25 border border-white/25 flex items-center justify-center">
                      <MiniSprout
                        eyeColor={stateEye}
                        sleeping={circadianMode === 'night' && stateId === 'optimal_motivated' && !intervention}
                        className="w-12 h-12"
                      />
                    </div>
                  </div>

                  {/* Notification */}
                  <div className="rounded-xl bg-black/45 border border-white/15 px-2 py-1.5 backdrop-blur-sm">
                    <div className="text-[9px] font-bold uppercase tracking-wide text-amber-200 truncate">
                      {watchNotification.title}
                    </div>
                    <p className="text-[10px] leading-snug text-white/95 line-clamp-3">{watchNotification.text}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-center text-[10px] font-mono bg-black/35 rounded-xl p-1 border border-white/10">
                    <div className={hrElevated ? 'text-rose-300 font-bold' : 'text-white'}>
                      <span className="inline-flex items-center gap-1">
                        <HeartPulse className="w-3 h-3" /> {hr} BPM
                      </span>
                    </div>
                    <div className="text-white">{pvt} ms PVT</div>
                  </div>
                </div>
                <div className="w-24 h-5 rounded-b-xl bg-slate-800 border-x border-b border-slate-700" />
              </div>
            </div>
          </div>

          <div
            className={`rounded-xl border p-3 text-[11px] flex items-start gap-2 ${
              hapticActive
                ? isDark
                  ? 'border-sky-400/50 bg-sky-500/10 text-sky-100'
                  : 'border-sky-400 bg-sky-50 text-sky-900'
                : theme.cardSubtleBg
            }`}
          >
            <Activity className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              {hapticActive
                ? hrElevated
                  ? `Feedback háptico activo: el pulso en reposo (${hr} bpm) supera 88 bpm. Vibraciones suaves guían una respiración lenta (inhalar 4 s · exhalar 6 s).`
                  : 'Feedback háptico activo: vibración suave de acompañamiento durante la intervención.'
                : `Háptica en reposo. Se activa automáticamente si el pulso en reposo supera 88 bpm (hoy: ${hr} bpm).`}
            </span>
          </div>
        </QuadrantCard>

        {/* ---------- 3. EVA Helmet HUD ---------- */}
        <QuadrantCard
          index={3}
          title="HUD del Casco EVA · Realidad Aumentada Psicológica"
          subtitle="El visor es el entorno de mayor estrés de la misión"
          Icon={Eye}
          refs={evaRefs}
          theme={theme}
          isDark={isDark}
        >
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setEvaStressSim((s) => !s)}
              disabled={isSpe}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition ${
                isSpe
                  ? 'opacity-40 cursor-not-allowed border-slate-500/30'
                  : evaStressSim
                  ? isDark
                    ? 'bg-rose-500/20 text-rose-200 border-rose-400/60'
                    : 'bg-rose-600 text-white border-rose-700'
                  : isDark
                  ? 'bg-slate-900/60 text-slate-200 border-slate-600 hover:border-rose-400'
                  : 'bg-white text-slate-800 border-slate-300 hover:border-rose-500'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>{evaStressSim ? 'Detener simulación de estrés' : 'Simular pico de estrés en EVA'}</span>
            </button>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="rounded-[46%/38%] p-2.5 bg-gradient-to-b from-slate-300 via-slate-400 to-slate-600 shadow-2xl">
              <div className="relative rounded-[44%/36%] overflow-hidden bg-gradient-to-b from-[#040916] via-[#08142b] to-[#020611] text-cyan-200 px-8 sm:px-10 py-7 min-h-[290px] flex flex-col justify-between">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_15%,rgba(186,230,253,0.18),transparent_55%)]" />

                {/* Survival metrics */}
                <div className="relative z-10 grid grid-cols-3 gap-1 text-[10px] font-mono text-center border-b border-cyan-500/25 pb-2">
                  <div>
                    <div className="text-cyan-400/80">PRESIÓN</div>
                    <div className="font-bold text-white">29.6 kPa</div>
                  </div>
                  <div>
                    <div className="text-cyan-400/80">CO₂</div>
                    <div className={`font-bold ${Number(co2) > 3.5 ? 'text-rose-400' : 'text-emerald-400'}`}>{co2} mmHg</div>
                  </div>
                  <div>
                    <div className="text-cyan-400/80">EVARM</div>
                    <div className="font-bold text-white">{evarm} mSv</div>
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between text-[10px] font-mono mt-1.5">
                  <span className="flex items-center gap-1">
                    <Radio className="w-3 h-3" /> +{delay} min Tierra
                  </span>
                  <span className={evaStress ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    HR {evaHr} bpm{evaStressSim && !hrElevated ? ' (sim)' : ''}
                  </span>
                  <span className={evaStress ? 'text-amber-300 font-bold' : 'text-cyan-300'}>
                    O₂ {evaStress ? '+15%' : 'nominal'}
                  </span>
                </div>

                {/* Center psychological assistance */}
                <div className="relative z-10 my-2 flex flex-col items-center text-center gap-2">
                  {isSpe ? (
                    <div className="px-3 py-2 rounded-xl bg-rose-600/30 border border-rose-400 text-rose-100 animate-pulse space-y-1">
                      <div className="flex items-center justify-center gap-1 text-xs font-black">
                        <ShieldAlert className="w-4 h-4" />
                        <span>EVA SUSPENDIDA (SPE · ALARA)</span>
                      </div>
                      <div className="text-[10px] font-mono">
                        Neutrones: {dayData.metrics.daily_neutron_msv.toFixed(2)} mSv/d · Regreso a zona blindada
                      </div>
                    </div>
                  ) : evaStress ? (
                    <>
                      <div className="relative w-14 h-14 flex items-center justify-center">
                        <span className="absolute inset-0 rounded-full bg-sky-400/25 border border-sky-300/60 animate-breathe" />
                        <Wind className="w-5 h-5 text-sky-200 relative" />
                      </div>
                      <p className="text-[11px] font-semibold text-white leading-snug max-w-xs">
                        Frecuencia cardíaca elevada. Aumentando flujo de O₂ al 15%. Reproduciendo ruido blanco de bosque
                        terrestre para estabilización. Respira conmigo...
                      </p>
                    </>
                  ) : (
                    <div className="px-4 py-2.5 rounded-xl border border-dashed border-cyan-400/40 bg-cyan-500/5 space-y-1">
                      <div className="text-[10px] font-mono text-cyan-400">PREBREATHE &amp; SOPORTE VITAL OK</div>
                      <div className="text-xs font-bold text-white">VISOR EN RANGO NOMINAL</div>
                      <div className="text-[10px] font-mono text-cyan-300">Sprout-Bot vigilando tu estrés en silencio</div>
                    </div>
                  )}
                </div>

                {/* Breathing wave */}
                <div className="relative z-10 h-9 overflow-hidden border-t border-cyan-500/25 pt-1">
                  <svg viewBox="0 0 240 36" className="w-full h-full" preserveAspectRatio="none">
                    <g className={evaStress ? 'animate-breath-wave' : ''}>
                      <path
                        d={BREATH_WAVE_PATH}
                        fill="none"
                        stroke={evaStress ? '#7dd3fc' : '#22d3ee'}
                        strokeOpacity={evaStress ? 0.95 : 0.35}
                        strokeWidth="2"
                      />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <p className={`text-[11px] ${theme.textMuted}`}>
            Presión de traje de referencia; CO₂, EVARM y pulso provienen de la telemetría del día {day}. El mensaje de
            calma aparece si el pulso supera 88 bpm o al simular un pico de estrés.
          </p>
        </QuadrantCard>

        {/* ---------- 4. Smart Cabin ---------- */}
        <QuadrantCard
          index={4}
          title="Cabina Inteligente · Luces, Audio y Ventanas AR"
          subtitle="“Smart Home” espacial controlado por Sprout-Bot contra el confinamiento"
          Icon={Home}
          refs={cabinRefs}
          theme={theme}
          isDark={isDark}
        >
          {/* LED */}
          <div className={`rounded-xl border p-3 space-y-2.5 ${theme.cardSubtleBg}`}>
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="flex items-center gap-1 font-bold">
                <Lightbulb className="w-3.5 h-3.5" /> Iluminación LED
              </span>
              <span className="font-bold">{intervention ? '480 nm · 6500 K' : `${theme.spectrumLabel} · ${theme.kelvin}`}</span>
            </div>
            <div
              className={`h-12 rounded-xl border border-white/30 flex items-center justify-center transition-all duration-700 bg-gradient-to-r ${
                intervention ? 'from-sky-300 via-blue-500 to-indigo-500' : theme.ledSwatch
              }`}
              style={{
                boxShadow: intervention ? '0 0 30px rgba(59,130,246,0.6)' : theme.ledGlowShadow,
              }}
            >
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-black/55 text-white">
                {intervention ? 'Terapia de Luz Azul (480 nm) · Cabina común' : `${theme.label} (${theme.windowLabel})`}
              </span>
            </div>
            {intervention && (
              <div className={`text-[11px] ${isDark ? 'text-amber-200' : 'text-amber-900'}`}>
                Módulo de descanso: luz cálida 2700 K. Sesión azul de 20 min; al terminar vuelvo al espectro circadiano
                para proteger tu melatonina.
              </div>
            )}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span>Índice de Melatonina Nocturna</span>
                <span className="font-mono">{melatoninMetric.pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-500/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-sky-400 transition-all duration-700"
                  style={{ width: `${melatoninMetric.pct}%` }}
                />
              </div>
              <p className={`text-[10px] ${theme.textMuted}`}>
                {melatoninMetric.label}. El ciclo de luz terrestre contrarresta los 16 amaneceres orbitales diarios
                (HRP-RISK-014).
              </p>
            </div>
          </div>

          {/* Audio */}
          <div className={`rounded-xl border p-3 space-y-2.5 ${theme.cardSubtleBg}`}>
            <div className="flex items-start gap-2">
              <div
                className={`relative w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-hidden ${
                  isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-300'
                }`}
              >
                {audioStatus.kind === 'rain' ? (
                  <>
                    <CloudRain className={`w-4 h-4 ${isDark ? 'text-sky-300' : 'text-sky-700'}`} />
                    {[6, 14, 22, 30].map((x, i) => (
                      <span
                        key={x}
                        className="absolute top-0 w-px h-2 bg-sky-400 animate-rain-drop"
                        style={{ left: `${x}px`, animationDelay: `${i * 0.25}s` }}
                      />
                    ))}
                  </>
                ) : audioStatus.kind === 'forest' ? (
                  <Trees className={`w-4 h-4 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`} />
                ) : audioStatus.kind === 'alert' ? (
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className={`w-4 h-4 ${theme.accentText}`} />
                )}
              </div>
              <div className="min-w-0">
                <div className={`text-[10px] font-mono font-bold uppercase ${theme.textMuted}`}>
                  Sistema de Audio de Cabina
                </div>
                <div className="text-[12px] font-bold leading-snug">{audioStatus.label}</div>
                <div className={`text-[10px] ${theme.textMuted}`}>{audioStatus.sub}</div>
              </div>
            </div>

            {/* Music player */}
            <div
              className={`rounded-xl border p-2.5 flex items-center gap-3 ${
                isDark ? 'bg-slate-950/70 border-slate-700' : 'bg-white border-slate-200'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-amber-500 flex items-end justify-center gap-0.5 p-1.5 shrink-0">
                {[0, 0.2, 0.4, 0.1, 0.3].map((d, i) => (
                  <span
                    key={i}
                    className={`w-1 h-full rounded-sm bg-white/90 ${playback.isPlaying ? 'animate-eq-bar' : ''}`}
                    style={{ animationDelay: `${d}s`, transform: playback.isPlaying ? undefined : 'scaleY(0.3)', transformOrigin: 'bottom' }}
                  />
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-extrabold truncate">
                  {currentTrack.title} <span className={`font-medium ${theme.textMuted}`}>· {currentTrack.artist}</span>
                </div>
                <div className={`text-[10px] font-mono ${theme.textMuted}`}>
                  Playlist “{CREW_PROFILE.playlistName}” · {playback.isPlaying ? 'Reproduciendo a 40 dB' : 'En pausa'}
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-slate-500/25 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-400 transition-all duration-1000"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className={`flex justify-between text-[9px] font-mono mt-0.5 ${theme.textMuted}`}>
                  <span>{formatClock(playback.elapsed)}</span>
                  <span>{formatClock(currentTrack.durationSec)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setPlayback((p) => ({ ...p, isPlaying: !p.isPlaying }))}
                  aria-label={playback.isPlaying ? 'Pausar' : 'Reproducir'}
                  className={`p-1.5 rounded-full border transition ${
                    isDark ? 'border-slate-600 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {playback.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPlayback((p) => ({ ...p, trackIdx: (p.trackIdx + 1) % playlist.length, elapsed: 0 }))
                  }
                  aria-label="Siguiente tema"
                  className={`p-1.5 rounded-full border transition ${
                    isDark ? 'border-slate-600 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* AR Viewports */}
          <div className={`rounded-xl border p-3 space-y-2.5 ${theme.cardSubtleBg}`}>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-[11px] font-mono font-bold">
                <AppWindow className="w-3.5 h-3.5" /> Ventanas de Realidad Aumentada (OLED)
              </span>
              <button
                type="button"
                onClick={() => setWindowShieldManual(!shieldOn)}
                role="switch"
                aria-checked={shieldOn}
                className="inline-flex items-center gap-2 text-[11px] font-bold"
              >
                <span>Escudo de Ventana</span>
                <span
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    shieldOn ? 'bg-emerald-500' : isDark ? 'bg-slate-700' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                      shieldOn ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </span>
              </button>
            </div>

            <div className="rounded-xl overflow-hidden">
              <ArViewportScene scene={landscape} shieldOn={shieldOn} />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {AR_LANDSCAPES.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setLandscape(id);
                    setWindowShieldManual(true);
                  }}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold transition ${
                    shieldOn && landscape === id
                      ? isDark
                        ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/60'
                        : 'bg-emerald-600 text-white border-emerald-700'
                      : isDark
                      ? 'border-slate-600 hover:border-emerald-400'
                      : 'border-slate-300 hover:border-emerald-500'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>

            <p className={`text-[10px] leading-relaxed ${theme.textMuted}`}>
              {shieldOn
                ? `Proyectando paisaje terrestre familiar${
                    windowShieldManual === null ? ' (activado automáticamente por Sprout-Bot)' : ''
                  } para aliviar la nostalgia y el confinamiento (HRP-RISK-019).`
                : 'Vista directa al espacio profundo. Sprout-Bot activa el escudo cuando detecta aislamiento, fatiga o nostalgia.'}
            </p>
          </div>
        </QuadrantCard>
      </div>
    </div>
  );
}
