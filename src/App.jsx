import React, { useEffect, useMemo, useState } from 'react';
import telemetryData from './data/astronaut_telemetry_180d.json';
import nasaCsaKb from './data/unified_nasa_csa_kb.json';
import { CIRCADIAN_MODES, getCircadianModeFromDate } from './utils/circadianThemes';
import { evaluateTelemetryDay } from './utils/clinicalEngine';
import CircadianHeader from './components/CircadianHeader';
import MissionSimulator from './components/MissionSimulator';
import SproutBotCopilot from './components/SproutBotCopilot';
import BiomarkerGrid from './components/BiomarkerGrid';
import PvtCognitiveTest from './components/PvtCognitiveTest';
import CountermeasuresPanel from './components/CountermeasuresPanel';
import MultiDeviceEcosystem from './components/MultiDeviceEcosystem';
import CsaDosimetryScanner from './components/CsaDosimetryScanner';
import VeggieNutritionModule from './components/VeggieNutritionModule';
import EarthTelemetryModal from './components/EarthTelemetryModal';

export default function App() {
  const [circadianMode, setCircadianMode] = useState(() => getCircadianModeFromDate());
  const [selectedDay, setSelectedDay] = useState(25);
  const [isPlaying, setIsPlaying] = useState(false);
  const [livePvtMs, setLivePvtMs] = useState(null);
  const [activeView, setActiveView] = useState('cockpit');
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);

  const theme = CIRCADIAN_MODES[circadianMode];
  const telemetry = telemetryData.telemetry;
  const thresholds = nasaCsaKb.clinical_thresholds;
  const knowledgeBase = nasaCsaKb.knowledge_base;

  // Auto-advance 180-day playback when enabled
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setSelectedDay((prev) => (prev >= 180 ? 1 : prev + 1));
    }, 1100);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleSelectDay = (day) => {
    setSelectedDay(day);
    setLivePvtMs(null);
  };

  const dayData = useMemo(
    () => telemetry.find((d) => d.mission_day === selectedDay) || telemetry[0],
    [telemetry, selectedDay]
  );

  const evaluation = useMemo(
    () => evaluateTelemetryDay(dayData, thresholds, knowledgeBase, livePvtMs),
    [dayData, thresholds, knowledgeBase, livePvtMs]
  );

  const handleJumpToView = (viewId) => {
    setActiveView(viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen circadian-transition ${theme.appBg}`}>
      <CircadianHeader
        mode={circadianMode}
        onSelectMode={setCircadianMode}
        theme={theme}
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenTelemetryModal={() => setIsTelemetryModalOpen(true)}
        dayData={dayData}
        overallStatus={evaluation.overallStatus}
      />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5 space-y-6">
        {/* Always-available 180-day Mission Simulator & Demo Milestones */}
        <MissionSimulator
          telemetry={telemetry}
          selectedDay={selectedDay}
          onSelectDay={handleSelectDay}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((p) => !p)}
          theme={theme}
        />

        {activeView === 'cockpit' && (
          <>
            {/* Interactive Sprout-Bot Copiloto */}
            <SproutBotCopilot
              evaluation={evaluation}
              circadianMode={circadianMode}
              theme={theme}
              onJumpToView={handleJumpToView}
            />

            {/* 6 Biomarkers + 10s Live PVT Cognitive Micro-Test */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
              <div className="xl:col-span-8">
                <BiomarkerGrid biomarkers={evaluation.biomarkers} theme={theme} />
              </div>
              <div className="xl:col-span-4 xl:mt-9">
                <PvtCognitiveTest
                  datasetPvtMs={dayData.metrics.pvt_reaction_ms}
                  livePvtMs={livePvtMs}
                  onApplyLivePvt={setLivePvtMs}
                  onResetLivePvt={() => setLivePvtMs(null)}
                  theme={theme}
                />
              </div>
            </div>

            {/* NASA HRP & CSA Countermeasures Engine */}
            <CountermeasuresPanel
              evaluation={evaluation}
              allRecords={knowledgeBase}
              theme={theme}
            />

            {/* Full Integrated Aerospace Modules Preview Section */}
            <div className="pt-2 space-y-6">
              <div className={`flex flex-wrap items-center justify-between gap-2 border-t ${theme.divider} pt-5`}>
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight">
                    Módulos Especializados de Salud Orbital (CSA · Veggie · Multi-Dispositivo)
                  </h2>
                  <p className={`text-xs ${theme.textMuted}`}>
                    También puedes abrir cada módulo de forma aislada desde las pestañas superiores.
                  </p>
                </div>
              </div>

              <CsaDosimetryScanner evaluation={evaluation} theme={theme} />
              <VeggieNutritionModule evaluation={evaluation} theme={theme} />
              <MultiDeviceEcosystem
                evaluation={evaluation}
                circadianMode={circadianMode}
                theme={theme}
              />
            </div>
          </>
        )}

        {activeView === 'devices' && (
          <MultiDeviceEcosystem
            evaluation={evaluation}
            circadianMode={circadianMode}
            theme={theme}
          />
        )}

        {activeView === 'dosimetry' && (
          <CsaDosimetryScanner evaluation={evaluation} theme={theme} />
        )}

        {activeView === 'veggie' && (
          <VeggieNutritionModule evaluation={evaluation} theme={theme} />
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t mt-8 py-5 px-4 sm:px-6 text-xs ${theme.divider} ${theme.textMuted}`}>
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong className={theme.textPrimary}>AURA-7</strong> · Equipo{' '}
            <strong className="text-sky-500">Andes Space Labs</strong> · NASA Space Apps Challenge 2026
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span>{telemetryData.mission_profile}</span>
            <span>·</span>
            <span>{nasaCsaKb.metadata.total_verified_records} registros NASA HRP &amp; CSA</span>
            <button
              type="button"
              onClick={() => setIsTelemetryModalOpen(true)}
              className={`font-semibold underline ${theme.accentText}`}
            >
              Generar Paquete Houston
            </button>
          </div>
        </div>
      </footer>

      {/* Asynchronous Earth Telemetry Packet Modal */}
      <EarthTelemetryModal
        isOpen={isTelemetryModalOpen}
        onClose={() => setIsTelemetryModalOpen(false)}
        evaluation={evaluation}
        circadianMode={circadianMode}
        theme={theme}
      />
    </div>
  );
}
