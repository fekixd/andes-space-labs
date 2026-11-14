import React from 'react';
import {
  Bone,
  HeartPulse,
  Radiation,
  Wind,
  MoonStar,
  Brain,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { HAZARD_META } from '../utils/clinicalEngine';

const METRIC_ICONS = {
  bone_density_index: Bone,
  resting_heart_rate: HeartPulse,
  cumulative_radiation_msv: Radiation,
  cabin_co2_mmhg: Wind,
  sleep_hours: MoonStar,
  pvt_reaction_ms: Brain,
};

const STATUS_CONFIG = {
  optimal: {
    label: 'Óptimo',
    badge: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/35',
    border: 'border-emerald-500/25',
    bar: 'bg-emerald-500',
    Icon: CheckCircle2,
  },
  warning: {
    label: 'Precaución',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
    border: 'border-amber-500/45',
    bar: 'bg-amber-500',
    Icon: AlertTriangle,
  },
  critical: {
    label: 'Crítico',
    badge: 'bg-rose-500/20 text-rose-400 border-rose-500/50',
    border: 'border-rose-500/60 shadow-rose-500/10',
    bar: 'bg-rose-500',
    Icon: ShieldAlert,
  },
};

export default function BiomarkerGrid({ biomarkers, theme }) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold tracking-tight">
            Panel de Evaluación Clínica en Tiempo Real (6 Biomarcadores)
          </h3>
          <p className={`text-xs ${theme.textMuted}`}>
            Evaluación autónoma frente a umbrales oficiales NASA HRP &amp; CSA (`clinical_thresholds`)
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Óptimo
          </span>
          <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Precaución
          </span>
          <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Crítico
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {biomarkers.map((metric) => {
          const Icon = METRIC_ICONS[metric.key] || HeartPulse;
          const st = STATUS_CONFIG[metric.status];
          const StatusIcon = st.Icon;
          const hazardMeta = HAZARD_META[metric.hazard];

          return (
            <article
              key={metric.key}
              className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 circadian-transition ${
                theme.cardBg
              } ${metric.status !== 'optimal' ? st.border : ''}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                      metric.status === 'critical'
                        ? 'bg-rose-500/15 border-rose-500/35 text-rose-400'
                        : metric.status === 'warning'
                        ? 'bg-amber-500/15 border-amber-500/35 text-amber-400'
                        : 'bg-sky-500/15 border-sky-500/30 text-sky-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold leading-tight">{metric.title}</h4>
                    <span className={`text-[11px] font-medium ${theme.textMuted}`}>
                      {hazardMeta?.shortLabel || metric.hazard}
                    </span>
                  </div>
                </div>

                {/* Traffic Light Badge */}
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${st.badge}`}
                >
                  <StatusIcon className="w-3 h-3" />
                  <span>{st.label}</span>
                </span>
              </div>

              {/* Value + Extra Tag */}
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold font-mono tracking-tight">
                    {metric.formattedValue}
                  </span>
                  <span className={`text-sm font-semibold ${theme.textMuted}`}>{metric.unit}</span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                    metric.isLiveOverride
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400/50 animate-pulse'
                      : theme.cardSubtleBg
                  }`}
                >
                  {metric.extraTag}
                </span>
              </div>

              {/* Threshold Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-2 rounded-full bg-slate-500/15 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${st.bar}`}
                    style={{ width: `${metric.progressPct}%` }}
                  />
                </div>
                <div className={`text-[11px] font-mono ${theme.textMuted}`}>
                  {metric.thresholdLabel}
                </div>
              </div>

              {/* Clinical Interpretation */}
              <p className={`text-xs leading-snug ${theme.textSecondary}`}>{metric.note}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
