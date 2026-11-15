import React, { useEffect, useMemo, useState } from 'react';
import telemetryData from './data/astronaut_telemetry_180d.json';
import nasaCsaKb from './data/unified_nasa_csa_kb.json';
import { CIRCADIAN_MODES, getCircadianModeFromDate } from './utils/circadianThemes';
import { evaluateDay } from './services/evaluationEngine';
import { computeMetricHistories, buildMissionAlertLog } from './services/historyService';
import { inferPsychologicalState } from './services/psychologicalInferenceEngine';
import TopEarthHeader from './components/global/TopEarthHeader';
import SidebarNav from './components/global/SidebarNav';
import BottomMissionSimulator from './components/global/BottomMissionSimulator';
import EarthSyncPacketModal from './components/global/EarthSyncPacketModal';
import SproutBotFloatingWidget from './components/copilot/SproutBotFloatingWidget';
import DashboardOverview from './components/modules/1_DashboardOverview';
import HealthTrendsModule from './components/modules/2_HealthTrendsModule';
import RadiationEvarmModule from './components/modules/3_RadiationEvarmModule';
import WellnessVeggieModule from './components/modules/4_WellnessVeggieModule';
import DiagnosticSuiteModule from './components/modules/5_DiagnosticSuiteModule';
import MissionAlertLogModule from './components/modules/6_MissionAlertLogModule';
import MultiDeviceEcosystem from './components/modules/7_MultiDeviceEcosystem';

