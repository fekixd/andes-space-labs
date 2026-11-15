import React from 'react';
import {
  ShieldAlert,
  Sprout,
  MessageCircleHeart,
  Info,
  Sparkles,
  Stethoscope,
  Moon,
  SunMedium,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import SproutBotAvatarSvg from './SproutBotAvatarSvg';

export default function SproutBotHero({
  evaluation,
  psychInference,
  circadianMode,
  theme,
  onTriggerAction,
}) {
  const { dayData, mascotPosture, narrative, overallStatus } = evaluation;
  const isDark = theme?.isDark ?? circadianMode !== 'day';

  const visualExpression =
    psychInference?.visualExpression ||
    (mascotPosture === 'shield'
      ? 'alert_protector'
      : mascotPosture === 'weights'
      ? 'medical_assistant'
      : mascotPosture === 'veggie'
      ? 'worried_empathetic'
      : 'optimal_motivated');

  const coreColor =
    psychInference?.accentHex ||
    (visualExpression === 'alert_protector' || visualExpression === 'medical_assistant'
      ? '#00F0FF'
      : visualExpression === 'worried_empathetic'
      ? '#FFB800'
      : '#00FF66');

  const expressionChip =
    visualExpression === 'alert_protector'
      ? {
          label: psychInference?.stateLabel || 'Alerta / Protector SPE',
          Icon: ShieldAlert,
          cls: isDark
            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50'
            : 'bg-cyan-100 text-cyan-900 border-cyan-500/50',
        }
      : visualExpression === 'worried_empathetic'
      ? {
          label: psychInference?.stateLabel || 'Empático / Seguimiento Psicosocial',
          Icon: Sparkles,
          cls: isDark
            ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
            : 'bg-amber-100 text-amber-900 border-amber-500/50',
        }
      : visualExpression === 'medical_assistant'
      ? {
          label: psychInference?.stateLabel || 'Auxiliar Médico · ARED',
          Icon: Stethoscope,
          cls: isDark
            ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50'
            : 'bg-sky-100 text-sky-900 border-sky-500/50',
        }
      : {
          label: psychInference?.stateLabel || 'Óptimo / Motivado',
          Icon: Sprout,
          cls: isDark
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
            : 'bg-emerald-100 text-emerald-900 border-emerald-500/50',
        };

  const ChipIcon = expressionChip.Icon;
  const primaryCitation = psychInference?.primaryCitation;
  const actionPrompts = psychInference?.actionPrompts || [];

  return (
    <section
      className={`rounded-2xl border p-5 sm:p-6 relative overflow-hidden circadian-transition ${theme.cardBg}`}
    >
      <div
        className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-35 transition-all duration-700"
        style={{ background: coreColor }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Expressive Animated Empathy SVG Mascot */}
        <div className="lg:col-span-4 flex flex-col items-center">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border mb-2 ${expressionChip.cls}`}
          >
            <ChipIcon className="w-3.5 h-3.5" />
            <span>{expressionChip.label}</span>
          </span>

          <div className="w-60 h-60 sm:w-64 sm:h-64 flex items-center justify-center">
            <SproutBotAvatarSvg
              visualExpression={visualExpression}
              mascotPosture={mascotPosture}
              circadianMode={circadianMode}
              earthCommDelayMin={dayData.earth_comm_delay_min}
              overallStatus={overallStatus}
              isDark={isDark}
              className="w-60 h-60 sm:w-64 sm:h-64"
            />
          </div>
        </div>

        {/* Autonomous Psychological Inference & Proactive One-Click Countermeasures */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-500">
              <MessageCircleHeart className="w-4 h-4" />
              <span>
                Sprout-Bot v2.3 · Inferencia Psicológica Autónoma ·{' '}
                {psychInference?.toneTag || narrative.toneLabel}
              </span>
            </div>
            {psychInference?.confidencePct && (
              <span
                className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold ${
                  isDark
                    ? 'bg-slate-900/70 border-slate-700 text-cyan-300'
                    : 'bg-sky-50 border-sky-300 text-cyan-800'
                }`}
              >
                Red Neuronal HRI {psychInference.confidencePct}% · Cero Encuestas Manuales
              </span>
            )}
          </div>

          <div className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${theme.cardSubtleBg}`}>
            <p className="text-base sm:text-lg font-bold leading-snug">
              “{psychInference?.proactiveGreeting || narrative.summaryLine}”
            </p>
            <p className={`text-xs sm:text-sm leading-relaxed ${theme.textSecondary}`}>
              {narrative.correlationBody}
            </p>

            {/* One-Click Active Assistance Strip */}
            {actionPrompts.length > 0 && onTriggerAction && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {actionPrompts.map((prompt) => {
                  const isAttenuated =
                    prompt.actionType === 'attenuate_lights' &&
                    (circadianMode === 'sunset' || circadianMode === 'night');
                  return (
                    <button
                      key={prompt.id}
                      type="button"
                      onClick={() => onTriggerAction(prompt)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                        isAttenuated
                          ? isDark
                            ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/60'
                            : 'bg-emerald-600 text-white border-emerald-700'
                          : prompt.variant === 'amber'
                          ? isDark
                            ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/60'
                            : 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-600'
                          : prompt.variant === 'emerald'
                          ? isDark
                            ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border-emerald-400/60'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                          : isDark
                          ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border-cyan-400/60'
                          : 'bg-cyan-700 hover:bg-cyan-800 text-white border-cyan-800'
                      }`}
                    >
                      {isAttenuated ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : prompt.actionType === 'attenuate_lights' ? (
                        <Moon className="w-3.5 h-3.5" />
                      ) : prompt.targetModule === 'wellness' ? (
                        <Sprout className="w-3.5 h-3.5" />
                      ) : (
                        <SunMedium className="w-3.5 h-3.5" />
                      )}
                      <span>[{prompt.buttonLabel}]</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className={`pt-2.5 border-t ${theme.divider} flex flex-wrap items-center justify-between gap-2 text-[11px]`}>
              <div className={`flex items-start gap-2 ${theme.textMuted}`}>
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-sky-400" />
                <span>{narrative.disclaimer}</span>
              </div>

              {primaryCitation && (
                <a
                  href={primaryCitation.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition ${
                    isDark
                      ? 'bg-slate-900/80 border-cyan-500/35 text-cyan-300 hover:border-cyan-400'
                      : 'bg-cyan-50 border-cyan-300 text-cyan-900 hover:border-cyan-500'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3 shrink-0" />
                  <span>
                    Basado en: {primaryCitation.id} ({primaryCitation.title})
                  </span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
