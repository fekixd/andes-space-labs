import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  ExternalLink,
  Search,
  ShieldCheck,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { HAZARD_META } from '../utils/clinicalEngine';

export default function CountermeasuresPanel({
  evaluation,
  allRecords,
  theme,
}) {
  const [selectedHazard, setSelectedHazard] = useState('auto');
  const [query, setQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState({});

  const { activeHazards, recommendedRecords } = evaluation;

  const filteredRecords = useMemo(() => {
    const base =
      selectedHazard === 'auto'
        ? recommendedRecords
        : selectedHazard === 'all'
        ? allRecords
        : allRecords.filter((r) => r.hazard_categories.includes(selectedHazard));

    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.summary.some((s) => s.toLowerCase().includes(q)) ||
        r.countermeasures.some((c) => c.toLowerCase().includes(q))
    );
  }, [selectedHazard, recommendedRecords, allRecords, query]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const hazardFilterButtons = [
    {
      id: 'auto',
      label:
        activeHazards.length > 0
          ? `Relevantes al Día (${recommendedRecords.length})`
          : `Base Preventiva (${recommendedRecords.length})`,
    },
    { id: 'all', label: `Todos (${allRecords.length})` },
    { id: 'radiation', label: 'Radiación' },
    { id: 'altered_gravity', label: 'Gravedad / ARED' },
    { id: 'hostile_environment', label: 'Cabina / CO₂' },
    { id: 'isolation_behavioral', label: 'Sueño / Cognición' },
    { id: 'distance', label: 'Distancia' },
  ];

  return (
    <section className={`rounded-2xl border p-5 circadian-transition ${theme.cardBg}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className={`w-4 h-4 ${theme.accentText}`} />
            <h3 className="text-base sm:text-lg font-bold tracking-tight">
              Contramedidas Oficiales NASA HRP &amp; CSA ({allRecords.length} Registros Verificados)
            </h3>
          </div>
          <p className={`text-xs mt-0.5 ${theme.textMuted}`}>
            Filtrado dinámico por categorías `hazard_categories` activas en la telemetría actual
          </p>
        </div>

        {/* Search box */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar HRP-RISK, CSA-RAD, ARED…"
            className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 ${theme.inputBg}`}
          />
        </div>
      </div>

      {/* Active Hazards Pill Row */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold mr-1 ${theme.textMuted}`}>
          <Filter className="w-3.5 h-3.5" />
          Filtro:
        </span>
        {hazardFilterButtons.map((btn) => {
          const isSelected = selectedHazard === btn.id;
          const isTriggered = activeHazards.includes(btn.id);
          return (
            <button
              key={btn.id}
              type="button"
              onClick={() => setSelectedHazard(btn.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                isSelected
                  ? theme.pillActive + ' border-transparent'
                  : `${theme.cardSubtleBg} ${
                      isTriggered ? 'border-amber-400/50 text-amber-400' : theme.textSecondary
                    } hover:border-sky-400`
              }`}
            >
              {btn.label}
              {isTriggered && !isSelected && ' •'}
            </button>
          );
        })}
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <div className={`p-6 rounded-xl border text-center text-xs ${theme.cardSubtleBg}`}>
          No se encontraron registros oficiales que coincidan con “{query}”.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 max-h-[620px] overflow-y-auto pr-1">
          {filteredRecords.map((rec) => {
            const isExpanded = !!expandedIds[rec.id];
            const isCsa = rec.id.startsWith('CSA-');
            const summaryText = rec.summary?.[0] || '';
            const countermeasures = rec.countermeasures?.length
              ? rec.countermeasures
              : rec.summary?.slice(0, 2) || [];

            return (
              <article
                key={rec.id}
                className={`rounded-xl border p-4 flex flex-col justify-between gap-3 transition ${theme.cardSubtleBg} hover:border-sky-400/60`}
              >
                <div className="space-y-2">
                  {/* Top Meta Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                          isCsa
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/35'
                            : 'bg-sky-500/15 text-sky-400 border-sky-500/35'
                        }`}
                      >
                        {rec.id}
                      </span>
                      <span className={`text-[10px] font-semibold uppercase ${theme.textMuted}`}>
                        {isCsa ? 'Canadian Space Agency' : 'NASA HRP'}
                      </span>
                    </div>

                    <a
                      href={rec.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold hover:underline ${theme.accentText}`}
                    >
                      <span>Fuente oficial</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-bold leading-snug">{rec.title}</h4>

                  {/* Hazard tags */}
                  <div className="flex flex-wrap gap-1">
                    {rec.hazard_categories.map((cat) => {
                      const meta = HAZARD_META[cat];
                      const active = activeHazards.includes(cat);
                      return (
                        <span
                          key={cat}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            active
                              ? 'bg-amber-500/20 text-amber-400 border-amber-400/50'
                              : meta?.badgeClass || 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          }`}
                        >
                          {meta?.shortLabel || cat}
                          {active && ' (Activo)'}
                        </span>
                      );
                    })}
                  </div>

                  {/* Summary */}
                  {summaryText && (
                    <p className={`text-xs leading-relaxed ${theme.textSecondary}`}>
                      {summaryText}
                    </p>
                  )}

                  {/* Countermeasures list */}
                  {countermeasures.length > 0 && (
                    <div className="pt-1 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-500">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Contramedidas &amp; Evidencia:</span>
                      </div>
                      <ul className={`space-y-1 text-[11px] ${theme.textSecondary}`}>
                        {(isExpanded ? countermeasures : countermeasures.slice(0, 2)).map(
                          (cm, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                              <span>{cm}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Expand button if more details exist */}
                {(countermeasures.length > 2 || (rec.summary && rec.summary.length > 1)) && (
                  <button
                    type="button"
                    onClick={() => toggleExpand(rec.id)}
                    className={`self-start inline-flex items-center gap-1 text-[11px] font-semibold ${theme.accentText} hover:underline`}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>Ver menos</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>Ver detalles completos ({rec.summary.length} notas)</span>
                      </>
                    )}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
