import React, { useState } from 'react';
import {
  Sprout,
  Droplets,
  Sun,
  Utensils,
  Sparkles,
  ExternalLink,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';

const NUTRIENTS = [
  {
    id: 'omega3',
    name: 'Ácidos Grasos Omega-3',
    dose: '2.0 g / día',
    benefit: 'Protege función cardiovascular, mitiga inflamación neuro-ocular (SANS) y preserva masa muscular.',
    color: 'text-sky-400 bg-sky-500/15 border-sky-500/35',
  },
  {
    id: 'lycopene',
    name: 'Licopeno (Carotenoide)',
    dose: '15 mg / día',
    benefit: 'Antioxidante contra daño oxidativo por radiación ionizante y soporte inmunológico.',
    color: 'text-rose-400 bg-rose-500/15 border-rose-500/35',
  },
  {
    id: 'flavonoids',
    name: 'Flavonoides & Polifenoles',
    dose: '400 mg / día',
    benefit: 'Equilibra el microbioma intestinal en espacio confinado y combate fatiga cognitiva.',
    color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/35',
  },
];

export default function VeggieNutritionModule({ evaluation, theme }) {
  const [hydrationPct, setHydrationPct] = useState(78);
  const [ledSpectrum, setLedSpectrum] = useState('magenta'); // 'magenta' | 'daylight'
  const [harvestCount, setHarvestCount] = useState(2);
  const [checkedNutrients, setCheckedNutrients] = useState({
    omega3: true,
    lycopene: false,
    flavonoids: true,
  });

  const { dayData, effectivePvt } = evaluation;
  const m = dayData.metrics;

  const highStressDay =
    m.sleep_hours < 7.0 ||
    effectivePvt > 285 ||
    m.cabin_co2_mmhg > 2.5 ||
    dayData.solar_particle_event;

  const handleWater = () => {
    setHydrationPct((prev) => Math.min(100, prev + 14));
  };

  const handleHarvest = () => {
    setHarvestCount((c) => c + 1);
    setHydrationPct((prev) => Math.max(45, prev - 10));
  };

  const toggleNutrient = (id) => {
    setCheckedNutrients((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className={`rounded-2xl border p-5 sm:p-6 circadian-transition ${theme.cardBg}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
              Módulo Veggie Garden &amp; Space Nutrition (Mostaza Mizuna)
            </h2>
          </div>
          <p className={`text-xs mt-0.5 ${theme.textMuted}`}>
            Botánica terapéutica (`HRP-RES-010` / `HRP-RES-012`) y dieta mejorada anti-fatiga de menú (`HRP-RES-008` / `HRP-RES-009`)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://www.nasa.gov/humans-in-space/can-space-gardening-help-astronauts-cope-with-isolation/"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 text-xs font-semibold hover:underline ${theme.accentText}`}
          >
            <span>HRP-RES-010</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="opacity-30">|</span>
          <a
            href="https://www.nasa.gov/missions/station/enhanced-diet-may-help-astronauts-adapt-to-spaceflight/"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 text-xs font-semibold hover:underline ${theme.accentText}`}
          >
            <span>HRP-RES-009</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* LEFT: Interactive Veggie Growth Chamber */}
        <div
          className={`lg:col-span-6 rounded-2xl border p-4 flex flex-col justify-between gap-4 ${theme.cardSubtleBg}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Cámara Veggie · Brassica rapa (Mizuna)
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Cosechas: {harvestCount}
            </span>
          </div>

          {/* Animated Veggie Chamber SVG */}
          <div className="relative rounded-xl border border-pink-500/30 bg-[#0b101f] overflow-hidden p-4 flex flex-col items-center justify-center min-h-[220px]">
            {/* LED Grow Light Canopy */}
            <div
              className={`w-full max-w-[260px] h-3 rounded-full mb-2 transition-all duration-500 ${
                ledSpectrum === 'magenta'
                  ? 'bg-gradient-to-r from-pink-500 via-fuchsia-400 to-indigo-500 shadow-[0_8px_30px_rgba(236,72,153,0.75)]'
                  : 'bg-gradient-to-r from-sky-300 via-white to-amber-200 shadow-[0_8px_28px_rgba(125,211,252,0.65)]'
              }`}
            />

            <svg viewBox="0 0 260 155" className="w-64 h-40">
              {/* Light beams */}
              <polygon
                points="28,4 232,4 250,145 10,145"
                fill={
                  ledSpectrum === 'magenta'
                    ? 'rgba(236, 72, 153, 0.10)'
                    : 'rgba(186, 230, 253, 0.10)'
                }
              />

              {/* Plant Pillows (3 bags of substrate + fertilizer) */}
              <rect x="26" y="114" width="60" height="24" rx="7" fill="#334155" stroke="#64748b" />
              <rect x="100" y="114" width="60" height="24" rx="7" fill="#334155" stroke="#64748b" />
              <rect x="174" y="114" width="60" height="24" rx="7" fill="#334155" stroke="#64748b" />
              <text x="56" y="129" textAnchor="middle" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
                PILLOW A
              </text>
              <text x="130" y="129" textAnchor="middle" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
                PILLOW B
              </text>
              <text x="204" y="129" textAnchor="middle" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
                PILLOW C
              </text>

              {/* Mizuna Mustard Leaves */}
              <g className="animate-float-slow">
                {/* Cluster 1 */}
                <path d="M56 114 Q42 74 30 82 Q36 104 56 114 Z" fill="#22c55e" />
                <path d="M56 114 Q56 64 68 72 Q70 98 56 114 Z" fill="#4ade80" />
                <path d="M56 114 Q74 80 82 88 Q74 106 56 114 Z" fill="#16a34a" />
                {/* Cluster 2 */}
                <path d="M130 114 Q112 66 100 76 Q106 104 130 114 Z" fill="#16a34a" />
                <path d="M130 114 Q128 52 142 62 Q146 96 130 114 Z" fill="#4ade80" />
                <path d="M130 114 Q152 72 162 82 Q152 106 130 114 Z" fill="#22c55e" />
                {/* Cluster 3 */}
                <path d="M204 114 Q188 74 178 84 Q184 104 204 114 Z" fill="#4ade80" />
                <path d="M204 114 Q204 64 216 74 Q218 98 204 114 Z" fill="#22c55e" />
                <path d="M204 114 Q224 80 232 90 Q222 108 204 114 Z" fill="#86efac" />
              </g>
            </svg>

            <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-300 mt-1">
              <span>Humedad sustrato: {hydrationPct}%</span>
              <span>Microbioma: Vigilado (JSC)</span>
            </div>
          </div>

          {/* Interactive Garden Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleWater}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/35 hover:bg-cyan-500/30 transition"
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>Regar Pillows</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setLedSpectrum((s) => (s === 'magenta' ? 'daylight' : 'magenta'))
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/35 hover:bg-fuchsia-500/25 transition"
              >
                <Sun className="w-3.5 h-3.5" />
                <span>{ledSpectrum === 'magenta' ? 'LED Rojo/Azul' : 'LED Blanco 6500K'}</span>
              </button>
            </div>
            <button
              type="button"
              onClick={handleHarvest}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-stone-950 hover:bg-emerald-400 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cosechar Hojas Frescas</span>
            </button>
          </div>
        </div>

        {/* RIGHT: Space Nutrition & Microbiome Supplementation */}
        <div
          className={`lg:col-span-6 rounded-2xl border p-4 flex flex-col justify-between gap-4 ${theme.cardSubtleBg}`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Utensils className={`w-4 h-4 ${theme.accentText}`} />
                <h3 className="text-sm font-bold">
                  Prescripción Nutricional &amp; Microbioma (Día {dayData.mission_day})
                </h3>
              </div>
              {highStressDay && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/35">
                  Refuerzo Anti-Estrés Activo
                </span>
              )}
            </div>

            <p className={`text-xs leading-relaxed ${theme.textSecondary}`}>
              La suplementación con <strong>omega-3</strong>, <strong>licopeno</strong> y{' '}
              <strong>flavonoides</strong> protege la inmunidad y el microbioma intestinal, mientras que la cosecha de mostaza mizuna reduce la fatiga de menú y el aislamiento psicológico.
            </p>
          </div>

          {/* 3 Supplement Interactive Checklists */}
          <div className="space-y-2.5">
            {NUTRIENTS.map((nut) => {
              const taken = !!checkedNutrients[nut.id];
              return (
                <button
                  key={nut.id}
                  type="button"
                  onClick={() => toggleNutrient(nut.id)}
                  className={`w-full text-left rounded-xl border p-3 transition flex items-start justify-between gap-3 ${
                    taken ? nut.color : `${theme.cardBg} opacity-80 hover:opacity-100`
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold">{nut.name}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/20">
                        {nut.dose}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-90 leading-snug">{nut.benefit}</p>
                  </div>
                  <div className="shrink-0 mt-0.5">
                    <CheckCircle2
                      className={`w-5 h-5 ${
                        taken ? 'text-emerald-400' : 'opacity-30'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5 text-xs">
            <HeartHandshake className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Beneficio Psicológico (`HRP-RISK-012`):</strong> Cuidar un “pulgar verde espacial” aporta un recordatorio tangible de la Tierra en misiones superiores a 140 días.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
