import React, { useMemo, useState } from 'react';
import {
  ScrollText,
  ExternalLink,
  Send,
  Calendar,
  Filter,
  Radio,
  Search,
} from 'lucide-react';
import { STATUS_META } from '../../services/evaluationEngine';
import { CIRCADIAN_MODES } from '../../utils/circadianThemes';

export default function MissionAlertLogModule({
  alertLog,
  selectedDay,
  dayData,
  circadianMode,
  onSelectMode,
  onOpenTelemetryModal,
  theme,
}) {
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Activa Hoy' | 'En Monitoreo' | 'Resuelta'
  const [severityFilter, setSeverityFilter] = useState('all'); // 'all' | 'critical' | 'warning'
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return alertLog.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (severityFilter !== 'all' && item.severity !== severityFilter) return false;
      if (
        q &&
        !item.indicator.toLowerCase().includes(q) &&
        !(item.kbRecord?.id || '').toLowerCase().includes(q) &&
        !String(item.day).includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [alertLog, statusFilter, severityFilter, searchTerm]);

  const counts = useMemo(
    () => ({
      activeToday: alertLog.filter((x) => x.status === 'Activa Hoy').length,
      monitoring: alertLog.filter((x) => x.status === 'En Monitoreo').length,
      resolved: alertLog.filter((x) => x.status === 'Resuelta').length,
    }),
    [alertLog]
  );

  const trackingBadge = (st) => {
    if (st === 'Activa Hoy') return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    if (st === 'En Monitoreo') return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/35';
  };

  return (
    <div className="space-y-5">
      {/* Top Grid: Earth Sync Access + Circadian Rhythm Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Earth Link & Modal Trigger Card */}
        <section
          className={`lg:col-span-6 rounded-2xl border p-5 flex flex-col justify-between gap-4 circadian-transition ${theme.cardBg}`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400" />
                <span>Enlace Asíncrono con Tierra (Houston MCC)</span>
              </h2>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                +{dayData.earth_comm_delay_min.toFixed(1)} min
              </span>
            </div>
            <p className={`text-xs leading-relaxed ${theme.textSecondary}`}>
              En el Día {selectedDay}, las señales hacia Houston tardan{' '}
              <strong>{dayData.earth_comm_delay_min.toFixed(1)} minutos</strong> en llegar (y{' '}
              <strong>{(dayData.earth_comm_delay_min * 2).toFixed(1)} min</strong> en recibir respuesta). AURA-7 compila paquetes telemétricos comprimidos para revisión asíncrona de los Flight Surgeons.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenTelemetryModal}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition ${theme.accentBg}`}
          >
            <Send className="w-4 h-4" />
            <span>Abrir Modal “Asynchronous Earth Telemetry Packet”</span>
          </button>
        </section>

        {/* Circadian Schedule Calendar */}
        <section
          className={`lg:col-span-6 rounded-2xl border p-5 space-y-3 circadian-transition ${theme.cardBg}`}
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-extrabold flex items-center gap-2">
              <Calendar className={`w-5 h-5 ${theme.accentText}`} />
              <span>Calendario Circadiano Terrestre (24 h)</span>
            </h3>
            <span className={`text-[11px] font-mono ${theme.textMuted}`}>
              Mitiga 16 órbitas/día
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {Object.values(CIRCADIAN_MODES).map((m) => {
              const active = circadianMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectMode(m.id)}
                  className={`text-left p-3 rounded-xl border transition ${
                    active ? theme.pillActive + ' border-transparent' : theme.cardSubtleBg
                  }`}
                >
                  <div className="text-xs font-extrabold">{m.label}</div>
                  <div className="text-[10px] font-mono opacity-85">{m.windowLabel}</div>
                  <div className="text-[10px] mt-1 opacity-80 truncate">{m.kelvin}</div>
                </button>
              );
            })}
          </div>
          <p className={`text-[11px] ${theme.textMuted}`}>
            Sincroniza la iluminación LED de cabina (`HRP-RISK-014`) y el comportamiento visual de Sprout-Bot.
          </p>
        </section>
      </div>

      {/* Historical Alert Log (Day 1 to selectedDay) */}
      <section className={`rounded-2xl border p-5 space-y-4 circadian-transition ${theme.cardBg}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
              <ScrollText className={`w-5 h-5 ${theme.accentText}`} />
              <span>Bitácora Histórica de Alertas (Día 1 al Día {selectedDay})</span>
            </h2>
            <p className={`text-xs mt-0.5 ${theme.textMuted}`}>
              {alertLog.length} eventos registrados hasta la fecha ·{' '}
              <strong className="text-rose-400">{counts.activeToday} Activa Hoy</strong> ·{' '}
              <strong className="text-amber-400">{counts.monitoring} En Monitoreo</strong> ·{' '}
              <strong className="text-emerald-500">{counts.resolved} Resuelta</strong>
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar día, indicador o código…"
              className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 ${theme.inputBg}`}
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold mr-1 ${theme.textMuted}`}>
              <Filter className="w-3.5 h-3.5" /> Seguimiento:
            </span>
            {['all', 'Activa Hoy', 'En Monitoreo', 'Resuelta'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                  statusFilter === st
                    ? theme.pillActive + ' border-transparent'
                    : `${theme.cardSubtleBg} ${theme.textSecondary}`
                }`}
              >
                {st === 'all' ? 'Todos' : st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'Todas Gravedades' },
              { id: 'critical', label: 'Crítico' },
              { id: 'warning', label: 'Precaución' },
            ].map((sev) => (
              <button
                key={sev.id}
                type="button"
                onClick={() => setSeverityFilter(sev.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                  severityFilter === sev.id
                    ? theme.pillActive + ' border-transparent'
                    : `${theme.cardSubtleBg} ${theme.textSecondary}`
                }`}
              >
                {sev.label}
              </button>
            ))}
          </div>
        </div>

        {/* Log Table */}
        {filteredLogs.length === 0 ? (
          <div className={`p-6 rounded-xl border text-center text-xs ${theme.cardSubtleBg}`}>
            No hay alertas históricas registradas con los filtros seleccionados hasta el Día {selectedDay}.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto rounded-xl border border-slate-500/20">
            <table className="w-full text-left border-collapse text-xs">
              <thead className={`sticky top-0 z-10 ${theme.isDark ? 'bg-slate-900' : 'bg-sky-100'}`}>
                <tr className="border-b border-slate-500/20">
                  <th className="py-2.5 px-3 font-bold">Día</th>
                  <th className="py-2.5 px-3 font-bold">Indicador</th>
                  <th className="py-2.5 px-3 font-bold">Valor</th>
                  <th className="py-2.5 px-3 font-bold">Gravedad</th>
                  <th className="py-2.5 px-3 font-bold">Referencia NASA / CSA</th>
                  <th className="py-2.5 px-3 font-bold">Seguimiento</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((row) => {
                  const sevMeta = STATUS_META[row.severity];
                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-slate-500/15 ${
                        row.day === selectedDay ? 'bg-sky-500/10' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold whitespace-nowrap">
                        Día {row.day}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold">{row.indicator}</div>
                        <div className={`text-[11px] ${theme.textMuted}`}>{row.note}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono whitespace-nowrap">{row.valueText}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${sevMeta.badgeClass}`}
                        >
                          {sevMeta.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {row.kbRecord ? (
                          <a
                            href={row.kbRecord.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={row.kbRecord.title}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:underline"
                          >
                            <span>{row.kbRecord.id}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${trackingBadge(
                            row.status
                          )}`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