export default function App() {
  const [circadianMode, setCircadianMode] = useState(() => getCircadianModeFromDate());
  const [selectedDay, setSelectedDay] = useState(25);
  const [activeModule, setActiveModule] = useState('overview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [liveDemoOverrides, setLiveDemoOverrides] = useState({});
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const theme = CIRCADIAN_MODES[circadianMode];
  const telemetry = telemetryData.telemetry;
  const thresholds = nasaCsaKb.clinical_thresholds;
  const knowledgeBase = nasaCsaKb.knowledge_base;

  // Auto-advance 180-day simulator when playing
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setSelectedDay((prev) => (prev >= 180 ? 1 : prev + 1));
      setLiveDemoOverrides({});
    }, 1200);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleSelectDay = (day) => {
    const clamped = Math.max(1, Math.min(180, day));
    setSelectedDay(clamped);
    setLiveDemoOverrides({});
  };

  const handleSelectModule = (moduleId) => {
    setActiveModule(moduleId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const dayData = useMemo(
    () => telemetry.find((d) => d.mission_day === selectedDay) || telemetry[0],
    [telemetry, selectedDay]
  );

  const prevDayData = useMemo(
    () => (selectedDay > 1 ? telemetry.find((d) => d.mission_day === selectedDay - 1) || null : null),
    [telemetry, selectedDay]
  );

  const evaluation = useMemo(
    () =>
      evaluateDay({
        dayData,
        prevDayData,
        thresholds,
        knowledgeBase,
        liveDemoOverrides,
      }),
    [dayData, prevDayData, thresholds, knowledgeBase, liveDemoOverrides]
  );

  const histories = useMemo(
    () => computeMetricHistories(telemetry, selectedDay, liveDemoOverrides),
    [telemetry, selectedDay, liveDemoOverrides]
  );

  const alertLog = useMemo(
    () => buildMissionAlertLog(telemetry, selectedDay, thresholds, knowledgeBase, liveDemoOverrides),
    [telemetry, selectedDay, thresholds, knowledgeBase, liveDemoOverrides]
  );

  const psychInference = useMemo(
    () =>
      inferPsychologicalState({
        telemetry,
        selectedDay,
        evaluation,
        liveDemoOverrides,
        knowledgeBase,
        circadianMode,
      }),
    [telemetry, selectedDay, evaluation, liveDemoOverrides, knowledgeBase, circadianMode]
  );

  const handleTriggerCopilotAction = (actionPrompt) => {
    if (!actionPrompt) return;
    if (actionPrompt.actionType === 'attenuate_lights') {
      setCircadianMode((prev) => (prev === 'sunset' ? 'night' : 'sunset'));
      return;
    }
    if (actionPrompt.actionType === 'navigate' && actionPrompt.targetModule) {
      handleSelectModule(actionPrompt.targetModule);
    }
  };

  const handleApplyLivePvt = (ms) => {
    setLiveDemoOverrides((prev) => ({ ...prev, pvt_reaction_ms: ms }));
  };

  const handleResetLivePvt = () => {
    setLiveDemoOverrides((prev) => {
      const next = { ...prev };
      delete next.pvt_reaction_ms;
      return next;
    });
  };

  const handleSyncLiveOverrides = (overridesObj) => {
    setLiveDemoOverrides((prev) => ({ ...prev, ...overridesObj }));
  };

  const handleResetAllLiveOverrides = () => {
    setLiveDemoOverrides({});
  };

  return (
    <div className={`min-h-screen circadian-transition ${theme.appBg}`}>
      {/* Fixed Top Earth & Autonomy Header */}
      <TopEarthHeader
        selectedDay={selectedDay}
        dayData={dayData}
        circadianMode={circadianMode}
        onSelectMode={setCircadianMode}
        theme={theme}
        onOpenTelemetryModal={() => setIsTelemetryModalOpen(true)}
        hasAnyLiveOverride={evaluation.hasAnyLiveOverride}
        overallMeta={evaluation.overallMeta}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((v) => !v)}
      />

      {/* Progressive Disclosure Main Shell */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 pt-28 xl:pt-20 pb-36 sm:pb-32 flex gap-5">
        <SidebarNav
          activeModule={activeModule}
          onSelectModule={handleSelectModule}
          evaluation={evaluation}
          alertLogCount={alertLog.length}
          theme={theme}
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 min-w-0">
          {activeModule === 'overview' && (
            <DashboardOverview
              evaluation={evaluation}
              psychInference={psychInference}
              circadianMode={circadianMode}
              theme={theme}
              onNavigateModule={handleSelectModule}
              onTriggerCopilotAction={handleTriggerCopilotAction}
            />
          )}

          {activeModule === 'health' && (
            <HealthTrendsModule
              evaluation={evaluation}
              histories={histories}
              selectedDay={selectedDay}
              theme={theme}
            />
          )}

          {activeModule === 'radiation' && (
            <RadiationEvarmModule
              evaluation={evaluation}
              knowledgeBase={knowledgeBase}
              histories={histories}
              selectedDay={selectedDay}
              thresholds={thresholds}
              circadianMode={circadianMode}
              theme={theme}
            />
          )}

          {activeModule === 'wellness' && (
            <WellnessVeggieModule
              evaluation={evaluation}
              knowledgeBase={knowledgeBase}
              theme={theme}
            />
          )}

          {activeModule === 'cognition' && (
            <DiagnosticSuiteModule
              evaluation={evaluation}
              histories={histories}
              knowledgeBase={knowledgeBase}
              liveDemoOverrides={liveDemoOverrides}
              onApplyLivePvt={handleApplyLivePvt}
              onResetLivePvt={handleResetLivePvt}
              onSyncLiveOverrides={handleSyncLiveOverrides}
              onResetAllLiveOverrides={handleResetAllLiveOverrides}
              circadianMode={circadianMode}
              theme={theme}
            />
          )}

          {activeModule === 'mission' && (
            <MissionAlertLogModule
              alertLog={alertLog}
              selectedDay={selectedDay}
              dayData={dayData}
              circadianMode={circadianMode}
              onSelectMode={setCircadianMode}
              onOpenTelemetryModal={() => setIsTelemetryModalOpen(true)}
              theme={theme}
            />
          )}

          {activeModule === 'ecosystem' && (
            <MultiDeviceEcosystem
              evaluation={evaluation}
              psychInference={psychInference}
              selectedDay={selectedDay}
              circadianMode={circadianMode}
              knowledgeBase={knowledgeBase}
              theme={theme}
            />
          )}
        </main>
      </div>

      {/* Global Autonomous Psychological Inference Companion HUD Overlay (v2.3) */}
      <SproutBotFloatingWidget
        inference={psychInference}
        evaluation={evaluation}
        selectedDay={selectedDay}
        circadianMode={circadianMode}
        liveDemoOverrides={liveDemoOverrides}
        theme={theme}
        onTriggerAction={handleTriggerCopilotAction}
      />

      {/* Fixed Bottom 180-Day Mission Simulator */}
      <BottomMissionSimulator
        selectedDay={selectedDay}
        onSelectDay={handleSelectDay}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((p) => !p)}
        theme={theme}
      />

      {/* Asynchronous Earth Telemetry Packet Modal */}
      <EarthSyncPacketModal
        isOpen={isTelemetryModalOpen}
        onClose={() => setIsTelemetryModalOpen(false)}
        evaluation={evaluation}
        circadianMode={circadianMode}
        theme={theme}
      />
    </div>
  );
}
