
import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { DriverApplication } from '../../types';
import { CheckIcon, XIcon } from '../../components/icons/Icon';

interface CreatePasswordProps {
    applicant: DriverApplication;
    onPasswordCreate: (password: string) => void;
}

const PasswordRequirement = ({ meets, text }: { meets: boolean, text: string }) => (
    <div className={`flex items-center text-sm ${meets ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}`}>
        {meets ? <CheckIcon className="w-4 h-4 mr-2" /> : <XIcon className="w-4 h-4 mr-2" />}
        <span>{text}</span>
    </div>
);

const CreatePassword: React.FC<CreatePasswordProps> = ({ applicant, onPasswordCreate }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const [requirements, setRequirements] = useState({
        length: false,
        lowercase: false,
        uppercase: false,
        number: false,
        special: false,
    });
    const [strength, setStrength] = useState<'Weak' | 'Medium' | 'Strong'>('Weak');

    useEffect(() => {
        const length = password.length >= 8;
        const lowercase = /[a-z]/.test(password);
        const uppercase = /[A-Z]/.test(password);
        const number = /[0-9]/.test(password);
        const special = /[^A-Za-z0-9]/.test(password);

        setRequirements({ length, lowercase, uppercase, number, special });

        const score = Object.values({ length, lowercase, uppercase, number, special }).filter(Boolean).length;
        if (score <= 2) {
            setStrength('Weak');
        } else if (score <= 4) {
            setStrength('Medium');
        } else {
            setStrength('Strong');
        }
    }, [password]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (strength === 'Weak') {
            setError('Password is too weak. Please meet more requirements.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        onPasswordCreate(password);
    };

    const strengthConfig = {
        Weak: { color: 'bg-red-500', width: '33.33%', label: 'Weak' },
        Medium: { color: 'bg-yellow-500', width: '66.66%', label: 'Medium' },
        Strong: { color: 'bg-green-500', width: '100%', label: 'Strong' },
    };

    const isSubmitDisabled = strength === 'Weak' || !password || !confirmPassword;

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Welcome, {applicant.firstName}!</CardTitle>
                    <CardDescription>Your application has been submitted. Create a secure password to track its status.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-1">Password</label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                aria-describedby="password-strength"
                            />
                        </div>
                        <div id="password-strength" className="space-y-2 pt-2">
                             <div className="flex items-center gap-2">
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full transition-all ${strengthConfig[strength].color}`}
                                        style={{ width: strengthConfig[strength].width }}
                                    ></div>
                                </div>
                                <span className={`text-sm font-medium w-20 text-right ${strength === 'Weak' ? 'text-red-500' : strength === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`}>{strengthConfig[strength].label}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                <PasswordRequirement meets={requirements.length} text="At least 8 characters" />
                                <PasswordRequirement meets={requirements.lowercase} text="A lowercase letter" />
                                <PasswordRequirement meets={requirements.uppercase} text="An uppercase letter" />
                                <PasswordRequirement meets={requirements.number} text="A number" />
                                <PasswordRequirement meets={requirements.special} text="A special character" />
                            </div>
                        </div>
                         <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-muted-foreground mb-1">Confirm Password</label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-destructive text-center">{error}</p>}
                    </CardContent>
                     <div className="p-6 pt-0">
                         <Button type="submit" className="w-full" disabled={isSubmitDisabled}>Set Password & Continue</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CreatePassword;
