import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Moon,
  Radiation,
  ShieldCheck,
  Sparkles,
  Sprout,
  Stethoscope,
  SunMedium,
  X,
} from 'lucide-react';
import SproutBotAvatarSvg from './SproutBotAvatarSvg';

const ACTION_BTN_STYLES = {
  amber: {
    dark: 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/60',
    light: 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-600 shadow-sm',
  },
  emerald: {
    dark: 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border-emerald-400/60',
    light: 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-sm',
  },
  cyan: {
    dark: 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border-cyan-400/60',
    light: 'bg-cyan-700 hover:bg-cyan-800 text-white border-cyan-800 shadow-sm',
  },
};

export default function SproutBotFloatingWidget({
  inference,
  evaluation,
  selectedDay,
  circadianMode,
  liveDemoOverrides,
  theme,
  onTriggerAction,
}) {
  const isDark = theme?.isDark ?? circadianMode !== 'day';

  const overrideFingerprint = useMemo(
    () =>
      Object.entries(liveDemoOverrides || {})
        .map(([k, v]) => `${k}:${typeof v === 'object' ? `${v?.value}-${v?.status}` : v}`)
        .sort()
        .join('|'),
    [liveDemoOverrides]
  );

  const [isOpen, setIsOpen] = useState(() => Boolean(inference?.autoOpenBubble));
  const [recentActionIds, setRecentActionIds] = useState({});
  const prevTriggerKeyRef = useRef(`${selectedDay}|${inference?.stateId}|${overrideFingerprint}`);

  // Automatically pop open the proactive chat bubble on actionable day changes or Module 5 completions
  useEffect(() => {
    const nextKey = `${selectedDay}|${inference?.stateId}|${overrideFingerprint}`;
    if (nextKey !== prevTriggerKeyRef.current) {
      prevTriggerKeyRef.current = nextKey;
      setRecentActionIds({});
      if (inference?.autoOpenBubble || overrideFingerprint.length > 0) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }
  }, [selectedDay, inference?.stateId, inference?.autoOpenBubble, overrideFingerprint]);

  if (!inference || !evaluation) return null;

  const { dayData, mascotPosture, overallStatus } = evaluation;
  const {
    stateLabel,
    shortBadge,
    visualExpression,
    accentHex,
    toneTag,
    confidencePct,
    telemetrySignature,
    proactiveGreeting,
    actionPrompts,
    primaryCitation,
    citations,
    isolationProgressPct,
  } = inference;

  const handleActionClick = (prompt) => {
    if (onTriggerAction) {
      onTriggerAction(prompt);
    }
    setRecentActionIds((prev) => ({ ...prev, [prompt.id]: true }));
  };

  const orbRingBorder =
    visualExpression === 'alert_protector'
      ? 'border-cyan-400 shadow-cyan-500/35'
      : visualExpression === 'worried_empathetic'
      ? 'border-amber-400 shadow-amber-500/35'
      : visualExpression === 'medical_assistant'
      ? 'border-cyan-400 shadow-cyan-500/30'
      : 'border-emerald-400 shadow-emerald-500/30';

  const badgeToneCls =
    visualExpression === 'alert_protector'
      ? isDark
        ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/50'
        : 'bg-cyan-100 text-cyan-900 border-cyan-500/50'
      : visualExpression === 'worried_empathetic'
      ? isDark
        ? 'bg-amber-500/15 text-amber-300 border-amber-400/50'
        : 'bg-amber-100 text-amber-900 border-amber-500/50'
      : visualExpression === 'medical_assistant'
      ? isDark
        ? 'bg-cyan-500/15 text-cyan-200 border-cyan-400/50'
        : 'bg-sky-100 text-sky-900 border-sky-500/50'
      : isDark
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/50'
      : 'bg-emerald-100 text-emerald-900 border-emerald-500/50';

  return (
    <aside
      aria-label="Sprout-Bot Copiloto Psicológico Autónomo"
      className="fixed bottom-28 sm:bottom-24 right-3 sm:right-6 z-40 flex flex-col items-end gap-2.5 max-w-[calc(100vw-1.5rem)]"
    >
      {/* Proactive Chat / Inference HUD Bubble */}
      {isOpen && (
        <div
          className={`animate-bubble-in w-[360px] sm:w-[405px] max-w-[calc(100vw-1.5rem)] max-h-[calc(100vh-12.5rem)] overflow-y-auto rounded-2xl border backdrop-blur-xl shadow-2xl p-4 space-y-3 circadian-transition ${
            isDark
              ? 'bg-slate-950/92 text-slate-100 border-slate-700/90'
              : 'bg-white/95 text-slate-900 border-sky-300/80'
          }`}
          style={{
            boxShadow: isDark
              ? `0 20px 50px -12px rgba(2, 6, 23, 0.85), 0 0 0 1px ${accentHex}35`
              : `0 20px 45px -12px rgba(14, 116, 144, 0.28), 0 0 0 1px ${accentHex}45`,
          }}
        >
          {/* Bubble Header: Inferred Psychological State + Confidence */}
          <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-500/20">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${badgeToneCls}`}>
                  {visualExpression === 'alert_protector' && <Radiation className="w-3 h-3" />}
                  {visualExpression === 'worried_empathetic' && <Sparkles className="w-3 h-3" />}
                  {visualExpression === 'medical_assistant' && <Stethoscope className="w-3 h-3" />}
                  {visualExpression === 'optimal_motivated' && <Sprout className="w-3 h-3" />}
                  <span>{stateLabel}</span>
                </span>
                <span className="text-[10px] font-mono font-bold opacity-75">
                  IA {confidencePct}% · D{selectedDay}
                </span>
              </div>
              <div className={`text-[10px] font-mono mt-1 flex items-center gap-1.5 ${theme.textMuted}`}>
                <Activity className="w-3 h-3 shrink-0" />
                <span className="truncate">{toneTag} · Cero Encuestas Manuales</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Minimizar asistente Sprout-Bot"
              className={`p-1 rounded-lg border transition shrink-0 ${
                isDark
                  ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                  : 'border-slate-300 hover:bg-slate-100 text-slate-600'
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Live Sensor Fusion Telemetry Strip */}
          <div
            className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-mono leading-tight ${
              isDark
                ? 'bg-slate-900/80 border-slate-700/80 text-slate-300'
                : 'bg-slate-100/90 border-slate-200 text-slate-700'
            }`}
          >
            {telemetrySignature}
          </div>

          {/* Progressive Isolation Gauge when in >Day 60 Isolation State */}
          {typeof isolationProgressPct === 'number' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className={theme.textMuted}>Índice Progresivo de Aislamiento (&gt; Día 60)</span>
                <span className={isDark ? 'text-amber-300 font-bold' : 'text-amber-800 font-bold'}>
                  {isolationProgressPct}%
                </span>
              </div>
              <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                  style={{ width: `${Math.max(12, isolationProgressPct)}%` }}
                />
              </div>
            </div>
          )}

          {/* First-person Proactive Conversational Message */}
          <div className="flex items-start gap-2.5">
            <div className="shrink-0 -mt-1 hidden sm:block">
              <SproutBotAvatarSvg
                visualExpression={visualExpression}
                mascotPosture={mascotPosture}
                circadianMode={circadianMode}
                earthCommDelayMin={dayData.earth_comm_delay_min}
                overallStatus={overallStatus}
                isDark={isDark}
                compact
                className="w-16 h-16"
              />
            </div>
            <p className="text-xs sm:text-[13px] leading-relaxed font-medium">
              “{proactiveGreeting}”
            </p>
          </div>

          {/* One-Click Active Assistance Proposals */}
          <div className="space-y-2 pt-1">
            {actionPrompts.map((prompt) => {
              const executed = Boolean(recentActionIds[prompt.id]);
              const variantCls = ACTION_BTN_STYLES[prompt.variant || 'cyan'];
              const isAttenuatedAlready =
                prompt.actionType === 'attenuate_lights' &&
                (circadianMode === 'sunset' || circadianMode === 'night');

              return (
                <div
                  key={prompt.id}
                  className={`rounded-xl border p-2.5 space-y-2 ${
                    isDark
                      ? 'bg-slate-900/65 border-slate-700/80'
                      : 'bg-sky-50/75 border-sky-200/80'
                  }`}
                >
                  <p className={`text-[11px] leading-snug ${theme.textSecondary}`}>
                    {prompt.question}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleActionClick(prompt)}
                    className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-extrabold border transition ${
                      executed || isAttenuatedAlready
                        ? isDark
                          ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400/70'
                          : 'bg-emerald-600 text-white border-emerald-700'
                        : isDark
                        ? variantCls.dark
                        : variantCls.light
                    }`}
                  >
                    {executed || isAttenuatedAlready ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : prompt.actionType === 'attenuate_lights' ? (
                      <Moon className="w-3.5 h-3.5 shrink-0" />
                    ) : prompt.targetModule === 'wellness' ? (
                      <Sprout className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <SunMedium className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>
                      [{executed && prompt.activeDoneLabel ? prompt.activeDoneLabel : prompt.buttonLabel}]
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Corner Clinical Knowledge Base Validation Badge (Zero Hallucinations) */}
          {primaryCitation && (
            <div
              className={`pt-2 border-t border-slate-500/20 flex flex-col gap-1.5`}
            >
              <a
                href={primaryCitation.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl border text-[10px] font-semibold transition ${
                  isDark
                    ? 'bg-slate-900/90 border-cyan-500/35 text-cyan-200 hover:border-cyan-400'
                    : 'bg-cyan-50 border-cyan-300 text-cyan-900 hover:border-cyan-500'
                }`}
              >
                <span className="inline-flex items-center gap-1.5 min-w-0">
                  <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`} />
                  <span className="truncate">
                    Basado en: <strong>{primaryCitation.id}</strong> ({primaryCitation.title})
                  </span>
                </span>
                <ExternalLink className="w-3 h-3 shrink-0 opacity-75 group-hover:opacity-100" />
              </a>

              {citations.length > 1 && (
                <div className="flex flex-wrap gap-1">
                  {citations.slice(1).map((rec) => (
                    <a
                      key={rec.id}
                      href={rec.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-mono font-bold transition ${
                        isDark
                          ? 'bg-slate-900/70 border-slate-700 text-slate-300 hover:border-sky-400'
                          : 'bg-slate-100 border-slate-300 text-slate-700 hover:border-sky-500'
                      }`}
                    >
                      <span>{rec.id}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Sprout-Bot Companion Orb / Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-full border-2 backdrop-blur-xl shadow-xl transition hover:scale-[1.03] ${orbRingBorder} ${
          isDark ? 'bg-slate-950/92 text-slate-100' : 'bg-white/95 text-slate-900'
        }`}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Contraer burbuja de Sprout-Bot' : 'Abrir análisis psicológico de Sprout-Bot'}
      >
        <div className="relative w-11 h-11 rounded-full overflow-hidden flex items-center justify-center shrink-0">
          <SproutBotAvatarSvg
            visualExpression={visualExpression}
            mascotPosture={mascotPosture}
            circadianMode={circadianMode}
            earthCommDelayMin={dayData.earth_comm_delay_min}
            overallStatus={overallStatus}
            isDark={isDark}
            compact
            className="w-12 h-12"
          />
          {!isOpen && (
            <span
              className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-slate-950 animate-ping"
              style={{ backgroundColor: accentHex }}
            />
          )}
        </div>

        <div className="text-left leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black tracking-tight">Sprout-Bot IA</span>
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: accentHex }}
            />
          </div>
          <div className={`text-[10px] font-mono font-bold truncate max-w-[140px] ${theme.textMuted}`}>
            {shortBadge}
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 opacity-70 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
    </aside>
  );
}
