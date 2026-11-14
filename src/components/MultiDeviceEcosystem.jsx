import React, { useState } from 'react';
import {
  Watch,
  Eye,
  Lightbulb,
  Bell,
  HeartPulse,
  Radio,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function MultiDeviceEcosystem({
  evaluation,
  circadianMode,
  theme,
}) {
  const [notifFeedback, setNotifFeedback] = useState(null);
  const [toastAlert, setToastAlert] = useState(null);

  const { dayData, effectivePvt, overallStatus, mascotPosture, narrative } = evaluation;
  const m = dayData.metrics;

  const statusColor =
    overallStatus === 'critical'
      ? '#f43f5e'
      : overallStatus === 'warning'
      ? '#f59e0b'
      : '#10b981';

  const triggerNativeNotification = async () => {
    const title = `AURA-7 · Día ${dayData.mission_day} (${
      overallStatus === 'critical'
        ? 'ALERTA CRÍTICA'
        : overallStatus === 'warning'
        ? 'PRECAUCIÓN'
        : 'NOMINAL'
    })`;
    const body = `${narrative.headline}. Pulso ${m.resting_heart_rate} bpm · CO₂ ${m.cabin_co2_mmhg.toFixed(
      2
    )} mmHg · PVT ${Math.round(effectivePvt)} ms.`;

    // Always show in-app mirrored notification so demo feedback is guaranteed
    setToastAlert({ title, body, time: new Date().toLocaleTimeString('es-ES') });

    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotifFeedback('Notificación mostrada en HUD (Notification API no disponible en este navegador).');
      return;
    }

    try {
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }
      if (permission === 'granted') {
        new Notification(title, {
          body,
          tag: 'aura7-copilot-alert',
        });
        setNotifFeedback('Notificación nativa del navegador enviada y sincronizada al reloj.');
      } else {
        setNotifFeedback('Permiso de notificaciones denegado en el navegador; aviso reflejado en HUD.');
      }
    } catch {
      setNotifFeedback('Aviso sincronizado en consola y dispositivos (entorno sin permiso nativo).');
    }
  };

  const melatoninMetric =
    circadianMode === 'day'
      ? { pct: 12, label: 'Supresión melatonina: 88% (Enfoque)' }
      : circadianMode === 'sunset'
      ? { pct: 58, label: 'Rampa melatonina: 58% (Transición)' }
      : { pct: 95, label: 'Protección melatonina: 95% (Sueño)' };

  return (
    <section className="space-y-5">
      {/* Header + Native Browser Notification Button */}
      <div
        className={`rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 circadian-transition ${theme.cardBg}`}
      >
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${theme.accentText}`} />
            <h2 className="text-lg font-extrabold tracking-tight">
              Ecosistema Multi-Dispositivo AURA-7 (Sincronización en Tiempo Real)
            </h2>
          </div>
          <p className={`text-xs mt-1 ${theme.textMuted}`}>
            Sprout-Bot y las alertas clínicas del Día {dayData.mission_day} se reflejan al instante en la muñeca, casco EVA e iluminación LED de cabina.
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
      </div>

      {notifFeedback && (
        <div
          className={`rounded-xl border px-4 py-2.5 text-xs flex items-center justify-between gap-2 ${theme.cardSubtleBg}`}
        >
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            {notifFeedback}
          </span>
        </div>
      )}

      {/* Mirrored Push Banner */}
      {toastAlert && (
        <div className="rounded-xl border border-sky-400/50 bg-slate-950/90 text-slate-100 p-4 shadow-xl flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-sky-300 flex items-center gap-2">
                <span>{toastAlert.title}</span>
                <span className="font-mono text-[10px] opacity-60">{toastAlert.time}</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{toastAlert.body}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setToastAlert(null)}
            className="text-xs text-slate-400 hover:text-white"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* 3 Hardware Mockups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. SMARTWATCH (COMPANION WATCH) */}
        <article className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 circadian-transition ${theme.cardBg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Watch className={`w-4 h-4 ${theme.accentText}`} />
              <h3 className="text-sm font-bold">Smartwatch (Companion Watch)</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              BLE Sync · Háptica ON
            </span>
          </div>

          {/* Watch Strap & Bezel Mockup */}
          <div className="flex flex-col items-center py-2">
            <div className="w-24 h-6 rounded-t-xl bg-slate-800 border-x border-t border-slate-700" />
            <div
              className="w-52 h-56 rounded-[2.2rem] bg-slate-950 border-4 border-slate-700 p-3.5 shadow-2xl relative flex flex-col justify-between text-slate-100"
              style={{ boxShadow: `0 0 28px ${statusColor}33` }}
            >
              {/* Side Crown */}
              <div className="absolute -right-2.5 top-16 w-2 h-8 rounded-r bg-slate-600" />
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>D{dayData.mission_day}</span>
                <span style={{ color: statusColor }} className="font-bold">
                  {overallStatus === 'critical' ? 'ALARMA' : overallStatus === 'warning' ? 'ALERTA' : 'OK'}
                </span>
              </div>

              {/* Mini Sprout-Bot Face on Watch */}
              <div className="flex flex-col items-center justify-center my-1">
                <div
                  className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center relative"
                  style={{ borderColor: statusColor, backgroundColor: '#0b1428' }}
                >
                  <svg viewBox="0 0 64 64" className="w-12 h-12">
                    <path d="M32 14 Q23 5 20 12 Q21 18 32 17 Z" fill="#22c55e" />
                    <path d="M32 14 Q41 5 44 12 Q43 18 32 17 Z" fill="#4ade80" />
                    <rect x="14" y="18" width="36" height="28" rx="11" fill="#e2e8f0" />
                    <rect x="18" y="23" width="28" height="18" rx="7" fill="#0f172a" />
                    {circadianMode === 'night' && mascotPosture === 'nominal' ? (
                      <>
                        <path d="M23 32 Q26 35 29 32" stroke="#818cf8" strokeWidth="2" fill="none" />
                        <path d="M35 32 Q38 35 41 32" stroke="#818cf8" strokeWidth="2" fill="none" />
                      </>
                    ) : (
                      <>
                        <circle cx="26" cy="31" r="2.5" fill={statusColor} />
                        <circle cx="38" cy="31" r="2.5" fill={statusColor} />
                      </>
                    )}
                  </svg>
                </div>
                <div className="text-[11px] font-bold mt-1.5 text-center leading-tight">
                  {mascotPosture === 'shield'
                    ? 'Refugio SPE'
                    : mascotPosture === 'weights'
                    ? 'Toca ARED Hoy'
                    : mascotPosture === 'veggie'
                    ? 'Purgar CO₂ / Descanso'
                    : 'Ritmo Estable'}
                </div>
              </div>

              {/* Watch Bottom Metrics */}
              <div className="grid grid-cols-2 gap-1.5 text-center text-[10px] font-mono bg-slate-900/90 rounded-xl p-1.5 border border-slate-800">
                <div>
                  <span className="text-rose-400 flex items-center justify-center gap-1">
                    <HeartPulse className="w-3 h-3" /> {m.resting_heart_rate}
                  </span>
                  <span className="text-[9px] text-slate-400">BPM</span>
                </div>
                <div>
                  <span className="text-sky-400">{Math.round(effectivePvt)} ms</span>
                  <div className="text-[9px] text-slate-400">PVT</div>
                </div>
              </div>
            </div>
            <div className="w-24 h-6 rounded-b-xl bg-slate-800 border-x border-b border-slate-700" />
          </div>

          <p className={`text-xs ${theme.textMuted}`}>
            Pulso háptico automático cuando el PVT supera 285 ms o hay aviso de radiación SPE.
          </p>
        </article>

        {/* 2. EVA HELMET VISOR HUD */}
        <article className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 circadian-transition ${theme.cardBg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className={`w-4 h-4 ${theme.accentText}`} />
              <h3 className="text-sm font-bold">HUD de Visor de Casco EVA</h3>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                dayData.solar_particle_event
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 font-bold'
                  : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
              }`}
            >
              {dayData.solar_particle_event ? 'EVA ABORTADA (SPE)' : 'EVA LISTO'}
            </span>
          </div>

          {/* Helmet Visor Curved Frame */}
          <div className="relative rounded-[2rem] border-4 border-slate-700 bg-gradient-to-b from-[#040916] via-[#08142b] to-[#020611] p-4 min-h-[260px] text-cyan-200 overflow-hidden flex flex-col justify-between shadow-inner">
            {/* Subtle starfield & curvature reflection */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(56,189,248,0.16),transparent_55%)]" />
            <div className="pointer-events-none absolute top-3 left-6 right-6 h-10 rounded-full border-t border-white/15" />

            {/* Top HUD Arc */}
            <div className="relative z-10 flex items-center justify-between text-[10px] font-mono border-b border-cyan-500/25 pb-2">
              <span className="flex items-center gap-1 text-cyan-300">
                <Radio className="w-3 h-3" /> DELAY +{dayData.earth_comm_delay_min.toFixed(1)}m
              </span>
              <span>SUIT O₂: 29.6 kPa</span>
              <span className={m.cabin_co2_mmhg > 3.5 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                CO₂: {m.cabin_co2_mmhg.toFixed(2)}
              </span>
            </div>

            {/* Center Visor Reticle & Alert */}
            <div className="relative z-10 my-3 flex flex-col items-center justify-center text-center">
              {dayData.solar_particle_event ? (
                <div className="px-3 py-2 rounded-xl bg-rose-600/30 border border-rose-400 text-rose-200 animate-pulse space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-black">
                    <ShieldAlert className="w-4 h-4" />
                    <span>REGRESAR A ESCLUSA</span>
                  </div>
                  <div className="text-[10px] font-mono">
                    EVARM 25x Médula · Radi-N2: {m.daily_neutron_msv.toFixed(2)} mSv/d
                  </div>
                </div>
              ) : (
                <div className="w-28 h-20 rounded-xl border border-dashed border-cyan-400/40 flex flex-col items-center justify-center bg-cyan-500/5">
                  <span className="text-[10px] font-mono text-cyan-400">AURA-7 HUD</span>
                  <span className="text-xs font-bold text-white mt-0.5">
                    {effectivePvt > 345 ? 'NO APTO EVA' : 'CORREDOR LIBRE'}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300">
                    EVARM: {m.cumulative_radiation_msv.toFixed(1)} mSv
                  </span>
                </div>
              )}
            </div>

            {/* Bottom HUD Bar */}
            <div className="relative z-10 flex items-center justify-between text-[10px] font-mono border-t border-cyan-500/25 pt-2">
              <span>HR: {m.resting_heart_rate} bpm</span>
              <span>PVT: {Math.round(effectivePvt)} ms</span>
              <span>MODO: {circadianMode.toUpperCase()}</span>
            </div>
          </div>

          <p className={`text-xs ${theme.textMuted}`}>
            Proyección óptica de bajo contraste sobre el visor presurizado para decisiones autónomas sin esperar a Houston.
          </p>
        </article>

        {/* 3. CABIN CIRCADIAN LED LIGHTING SYSTEM (SSLA) */}
        <article className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 circadian-transition ${theme.cardBg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className={`w-4 h-4 ${theme.accentText}`} />
              <h3 className="text-sm font-bold">Luces LED Circadianas de Cabina</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-sky-400/40 text-sky-400">
              {theme.kelvin}
            </span>
          </div>

          {/* Cabin LED Fixture Visualization */}
          <div className={`rounded-2xl border p-4 space-y-4 ${theme.cardSubtleBg}`}>
            {/* Glowing LED Array Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-mono">
                <span>Panel SSLA Cabina Crew-1</span>
                <span className="font-bold">{theme.spectrumLabel}</span>
              </div>
              <div
                className={`h-14 rounded-xl bg-gradient-to-r ${theme.ledSwatch} border border-white/30 flex items-center justify-center transition-all duration-700`}
                style={{ boxShadow: theme.ledGlowShadow }}
              >
                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                    circadianMode === 'day'
                      ? 'bg-slate-900/80 text-white'
                      : 'bg-black/50 text-white'
                  }`}
                >
                  {circadianMode === 'day'
                    ? '480 nm · Día Activo'
                    : circadianMode === 'sunset'
                    ? '590 nm · Atardecer Cálido'
                    : '<450 nm · Noche Orbital'}
                </span>
              </div>
            </div>

            {/* Melatonin / Alertness Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>Respuesta Neuroendocrina</span>
                <span className="font-mono">{melatoninMetric.pct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-500/20 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    circadianMode === 'day'
                      ? 'bg-sky-400'
                      : circadianMode === 'sunset'
                      ? 'bg-amber-400'
                      : 'bg-indigo-400'
                  }`}
                  style={{ width: `${melatoninMetric.pct}%` }}
                />
              </div>
              <p className={`text-[11px] ${theme.textMuted}`}>{melatoninMetric.label}</p>
            </div>

            {/* 16 sunrises mitigation pill */}
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/25 text-[11px]">
              <strong>HRP-RISK-014:</strong> Anula el desfase causado por los 16 amaneceres y atardeceres cada 24 horas en órbita.
            </div>
          </div>

          <p className={`text-xs ${theme.textMuted}`}>
            Cambia el selector superior (`Día / Atardecer / Noche`) para observar la transición espectral en toda la cabina.
          </p>
        </article>
      </div>
    </section>
  );
}
