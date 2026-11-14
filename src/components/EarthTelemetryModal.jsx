import React, { useEffect, useState } from 'react';
import {
  X,
  Send,
  Radio,
  CheckCircle2,
  Satellite,
  FileCode2,
  ShieldAlert,
} from 'lucide-react';

export default function EarthTelemetryModal({
  isOpen,
  onClose,
  evaluation,
  circadianMode,
  theme,
}) {
  const [txState, setTxState] = useState('ready'); // 'ready' | 'transmitting' | 'delivered'
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setTxState('ready');
      setProgress(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (txState !== 'transmitting') return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTxState('delivered');
          return 100;
        }
        return p + 4;
      });
    }, 110);
    return () => clearInterval(interval);
  }, [txState]);

  if (!isOpen) return null;

  const { dayData, effectivePvt, isLivePvtOverride, activeHazards, overallStatus, recommendedRecords } =
    evaluation;
  const delayMin = dayData.earth_comm_delay_min;

  const compressedPacket = {
    packet_id: `AURA7-PKT-D${String(dayData.mission_day).padStart(3, '0')}`,
    team: 'Andes Space Labs',
    timestamp_utc: new Date().toISOString(),
    mission_day: dayData.mission_day,
    one_way_light_delay_min: delayMin,
    circadian_phase_earth: circadianMode,
    overall_triage: overallStatus.toUpperCase(),
    flags: {
      ared_workout_completed: dayData.ared_workout_completed,
      solar_particle_event: dayData.solar_particle_event,
      live_pvt_override: isLivePvtOverride,
    },
    telemetry_metrics: {
      ...dayData.metrics,
      pvt_reaction_ms: Math.round(effectivePvt),
    },
    active_hazards: activeHazards,
    autonomous_protocols_invoked: recommendedRecords.slice(0, 4).map((r) => r.id),
  };

  const payloadJson = JSON.stringify(compressedPacket, null, 2);
  const payloadBytes = new Blob([payloadJson]).size;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Asynchronous Earth Telemetry Packet"
    >
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden circadian-transition ${
          theme.isDark ? 'bg-[#0b1328] text-slate-100 border-sky-500/35' : 'bg-white text-slate-900 border-sky-300'
        }`}
      >
        {/* Modal Header */}
        <div className={`px-5 py-4 border-b ${theme.divider} flex items-center justify-between gap-3`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-400/35 flex items-center justify-center text-sky-400">
              <Satellite className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                Asynchronous Earth Telemetry Packet (Houston MCC)
              </h2>
              <p className={`text-xs ${theme.textMuted}`}>
                Paquete CCSDS comprimido · Enlace diferido Deep Space Network ({delayMin.toFixed(1)} min)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-500/15 transition"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Delayed Space-to-Earth Link Animation */}
          <div className={`rounded-xl border p-4 space-y-3 ${theme.cardSubtleBg}`}>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-cyan-400" />
                Tránsito de Señal Espacio-Tierra
              </span>
              <span className="font-mono text-cyan-400">
                Latencia física: {delayMin.toFixed(1)} min ({(delayMin * 60).toFixed(0)} s)
              </span>
            </div>

            {/* Animated Signal Track */}
            <div className="relative h-14 rounded-xl bg-slate-950 border border-slate-800 px-4 flex items-center justify-between overflow-hidden text-white">
              {/* Left node: Spacecraft */}
              <div className="z-10 flex flex-col items-center">
                <span className="text-[10px] font-mono text-sky-300 font-bold">AURA-7</span>
                <span className="text-[9px] text-slate-400">Día {dayData.mission_day}</span>
              </div>

              {/* Dotted radio link */}
              <div className="flex-1 mx-4 relative h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 transition-all duration-150"
                  style={{ width: `${txState === 'delivered' ? 100 : progress}%` }}
                />
              </div>

              {/* Moving Packet Dot when transmitting */}
              {txState === 'transmitting' && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-cyan-400 shadow-[0_0_18px_#22d3ee] flex items-center justify-center transition-all duration-100"
                  style={{ left: `calc(${12 + progress * 0.72}%)` }}
                >
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}

              {/* Right node: Houston MCC */}
              <div className="z-10 flex flex-col items-center text-right">
                <span className="text-[10px] font-mono text-emerald-300 font-bold">HOUSTON MCC</span>
                <span className="text-[9px] text-slate-400">Flight Surgeon</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              {txState === 'ready' && (
                <span className={theme.textMuted}>
                  Listo para encolar ({payloadBytes} bytes comprimidos). Mientras viaja, AURA-7 protege al tripulante de forma autónoma.
                </span>
              )}
              {txState === 'transmitting' && (
                <span className="font-semibold text-cyan-400">
                  Transmitiendo paquete asíncrono hacia DSN… simulando +{delayMin.toFixed(1)} min de vuelo lumínico ({progress}%)
                </span>
              )}
              {txState === 'delivered' && (
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Paquete recibido en Houston MCC tras {delayMin.toFixed(1)} min-luz (ACK pendiente +{(delayMin * 2).toFixed(1)} min total).
                </span>
              )}
            </div>
          </div>

          {/* Summary Pills */}
          <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
            <div className={`p-2.5 rounded-xl border ${theme.cardSubtleBg}`}>
              <div className={`text-[10px] ${theme.textMuted}`}>Estado Clínico</div>
              <div
                className={`font-bold mt-0.5 uppercase ${
                  overallStatus === 'critical'
                    ? 'text-rose-400'
                    : overallStatus === 'warning'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {overallStatus}
              </div>
            </div>
            <div className={`p-2.5 rounded-xl border ${theme.cardSubtleBg}`}>
              <div className={`text-[10px] ${theme.textMuted}`}>Tamaño Paquete</div>
              <div className="font-mono font-bold mt-0.5">{payloadBytes} B</div>
            </div>
            <div className={`p-2.5 rounded-xl border ${theme.cardSubtleBg}`}>
              <div className={`text-[10px] ${theme.textMuted}`}>Códigos Adjuntos</div>
              <div className="font-mono font-bold mt-0.5 text-sky-400">
                {compressedPacket.autonomous_protocols_invoked.length} HRP/CSA
              </div>
            </div>
          </div>

          {overallStatus === 'critical' && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs flex items-center gap-2 text-rose-300">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>
                Debido al retraso de {delayMin.toFixed(1)} min, Sprout-Bot ya ejecutó los protocolos autónomos locales antes de recibir confirmación terrestre.
              </span>
            </div>
          )}

          {/* Compressed JSON Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <FileCode2 className="w-4 h-4 text-sky-400" />
                Payload Comprimido (`CCSDS-JSON`)
              </span>
              <span className="font-mono text-[10px] opacity-70">{compressedPacket.packet_id}</span>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-950 text-cyan-200 border border-slate-800 text-[11px] font-mono overflow-x-auto max-h-52 leading-relaxed">
              {payloadJson}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`px-5 py-3.5 border-t ${theme.divider} flex flex-wrap items-center justify-end gap-2.5`}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-500/30 hover:bg-slate-500/10 transition"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => setTxState('transmitting')}
            disabled={txState === 'transmitting'}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition disabled:opacity-60 ${theme.accentBg}`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {txState === 'transmitting'
                ? 'Transmitiendo a Houston…'
                : txState === 'delivered'
                ? 'Reenviar Paquete Asíncrono'
                : 'Transmitir a Houston (Diferido)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
