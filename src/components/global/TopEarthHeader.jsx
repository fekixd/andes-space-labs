import React, { useEffect, useState } from 'react';
import {
  Sun,
  Sunset,
  Moon,
  Clock,
  Radio,
  Send,
  ShieldCheck,
  Database,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';

export default function TopEarthHeader({
  selectedDay,
  dayData,
  circadianMode,
  onSelectMode,
  theme,
  onOpenTelemetryModal,
  hasAnyLiveOverride,
  overallMeta,
  mobileMenuOpen,
  onToggleMobileMenu,
}) {
  const [earthTime, setEarthTime] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setEarthTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const utcStr = earthTime.toISOString().slice(11, 19);
  const localStr = earthTime.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const modes = [
    { id: 'day', label: 'Día', range: '06:00-17:30', Icon: Sun },
    { id: 'sunset', label: 'Atardecer', range: '17:30-20:00', Icon: Sunset },
    { id: 'night', label: 'Noche', range: '20:00-06:00', Icon: Moon },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 border-b backdrop-blur-xl circadian-transition ${theme.headerBg}`}
    >
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 h-auto py-2.5 flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Mobile Menu + Brand + MISSION DAY Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className={`lg:hidden p-2 rounded-xl border ${theme.cardSubtleBg}`}
            aria-label="Alternar navegación de módulos"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 via-cyan-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-sky-500/25 shrink-0">
            A7
          </div>

          <div className="leading-tight">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm sm:text-base tracking-tight">
                AURA-7
              </span>
              <span className="px-2 py-0.5 rounded-md bg-sky-500/15 border border-sky-500/35 text-sky-500 font-mono text-[11px] font-bold">
                MISSION DAY {selectedDay} / 180
              </span>
              <span
                className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${overallMeta.badgeClass}`}
              >
                {overallMeta.label}
              </span>
            </div>
            <div className={`text-[11px] flex items-center gap-2 flex-wrap ${theme.textMuted}`}>
              <span className="font-semibold text-sky-500">Andes Space Labs</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline font-mono">
                {hasAnyLiveOverride ? (
                  <span className="inline-flex items-center gap-1 text-cyan-400 font-bold">
                    <Sparkles className="w-3 h-3" /> [Medición Demo en Vivo]
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <Database className="w-3 h-3" /> [Telemetría Histórica Auditada]
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right: Autonomy Status + Earth Clock + Circadian Selector + Houston Modal */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Autonomy & Earth Comm Delay Indicator */}
          <div
            className={`hidden xl:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border circadian-transition ${theme.cardSubtleBg}`}
          >
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
            <div className="leading-tight">
              <div className="text-[11px] font-mono font-bold">
                Earth Comm Delay: {dayData.earth_comm_delay_min.toFixed(1)} min (One-Way)
              </div>
              <div className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>LOCAL AUTONOMOUS MODE ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Earth Clock */}
          <div
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border circadian-transition ${theme.cardSubtleBg}`}
          >
            <Clock className={`w-4 h-4 ${theme.accentText}`} />
            <div className="leading-tight">
              <div className={`text-[10px] font-semibold uppercase ${theme.textMuted}`}>
                Reloj Terrestre
              </div>
              <div className="font-mono text-xs font-bold">
                {localStr} <span className="opacity-50">|</span> {utcStr} UTC
              </div>
            </div>
          </div>

          {/* Circadian Mode Selector */}
          <div
            className={`flex items-center p-1 rounded-xl border circadian-transition ${theme.cardSubtleBg}`}
            role="group"
            aria-label="Selector de Modo Circadiano Terrestre"
          >
            {modes.map(({ id, label, range, Icon }) => {
              const active = circadianMode === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectMode(id)}
                  title={`${label} (${range})`}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                    active ? theme.pillActive : theme.pillInactive
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                  <span className="hidden 2xl:inline text-[10px] font-mono opacity-80">
                    {range}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Open Asynchronous Earth Telemetry Packet Modal */}
          <button
            type="button"
            onClick={onOpenTelemetryModal}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shadow-sm transition ${theme.accentBg}`}
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Paquete Houston</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/20">
              +{dayData.earth_comm_delay_min.toFixed(1)}m
            </span>
          </button>
        </div>
      </div>

      {/* Compact Autonomy Strip on <xl screens */}
      <div
        className={`xl:hidden px-3 sm:px-6 py-1 border-t text-[11px] flex flex-wrap items-center justify-between gap-2 ${theme.divider}`}
      >
        <span className="font-mono">
          Earth Comm Delay: <strong>{dayData.earth_comm_delay_min.toFixed(1)} min (One-Way)</strong>
        </span>
        <span className="font-bold text-emerald-500 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          LOCAL AUTONOMOUS MODE ACTIVE
        </span>
      </div>
    </header>
  );
}
