
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { UserGroupIcon, ShieldExclamationIcon, UserPlusIcon, ClipboardDocumentCheckIcon } from '../components/icons/Icon';
import { Input } from '../components/ui/input';
import { getBrandingConfig } from '../lib/branding';

interface LoginProps {
  onLogin: (role: 'staff' | 'driver', email: string) => void;
  onSignUpClick: () => void;
  onApplicantLogin: (email: string, password: string) => boolean;
}

type LoginRole = 'staff' | 'driver' | 'applicant';

const Login: React.FC<LoginProps> = ({ onLogin, onSignUpClick, onApplicantLogin }) => {
  const [view, setView] = useState<'selection' | 'login'>('selection');
  const [loginRole, setLoginRole] = useState<LoginRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [branding, setBranding] = useState(getBrandingConfig());

  // Listen for branding changes from other components
  useEffect(() => {
    const handleStorageChange = () => {
      setBranding(getBrandingConfig());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleRoleSelect = (role: LoginRole) => {
    setLoginRole(role);
    setView('login');
    setError('');
  };

  const handleBack = () => {
    setView('selection');
    setLoginRole(null);
    setError('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (loginRole === 'applicant') {
      const success = onApplicantLogin(email, password);
      if (!success) {
        setError('Invalid email or password.');
      }
    } else if (loginRole === 'staff' || loginRole === 'driver') {
        // Accept demo credentials
        const validCredentials = [
          { email: 'staff@demo.com', password: 'demo123', role: 'staff' as const },
          { email: 'driver@demo.com', password: 'demo123', role: 'driver' as const },
          // Legacy credentials for backward compatibility
          { email: 'j@example.com', password: 'password123', role: 'staff' as const },
          { email: 'j@example.com', password: 'password123', role: 'driver' as const },
        ];
        
        const isValid = validCredentials.some(
          cred => cred.email.toLowerCase() === email.toLowerCase() && 
                  cred.password === password &&
                  cred.role === loginRole
        );
        
        if (isValid) {
            onLogin(loginRole, email);
        } else {
            setError('Invalid email or password. Use the demo credentials shown above.');
        }
    }
  };

  const roleTitles: { [key in LoginRole]: string } = {
    staff: 'Staff Login',
    driver: 'Driver Login',
    applicant: 'Track Application',
  };

  // Demo credentials component
  const DemoCredentials = () => (
    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">
        🎬 Demo Credentials
      </h3>
      <div className="space-y-1.5 text-xs text-blue-800 dark:text-blue-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
          <span className="font-medium min-w-[60px]">Staff:</span>
          <code className="bg-blue-100 dark:bg-blue-800/50 px-2 py-0.5 rounded">staff@demo.com</code>
          <span className="mx-1 hidden sm:inline">/</span>
          <code className="bg-blue-100 dark:bg-blue-800/50 px-2 py-0.5 rounded">demo123</code>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
          <span className="font-medium min-w-[60px]">Driver:</span>
          <code className="bg-blue-100 dark:bg-blue-800/50 px-2 py-0.5 rounded">driver@demo.com</code>
          <span className="mx-1 hidden sm:inline">/</span>
          <code className="bg-blue-100 dark:bg-blue-800/50 px-2 py-0.5 rounded">demo123</code>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
          <span className="font-medium min-w-[60px]">Applicant:</span>
          <span className="text-blue-700 dark:text-blue-300">Sign up with any email</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {branding.companyLogoUrl && (
            <div className="flex justify-center mb-4">
              <img 
                src={branding.companyLogoUrl} 
                alt={branding.companyLogoAlt} 
                className="h-16 w-auto object-contain"
              />
            </div>
          )}
          <CardTitle className="text-3xl font-bold">{branding.companyName}</CardTitle>
          <CardDescription>
            {view === 'selection' ? 'Reimagined DMS Platform' : roleTitles[loginRole!]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {view === 'selection' && <DemoCredentials />}
          {view === 'selection' ? (
            <div className="flex flex-col gap-4">
              <Button onClick={() => handleRoleSelect('staff')} className="w-full" variant="secondary" size="lg">
                <ShieldExclamationIcon className="mr-2 h-5 w-5" />
                Log in as Staff
              </Button>
              <Button onClick={() => handleRoleSelect('driver')} variant="secondary" className="w-full" size="lg">
                <UserGroupIcon className="mr-2 h-5 w-5" />
                Log in as Driver
              </Button>
              <Button onClick={() => handleRoleSelect('applicant')} variant="secondary" className="w-full" size="lg">
                <ClipboardDocumentCheckIcon className="mr-2 h-5 w-5" />
                Track Application
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
              </div>

              <Button onClick={onSignUpClick} variant="outline" className="w-full" size="lg">
                <UserPlusIcon className="mr-2 h-5 w-5" />
                Sign Up as Driver
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <Button type="submit" className="w-full">Login</Button>
              <Button type="button" variant="link" className="w-full" onClick={handleBack}>
                Back to role selection
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;