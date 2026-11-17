import React from 'react';
import { MineProvider, useMine } from './context/MineContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { DemoControlModal } from './components/common/DemoControlModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { NodeDetailDrawer } from './components/common/NodeDetailDrawer';
import { AddNodeModal } from './components/common/AddNodeModal';

import { OverviewView } from './components/views/OverviewView';
import { DigitalTwinView } from './components/views/DigitalTwinView';
import { SensorNodesView } from './components/views/SensorNodesView';
import { AiRiskView } from './components/views/AiRiskView';
import { DataAnalyticsView } from './components/views/DataAnalyticsView';
import { NetworkTopologyView } from './components/views/NetworkTopologyView';
import { AlertsView } from './components/views/AlertsView';
import { GisEnvironmentView } from './components/views/GisEnvironmentView';
import { MaintenanceView } from './components/views/MaintenanceView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';

const MainContent: React.FC = () => {
  const { activeView } = useMine();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b0f17]">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0b0f17]">
          {activeView === 'overview' && <OverviewView />}
          {activeView === 'digital_twin' && <DigitalTwinView />}
          {activeView === 'nodes' && <SensorNodesView />}
          {activeView === 'ai_risk' && <AiRiskView />}
          {activeView === 'analytics' && <DataAnalyticsView />}
          {activeView === 'network' && <NetworkTopologyView />}
          {activeView === 'alerts' && <AlertsView />}
          {activeView === 'gis' && <GisEnvironmentView />}
          {activeView === 'maintenance' && <MaintenanceView />}
          {activeView === 'reports' && <ReportsView />}
          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Persistent Modals & Drawers */}
      <DemoControlModal />
      <NotificationDrawer />
      <NodeDetailDrawer />
      <AddNodeModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <MineProvider>
      <MainContent />
    </MineProvider>
  );
};

export default App;
