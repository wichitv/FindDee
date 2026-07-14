import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import SearchPage from './pages/SearchPage';
import SyncDashboardPage from './pages/SyncDashboardPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import Sidebar from './components/Sidebar';
import { getCurrentUser, logout } from './services/authService';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(() => getCurrentUser());

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setCurrentPage('landing');
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setCurrentPage('landing');
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <React.StrictMode>
      <div className="flex h-screen overflow-hidden">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} user={user} onLogout={handleLogout} />
        <div className="flex-1 overflow-y-auto">
          {currentPage === 'dashboard' ? (
            <DashboardPage onNavigate={setCurrentPage} user={user} onLogout={handleLogout} />
          ) : currentPage === 'landing' ? (
            <LandingPage onNavigate={setCurrentPage} user={user} onLogout={handleLogout} />
          ) : currentPage === 'search' ? (
            <SearchPage onNavigate={setCurrentPage} user={user} onLogout={handleLogout} />
          ) : currentPage === 'sync' ? (
            <SyncDashboardPage onNavigate={setCurrentPage} user={user} onLogout={handleLogout} />
          ) : (
            <LandingPage onNavigate={setCurrentPage} user={user} onLogout={handleLogout} />
          )}
        </div>
      </div>
    </React.StrictMode>
  );
}

export default App;


