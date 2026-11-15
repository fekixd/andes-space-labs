import React from 'react';
import {
  LayoutDashboard,
  Activity,
  Radiation,
  Sprout,
  Brain,
  ScrollText,
  Watch,
  ShieldCheck,
} from 'lucide-react';

export const NAV_MODULES = [
  {
    id: 'overview',
    num: '01',
    label: 'Dashboard',
    sublabel: 'Resumen & Sprout-Bot',
    Icon: LayoutDashboard,
  },
  {
    id: 'health',
    num: '02',
    label: 'Salud & Tendencias',
    sublabel: 'Biomarcadores 180d',
    Icon: Activity,
  },
  {
    id: 'radiation',
    num: '03',
    label: 'Radiación & EVARM',
    sublabel: 'Escáner CSA / Radi-N2',
    Icon: Radiation,
  },
  {
    id: 'wellness',
    num: '04',
    label: 'Bienestar & Veggie',
    sublabel: 'Nutrición, ARED & Sueño',
    Icon: Sprout,
  },
  {
    id: 'cognition',
    num: '05',
    label: 'Cognición (PVT)',
    sublabel: 'Prueba Reacción en Vivo',
    Icon: Brain,
  },
  {
    id: 'mission',
    num: '06',
    label: 'Misión, Tierra & Bitácora',
    sublabel: 'Historial de Alertas',
    Icon: ScrollText,
  },
  {
    id: 'ecosystem',
    num: '07',
    label: 'Ecosistema Cabina',
    sublabel: 'Reloj, Visor EVA & LED',
    Icon: Watch,
  },
];

export default function SidebarNav({
  activeModule,
  onSelectModule,
  evaluation,
  alertLogCount,
  theme,
  mobileMenuOpen,
  onCloseMobileMenu,
}) {
  const { criticalCount, warningCount, isSpeWindow, hasAnyLiveOverride } = evaluation;

  const getBadge = (id) => {
    if (id === 'overview' && criticalCount > 0) {
      return { text: `${criticalCount} Crít.`, cls: 'bg-rose-500 text-white' };
    }
    if (id === 'health' && (criticalCount > 0 || warningCount > 0)) {
      return {
        text: `${criticalCount + warningCount}`,
        cls: criticalCount > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400',
      };
    }
    if (id === 'radiation' && isSpeWindow) {
      return { text: 'SPE', cls: 'bg-rose-500 text-white animate-pulse' };
    }
    if (id === 'cognition' && hasAnyLiveOverride) {
      return { text: 'VIVO', cls: 'bg-cyan-500/20 text-cyan-400' };
    }
    if (id === 'mission') {
      return { text: String(alertLogCount), cls: 'bg-slate-500/20 text-slate-400' };
    }
    return null;
  };

  const navContent = (
    <div className="flex flex-col justify-between h-full gap-4">
      <div className="space-y-1.5">
        <div className={`px-3 pb-1 text-[10px] font-bold uppercase tracking-widest ${theme.textMuted}`}>
          Navegación Modular (7 Vistas)
        </div>
        {NAV_MODULES.map((mod) => {
          const active = activeModule === mod.id;
          const Icon = mod.Icon;
          const badge = getBadge(mod.id);
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => {
                onSelectModule(mod.id);
                onCloseMobileMenu?.();
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between gap-2 transition-all border ${
                active
                  ? `${theme.pillActive} border-transparent`
                  : `border-transparent ${theme.pillInactive}`
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className="w-4 h-4 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">
                    <span className="font-mono opacity-70 mr-1">{mod.num}.</span>
                    {mod.label}
                  </div>
                  <div
                    className={`text-[10px] truncate ${
                      active ? 'opacity-90' : theme.textMuted
                    }`}
                  >
                    {mod.sublabel}
                  </div>
                </div>
              </div>
              {badge && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 ${badge.cls}`}
                >
                  {badge.text}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Circadian Spectrum Status Card inside Sidebar */}
      <div className={`rounded-xl border p-3 text-[11px] space-y-1.5 ${theme.cardSubtleBg}`}>
        <div className="flex items-center gap-1.5 font-bold">
          <ShieldCheck className={`w-3.5 h-3.5 ${theme.accentText}`} />
          <span>Espectro Circadiano</span>
        </div>
        <div className="font-mono font-semibold text-xs">{theme.spectrumLabel}</div>
        <div className={theme.textMuted}>{theme.melatoninState}</div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden lg:block w-64 shrink-0 rounded-2xl border p-3.5 self-start sticky top-20 circadian-transition ${theme.cardBg}`}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseMobileMenu}
          />
          <aside
            className={`relative z-10 w-72 max-w-[85vw] h-full p-4 overflow-y-auto border-r ${
              theme.isDark ? 'bg-[#091227] border-indigo-400/20' : 'bg-white border-sky-200'
            }`}
          >
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
