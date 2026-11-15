import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bone,
  CheckCircle2,
  Droplets,
  Dumbbell,
  ExternalLink,
  Fish,
  Flame,
  HeartPulse,
  Leaf,
  MoonStar,
  Salad,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  Utensils,
  Zap,
} from 'lucide-react';
import { resolveKbRecords } from '../../services/evaluationEngine';

const NUTRIENT_CARDS = [
  {
    id: 'omega3',
    name: 'Omega-3 (EPA/DHA)',
    badge: 'Soporte Inmune',
    doseLabel: '2.4 g · Síntesis Lipídica',
    Icon: Fish,
    accentHex: '#38bdf8',
    ringCls: 'border-sky-400/45 bg-sky-500/10',
    glowStyle: '0 0 22px rgba(56, 189, 248, 0.45)',
    iconCls: 'text-sky-400',
  },
  {
    id: 'flavonoids',
    name: 'Flavonoides',
    badge: 'Microbioma',
    doseLabel: '680 mg · Polifenoles Veggie',
    Icon: Salad,
    accentHex: '#22c55e',
    ringCls: 'border-emerald-400/45 bg-emerald-500/10',
    glowStyle: '0 0 22px rgba(34, 197, 94, 0.42)',
    iconCls: 'text-emerald-400',
  },
  {
    id: 'lycopene',
    name: 'Licopeno',
    badge: 'Antioxidante',
    doseLabel: '18 mg · Escudo Oxidativo',
    Icon: null,
    accentHex: '#fb7185',
    ringCls: 'border-rose-400/45 bg-rose-500/10',
    glowStyle: '0 0 22px rgba(251, 113, 133, 0.45)',
    iconCls: 'text-rose-400',
  },
];

function KbRefChips({ records, isDark }) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-end">
      {records.map((r) => (
        <a
          key={r.id}
          href={r.source_url}
          target="_blank"
          rel="noopener noreferrer"
          title={r.title}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border hover:underline transition ${
            isDark
              ? 'bg-sky-500/15 text-sky-300 border-sky-500/35'
              : 'bg-sky-100 text-sky-900 border-sky-400/60'
          }`}
        >
          <span>{r.id}</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      ))}
    </div>
  );
}

function TomatoLycopeneIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M16 7 C14 4, 11 4, 10 6 C13 7, 15 8, 16 10 C17 8, 19 7, 22 6 C21 4, 18 4, 16 7 Z"
        fill="#22c55e"
      />
      <path d="M16 4 V8" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="18" r="9.5" fill="#f43f5e" stroke="#fda4af" strokeWidth="1.2" />
      <ellipse cx="12.5" cy="14.5" rx="2.5" ry="1.4" transform="rotate(-25 12.5 14.5)" fill="#ffe4e6" opacity="0.85" />
    </svg>
  );
}

function SproutBotWateringSvg({ alertTone = 'amber' }) {
  const uid = useId().replace(/:/g, '');
  const eyeColor = alertTone === 'rose' ? '#fb7185' : '#fbbf24';
  const ringColor = alertTone === 'rose' ? '#f43f5e' : '#f59e0b';

  return (
    <svg viewBox="0 0 110 92" className="w-20 h-16 shrink-0" role="img" aria-label="Sprout-Bot con regadera">
      <defs>
        <linearGradient id={`sbw-shell-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>
      {/* Top Sprout */}
      <path d="M36 22 V10" stroke="#16a34a" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M36 13 Q26 5 22 11 Q24 17 36 16 Z" fill="#22c55e" />
      <path d="M36 13 Q47 5 50 11 Q48 17 36 16 Z" fill="#4ade80" />
      {/* Head */}
      <rect x="14" y="21" width="44" height="34" rx="14" fill={`url(#sbw-shell-${uid})`} stroke={ringColor} strokeWidth="2" />
      <rect x="19" y="26" width="34" height="22" rx="9" fill="#0f172a" />
      <circle cx="29" cy="36" r="3" fill={eyeColor} />
      <circle cx="43" cy="36" r="3" fill={eyeColor} />
      <path d="M31 42 Q36 45 41 42" stroke={eyeColor} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Body & arm holding watering can */}
      <rect x="22" y="57" width="28" height="22" rx="9" fill={`url(#sbw-shell-${uid})`} stroke={ringColor} strokeWidth="1.8" />
      <path d="M48 63 Q61 60 66 53" stroke={ringColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* Watering Can */}
      <g transform="translate(60, 39)">
        <rect x="4" y="8" width="20" height="16" rx="4" fill="#38bdf8" stroke="#bae6fd" strokeWidth="1.4" />
        <path d="M4 12 C-2 10, -2 21, 4 19" fill="none" stroke="#7dd3fc" strokeWidth="2.2" />
        <path d="M24 14 L34 7 L36 10 L24 19 Z" fill="#0ea5e9" />
        <line x1="35" y1="6" x2="38" y2="11" stroke="#e0f2fe" strokeWidth="2.2" strokeLinecap="round" />
        {/* Water drops from spout */}
        <circle cx="41" cy="14" r="1.6" fill="#7dd3fc" className="animate-bounce" />
        <circle cx="44" cy="20" r="1.5" fill="#38bdf8" className="animate-pulse" />
        <circle cx="39" cy="24" r="1.4" fill="#bae6fd" className="animate-bounce" />
      </g>
      {/* Target little sprout below spout */}
      <path d="M98 84 V71" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M98 74 Q90 66 87 72 Q90 77 98 76 Z" fill="#4ade80" />
      <path d="M98 74 Q106 66 109 72 Q106 77 98 76 Z" fill="#22c55e" />
    </svg>
  );
}

