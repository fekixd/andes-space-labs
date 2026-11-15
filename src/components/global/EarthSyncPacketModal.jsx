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

const TX_STEPS = [
  'Empaquetando telemetría auditada y alertas del día…',
  'Comprimiendo paquete CCSDS y adjuntando citas NASA/CSA…',
  'Enlace ascendente Deep Space Network (DSN) en tránsito lumínico…',
  'Entregado a Flight Surgeons en Houston Mission Control Center.',
];

export default function EarthSyncPacketModal({
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
    }, 105);
    return () => clearInterval(interval);
  }, [txState]);

  if (!isOpen) return null;

  const { dayData, metrics, overallStatus, activeAlerts, hasAnyLiveOverride } = evaluation;
  const delayMin = dayData.earth_comm_delay_min;
  const citationIds = Array.from(
    new Set(activeAlerts.flatMap((a) => a.citations.map((c) => c.id)))
  );

  const packet = {
    packet_id: `AURA7-MCC-D${String(dayData.mission_day).padStart(3, '0')}`,
    team: 'Andes Space Labs',
    mission_day: dayData.mission_day,
    one_way_comm_delay_min: delayMin,
    round_trip_delay_min: Number((delayMin * 2).toFixed(1)),
    circadian_mode: circadianMode,
    data_integrity: hasAnyLiveOverride
      ? 'MIXED_WITH_LIVE_DEMO_OVERRIDE'
      : 'HISTORICAL_AUDITED_TELEMETRY',
    readiness_score_pct: evaluation.readinessScore,
    overall_triage: overallStatus.toUpperCase(),
    radiation_summary_msv: {
      cumulative: dayData.metrics.cumulative_radiation_msv,
      daily_neutron: dayData.metrics.daily_neutron_msv,
      solar_particle_event: dayData.solar_particle_event,
    },
    active_alerts: activeAlerts.map((a) => ({
      severity: a.severity,
      title: a.title,
      references: a.citations.map((c) => c.id),
    })),
    biomarkers: Object.fromEntries(metrics.map((m) => [m.key, m.value])),
    official_citations: citationIds,
  };

  const jsonPayload = JSON.stringify(packet, null, 2);
  const packetBytes = new Blob([jsonPayload]).size;
  const stepIdx =
    txState === 'delivered'
      ? 3
      : progress < 35
      ? 0
      : progress < 70
      ? 1
      : 2;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Asynchronous Earth Telemetry Packet"
    >
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden circadian-transition ${
          theme.isDark
            ? 'bg-[#0b1328] text-slate-100 border-sky-500/35'
            : 'bg-white text-slate-900 border-sky-300'
        }`}
      >
        {/* Header */}
        <div className={`px-5 py-4 border-b ${theme.divider} flex items-center justify-between gap-3`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-400/35 flex items-center justify-center text-sky-400">
              <Satellite className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                Asynchronous Earth Telemetry Packet
              </h2>
              <p className={`text-xs ${theme.textMuted}`}>
                Transmisión diferida hacia Houston MCC · Retraso unidireccional: {delayMin.toFixed(1)} min
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

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[76vh] overflow-y-auto">
          {/* Step-by-step Flight Animation */}
          <div className={`rounded-xl border p-4 space-y-3 ${theme.cardSubtleBg}`}>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-cyan-400" />
                Enlace Espacio Profundo → Houston MCC
              </span>
              <span className="font-mono text-cyan-400">
                1-Way: {delayMin.toFixed(1)}m | RTT: {(delayMin * 2).toFixed(1)}m
              </span>
            </div>

            <div className="relative h-14 rounded-xl bg-slate-950 border border-slate-800 px-4 flex items-center justify-between overflow-hidden text-white">
              <div className="z-10">
                <div className="text-[10px] font-mono font-bold text-sky-300">NAVE AURA-7</div>
                <div className="text-[9px] text-slate-400">Día {dayData.mission_day}</div>
              </div>

              <div className="flex-1 mx-4 relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 transition-all duration-150"
                  style={{ width: `${txState === 'delivered' ? 100 : progress}%` }}
                />
              </div>

              {txState === 'transmitting' && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-cyan-400 shadow-[0_0_18px_#22d3ee] flex items-center justify-center transition-all duration-100"
                  style={{ left: `calc(${14 + progress * 0.68}%)` }}
                >
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}

              <div className="z-10 text-right">
                <div className="text-[10px] font-mono font-bold text-emerald-300">HOUSTON MCC</div>
                <div className="text-[9px] text-slate-400">Flight Surgeons</div>
              </div>
            </div>

            {/* Step Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
              {TX_STEPS.map((label, i) => {
                const done =
                  txState === 'delivered' || (txState === 'transmitting' && i <= stepIdx);
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${
                      done
                        ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400 font-semibold'
                        : `border-slate-500/20 ${theme.textMuted}`
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
            <div className={`p-2.5 rounded-xl border ${theme.cardSubtleBg}`}>
              <div className={`text-[10px] ${theme.textMuted}`}>Preparación</div>
              <div className="font-mono font-extrabold text-sm">{evaluation.readinessScore}%</div>
            </div>
            <div className={`p-2.5 rounded-xl border ${theme.cardSubtleBg}`}>
              <div className={`text-[10px] ${theme.textMuted}`}>Radiación Acum.</div>
              <div className="font-mono font-extrabold text-sm">
                {dayData.metrics.cumulative_radiation_msv.toFixed(1)} mSv
              </div>
            </div>
            <div className={`p-2.5 rounded-xl border ${theme.cardSubtleBg}`}>
              <div className={`text-[10px] ${theme.textMuted}`}>Alertas Adjuntas</div>
              <div className="font-mono font-extrabold text-sm">{activeAlerts.length}</div>
            </div>
            <div className={`p-2.5 rounded-xl border ${theme.cardSubtleBg}`}>
              <div className={`text-[10px] ${theme.textMuted}`}>Payload CCSDS</div>
              <div className="font-mono font-extrabold text-sm">{packetBytes} B</div>
            </div>
          </div>

          {overallStatus !== 'optimal' && (
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/35 text-xs flex items-center gap-2 text-amber-300">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>
                Debido al retraso de {delayMin.toFixed(1)} min, AURA-7 mantiene protocolos preventivos autónomos mientras los Flight Surgeons reciben este paquete.
              </span>
            </div>
          )}

          {/* JSON Payload */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <FileCode2 className="w-4 h-4 text-sky-400" />
                Resumen Telemétrico Comprimido (`{packet.packet_id}`)
              </span>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950 text-cyan-200 border border-slate-800 text-[11px] font-mono overflow-x-auto max-h-48">
              {jsonPayload}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-5 py-3.5 border-t ${theme.divider} flex justify-end gap-2.5`}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-500/30 hover:bg-slate-500/10"
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
                ? 'Reenviar Paquete'
                : 'Iniciar Transmisión Diferida'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
