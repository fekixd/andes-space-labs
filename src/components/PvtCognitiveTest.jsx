import React, { useEffect, useRef, useState } from 'react';
import { Brain, Play, RotateCcw, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function PvtCognitiveTest({
  datasetPvtMs,
  livePvtMs,
  onApplyLivePvt,
  onResetLivePvt,
  theme,
}) {
  // Phases: 'idle' | 'running_wait' | 'running_go' | 'false_start' | 'completed'
  const [phase, setPhase] = useState('idle');
  const [secondsLeft, setSecondsLeft] = useState(10.0);
  const [trials, setTrials] = useState([]);
  const [lastReaction, setLastReaction] = useState(null);
  const [statusMessage, setStatusMessage] = useState(
    'Inicia la prueba de 10 s y pulsa apenas el círculo cambie a VERDE.'
  );

  const stimulusStartRef = useRef(0);
  const goTimeoutRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const endTimeRef = useRef(0);
  const trialsRef = useRef([]);

  const clearAllTimers = () => {
    if (goTimeoutRef.current) clearTimeout(goTimeoutRef.current);
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  const scheduleNextStimulus = () => {
    setPhase('running_wait');
    const delayMs = 850 + Math.random() * 1350;
    goTimeoutRef.current = setTimeout(() => {
      if (Date.now() >= endTimeRef.current) return;
      stimulusStartRef.current = performance.now();
      setPhase('running_go');
    }, delayMs);
  };

  const finishSession = () => {
    clearAllTimers();
    setPhase('completed');
    setSecondsLeft(0);

    const collected = trialsRef.current;
    if (collected.length > 0) {
      const avg = Math.round(collected.reduce((sum, v) => sum + v, 0) / collected.length);
      onApplyLivePvt(avg);
      setStatusMessage(
        `Promedio PVT en vivo: ${avg} ms (${collected.length} estímulo${
          collected.length > 1 ? 's' : ''
        }). Biomarcador actualizado en tiempo real.`
      );
    } else {
      setStatusMessage('No se registraron clics válidos en la ventana de 10 s. Inténtalo de nuevo.');
    }
  };

  const startTest = () => {
    clearAllTimers();
    trialsRef.current = [];
    setTrials([]);
    setLastReaction(null);
    setSecondsLeft(10.0);
    setStatusMessage('Mantén la vista en el objetivo… espera el cambio a VERDE.');

    const now = Date.now();
    endTimeRef.current = now + 10000;

    sessionTimerRef.current = setInterval(() => {
      const remaining = Math.max(0, (endTimeRef.current - Date.now()) / 1000);
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        finishSession();
      }
    }, 100);

    scheduleNextStimulus();
  };

  const handleTargetClick = () => {
    if (phase === 'idle' || phase === 'completed') {
      startTest();
      return;
    }

    if (phase === 'running_wait') {
      if (goTimeoutRef.current) clearTimeout(goTimeoutRef.current);
      setPhase('false_start');
      setStatusMessage('¡Salida en falso! Espera a que el círculo se ponga VERDE.');
      goTimeoutRef.current = setTimeout(() => {
        if (Date.now() < endTimeRef.current) {
          scheduleNextStimulus();
        }
      }, 650);
      return;
    }

    if (phase === 'running_go') {
      const rt = Math.round(performance.now() - stimulusStartRef.current);
      const updated = [...trialsRef.current, rt];
      trialsRef.current = updated;
      setTrials(updated);
      setLastReaction(rt);

      const runningAvg = Math.round(updated.reduce((s, x) => s + x, 0) / updated.length);
      onApplyLivePvt(runningAvg);
      setStatusMessage(`¡Reacción capturada: ${rt} ms! Promedio parcial: ${runningAvg} ms.`);

      if (Date.now() + 900 < endTimeRef.current) {
        scheduleNextStimulus();
      } else {
        setPhase('running_wait');
      }
    }
  };

  const circleStyle =
    phase === 'running_go'
      ? 'bg-emerald-500 border-emerald-300 text-stone-950 shadow-[0_0_40px_rgba(16,185,129,0.75)] scale-105'
      : phase === 'false_start'
      ? 'bg-rose-600 border-rose-300 text-white shadow-[0_0_25px_rgba(225,29,72,0.5)]'
      : phase === 'running_wait'
      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
      : 'bg-sky-500/15 border-sky-400/60 hover:bg-sky-500/25';

  const activeValue = livePvtMs !== null ? livePvtMs : datasetPvtMs;

  return (
    <section className={`rounded-2xl border p-5 circadian-transition ${theme.cardBg}`}>
      <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Brain className={`w-4 h-4 ${theme.accentText}`} />
            <h3 className="text-sm sm:text-base font-bold tracking-tight">
              Micro-Test Cognitivo PVT (10 Segundos)
            </h3>
          </div>
          <p className={`text-xs mt-0.5 ${theme.textMuted}`}>
            Psychomotor Vigilance Task · Sobrescribe `pvt_reaction_ms` en vivo
          </p>
        </div>

        {livePvtMs !== null && (
          <button
            type="button"
            onClick={() => {
              clearAllTimers();
              trialsRef.current = [];
              setPhase('idle');
              setTrials([]);
              setLastReaction(null);
              onResetLivePvt();
              setStatusMessage('Valor oficial de telemetría restaurado.');
            }}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${theme.cardSubtleBg} hover:border-sky-400`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restaurar ({datasetPvtMs} ms)</span>
          </button>
        )}
      </div>

      {/* Interactive Stimulus Target */}
      <div className="flex flex-col items-center justify-center py-3">
        <button
          type="button"
          onClick={handleTargetClick}
          className={`w-44 h-44 rounded-full border-4 flex flex-col items-center justify-center text-center transition-all duration-150 select-none cursor-pointer focus:outline-none ${circleStyle}`}
        >
          {phase === 'idle' && (
            <>
              <Play className="w-8 h-8 mb-1 text-sky-400" />
              <span className="text-sm font-extrabold">INICIAR PVT</span>
              <span className={`text-[11px] mt-0.5 ${theme.textMuted}`}>Test 10 seg</span>
            </>
          )}
          {phase === 'running_wait' && (
            <>
              <span className="text-xs font-mono uppercase tracking-widest opacity-80">
                ESPERA...
              </span>
              <span className="text-2xl font-extrabold font-mono mt-1">
                {secondsLeft.toFixed(1)}s
              </span>
              <span className="text-[10px] mt-1 opacity-75">No pulses aún</span>
            </>
          )}
          {phase === 'running_go' && (
            <>
              <Zap className="w-8 h-8 mb-1 animate-bounce" />
              <span className="text-lg font-black tracking-tight">¡CLIC AHORA!</span>
              <span className="text-[11px] font-mono font-bold">
                {secondsLeft.toFixed(1)}s restantes
              </span>
            </>
          )}
          {phase === 'false_start' && (
            <>
              <AlertCircle className="w-7 h-7 mb-1" />
              <span className="text-xs font-bold">MUY PRONTO</span>
              <span className="text-[10px] opacity-85">Reajustando…</span>
            </>
          )}
          {phase === 'completed' && (
            <>
              <CheckCircle2 className="w-7 h-7 mb-1 text-emerald-400" />
              <span className="text-2xl font-black font-mono">{activeValue} ms</span>
              <span className="text-[11px] font-semibold mt-0.5">Repetir Test</span>
            </>
          )}
        </button>
      </div>

      {/* Status & Live Feedback */}
      <div className={`mt-3 p-3 rounded-xl border text-xs space-y-2 ${theme.cardSubtleBg}`}>
        <p className="font-medium leading-snug">{statusMessage}</p>

        <div className={`flex flex-wrap items-center justify-between gap-2 pt-1 border-t ${theme.divider} font-mono text-[11px]`}>
          <span>
            Último toque:{' '}
            <strong className="text-sky-400">
              {lastReaction !== null ? `${lastReaction} ms` : '—'}
            </strong>
          </span>
          <span>
            PVT activo:{' '}
            <strong
              className={
                activeValue > 345
                  ? 'text-rose-400'
                  : activeValue > 285
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }
            >
              {activeValue} ms
            </strong>
          </span>
        </div>

        {trials.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {trials.map((t, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 font-mono text-[10px]"
              >
                #{i + 1}: {t} ms
              </span>
            ))}
          </div>
        )}

        {/* Quick simulation buttons for presenter convenience */}
        <div className={`pt-2 border-t ${theme.divider} flex flex-wrap items-center justify-between gap-1.5`}>
          <span className={`text-[10px] ${theme.textMuted}`}>Simular reflejo rápido:</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => onApplyLivePvt(235)}
              className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
            >
              235 ms
            </button>
            <button
              type="button"
              onClick={() => onApplyLivePvt(315)}
              className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
            >
              315 ms
            </button>
            <button
              type="button"
              onClick={() => onApplyLivePvt(410)}
              className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25"
            >
              410 ms
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
