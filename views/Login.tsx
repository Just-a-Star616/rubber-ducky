
import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { UserGroupIcon, ShieldExclamationIcon, UserPlusIcon, ClipboardDocumentCheckIcon } from '../components/icons/Icon';
import { Input } from '../components/ui/input';

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
        if (email.toLowerCase() === 'j@example.com' && password === 'password123') {
            onLogin(loginRole, email);
        } else {
            setError('Invalid email or password.');
        }
    }
  };

  const roleTitles: { [key in LoginRole]: string } = {
    staff: 'Staff Login',
    driver: 'Driver Login',
    applicant: 'Track Application',
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Project Rubber Ducky</CardTitle>
          <CardDescription>
            {view === 'selection' ? 'Reimagined Invoicing Platform' : roleTitles[loginRole!]}
          </CardDescription>
        </CardHeader>
        <CardContent>
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