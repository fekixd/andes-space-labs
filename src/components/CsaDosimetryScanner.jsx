import React, { useState } from 'react';
import { ShieldAlert, Radiation, ExternalLink, Activity, AlertOctagon } from 'lucide-react';

const EVARM_ORGANS = [
  {
    id: 'eyes',
    name: 'Cristalino / Ojos',
    multiplier: '13x',
    risk: 'Riesgo de cataratas inducidas por radiación ionizante y neutrones.',
    cx: 120,
    cy: 42,
    r: 10,
    badgePos: 'top-6 right-2',
  },
  {
    id: 'skin',
    name: 'Piel / Dermis',
    multiplier: '6x',
    risk: 'Exposición superficial 6 veces superior a trabajadores nucleares terrestres.',
    cx: 84,
    cy: 126,
    r: 12,
    badgePos: 'top-28 left-2',
  },
  {
    id: 'marrow',
    name: 'Médula Ósea (BFO)',
    multiplier: '25x',
    risk: 'Depleción hematopoyética de células sanguíneas y mayor vulnerabilidad inmunológica.',
    cx: 120,
    cy: 142,
    r: 15,
    badgePos: 'bottom-16 right-2',
  },
];

export default function CsaDosimetryScanner({ evaluation, theme }) {
  const [selectedOrgan, setSelectedOrgan] = useState('marrow');

  const { dayData, isSpeWindow } = evaluation;
  const m = dayData.metrics;

  // True during days 110-114 or active solar_particle_event
  const speRedAlert = isSpeWindow || dayData.solar_particle_event;

  // Estimate daily total vs neutron contribution
  // Nominal days ~0.85 mSv/day total (~0.25 mSv neutron = ~29.4%); SPE days ~20 mSv/day (~6 mSv neutron = ~30%)
  const estimatedDailyTotal = speRedAlert
    ? Math.max(m.daily_neutron_msv / 0.3, 18.0)
    : Math.max(m.daily_neutron_msv / 0.3, 0.78);
  const neutronSharePct = Math.min(45, Math.round((m.daily_neutron_msv / estimatedDailyTotal) * 100));

  const activeOrgan = EVARM_ORGANS.find((o) => o.id === selectedOrgan) || EVARM_ORGANS[2];

  return (
    <section
      className={`rounded-2xl border p-5 sm:p-6 circadian-transition ${
        speRedAlert
          ? 'bg-gradient-to-br from-rose-950/90 via-[#2a0912] to-[#1a050b] border-rose-500/70 text-rose-50 shadow-xl shadow-rose-950/50'
          : theme.cardBg
      }`}
    >
      {/* Top Alert Banner during Days 110-114 */}
      {speRedAlert && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-500/20 border border-rose-400/70 flex flex-wrap items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-5 h-5 text-rose-300 shrink-0" />
            <div className="text-xs sm:text-sm font-bold text-rose-100">
              ALERTA ROJA EVARM &amp; RADI-N2 (Días 110–114): Tormenta Solar SPE en curso · Flujo neutrónico crítico ({m.daily_neutron_msv.toFixed(2)} mSv/día)
            </div>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-rose-600 text-white font-bold">
            ESCUDO OBLIGATORIO
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* LEFT: Anatomical SVG Body Dosimetry Scanner */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-3">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight flex items-center gap-2">
                <ShieldAlert className={`w-5 h-5 ${speRedAlert ? 'text-rose-400' : theme.accentText}`} />
                <span>Escáner Dosimetría CSA (EVARM)</span>
              </h2>
              <p className={`text-xs ${speRedAlert ? 'text-rose-200/80' : theme.textMuted}`}>
                Toca cada órgano para inspeccionar el factor de dosis frente a límite terrestre
              </p>
            </div>
          </div>

          <div
            className={`relative w-full max-w-[320px] h-[340px] rounded-2xl border overflow-hidden flex items-center justify-center ${
              speRedAlert
                ? 'bg-rose-950/60 border-rose-500/60'
                : theme.isDark
                ? 'bg-slate-950/80 border-sky-500/25'
                : 'bg-slate-900 border-sky-400/40 text-slate-100'
            }`}
          >
            {/* Animated Laser Scan Line */}
            <div
              className={`pointer-events-none absolute left-4 right-4 h-0.5 top-6 animate-scan-line ${
                speRedAlert
                  ? 'bg-rose-400 shadow-[0_0_16px_#fb7185]'
                  : 'bg-cyan-400 shadow-[0_0_14px_#38bdf8]'
              }`}
            />

            <svg viewBox="0 0 240 310" className="w-60 h-72 relative z-10">
              {/* Anatomical Silhouette */}
              <g
                fill={speRedAlert ? 'rgba(244,63,94,0.16)' : 'rgba(56,189,248,0.12)'}
                stroke={speRedAlert ? '#fb7185' : '#38bdf8'}
                strokeWidth="2"
              >
                {/* Head */}
                <circle cx="120" cy="44" r="24" />
                {/* Neck */}
                <rect x="111" y="68" width="18" height="14" rx="4" />
                {/* Torso */}
                <path d="M 80 84 Q 120 76 160 84 L 154 176 Q 120 184 86 176 Z" />
                {/* Left & Right Arms */}
                <path d="M 80 86 L 54 150 L 66 156 L 86 106 Z" />
                <path d="M 160 86 L 186 150 L 174 156 L 154 106 Z" />
                {/* Legs */}
                <path d="M 88 176 L 84 282 L 106 282 L 114 184 Z" />
                <path d="M 152 176 L 156 282 L 134 282 L 126 184 Z" />
              </g>

              {/* Spine / Bone Marrow Axis */}
              <line
                x1="120"
                y1="88"
                x2="120"
                y2="172"
                stroke={speRedAlert ? '#fda4af' : '#fbbf24'}
                strokeWidth="4"
                strokeDasharray="4 3"
              />

              {/* Interactive Organ Hotspots */}
              {EVARM_ORGANS.map((organ) => {
                const isSelected = selectedOrgan === organ.id;
                const hotColor = speRedAlert ? '#f43f5e' : isSelected ? '#f59e0b' : '#38bdf8';
                return (
                  <g
                    key={organ.id}
                    onClick={() => setSelectedOrgan(organ.id)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={organ.cx}
                      cy={organ.cy}
                      r={organ.r + 7}
                      fill={hotColor}
                      opacity="0.22"
                      className={speRedAlert || isSelected ? 'animate-ping' : ''}
                    />
                    <circle
                      cx={organ.cx}
                      cy={organ.cy}
                      r={organ.r}
                      fill={hotColor}
                      fillOpacity="0.45"
                      stroke="#ffffff"
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                    />
                    <text
                      x={organ.cx}
                      y={organ.cy + 3.5}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {organ.multiplier}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Corner HUD Labels */}
            <div className="absolute top-3 left-3 text-[10px] font-mono text-cyan-300">
              CSA-EVARM MOSFET
            </div>
            <div className="absolute bottom-3 right-3 text-[10px] font-mono text-rose-300">
              DÍA {dayData.mission_day} · {m.cumulative_radiation_msv.toFixed(2)} mSv
            </div>
          </div>
        </div>

        {/* RIGHT: Organ Cards + Radi-N2 Neutron Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          {/* 3 Sensitive Organs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {EVARM_ORGANS.map((organ) => {
              const active = selectedOrgan === organ.id;
              return (
                <button
                  key={organ.id}
                  type="button"
                  onClick={() => setSelectedOrgan(organ.id)}
                  className={`text-left rounded-xl border p-3.5 transition ${
                    speRedAlert
                      ? active
                        ? 'bg-rose-500/30 border-rose-300'
                        : 'bg-rose-950/50 border-rose-500/40 hover:border-rose-400'
                      : active
                      ? 'bg-sky-500/15 border-sky-400'
                      : `${theme.cardSubtleBg} hover:border-sky-400/60`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{organ.name}</span>
                    <span
                      className={`font-mono text-sm font-black px-2 py-0.5 rounded ${
                        speRedAlert
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {organ.multiplier}
                    </span>
                  </div>
                  <p className={`text-[11px] mt-1.5 leading-snug ${speRedAlert ? 'text-rose-100/80' : theme.textMuted}`}>
                    {organ.risk}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active Organ Detail */}
          <div
            className={`rounded-xl border p-4 space-y-2 ${
              speRedAlert ? 'bg-rose-950/60 border-rose-500/50' : theme.cardSubtleBg
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold">
                  Órgano focal: {activeOrgan.name} ({activeOrgan.multiplier} exposición ocupacional)
                </span>
              </div>
              <a
                href="https://www.asc-csa.gc.ca/eng/iss/evarm.asp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:underline"
              >
                <span>CSA-RAD-009 (EVARM)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className={`text-xs ${speRedAlert ? 'text-rose-100/85' : theme.textSecondary}`}>
              {activeOrgan.risk} El blindaje del traje espacial y la densidad de la cabina determinan cuánta radiación secundaria alcanza los tejidos profundos.
            </p>
          </div>

          {/* Radi-N2 Neutron Dosimetry Breakdown */}
          <div
            className={`rounded-xl border p-4 space-y-3 ${
              speRedAlert ? 'bg-rose-950/60 border-rose-500/50' : theme.cardSubtleBg
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Radiation className={`w-4 h-4 ${speRedAlert ? 'text-rose-400 animate-spin' : 'text-amber-400'}`} />
                <h3 className="text-sm font-bold">
                  Monitor de Burbujas CSA `Radi-N2` (Desglose de Neutrones)
                </h3>
              </div>
              <a
                href="https://www.asc-csa.gc.ca/eng/sciences/radi-n2.asp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:underline"
              >
                <span>CSA-RAD-010 (Radi-N2)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-black/20 border border-slate-500/20">
                <div className="text-[11px] opacity-75">Neutrones Hoy (`daily_neutron_msv`)</div>
                <div
                  className={`text-xl font-black font-mono mt-0.5 ${
                    speRedAlert ? 'text-rose-300' : 'text-amber-400'
                  }`}
                >
                  {m.daily_neutron_msv.toFixed(2)} mSv
                </div>
              </div>
              <div className="p-3 rounded-lg bg-black/20 border border-slate-500/20">
                <div className="text-[11px] opacity-75">Fracción de Dosis Diaria</div>
                <div className="text-xl font-black font-mono mt-0.5 text-sky-400">
                  ~{neutronSharePct}%
                </div>
              </div>
              <div className="p-3 rounded-lg bg-black/20 border border-slate-500/20">
                <div className="text-[11px] opacity-75">Dosis Acumulada Misión</div>
                <div className="text-xl font-black font-mono mt-0.5">
                  {m.cumulative_radiation_msv.toFixed(2)} mSv
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span>Contribución Neutrónica (~30% estándar ISS / picos en SPE)</span>
                <span>{m.daily_neutron_msv.toFixed(2)} / 6.50 mSv max</span>
              </div>
              <div className="h-2.5 rounded-full bg-black/30 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    speRedAlert ? 'bg-rose-500' : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, (m.daily_neutron_msv / 6.5) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
