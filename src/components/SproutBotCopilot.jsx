import React, { useState } from 'react';
import {
  Radio,
  ShieldAlert,
  Dumbbell,
  Sprout,
  Sun,
  Sunset,
  Moon,
  MessageCircleHeart,
  Stethoscope,
  Wind,
  Sparkles,
} from 'lucide-react';

export default function SproutBotCopilot({
  evaluation,
  circadianMode,
  theme,
  onJumpToView,
}) {
  const [activePromptTab, setActivePromptTab] = useState('connection');
  const [breathActive, setBreathActive] = useState(false);

  const { dayData, mascotPosture, narrative, overallStatus, isLivePvtOverride, effectivePvt } =
    evaluation;

  const delayMin = dayData.earth_comm_delay_min;
  const roundTripMin = delayMin * 2;
  const isNight = circadianMode === 'night';
  const isSunset = circadianMode === 'sunset';

  // Sprout-Bot core visual colors by circadian time + health alert override
  const botCoreColor =
    mascotPosture === 'shield'
      ? '#f43f5e'
      : isNight
      ? '#6366f1'
      : isSunset
      ? '#f59e0b'
      : '#0ea5e9';

  const botVisorBg =
    mascotPosture === 'shield'
      ? '#1f0b14'
      : isNight
      ? '#090e23'
      : isSunset
      ? '#2b1207'
      : '#082f49';

  const eyeColor =
    mascotPosture === 'shield'
      ? '#fb7185'
      : isNight
      ? '#818cf8'
      : isSunset
      ? '#fbbf24'
      : '#38bdf8';

  const leafColor =
    mascotPosture === 'shield'
      ? '#fda4af'
      : isSunset
      ? '#84cc16'
      : isNight
      ? '#34d399'
      : '#22c55e';

  const postureLabel =
    mascotPosture === 'shield'
      ? 'Escudo Radiación SPE Activo'
      : mascotPosture === 'weights'
      ? 'Modo Entrenamiento ARED'
      : mascotPosture === 'veggie'
      ? 'Modo Terapia Veggie & Aire'
      : isNight
      ? 'Modo Reposo Circadiano'
      : isSunset
      ? 'Modo Transición Ámbar'
      : 'Modo Copiloto Activo';

  const postureBadgeClass =
    mascotPosture === 'shield'
      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
      : mascotPosture === 'weights'
      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
      : mascotPosture === 'veggie'
      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
      : theme.accentSoft;

  return (
    <section
      className={`rounded-2xl border p-5 sm:p-6 circadian-transition relative overflow-hidden ${theme.cardBg}`}
    >
      {/* Subtle Ambient Circadian Aura */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-50 transition-all duration-700"
        style={{ background: botCoreColor }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* LEFT COLUMN: Animated SVG Sprout-Bot + Earth Comm Delay Ring */}
        <div className="lg:col-span-5 flex flex-col items-center">
          {/* Status Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${postureBadgeClass}`}
            >
              {mascotPosture === 'shield' && <ShieldAlert className="w-3.5 h-3.5" />}
              {mascotPosture === 'weights' && <Dumbbell className="w-3.5 h-3.5" />}
              {mascotPosture === 'veggie' && <Sprout className="w-3.5 h-3.5" />}
              {mascotPosture === 'nominal' &&
                (isNight ? (
                  <Moon className="w-3.5 h-3.5" />
                ) : isSunset ? (
                  <Sunset className="w-3.5 h-3.5" />
                ) : (
                  <Sun className="w-3.5 h-3.5" />
                ))}
              <span>{postureLabel}</span>
            </span>

            {isLivePvtOverride && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-400/40">
                <Sparkles className="w-3 h-3" />
                PVT Live: {Math.round(effectivePvt)} ms
              </span>
            )}
          </div>

          {/* Animated SVG Mascot Container */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* Earth Comm Delay Orbital Radar Ring */}
            <svg
              viewBox="0 0 280 280"
              className="w-full h-full drop-shadow-xl"
              role="img"
              aria-label={`Sprout-Bot en ${postureLabel}`}
            >
              <defs>
                <radialGradient id="sproutAura" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={botCoreColor} stopOpacity="0.32" />
                  <stop offset="70%" stopColor={botCoreColor} stopOpacity="0.08" />
                  <stop offset="100%" stopColor={botCoreColor} stopOpacity="0" />
                </radialGradient>
                <linearGradient id="botShell" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={theme.isDark ? '#e2e8f0' : '#ffffff'} />
                  <stop offset="100%" stopColor={theme.isDark ? '#94a3b8' : '#cbd5e1'} />
                </linearGradient>
                <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fb7185" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity="0.12" />
                </linearGradient>
              </defs>

              {/* Soft Background Aura */}
              <circle cx="140" cy="140" r="130" fill="url(#sproutAura)" />

              {/* Outer Comm Delay Ring */}
              <circle
                cx="140"
                cy="140"
                r="122"
                fill="none"
                stroke={botCoreColor}
                strokeOpacity="0.25"
                strokeWidth="2"
                strokeDasharray="6 6"
              />
              {/* Progress arc representing Earth Comm Delay up to 20 min */}
              <circle
                cx="140"
                cy="140"
                r="122"
                fill="none"
                stroke={botCoreColor}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 122}
                strokeDashoffset={
                  2 * Math.PI * 122 * (1 - Math.min(1, delayMin / 20))
                }
                transform="rotate(-90 140 140)"
              />

              {/* Circadian Celestial Indicator (Sun / Sunset / Moon) */}
              {circadianMode === 'day' && (
                <g transform="translate(222, 46)">
                  <circle r="14" fill="#facc15" opacity="0.9" />
                  <circle r="20" fill="#fde047" opacity="0.25" />
                </g>
              )}
              {circadianMode === 'sunset' && (
                <g transform="translate(222, 50)">
                  <circle r="14" fill="#fb923c" opacity="0.9" />
                  <rect x="-18" y="4" width="36" height="12" fill="#7c2d12" opacity="0.7" rx="4" />
                </g>
              )}
              {circadianMode === 'night' && (
                <g transform="translate(222, 48)">
                  <path
                    d="M 4 -12 A 12 12 0 1 0 14 6 A 9 9 0 1 1 4 -12 Z"
                    fill="#c7d2fe"
                  />
                  <circle cx="-12" cy="-10" r="1.8" fill="#e0e7ff" />
                  <circle cx="14" cy="-14" r="1.5" fill="#e0e7ff" />
                </g>
              )}

              {/* SPE RADIATION SHIELD HEXAGON (Active during solar_particle_event) */}
              {mascotPosture === 'shield' && (
                <g className="animate-pulse">
                  <polygon
                    points="140,26 236,80 236,196 140,250 44,196 44,80"
                    fill="url(#shieldGrad)"
                    stroke="#f43f5e"
                    strokeWidth="3"
                    strokeDasharray="10 5"
                  />
                  <polygon
                    points="140,36 226,85 226,191 140,240 54,191 54,85"
                    fill="none"
                    stroke="#fda4af"
                    strokeWidth="1.5"
                    opacity="0.7"
                  />
                  <text
                    x="140"
                    y="240"
                    textAnchor="middle"
                    fill="#fda4af"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    ESCUDO ALARA ACTIVO
                  </text>
                </g>
              )}

              {/* FLOATING SPROUT-BOT BODY GROUP */}
              <g className="animate-float-slow">
                {/* Sprout Antenna / Mizuna Leaf on Top */}
                <path
                  d="M 140 82 Q 140 56 140 50"
                  stroke="#16a34a"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 140 54 Q 120 34 114 48 Q 112 62 140 60 Z"
                  fill={leafColor}
                />
                <path
                  d="M 140 54 Q 164 32 168 46 Q 168 62 140 60 Z"
                  fill={leafColor}
                  opacity="0.9"
                />
                {isNight && (
                  <circle cx="140" cy="48" r="5" fill="#a7f3d0" opacity="0.6" />
                )}

                {/* Headphones / Telemetry Ears */}
                <rect x="74" y="114" width="12" height="32" rx="6" fill={botCoreColor} />
                <rect x="194" y="114" width="12" height="32" rx="6" fill={botCoreColor} />

                {/* Main Rounded Helmet / Head */}
                <rect
                  x="84"
                  y="82"
                  width="112"
                  height="88"
                  rx="36"
                  fill="url(#botShell)"
                  stroke={botCoreColor}
                  strokeWidth="3"
                />

                {/* Visor Screen */}
                <rect
                  x="96"
                  y="96"
                  width="88"
                  height="56"
                  rx="22"
                  fill={botVisorBg}
                  stroke={botCoreColor}
                  strokeOpacity="0.6"
                  strokeWidth="1.5"
                />

                {/* Eyes & Mouth Expressions */}
                {isNight && mascotPosture === 'nominal' ? (
                  /* Sleeping Eyes + Zzz */
                  <g>
                    <path
                      d="M 112 122 Q 120 128 128 122"
                      stroke={eyeColor}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 152 122 Q 160 128 168 122"
                      stroke={eyeColor}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 134 136 Q 140 140 146 136"
                      stroke={eyeColor}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <text
                      x="184"
                      y="86"
                      fill="#a5b4fc"
                      fontSize="14"
                      fontWeight="bold"
                      className="animate-zzz-float"
                    >
                      Zzz
                    </text>
                  </g>
                ) : mascotPosture === 'shield' ? (
                  /* Alert Determined Eyes during SPE */
                  <g>
                    <path d="M 110 116 L 128 122 L 112 126 Z" fill={eyeColor} />
                    <path d="M 170 116 L 152 122 L 168 126 Z" fill={eyeColor} />
                    <line
                      x1="130"
                      y1="138"
                      x2="150"
                      y2="138"
                      stroke="#fda4af"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </g>
                ) : (
                  /* Warm Friendly Eyes (Day / Sunset / Weights / Veggie) */
                  <g>
                    <circle cx="120" cy="120" r="8" fill={eyeColor} />
                    <circle cx="160" cy="120" r="8" fill={eyeColor} />
                    <circle cx="123" cy="117" r="2.5" fill="#ffffff" />
                    <circle cx="163" cy="117" r="2.5" fill="#ffffff" />
                    {/* Warm cheeks */}
                    <ellipse cx="109" cy="131" rx="5" ry="2.8" fill={botCoreColor} opacity="0.4" />
                    <ellipse cx="171" cy="131" rx="5" ry="2.8" fill={botCoreColor} opacity="0.4" />
                    {/* Smile */}
                    <path
                      d="M 131 134 Q 140 143 149 134"
                      stroke={eyeColor}
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </g>
                )}

                {/* Torso / Medical Core */}
                <rect
                  x="104"
                  y="172"
                  width="72"
                  height="48"
                  rx="20"
                  fill="url(#botShell)"
                  stroke={botCoreColor}
                  strokeWidth="2.5"
                />
                {/* Glowing Medical Cross / Heart Core */}
                <circle cx="140" cy="196" r="12" fill={botVisorBg} />
                <path
                  d="M 140 189 V 203 M 133 196 H 147"
                  stroke={overallStatus === 'critical' ? '#fb7185' : '#34d399'}
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* CONTEXTUAL ARMS & PROPS */}
                {mascotPosture === 'weights' ? (
                  /* ARED Barbell / Weights lifted by Sprout-Bot */
                  <g>
                    {/* Arms gripping bar */}
                    <path
                      d="M 104 186 Q 76 184 74 164"
                      stroke={botCoreColor}
                      strokeWidth="7"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 176 186 Q 204 184 206 164"
                      stroke={botCoreColor}
                      strokeWidth="7"
                      strokeLinecap="round"
                      fill="none"
                    />
                    {/* Barbell bar */}
                    <line
                      x1="46"
                      y1="162"
                      x2="234"
                      y2="162"
                      stroke="#94a3b8"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    {/* Barbell plates */}
                    <rect x="44" y="146" width="12" height="32" rx="4" fill="#f59e0b" />
                    <rect x="58" y="150" width="8" height="24" rx="3" fill="#fbbf24" />
                    <rect x="224" y="146" width="12" height="32" rx="4" fill="#f59e0b" />
                    <rect x="214" y="150" width="8" height="24" rx="3" fill="#fbbf24" />
                  </g>
                ) : mascotPosture === 'veggie' ? (
                  /* Caring for Veggie Mizuna Plant Pillow under Horticultural LED */
                  <g>
                    {/* Arms holding Veggie pot */}
                    <path
                      d="M 104 188 Q 84 202 108 214"
                      stroke={botCoreColor}
                      strokeWidth="6"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 176 188 Q 196 202 172 214"
                      stroke={botCoreColor}
                      strokeWidth="6"
                      strokeLinecap="round"
                      fill="none"
                    />
                    {/* Veggie Plant Pillow Pot */}
                    <rect
                      x="182"
                      y="196"
                      width="48"
                      height="32"
                      rx="6"
                      fill="#1e293b"
                      stroke="#ec4899"
                      strokeWidth="2"
                    />
                    {/* LED pink/magenta grow glow */}
                    <line x1="188" y1="186" x2="224" y2="186" stroke="#f472b6" strokeWidth="3" strokeLinecap="round" />
                    {/* Mizuna Mustard Sprouts */}
                    <path d="M 198 196 Q 190 178 184 184 Q 186 194 198 196 Z" fill="#4ade80" />
                    <path d="M 206 196 Q 206 172 212 178 Q 214 190 206 196 Z" fill="#22c55e" />
                    <path d="M 214 196 Q 224 180 226 186 Q 222 195 214 196 Z" fill="#86efac" />
                  </g>
                ) : (
                  /* Standard friendly arms */
                  <g>
                    <path
                      d="M 104 186 Q 82 196 86 212"
                      stroke={botCoreColor}
                      strokeWidth="7"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 176 186 Q 198 196 194 212"
                      stroke={botCoreColor}
                      strokeWidth="7"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </g>
                )}
              </g>
            </svg>
          </div>

          {/* Earth Communication Delay Visual Clock */}
          <div
            className={`w-full max-w-sm mt-1 p-3 rounded-xl border circadian-transition ${theme.cardSubtleBg}`}
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Reloj de Retardo Tierra-Nave</span>
              </div>
              <span className="font-mono font-bold text-cyan-400">
                {delayMin.toFixed(1)} min (1-way)
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-500/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (delayMin / 20) * 100)}%` }}
              />
            </div>
            <div className={`mt-1.5 flex justify-between text-[11px] ${theme.textMuted}`}>
              <span>Ida y vuelta Houston: {roundTripMin.toFixed(1)} min</span>
              <span className="font-semibold text-emerald-500">Autonomía Local ON</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: First-Person Empathetic Clinical Dialogue */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-500">
                <MessageCircleHeart className="w-4 h-4" />
                <span>Sprout-Bot · Copiloto Médico Empático</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">
                {narrative.headline}
              </h2>
            </div>
          </div>

          {/* First-Person Speech Bubble */}
          <div
            className={`rounded-2xl border p-4 sm:p-5 space-y-3 circadian-transition ${theme.cardSubtleBg}`}
          >
            <p className="text-sm sm:text-base font-medium leading-relaxed">
              “{narrative.greeting}”
            </p>

            {/* Interactive Tab Switcher inside Sprout-Bot */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActivePromptTab('connection')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activePromptTab === 'connection' ? theme.pillActive : theme.pillInactive
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Cómo se conectan tus síntomas</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePromptTab('protocol')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activePromptTab === 'protocol' ? theme.pillActive : theme.pillInactive
                }`}
              >
                <Sprout className="w-3.5 h-3.5" />
                <span>Plan de acción inmediato</span>
              </button>
              <button
                type="button"
                onClick={() => setBreathActive((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  breathActive
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/50'
                    : `${theme.cardBg} hover:border-sky-400`
                }`}
              >
                <Wind className="w-3.5 h-3.5" />
                <span>{breathActive ? 'Detener respiración 4-4-6' : 'Respiración guiada'}</span>
              </button>
            </div>

            {activePromptTab === 'connection' ? (
              <div className={`text-xs sm:text-sm leading-relaxed pt-1 ${theme.textSecondary}`}>
                {narrative.clinicalConnection}
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <p className="text-xs sm:text-sm font-semibold text-sky-500">
                  {narrative.actionPrompt}
                </p>
                <ul className={`space-y-1.5 text-xs ${theme.textSecondary}`}>
                  {narrative.quickTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {breathActive && (
              <div className="mt-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-400/30 border-2 border-emerald-400 animate-ping" />
                  <div className="text-xs">
                    <div className="font-bold text-emerald-400">
                      Coherencia Cardíaca Orbital (4s Inhala · 4s Mantén · 6s Exhala)
                    </div>
                    <div className={theme.textMuted}>
                      Ayuda a reducir el tono simpático y compensar hipercapnia leve.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contextual Deep-Link Buttons to Specialty Views */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onJumpToView('dosimetry')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${theme.cardSubtleBg} hover:border-rose-400`}
            >
              Abrir Escáner CSA EVARM / Radi-N2 →
            </button>
            <button
              type="button"
              onClick={() => onJumpToView('veggie')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${theme.cardSubtleBg} hover:border-emerald-400`}
            >
              Ver Jardín Veggie &amp; Nutrición →
            </button>
            <button
              type="button"
              onClick={() => onJumpToView('devices')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${theme.cardSubtleBg} hover:border-sky-400`}
            >
              Sincronizar Smartwatch &amp; Visor EVA →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