function VeggieChamberSvg({ horticulturalOn, isWatering, hydrationPct, harvestCount }) {
  const uid = useId().replace(/:/g, '');
  const glassGrad = `veggie-glass-${uid}`;
  const beamGrad = `veggie-beam-${uid}`;
  const waterGlow = `veggie-water-${uid}`;

  const leafVibrant = horticulturalOn ? '#4ade80' : '#22c55e';
  const leafHighlight = horticulturalOn ? '#86efac' : '#4ade80';
  const scaleGrow = hydrationPct >= 95 ? 1.05 : 1;

  return (
    <div
      className={`relative rounded-2xl border overflow-hidden p-4 transition-all duration-700 ${
        horticulturalOn
          ? 'border-fuchsia-400/70 bg-gradient-to-b from-[#23062e] via-[#1a082b] to-[#0a0818]'
          : 'border-sky-400/40 bg-gradient-to-b from-[#0a192e] via-[#0c1d33] to-[#07101f]'
      }`}
      style={{
        boxShadow: horticulturalOn
          ? 'inset 0 0 48px rgba(236, 72, 153, 0.35), 0 0 28px rgba(192, 38, 211, 0.28)'
          : 'inset 0 0 36px rgba(56, 189, 248, 0.14)',
      }}
    >
      {/* Overhead Crystalline LED Fixture Bar */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-2 px-2">
        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-300">
          Veggie Chamber · ISS Hardware
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
            horticulturalOn
              ? 'bg-fuchsia-500/25 text-fuchsia-200 border-fuchsia-400/60'
              : 'bg-sky-500/20 text-sky-200 border-sky-400/50'
          }`}
        >
          {horticulturalOn ? 'LED Hortícola 660nm Rojo + 450nm Azul' : 'Inspección Luz Blanca 5500K'}
        </span>
      </div>

      {/* Physical LED Light Array */}
      <div
        className={`mx-auto w-[90%] h-3.5 rounded-full transition-all duration-700 ${
          horticulturalOn
            ? 'bg-gradient-to-r from-rose-500 via-fuchsia-400 to-blue-500 shadow-[0_10px_36px_rgba(232,121,249,0.9)]'
            : 'bg-gradient-to-r from-sky-100 via-white to-amber-100 shadow-[0_10px_28px_rgba(224,242,254,0.55)]'
        }`}
      />

      {/* Crystalline Glass Enclosure + 3 Mizuna Plant Pillows */}
      <svg viewBox="0 0 360 190" className="w-full h-52 sm:h-56 select-none" role="img" aria-label="Invernadero espacial Veggie con 3 Plant Pillows de Mostaza Mizuna">
        <defs>
          <linearGradient id={beamGrad} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={horticulturalOn ? '#ec4899' : '#bae6fd'}
              stopOpacity={horticulturalOn ? '0.42' : '0.22'}
            />
            <stop
              offset="65%"
              stopColor={horticulturalOn ? '#a855f7' : '#e0f2fe'}
              stopOpacity={horticulturalOn ? '0.18' : '0.07'}
            />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={glassGrad} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id={waterGlow} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Outer Crystalline Chamber Frame */}
        <rect
          x="14"
          y="6"
          width="332"
          height="176"
          rx="16"
          fill="none"
          stroke={horticulturalOn ? '#e879f9' : '#7dd3fc'}
          strokeOpacity="0.45"
          strokeWidth="2"
        />

        {/* Light Cone */}
        <polygon points="34,8 326,8 340,174 20,174" fill={`url(#${beamGrad})`} />

        {/* Crystalline Glass Diagonal Sheen */}
        <polygon points="22,8 92,8 46,178 16,178" fill={`url(#${glassGrad})`} />
        <polygon points="265,8 308,8 258,178 215,178" fill={`url(#${glassGrad})`} opacity="0.6" />

        {/* Metallic Base Tray */}
        <rect x="20" y="156" width="320" height="20" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />

        {/* 3 Plant Pillows + Roots + Mizuna Foliage */}
        {[
          { cx: 74, label: 'PILLOW 01' },
          { cx: 180, label: 'PILLOW 02' },
          { cx: 286, label: 'PILLOW 03' },
        ].map((pillow, idx) => (
          <g key={pillow.label}>
            {/* Root Network Inside Transparent Pillow Cutaway */}
            <rect
              x={pillow.cx - 38}
              y="130"
              width="76"
              height="30"
              rx="9"
              fill="#1e293b"
              stroke={isWatering ? '#38bdf8' : horticulturalOn ? '#c084fc' : '#64748b'}
              strokeWidth={isWatering ? '2' : '1.4'}
            />
            {/* Moisture Fill Indicator Inside Pillow */}
            <rect
              x={pillow.cx - 35}
              y={156 - Math.max(4, Math.round((hydrationPct / 100) * 18))}
              width="70"
              height={Math.max(4, Math.round((hydrationPct / 100) * 18))}
              rx="4"
              fill={hydrationPct >= 95 ? '#06b6d4' : '#0284c7'}
              opacity={isWatering ? '0.65' : '0.32'}
            />
            {/* Fine Root Tendrils */}
            <path
              d={`M${pillow.cx} 131 Q${pillow.cx - 12} 142 ${pillow.cx - 20} 152 M${pillow.cx} 131 V154 M${pillow.cx} 131 Q${pillow.cx + 12} 142 ${pillow.cx + 22} 151`}
              stroke={isWatering ? '#7dd3fc' : '#94a3b8'}
              strokeWidth="1.3"
              fill="none"
            />
            <text
              x={pillow.cx}
              y="148"
              textAnchor="middle"
              fill="#e2e8f0"
              fontSize="8.5"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {pillow.label}
            </text>

            {/* Mizuna Mustard Leaves */}
            <g
              className="animate-float-slow"
              style={{
                transformOrigin: `${pillow.cx}px 130px`,
                transform: `scale(${scaleGrow})`,
                animationDelay: `${idx * 0.4}s`,
              }}
            >
              {/* Outer serrated-style Mizuna leaves */}
              <path
                d={`M${pillow.cx} 130 Q${pillow.cx - 24} 84 ${pillow.cx - 38} 94 Q${pillow.cx - 28} 118 ${pillow.cx} 130 Z`}
                fill="#16a34a"
              />
              <path
                d={`M${pillow.cx} 130 Q${pillow.cx + 24} 84 ${pillow.cx + 38} 94 Q${pillow.cx + 28} 118 ${pillow.cx} 130 Z`}
                fill="#15803d"
              />
              {/* Mid lush leaves */}
              <path
                d={`M${pillow.cx} 130 Q${pillow.cx - 16} 66 ${pillow.cx - 26} 76 Q${pillow.cx - 16} 106 ${pillow.cx} 130 Z`}
                fill={leafVibrant}
              />
              <path
                d={`M${pillow.cx} 130 Q${pillow.cx + 16} 66 ${pillow.cx + 26} 76 Q${pillow.cx + 16} 106 ${pillow.cx} 130 Z`}
                fill={leafHighlight}
              />
              {/* Central crisp crown leaf */}
              <path
                d={`M${pillow.cx} 130 Q${pillow.cx - 8} 54 ${pillow.cx + 4} 58 Q${pillow.cx + 12} 92 ${pillow.cx} 130 Z`}
                fill={leafHighlight}
              />
              {/* Leaf veins */}
              <path
                d={`M${pillow.cx} 126 Q${pillow.cx - 12} 95 ${pillow.cx - 20} 82 M${pillow.cx} 126 Q${pillow.cx + 12} 95 ${pillow.cx + 20} 82`}
                stroke="#dcfce7"
                strokeWidth="0.9"
                strokeOpacity="0.55"
                fill="none"
              />
            </g>

            {/* Animated Hydration Droplets When Irrigating Roots */}
            {isWatering && (
              <g>
                {[-18, -6, 6, 18].map((dx, dIdx) => (
                  <path
                    key={dx}
                    d={`M${pillow.cx + dx} 48 C${pillow.cx + dx - 3} 55, ${pillow.cx + dx + 3} 55, ${pillow.cx + dx} 48 Z`}
                    fill={`url(#${waterGlow})`}
                    style={{
                      animation: 'veggieDropFall 0.9s linear infinite',
                      animationDelay: `${(idx * 0.2 + dIdx * 0.14).toFixed(2)}s`,
                    }}
                  />
                ))}
                <circle
                  cx={pillow.cx}
                  cy="134"
                  r="14"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  strokeOpacity="0.7"
                  className="animate-ping"
                />
              </g>
            )}
          </g>
        ))}

        {/* Harvest badge inside chamber if harvested */}
        {harvestCount > 0 && (
          <g transform="translate(242, 16)">
            <rect width="98" height="20" rx="10" fill="rgba(16, 185, 129, 0.25)" stroke="#34d399" />
            <text x="49" y="13.5" textAnchor="middle" fill="#a7f3d0" fontSize="9" fontFamily="monospace" fontWeight="bold">
              COSECHA: {harvestCount}x RACIÓN
            </text>
          </g>
        )}
      </svg>

      {/* Chamber Telemetry Strip + Moisture Gauge */}
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-200">
        <div className="px-2.5 py-2 rounded-xl bg-black/35 border border-white/10">
          <div className="text-[10px] text-slate-400">Especie · Etapa</div>
          <div className="font-bold text-emerald-300 truncate">Mostaza Mizuna · D21 Lista</div>
        </div>
        <div className="px-2.5 py-2 rounded-xl bg-black/35 border border-white/10">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Estado de Humedad</span>
            <span className={hydrationPct >= 95 ? 'text-cyan-300 font-bold' : 'text-amber-300 font-bold'}>
              {hydrationPct}%
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                hydrationPct >= 95 ? 'bg-cyan-400' : 'bg-sky-400'
              }`}
              style={{ width: `${hydrationPct}%` }}
            />
          </div>
        </div>
        <div className="px-2.5 py-2 rounded-xl bg-black/35 border border-white/10">
          <div className="text-[10px] text-slate-400">Seguridad JSC</div>
          <div className="font-bold text-sky-300 truncate">Microbioma Estable (HRP-RES-012)</div>
        </div>
      </div>
    </div>
  );
}

function RadialProgressRing({
  pct,
  color,
  trackColor,
  broken = false,
  size = 132,
  strokeWidth = 13,
  children,
}) {
  const uid = useId().replace(/:/g, '');
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
        <defs>
          <filter id={`ring-glow-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track Ring (fractured dashed style when broken) */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={broken ? '#ef4444' : trackColor}
          strokeOpacity={broken ? 0.28 : 1}
          strokeWidth={strokeWidth}
          strokeDasharray={broken ? '14 8' : undefined}
        />

        {/* Progress Arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap={broken ? 'butt' : 'round'}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${cx} ${cy})`}
          filter={`url(#ring-glow-${uid})`}
          style={{ transition: 'stroke-dashoffset 700ms ease, stroke 400ms ease' }}
        />

        {/* Dramatic Fracture Markers when ARED ring is broken (Day 98) */}
        {broken && (
          <g className="animate-pulse">
            <line x1={cx + r - 9} y1={cy - 6} x2={cx + r + 9} y2={cy + 6} stroke="#fb7185" strokeWidth="2.5" />
            <line x1={cx - 8} y1={cy + r - 8} x2={cx + 8} y2={cy + r + 8} stroke="#fb7185" strokeWidth="2.5" />
            <circle
              cx={cx}
              cy={cy}
              r={r + 8}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              opacity="0.7"
            />
          </g>
        )}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
        {children}
      </div>
    </div>
  );
}

