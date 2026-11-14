import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Radio,
  Dumbbell,
  ShieldAlert,
  Calendar,
} from 'lucide-react';
import { DEMO_MILESTONES } from '../utils/clinicalEngine';

export default function MissionSimulator({
  telemetry,
  selectedDay,
  onSelectDay,
  isPlaying,
  onTogglePlay,
  theme,
}) {
  const current = telemetry.find((d) => d.mission_day === selectedDay) || telemetry[0];

  // Build mini SVG sparkline path for cumulative radiation & CO2 across 180 days
  const width = 320;
  const height = 42;
  const radPoints = telemetry
    .map((d, idx) => {
      const x = (idx / (telemetry.length - 1)) * width;
      const y = height - (d.metrics.cumulative_radiation_msv / 260) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const cursorX = ((selectedDay - 1) / (telemetry.length - 1)) * width;

  const toneStyles = {
    emerald: {
      active: 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/25',
      idle: 'border-emerald-500/35 hover:border-emerald-400 hover:bg-emerald-500/10',
      dot: 'bg-emerald-400',
    },
    amber: {
      active: 'bg-amber-500 text-stone-950 border-amber-400 shadow-lg shadow-amber-500/25',
      idle: 'border-amber-500/35 hover:border-amber-400 hover:bg-amber-500/10',
      dot: 'bg-amber-400',
    },
    rose: {
      active: 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-500/25',
      idle: 'border-rose-500/40 hover:border-rose-400 hover:bg-rose-500/10',
      dot: 'bg-rose-500',
    },
    orange: {
      active: 'bg-orange-500 text-stone-950 border-orange-400 shadow-lg shadow-orange-500/25',
      idle: 'border-orange-500/35 hover:border-orange-400 hover:bg-orange-500/10',
      dot: 'bg-orange-400',
    },
  };

  return (
    <section
      className={`rounded-2xl border p-4 sm:p-5 circadian-transition ${theme.cardBg}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title + Current Day Flags */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className={`w-4 h-4 ${theme.accentText}`} />
            <h2 className="text-sm sm:text-base font-bold tracking-tight">
              Simulador de Misión de 180 Días · Tránsito Lunar-Marte
            </h2>
            <span className={`text-xs font-mono px-2 py-0.5 rounded-md border ${theme.accentSoft}`}>
              Día {selectedDay} / 180
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${
                current.ared_workout_completed
                  ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/35 font-semibold'
              }`}
            >
              <Dumbbell className="w-3 h-3" />
              {current.ared_workout_completed ? 'ARED Completado' : 'Sin Ejercicio ARED'}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${
                current.solar_particle_event
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/45 font-bold animate-pulse'
                  : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
              }`}
            >
              <ShieldAlert className="w-3 h-3" />
              {current.solar_particle_event ? 'TORMENTA SOLAR SPE ACTIVA' : 'Clima Solar Estable'}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${theme.cardSubtleBg}`}
            >
              <Radio className="w-3 h-3 text-cyan-400" />
              Retardo Tierra: <strong className="font-mono">{current.earth_comm_delay_min.toFixed(1)} min</strong>
            </span>
          </div>
        </div>

        {/* Playback + Mini 180d Radiation Curve */}
        <div className="flex items-center gap-3">
          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border ${theme.cardSubtleBg}`}
            title="Curva acumulada de radiación 180d + Ventanas de eventos"
          >
            <svg width={170} height={36} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
              {/* Event Highlight Bands: No ARED (85-115), SPE (110-114), CO2/Sleep (135-155) */}
              <rect
                x={(84 / 179) * width}
                y={0}
                width={(31 / 179) * width}
                height={height}
                fill="rgba(245, 158, 11, 0.14)"
                rx="2"
              />
              <rect
                x={(109 / 179) * width}
                y={0}
                width={(5 / 179) * width}
                height={height}
                fill="rgba(244, 63, 94, 0.35)"
                rx="2"
              />
              <rect
                x={(134 / 179) * width}
                y={0}
                width={(21 / 179) * width}
                height={height}
                fill="rgba(249, 115, 22, 0.18)"
                rx="2"
              />
              <polyline
                fill="none"
                stroke={theme.chartStroke}
                strokeWidth="2.5"
                points={radPoints}
              />
              <line
                x1={cursorX}
                y1={0}
                x2={cursorX}
                y2={height}
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="3 2"
              />
              <circle cx={cursorX} cy={height - (current.metrics.cumulative_radiation_msv / 260) * (height - 6) - 3} r="4.5" fill="#38bdf8" />
            </svg>
            <div className="text-[10px] leading-tight">
              <div className="font-semibold opacity-80">Perfil 180d</div>
              <div className="font-mono text-sky-400">
                {current.metrics.cumulative_radiation_msv.toFixed(1)} mSv
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onSelectDay(Math.max(1, selectedDay - 1))}
              className={`p-2 rounded-xl border transition ${theme.cardSubtleBg} hover:border-sky-400`}
              title="Día anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onTogglePlay}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${theme.accentBg}`}
              title="Reproducir secuencia de misión"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pausar' : 'Auto'}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectDay(Math.min(180, selectedDay + 1))}
              className={`p-2 rounded-xl border transition ${theme.cardSubtleBg} hover:border-sky-400`}
              title="Día siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Timeline Slider (Day 1 to 180) */}
      <div className="mt-4 space-y-2">
        <div className="relative pt-1">
          {/* Colored mission event track */}
          <div
            className={`w-full h-2.5 rounded-full overflow-hidden flex ${
              theme.isDark ? 'bg-slate-800/90' : 'bg-sky-200/80'
            }`}
          >
            <div style={{ width: `${(84 / 180) * 100}%` }} className="bg-emerald-500/40" />
            <div
              style={{ width: `${(25 / 180) * 100}%` }}
              className="bg-amber-500/65"
              title="Días 85–109: Sin ejercicio ARED"
            />
            <div
              style={{ width: `${(5 / 180) * 100}%` }}
              className="bg-rose-500/90"
              title="Días 110–114: Tormenta Solar SPE"
            />
            <div
              style={{ width: `${(20 / 180) * 100}%` }}
              className="bg-emerald-500/40"
            />
            <div
              style={{ width: `${(21 / 180) * 100}%` }}
              className="bg-orange-500/75"
              title="Días 135–155: Pico CO2 + Déficit de Sueño"
            />
            <div style={{ width: `${(25 / 180) * 100}%` }} className="bg-emerald-500/40" />
          </div>

          <input
            type="range"
            min={1}
            max={180}
            value={selectedDay}
            onChange={(e) => onSelectDay(Number(e.target.value))}
            aria-label="Selector de día de misión (1 a 180)"
            className="mission-slider w-full absolute inset-0 top-1"
          />
        </div>

        <div className={`flex justify-between text-[10px] font-mono ${theme.textMuted}`}>
          <span>Día 1 (Órbita Terrestre)</span>
          <span className="hidden sm:inline">D85–115: Sin ARED</span>
          <span className="text-rose-400 font-semibold">D110–114: SPE</span>
          <span className="hidden sm:inline text-orange-400">D135–155: CO₂ + Fatiga</span>
          <span>Día 180 (Espacio Profundo)</span>
        </div>
      </div>

      {/* 4 Demo Quick-Jump Buttons */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
        {DEMO_MILESTONES.map((m) => {
          const isSelected = selectedDay === m.day;
          const style = toneStyles[m.tone];
          return (
            <button
              key={m.day}
              type="button"
              onClick={() => onSelectDay(m.day)}
              className={`text-left px-3.5 py-2.5 rounded-xl border transition-all duration-200 ${
                isSelected ? style.active : `${theme.cardSubtleBg} ${style.idle}`
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold leading-snug">{m.label}</span>
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isSelected ? 'bg-white' : style.dot
                  }`}
                />
              </div>
              <p
                className={`text-[11px] mt-1 leading-tight ${
                  isSelected ? 'opacity-90' : theme.textMuted
                }`}
              >
                {m.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
