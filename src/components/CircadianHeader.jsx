import React, { useEffect, useState } from 'react';
import {
  Sun,
  Sunset,
  Moon,
  Clock,
  Send,
  Sparkles,
  Watch,
  ShieldAlert,
  Sprout,
  LayoutDashboard,
} from 'lucide-react';
import { CIRCADIAN_MODES } from '../utils/circadianThemes';

export default function CircadianHeader({
  mode,
  onSelectMode,
  theme,
  activeView,
  onSelectView,
  onOpenTelemetryModal,
  dayData,
  overallStatus,
}) {
  const [earthTime, setEarthTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setEarthTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedUtc = earthTime.toISOString().slice(11, 19);
  const formattedLocal = earthTime.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const modeButtons = [
    { id: 'day', label: 'Día', hours: '06:00-17:30', Icon: Sun },
    { id: 'sunset', label: 'Atardecer', hours: '17:30-20:00', Icon: Sunset },
    { id: 'night', label: 'Noche', hours: '20:00-06:00', Icon: Moon },
  ];

  const navTabs = [
    { id: 'cockpit', label: 'Copiloto & Clínica', Icon: LayoutDashboard },
    { id: 'devices', label: 'Multi-Device Ecosystem', Icon: Watch },
    { id: 'dosimetry', label: 'Escáner CSA EVARM / Radi-N2', Icon: ShieldAlert },
    { id: 'veggie', label: 'Veggie Garden & Nutrición', Icon: Sprout },
  ];

  const statusBadge =
    overallStatus === 'critical'
      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
      : overallStatus === 'warning'
      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
      : 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40';

  const statusLabel =
    overallStatus === 'critical'
      ? 'ALERTA CRÍTICA'
      : overallStatus === 'warning'
      ? 'PRECAUCIÓN'
      : 'NOMINAL';

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-xl circadian-transition ${theme.headerBg}`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 space-y-3">
        {/* Top Row: Brand, Earth Clock, Circadian Selector, Telemetry Modal Button */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 via-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25 text-white font-extrabold tracking-tight">
              A7
              <span
                className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  overallStatus === 'critical'
                    ? 'bg-rose-500 animate-ping'
                    : overallStatus === 'warning'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight">
                  AURA-7{' '}
                  <span className={`font-medium text-sm ${theme.textSecondary}`}>
                    · Autonomous Circadian &amp; Health Copilot
                  </span>
                </h1>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusBadge}`}
                >
                  Día {dayData.mission_day} · {statusLabel}
                </span>
              </div>
              <p className={`text-xs ${theme.textMuted} flex items-center gap-2 flex-wrap`}>
                <span className="font-semibold text-sky-500">Andes Space Labs</span>
                <span>·</span>
                <span>NASA Space Apps Challenge 2026</span>
                <span className="hidden md:inline">·</span>
                <span className="hidden md:inline font-mono text-[11px]">
                  {theme.spectrumLabel} ({theme.kelvin})
                </span>
              </p>
            </div>
          </div>

          {/* Earth Clock & Circadian Mode Selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Earth Clock */}
            <div
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border circadian-transition ${theme.cardSubtleBg}`}
            >
              <Clock className={`w-4 h-4 ${theme.accentText}`} />
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70">
                    Reloj Tierra (Houston/UTC)
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-400">
                    16 órbitas/día mitigadas
                  </span>
                </div>
                <div className="font-mono text-xs sm:text-sm font-bold flex items-center gap-2">
                  <span>{formattedLocal} LOC</span>
                  <span className="opacity-40">|</span>
                  <span className="opacity-80">{formattedUtc} UTC</span>
                </div>
              </div>
            </div>

            {/* 3-Way Circadian Selector */}
            <div
              className={`flex items-center p-1 rounded-xl border circadian-transition ${theme.cardSubtleBg}`}
              role="group"
              aria-label="Selector Circadiano Terrestre"
            >
              {modeButtons.map(({ id, label, hours, Icon }) => {
                const active = mode === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSelectMode(id)}
                    title={`${label} (${hours}) — ${CIRCADIAN_MODES[id].spectrumLabel}`}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs transition-all duration-300 ${
                      active ? theme.pillActive : theme.pillInactive
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                    <span className="hidden xl:inline text-[10px] opacity-80 font-mono">
                      ({hours})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Asynchronous Earth Telemetry Packet Modal Button */}
            <button
              type="button"
              onClick={onOpenTelemetryModal}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${theme.accentBg}`}
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Paquete Houston</span>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-black/20">
                +{dayData.earth_comm_delay_min.toFixed(1)}m
              </span>
            </button>
          </div>
        </div>

        {/* Navigation Row + Spectral Indicator */}
        <div className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-dashed ${theme.divider}`}>
          <nav className="flex flex-wrap items-center gap-1.5" aria-label="Vistas del sistema">
            {navTabs.map(({ id, label, Icon }) => {
              const isActive = activeView === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectView(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? theme.pillActive
                      : `${theme.pillInactive} border border-transparent`
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          <div className={`flex items-center gap-2 text-[11px] ${theme.textMuted}`}>
            <Sparkles className={`w-3.5 h-3.5 ${theme.accentText}`} />
            <span>{theme.melatoninState}</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{theme.orbitNote}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