export default function WellnessVeggieModule({ evaluation, knowledgeBase, theme }) {
  const isDark = theme?.isDark ?? true;
  const { dayData, metrics } = evaluation;
  const mByKey = useMemo(() => Object.fromEntries(metrics.map((x) => [x.key, x.value])), [metrics]);

  const boneDensity = Number(mByKey.bone_density_index ?? dayData.metrics.bone_density_index);
  const restingHr = Math.round(mByKey.resting_heart_rate ?? dayData.metrics.resting_heart_rate);
  const sleepHours = Number(mByKey.sleep_hours ?? dayData.metrics.sleep_hours);
  const pvtMs = Math.round(mByKey.pvt_reaction_ms ?? dayData.metrics.pvt_reaction_ms);
  const aredDone = dayData.ared_workout_completed === true;
  const missionDay = dayData.mission_day;

  // Zone 1 interactive state
  const [horticulturalOn, setHorticulturalOn] = useState(false);
  const [hydrationPct, setHydrationPct] = useState(74);
  const [isWatering, setIsWatering] = useState(false);
  const [harvestCount, setHarvestCount] = useState(0);
  const waterTimerRef = useRef(null);

  // Zone 2 interactive state
  const [selectedNutrients, setSelectedNutrients] = useState({
    omega3: true,
    flavonoids: false,
    lycopene: false,
  });
  const [mizunaAddedToDinner, setMizunaAddedToDinner] = useState(false);

  // Reset contextual daily food & watering feedback on day jump
  useEffect(() => {
    setMizunaAddedToDinner(false);
  }, [missionDay]);

  useEffect(() => {
    return () => {
      if (waterTimerRef.current) clearTimeout(waterTimerRef.current);
    };
  }, []);

  const handleWaterPillows = () => {
    setIsWatering(true);
    setHydrationPct(100);
    if (waterTimerRef.current) clearTimeout(waterTimerRef.current);
    waterTimerRef.current = setTimeout(() => {
      setIsWatering(false);
    }, 1900);
  };

  const handleHarvestMizuna = () => {
    setHarvestCount((c) => c + 1);
    setMizunaAddedToDinner(true);
    setSelectedNutrients((prev) => ({ ...prev, flavonoids: true }));
  };

  const toggleNutrient = (id) => {
    setSelectedNutrients((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Verified KB Citations
  const veggieRefs = resolveKbRecords(knowledgeBase, ['HRP-RES-010', 'HRP-RES-012']);
  const nutritionRefs = resolveKbRecords(knowledgeBase, ['HRP-RISK-007', 'HRP-RES-008', 'HRP-RES-009']);
  const fitnessRefs = resolveKbRecords(knowledgeBase, ['HRP-RISK-009', 'HRP-RISK-011', 'HRP-RISK-014']);

  // Clinical / Psychological derived flags
  const isStressOrFatigue = pvtMs > 285 || sleepHours < 7.0;
  const boneAlert = !aredDone || boneDensity < 97.5;

  // Menu fatigue risk progression across 180d (drops sharply when Mizuna fresh leaves added)
  const standardMenuDays = missionDay >= 14 ? 14 + (missionDay % 7) : missionDay;
  const displayMenuDays = missionDay >= 14 && missionDay % 14 === 0 ? 14 : Math.max(14, Math.min(28, standardMenuDays));
  const rawMenuFatigue = Math.min(92, Math.round(28 + (missionDay / 180) * 62));
  const menuFatiguePct = mizunaAddedToDinner ? Math.max(16, rawMenuFatigue - 34) : rawMenuFatigue;

  // Sleep & ARED Ring computations
  const aredPct = aredDone ? 100 : 15;
  const aredRingColor = aredDone ? (isDark ? '#10b981' : '#059669') : '#f43f5e';

  const sleepPct = Math.min(100, Math.round((sleepHours / 8.0) * 100));
  const sleepRingColor =
    sleepHours >= 7.0
      ? isDark
        ? '#38bdf8'
        : '#0284c7'
      : sleepHours >= 6.0
      ? isDark
        ? '#f59e0b'
        : '#d97706'
      : isDark
      ? '#f43f5e'
      : '#e11d48';
  const sleepStatusLabel =
    sleepHours >= 7.0 ? 'Ciclo Cerrado Óptimo' : sleepHours >= 6.0 ? 'Déficit Moderado' : 'Deuda Aguda de Sueño';

  const boneStatus = metrics.find((x) => x.key === 'bone_density_index')?.status || 'optimal';
  const hrStatus = metrics.find((x) => x.key === 'resting_heart_rate')?.status || 'optimal';
  const emeraldTxt = isDark ? 'text-emerald-400' : 'text-emerald-700';
  const amberTxt = isDark ? 'text-amber-400' : 'text-amber-700';
  const roseTxt = isDark ? 'text-rose-400' : 'text-rose-600';

  return (
    <div className="space-y-5">
      {/* Scoped Water Drop Keyframe strictly inside Module 4 */}
      <style>{`
        @keyframes veggieDropFall {
          0% { transform: translateY(0px) scale(0.9); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(82px) scale(1.1); opacity: 0; }
        }
      `}</style>

      {/* ============ JURY DEMO INTERRUPTION BANNER (DAY 25 -> DAY 98) ============ */}
      {!aredDone && (
        <section
          role="alert"
          className={`rounded-2xl border-2 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 shadow-xl animate-pulse circadian-transition ${
            isDark
              ? 'border-rose-500/80 bg-gradient-to-r from-rose-950/90 via-amber-950/75 to-slate-950 text-rose-100'
              : 'border-rose-500 bg-gradient-to-r from-rose-50 via-amber-50 to-white text-rose-950'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/60 flex items-center justify-center shrink-0">
            <Dumbbell className={`w-6 h-6 ${roseTxt}`} />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-rose-500 text-white">
                Interrupción Crítica · Día {missionDay}
              </span>
              <span className={`text-[11px] font-mono font-bold ${amberTxt}`}>
                ARED Omitido · Densidad Ósea {boneDensity.toFixed(2)}%
              </span>
            </div>
            <p className="text-sm sm:text-base font-extrabold leading-snug">
              “¡Comandante! Saltarse el ejercicio ARED hoy acelerará tu pérdida ósea a un 1.5% mensual (HRP-RISK-011).
              Dirígete al módulo de carga resistiva de inmediato.”
            </p>
          </div>
          <KbRefChips records={fitnessRefs.slice(0, 2)} isDark={isDark} />
        </section>
      )}

      {/* ============ ZONA 1 & ZONA 2 TOP GRID ============ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* ---------- ZONA 1: INVERNADERO ESPACIAL INTERACTIVO "VEGGIE" ---------- */}
        <section
          className={`xl:col-span-7 rounded-2xl border p-5 flex flex-col justify-between gap-4 circadian-transition ${theme.cardBg}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                Zona 1 · Terapia Psicológica &amp; Botánica Orbital
              </div>
              <h2 className="text-base sm:text-lg font-extrabold flex items-center gap-2 mt-0.5">
                <Sprout className="w-5 h-5 text-emerald-400" />
                <span>Invernadero Espacial Interactivo “Veggie”</span>
              </h2>
            </div>
            <KbRefChips records={veggieRefs} isDark={isDark} />
          </div>

          {/* Crystalline SVG Chamber */}
          <VeggieChamberSvg
            horticulturalOn={horticulturalOn}
            isWatering={isWatering}
            hydrationPct={hydrationPct}
            harvestCount={harvestCount}
          />

          {/* Interactive Botanical Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setHorticulturalOn((v) => !v)}
              className={`sm:col-span-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold border-2 transition shadow-md ${
                horticulturalOn
                  ? 'bg-gradient-to-r from-fuchsia-600 via-pink-500 to-indigo-600 text-white border-fuchsia-300 shadow-fuchsia-500/35'
                  : isDark
                  ? 'bg-fuchsia-500/15 hover:bg-fuchsia-500/25 text-fuchsia-200 border-fuchsia-400/60'
                  : 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white border-fuchsia-700'
              }`}
            >
              <Sun className="w-4 h-4 shrink-0" />
              <span>
                {horticulturalOn
                  ? 'Espectro Hortícola Activo (Cambiar a Luz Blanca)'
                  : 'Activar Espectro Hortícola (Rojo/Azul)'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleWaterPillows}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-extrabold border transition ${
                hydrationPct >= 100
                  ? isDark
                    ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400/70'
                    : 'bg-cyan-600 text-white border-cyan-700'
                  : isDark
                  ? 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border-cyan-500/45'
                  : 'bg-sky-100 hover:bg-sky-200 text-sky-900 border-sky-400'
              }`}
            >
              <Droplets className={`w-4 h-4 ${isWatering ? 'animate-bounce' : ''}`} />
              <span>{isWatering ? 'Regando Raíces...' : 'Hidratar Plant Pillows'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleHarvestMizuna}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition shadow ${
                harvestCount > 0
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  : isDark
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/50'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>
                {harvestCount > 0
                  ? `Cosechar Mizuna Fresca (${harvestCount} enviada a cena)`
                  : 'Cosechar Hojas Frescas de Mizuna'}
              </span>
            </button>

            <span className={`text-[11px] font-mono ${theme.textMuted}`}>
              {isWatering ? 'Infiltración capilar en 3 pillows · 100%' : 'Terapia hortícola activa · D' + missionDay}
            </span>
          </div>

          {/* Sprout-Bot Psychological Stress / Bad Sleep Intervention with Watering Can */}
          {isStressOrFatigue ? (
            <div
              className={`rounded-2xl border p-3.5 flex flex-col sm:flex-row items-center gap-3 ${
                isDark
                  ? 'border-amber-400/55 bg-amber-500/10 text-amber-100'
                  : 'border-amber-500 bg-amber-50 text-amber-950'
              }`}
            >
              <SproutBotWateringSvg alertTone={sleepHours < 6.0 || pvtMs > 345 ? 'rose' : 'amber'} />
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className={`text-[10px] font-mono font-black uppercase tracking-wider ${amberTxt}`}>
                    Sprout-Bot · Intervención Hortícola (PVT {pvtMs} ms · Sueño {sleepHours.toFixed(1)} h)
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] font-bold leading-snug">
                  “Tus niveles de estrés están altos hoy. Tómate 5 minutos para cuidar la Mizuna. La jardinería espacial
                  está comprobada para reducir la ansiedad de aislamiento (HRP-RES-010).”
                </p>
              </div>
            </div>
          ) : (
            <div className={`rounded-xl border p-3 flex items-center gap-3 text-xs ${theme.cardSubtleBg}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className={theme.textSecondary}>
                Ciclo cognitivo y de sueño estables hoy (PVT {pvtMs} ms · Sueño {sleepHours.toFixed(1)} h). Tu cuidado
                diario en Veggie sostiene la resiliencia psicosocial (HRP-RES-010).
              </span>
            </div>
          )}
        </section>

        {/* ---------- ZONA 2: SINTETIZADOR DE NUTRICIÓN ANTI-FATIGA (SMART REPLICATOR) ---------- */}
        <section
          className={`xl:col-span-5 rounded-2xl border p-5 flex flex-col justify-between gap-4 circadian-transition ${theme.cardBg}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>
                Zona 2 · Smart Food Replicator (JSC)
              </div>
              <h2 className="text-base sm:text-lg font-extrabold flex items-center gap-2 mt-0.5">
                <Utensils className={`w-5 h-5 ${theme.accentText}`} />
                <span>Sintetizador Nutricional Anti-Fatiga</span>
              </h2>
              <p className={`text-[11px] mt-0.5 ${theme.textMuted}`}>
                Dieta enriquecida Dra. Grace Douglas (HRP-RES-009) contra fatiga de menú (HRP-RISK-007)
              </p>
            </div>
            <KbRefChips records={nutritionRefs} isDark={isDark} />
          </div>

          {/* 3 Compact Visual Nutrient Synthesizer Cards */}
          <div className="grid grid-cols-3 gap-2.5">
            {NUTRIENT_CARDS.map((n) => {
              const active = selectedNutrients[n.id];
              const Icon = n.Icon;
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => toggleNutrient(n.id)}
                  className={`rounded-2xl border p-3 flex flex-col items-center text-center gap-2 transition hover:scale-[1.03] ${
                    active ? n.ringCls : theme.cardSubtleBg
                  }`}
                  style={active ? { boxShadow: n.glowStyle } : undefined}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
                      isDark ? 'bg-slate-950/75 border-white/15' : 'bg-white border-slate-200'
                    }`}
                  >
                    {Icon ? (
                      <Icon className={`w-6 h-6 ${n.iconCls}`} />
                    ) : (
                      <TomatoLycopeneIcon className="w-7 h-7" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-extrabold leading-tight">{n.name.split(' ')[0]}</div>
                    <div
                      className="text-[10px] font-mono font-bold"
                      style={{ color: isDark ? n.accentHex : undefined }}
                    >
                      {n.badge}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${
                      active
                        ? isDark
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                          : 'bg-emerald-600 text-white border-emerald-700'
                        : 'border-slate-500/30 opacity-70'
                    }`}
                  >
                    {active ? '✓ Sintetizado' : 'Activar'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Menu Fatigue Meter */}
          <div className={`rounded-2xl border p-4 space-y-3 ${theme.cardSubtleBg}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-extrabold">
                <Flame className={`w-4 h-4 ${menuFatiguePct >= 60 ? amberTxt : emeraldTxt}`} />
                <span>Riesgo de Fatiga de Menú</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-black border ${
                  menuFatiguePct >= 65
                    ? `bg-rose-500/20 ${roseTxt} border-rose-500/45`
                    : menuFatiguePct >= 40
                    ? `bg-amber-500/20 ${amberTxt} border-amber-500/45`
                    : `bg-emerald-500/20 ${emeraldTxt} border-emerald-500/45`
                }`}
              >
                {menuFatiguePct}% {mizunaAddedToDinner ? '· Mitigado' : '· Estándar'}
              </span>
            </div>

            <div className="h-3 rounded-full bg-slate-500/20 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  menuFatiguePct >= 65
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                    : menuFatiguePct >= 40
                    ? 'bg-gradient-to-r from-emerald-400 to-amber-400'
                    : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                }`}
                style={{ width: `${menuFatiguePct}%` }}
              />
            </div>

            <div
              className={`rounded-xl border p-3 text-xs leading-relaxed ${
                isDark ? 'bg-slate-950/60 border-amber-400/35 text-slate-100' : 'bg-white border-amber-300 text-slate-900'
              }`}
            >
              <div className={`flex items-center gap-1.5 text-[10px] font-mono font-bold mb-1 ${emeraldTxt}`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sprout-Bot · Nutrición Preventiva (Día {missionDay})</span>
              </div>
              “Llevas {displayMenuDays} días con el menú estándar. Riesgo de déficit calórico (HRP-RISK-007). He añadido
              la Mostaza Mizuna que acabas de cosechar a tu cena de hoy para mejorar la aceptabilidad (HRP-RES-008).”
            </div>

            <button
              type="button"
              onClick={() => setMizunaAddedToDinner((v) => !v)}
              className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-extrabold border transition ${
                mizunaAddedToDinner
                  ? isDark
                    ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400/70'
                    : 'bg-emerald-600 text-white border-emerald-700'
                  : isDark
                  ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border-amber-400/50'
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-600'
              }`}
            >
              <Leaf className="w-4 h-4" />
              <span>
                {mizunaAddedToDinner
                  ? '✓ Mostaza Mizuna añadida a la cena de hoy'
                  : 'Añadir Mostaza Mizuna Fresca a la Cena de Hoy'}
              </span>
            </button>
          </div>
        </section>
      </div>

      {/* ============ ZONA 3: ANILLOS DE RENDIMIENTO FÍSICO Y SUEÑO (SMARTWATCH RINGS) ============ */}
      <section className={`rounded-2xl border p-5 space-y-5 circadian-transition ${theme.cardBg}`}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isDark ? 'text-sky-300' : 'text-sky-800'}`}>
              Zona 3 · Centro de Alto Rendimiento (ARED &amp; Ritmo Circadiano)
            </div>
            <h3 className="text-base sm:text-lg font-extrabold flex items-center gap-2 mt-0.5">
              <Zap className={`w-5 h-5 ${aredDone ? emeraldTxt : roseTxt}`} />
              <span>Anillos de Ejercicio ARED (1.5 hrs/día) y Sueño Orbital</span>
            </h3>
          </div>
          <KbRefChips records={fitnessRefs} isDark={isDark} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Smartwatch Radial Rings */}
          <div className={`lg:col-span-6 rounded-2xl border p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center ${theme.cardSubtleBg}`}>
            {/* ARED Ring */}
            <div className="flex flex-col items-center text-center gap-2">
              <RadialProgressRing
                pct={aredPct}
                color={aredRingColor}
                trackColor={isDark ? 'rgba(148,163,184,0.2)' : 'rgba(15,23,42,0.12)'}
                broken={!aredDone}
              >
                <Dumbbell className={`w-5 h-5 mb-0.5 ${aredDone ? emeraldTxt : `${roseTxt} animate-bounce`}`} />
                <span className={`text-xl font-black font-mono ${aredDone ? emeraldTxt : roseTxt}`}>
                  {aredPct}%
                </span>
                <span className="text-[10px] font-mono opacity-80">
                  {aredDone ? '1.5 / 1.5 h' : '0.2 / 1.5 h'}
                </span>
              </RadialProgressRing>
              <div>
                <div className="text-xs font-extrabold">Anillo ARED</div>
                <div className={`text-[11px] font-semibold ${aredDone ? emeraldTxt : roseTxt}`}>
                  {aredDone ? 'Cerrado en Verde · Completado' : '¡Anillo Roto! Sesión Omitida'}
                </div>
              </div>
            </div>

            {/* Sleep Ring */}
            <div className="flex flex-col items-center text-center gap-2">
              <RadialProgressRing
                pct={sleepPct}
                color={sleepRingColor}
                trackColor={isDark ? 'rgba(148,163,184,0.2)' : 'rgba(15,23,42,0.12)'}
                broken={false}
              >
                <MoonStar className="w-5 h-5 mb-0.5" style={{ color: sleepRingColor }} />
                <span className="text-xl font-black font-mono" style={{ color: sleepRingColor }}>
                  {sleepHours.toFixed(1)} h
                </span>
                <span className="text-[10px] font-mono opacity-80">Meta ≥ 7.0 h</span>
              </RadialProgressRing>
              <div>
                <div className="text-xs font-extrabold">Anillo de Sueño</div>
                <div className="text-[11px] font-semibold" style={{ color: sleepRingColor }}>
                  {sleepStatusLabel}
                </div>
              </div>
            </div>
          </div>

          {/* Micro-Dashboard Óseo / Cardio + Scientific Validation Floating Card */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bone Density Index (flashes amber on missed ARED e.g. Day 98) */}
            <div
              className={`rounded-2xl border-2 p-4 flex flex-col justify-between transition ${
                boneAlert
                  ? isDark
                    ? 'border-amber-400 bg-amber-500/15 animate-pulse shadow-[0_0_24px_rgba(245,158,11,0.3)]'
                    : 'border-amber-500 bg-amber-50 animate-pulse shadow-[0_0_24px_rgba(245,158,11,0.25)]'
                  : theme.cardSubtleBg
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Bone className={`w-4 h-4 ${boneAlert ? amberTxt : emeraldTxt}`} />
                  <span>Densidad Ósea</span>
                </span>
                {boneAlert && <AlertTriangle className={`w-4 h-4 ${amberTxt}`} />}
              </div>

              <div className="my-2">
                <div
                  className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
                    boneAlert ? amberTxt : boneStatus === 'optimal' ? emeraldTxt : amberTxt
                  }`}
                >
                  {boneDensity.toFixed(2)}%
                </div>
                <div className={`text-[11px] font-mono mt-0.5 ${theme.textMuted}`}>
                  bone_density_index · Día {missionDay}
                </div>
              </div>

              <div className={`text-[11px] font-semibold ${boneAlert ? amberTxt : theme.textSecondary}`}>
                {boneAlert ? 'Alerta de desmineralización sin carga ARED' : 'Remodelado óseo protegido hoy'}
              </div>
            </div>

            {/* Resting Heart Rate */}
            <div
              className={`rounded-2xl border p-4 flex flex-col justify-between ${
                hrStatus === 'critical'
                  ? 'border-rose-500/70 bg-rose-500/10'
                  : hrStatus === 'warning'
                  ? 'border-amber-500/60 bg-amber-500/10'
                  : theme.cardSubtleBg
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <HeartPulse
                    className={`w-4 h-4 ${
                      hrStatus === 'critical' ? roseTxt : hrStatus === 'warning' ? amberTxt : emeraldTxt
                    }`}
                  />
                  <span>Pulso Reposo</span>
                </span>
                <Activity className="w-4 h-4 opacity-60" />
              </div>

              <div className="my-2">
                <div
                  className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
                    hrStatus === 'critical' ? roseTxt : hrStatus === 'warning' ? amberTxt : emeraldTxt
                  }`}
                >
                  {restingHr} <span className="text-lg">bpm</span>
                </div>
                <div className={`text-[11px] font-mono mt-0.5 ${theme.textMuted}`}>
                  resting_heart_rate · Día {missionDay}
                </div>
              </div>

              <div className={`text-[11px] ${theme.textSecondary}`}>
                {restingHr > 88 ? 'Sobrecarga autonómica detectada' : 'Capacidad aeróbica en rango nominal'}
              </div>
            </div>

            {/* Floating Scientific Validation Card */}
            <div
              className={`sm:col-span-2 rounded-2xl border p-3.5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDark
                  ? 'bg-slate-950/75 border-cyan-500/35 text-slate-200'
                  : 'bg-cyan-50/90 border-cyan-300 text-slate-900'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <ShieldCheck className={`w-5 h-5 shrink-0 mt-0.5 ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`} />
                <div className="text-[11px] leading-relaxed">
                  <strong>Validación Científica NASA HRP:</strong> Sin ejercicio resistivo ARED (1.5 hrs/día), los huesos
                  que soportan peso pierden entre <strong>1% y 1.5% de densidad al mes</strong> (HRP-RISK-011) junto con
                  caída de fuerza muscular y capacidad cardiorrespiratoria (HRP-RISK-009). La higiene circadiana protege el
                  descanso frente a los 16 ciclos diarios luz/oscuridad (HRP-RISK-014).
                </div>
              </div>
              <KbRefChips records={fitnessRefs} isDark={isDark} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
