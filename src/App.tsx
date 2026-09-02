import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthPage } from './components/auth/AuthPage';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Toast } from './components/common/Toast';

// User views
import { UserDashboard } from './components/user/UserDashboard';
import { ChequeCardRegistryView } from './components/user/ChequeCardRegistryView';
import { LoanAccountDetailsView } from './components/user/LoanAccountDetailsView';
import { ChequeCardModal } from './components/user/ChequeCardModal';
import { UserProfileView } from './components/user/UserProfile';
import { UserSettingsView } from './components/user/UserSettings';
import { DenominationSegregationView } from './components/user/DenominationSegregationView';

// Admin views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserManagement } from './components/admin/UserManagement';
import { OutletManagement } from './components/admin/OutletManagement';
import { AfoTransferManagement } from './components/admin/AfoTransferManagement';
import { AccessDelegation } from './components/admin/AccessDelegation';
import { SystemSettings } from './components/admin/SystemSettings';
import { SqlSchemaViewer } from './components/admin/SqlSchemaViewer';
import { DenominationSegregationAdmin } from './components/admin/DenominationSegregationAdmin';

const MainLayout: React.FC = () => {
  const { authMode, activeNavTab, userPreferences, isAddEntryModalOpen, closeAddEntryModal, initialAddEntryType } = useApp();
  const isDark = userPreferences.theme === 'dark';

  if (authMode === 'NONE') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-3 sm:p-6 ${
        isDark ? 'bg-[#0F172A]' : 'bg-[#ECEFF2]'
      }`}>
        <Toast />
        <AuthPage />
      </div>
    );
  }

  const renderActiveView = () => {
        if (authMode === 'USER') {
      switch (activeNavTab) {
        case 'dashboard':
          return <UserDashboard />;
        case 'cheque_cards':
          return <ChequeCardRegistryView />;
        case 'loan_accounts':
          return <LoanAccountDetailsView />;
        case 'denomination_segregation':
          return <DenominationSegregationView />;
        case 'profile':
          return <UserProfileView />;
        case 'settings':
          return <UserSettingsView />;
        default:
          return <UserDashboard />;
      }
    } else if (authMode === 'ADMIN') {
      switch (activeNavTab) {
        case 'dashboard':
          return <AdminDashboard />;
        case 'users':
          return <UserManagement />;
        case 'outlets':
          return <OutletManagement />;
        case 'afo_transfer':
          return <AfoTransferManagement />;
        case 'delegation':
          return <AccessDelegation />;
        case 'system_settings':
          return <SystemSettings />;
        case 'sql_schema':
          return <SqlSchemaViewer />;
        default:
          return <AdminDashboard />;
      }
    }
    return null;
  };

  return (
    <div className={`min-h-screen p-2 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center ${
      isDark ? 'bg-[#0B0F17]' : 'bg-[#ECEFF2]'
    }`}>
      <Toast />
      
      {/* Universal Add Entry (Cheque vs Card) Modal */}
      <ChequeCardModal
        isOpen={isAddEntryModalOpen}
        onClose={closeAddEntryModal}
        initialType={initialAddEntryType}
      />
      
      {/* Aesthetic Rounded Outer Canvas matching the reference image */}
      <div className={`w-full max-w-[1400px] min-h-[92vh] rounded-[28px] md:rounded-[36px] border p-3 sm:p-6 md:p-8 flex flex-col md:flex-row gap-3 md:gap-6 ${
        isDark 
          ? 'bg-[#131B2A] border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.4)] text-slate-100' 
          : 'bg-[#F7F9FB] border-white/80 shadow-[0_15px_50px_rgba(0,0,0,0.04)] text-slate-900'
      }`}>
        {/* Docked Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 min-w-0">
            {renderActiveView()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
