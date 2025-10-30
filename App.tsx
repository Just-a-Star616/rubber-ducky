

import React, { useState, useEffect } from 'react';
import Login from './views/Login';
import StaffDashboard from './views/staff/StaffDashboard';
import DriverPortal from './views/driver/DriverPortal';
import { themes, hexToRgb, hexToHsl } from './lib/themes';
import { DriverApplication, Driver } from './types';
import DriverSignUp from './views/driver/DriverSignUp';
import ApplicantPortal from './views/driver/ApplicantPortal';
// FIX: Import `mockDriverApplications` from the correct mock data file path to resolve the module resolution error.
import { mockDriverApplications, mockDrivers } from './lib/mockData';
import CreatePassword from './views/driver/CreatePassword';


type AppState = 'login' | 'signUp' | 'createPassword' | 'applicantPortal' | 'staffDashboard' | 'driverPortal';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(() => {
    const savedState = sessionStorage.getItem('appState') as AppState | null;
    return savedState || 'login';
  });
  
  const [applicantData, setApplicantData] = useState<DriverApplication | null>(() => {
      const savedApplicant = sessionStorage.getItem('applicantData');
      return savedApplicant ? JSON.parse(savedApplicant) : null;
  });
  
  const [loggedInDriver, setLoggedInDriver] = useState<Driver | null>(() => {
      const savedDriver = sessionStorage.getItem('loggedInDriver');
      return savedDriver ? JSON.parse(savedDriver) : null;
  });

  // To simulate a database of applications for login
  const [submittedApplications, setSubmittedApplications] = useState<DriverApplication[]>(mockDriverApplications);
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedPref = window.localStorage.getItem('isDarkMode');
      if (storedPref) return JSON.parse(storedPref);
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  const [themeName, setThemeName] = useState<string>(() => {
    return typeof window !== 'undefined' ? window.localStorage.getItem('themeName') || 'Papaya' : 'Papaya';
  });

  useEffect(() => {
    sessionStorage.setItem('appState', appState);
    if (applicantData) {
      sessionStorage.setItem('applicantData', JSON.stringify(applicantData));
    } else {
      sessionStorage.removeItem('applicantData');
    }
    if (loggedInDriver) {
        sessionStorage.setItem('loggedInDriver', JSON.stringify(loggedInDriver));
    } else {
        sessionStorage.removeItem('loggedInDriver');
    }
  }, [appState, applicantData, loggedInDriver]);

  useEffect(() => {
    if (appState === 'driverPortal' && !loggedInDriver) {
        setAppState('login');
    }
  }, [appState, loggedInDriver]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
        // Only change if user hasn't manually set a preference
        if (localStorage.getItem('isDarkMode') === null) {
            setIsDarkMode(e.matches);
        }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    const selectedTheme = themes.find(t => t.name === themeName);
    if (!selectedTheme) return;

    const colors = isDarkMode ? selectedTheme.dark : selectedTheme.light;
    const root = document.documentElement;

    // Set original RGB-based variables for legacy components
    Object.entries(colors.primary).forEach(([key, value]) => {
        root.style.setProperty(`--color-primary-${key}`, hexToRgb(value));
    });
    root.style.setProperty('--color-background', hexToRgb(colors.background));
    root.style.setProperty('--color-foreground', hexToRgb(colors.foreground));
    root.style.setProperty('--color-card', hexToRgb(colors.card));
    root.style.setProperty('--color-card-foreground', hexToRgb(colors['card-foreground']));
    root.style.setProperty('--color-sidebar', hexToRgb(colors.sidebar));
    root.style.setProperty('--color-sidebar-foreground', hexToRgb(colors['sidebar-foreground']));
    root.style.setProperty('--color-border', hexToRgb(colors.border));
    root.style.setProperty('--color-input', hexToRgb(colors.input));

    // Set HSL-based variables for shadcn components
    root.style.setProperty('--background', hexToHsl(colors.background));
    root.style.setProperty('--foreground', hexToHsl(colors.foreground));
    root.style.setProperty('--card', hexToHsl(colors.card));
    root.style.setProperty('--card-foreground', hexToHsl(colors['card-foreground']));
    root.style.setProperty('--popover', hexToHsl(colors.card));
    root.style.setProperty('--popover-foreground', hexToHsl(colors['card-foreground']));
    root.style.setProperty('--primary', hexToHsl(isDarkMode ? colors.primary['600'] : colors.primary['500']));
    root.style.setProperty('--primary-foreground', hexToHsl(isDarkMode ? colors.primary['50'] : colors.primary['950']));
    root.style.setProperty('--secondary', hexToHsl(colors.primary['100']));
    root.style.setProperty('--secondary-foreground', hexToHsl(colors.primary['900']));
    root.style.setProperty('--muted', hexToHsl(isDarkMode ? colors.primary['900'] : colors.primary['100']));
    root.style.setProperty('--muted-foreground', hexToHsl(isDarkMode ? colors.primary['200'] : colors.primary['800']));
    root.style.setProperty('--accent', hexToHsl(colors.primary['200']));
    root.style.setProperty('--accent-foreground', hexToHsl(colors.primary['900']));
    root.style.setProperty('--border', hexToHsl(colors.border));
    root.style.setProperty('--input', hexToHsl(colors.input));
    root.style.setProperty('--ring', hexToHsl(colors.primary['400']));
    
    // Set destructive colors (not in themes, so hardcoded)
    if (isDarkMode) {
        root.style.setProperty('--destructive', '0 63% 31%');
        root.style.setProperty('--destructive-foreground', '0 0% 98%');
    } else {
        root.style.setProperty('--destructive', '0 84% 60%');
        root.style.setProperty('--destructive-foreground', '0 0% 98%');
    }

    localStorage.setItem('themeName', themeName);
  }, [themeName, isDarkMode]);

  const handleLogin = (role: 'staff' | 'driver', email: string) => {
    if (role === 'staff') {
        setAppState('staffDashboard');
    }
    if (role === 'driver') {
        const driver = mockDrivers.find(d => d.email.toLowerCase() === email.toLowerCase());
        if (driver) {
            setLoggedInDriver(driver);
            setAppState('driverPortal');
        } else {
            alert('Login failed: driver not found.');
        }
    }
  };

  const handleLogout = () => {
    setAppState('login');
    setApplicantData(null);
    setLoggedInDriver(null);
  };
  
  const handleNavigateToSignUp = () => {
    setAppState('signUp');
  };
  
  const handleApplicationSubmit = (application: Omit<DriverApplication, 'id' | 'applicationDate' | 'notes' | 'status' | 'siteId'>) => {
    const fullApplication: DriverApplication = {
      ...application,
      id: `APP-${Date.now()}`,
      applicationDate: new Date().toISOString(),
      notes: [],
      status: 'Under Review',
      siteId: 'SITE01', // This would be determined dynamically in a real app, e.g., based on area
    };
    setApplicantData(fullApplication);
    setSubmittedApplications(prev => [...prev, fullApplication]);
    setAppState('createPassword');
  };

  const handlePasswordCreate = (password: string) => {
    if (!applicantData) return;
    const applicationWithPassword = { ...applicantData, password };
    setApplicantData(applicationWithPassword);
    setSubmittedApplications(prev => prev.map(app => app.id === applicantData.id ? applicationWithPassword : app));
    setAppState('applicantPortal');
  };
  
  const handleApplicantLogin = (email: string, password: string): boolean => {
    const foundApplication = submittedApplications.find(app => app.email.toLowerCase() === email.toLowerCase() && app.password === password);
    if (foundApplication) {
      setApplicantData(foundApplication);
      setAppState('applicantPortal');
      return true;
    }
    return false;
  };

  const handleUpdateApplication = (updatedApp: DriverApplication) => {
      setApplicantData(updatedApp);
      setSubmittedApplications(prev => prev.map(app => app.id === updatedApp.id ? updatedApp : app));
  };

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const commonProps = {
    isDarkMode,
    toggleDarkMode,
    handleLogout,
    themeName,
    setThemeName,
  };

  const renderContent = () => {
    switch(appState) {
        case 'login':
            return <Login onLogin={handleLogin} onSignUpClick={handleNavigateToSignUp} onApplicantLogin={handleApplicantLogin} />;
        case 'signUp':
            return <DriverSignUp onApplicationSubmit={handleApplicationSubmit} onBackToLogin={() => setAppState('login')} />;
        case 'createPassword':
            return <CreatePassword applicant={applicantData!} onPasswordCreate={handlePasswordCreate} />;
        case 'applicantPortal':
            return <ApplicantPortal application={applicantData!} handleLogout={handleLogout} onUpdateApplication={handleUpdateApplication} />;
        case 'staffDashboard':
            return <StaffDashboard {...commonProps} />;
        case 'driverPortal':
            return <DriverPortal driver={loggedInDriver!} {...commonProps} />;
        default:
            return <Login onLogin={handleLogin} onSignUpClick={handleNavigateToSignUp} onApplicantLogin={handleApplicantLogin} />;
    }
  }

  return (
    <div className="min-h-screen transition-colors duration-300">
      {renderContent()}
    </div>
  );
};

export default App;