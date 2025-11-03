import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '../ui/card';
import { BankAccount } from '../../types';

interface BankAccountVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (verificationCode: string) => void;
    bankAccount: BankAccount | null;
    isLoading?: boolean;
}

const BankAccountVerificationModal: React.FC<BankAccountVerificationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    bankAccount,
    isLoading = false,
}) => {
    const [verificationCode, setVerificationCode] = useState('');
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen]);

    const handleConfirm = () => {
        setError('');

        if (!verificationCode.trim()) {
            setError('Please enter the verification code.');
            return;
        }

        if (verificationCode.length !== 6 && verificationCode.length !== 8) {
            setError('Verification code should be 6 or 8 characters.');
            return;
        }

        onConfirm(verificationCode);
    };

    const handleResend = () => {
        setVerificationCode('');
        setTimeLeft(600);
        setError('');
        // In real app, trigger resend API call
        console.log('Resend verification code');
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const isExpired = timeLeft === 0;

    if (!isOpen || !bankAccount) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <Card className="w-full max-w-md" onClick={e => e.stopPropagation()}>
                <CardHeader>
                    <CardTitle>Verify Bank Account</CardTitle>
                    <CardDescription>
                        A verification code has been sent via {bankAccount.verificationMethod.toLowerCase()} to confirm this account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-3 rounded-lg bg-muted">
                        <p className="text-sm font-semibold">{bankAccount.accountHolderName}</p>
                        <p className="text-xs text-muted-foreground">{bankAccount.bankName}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                            **** **** **** {bankAccount.accountNumber.slice(-4)}
                        </p>
                    </div>

                    <div>
                        <label htmlFor="verification-code" className="block text-sm font-medium mb-1">
                            Verification Code
                        </label>
                        <Input
                            id="verification-code"
                            type="text"
                            value={verificationCode}
                            onChange={(e) => {
                                setVerificationCode(e.target.value.toUpperCase());
                                setError('');
                            }}
                            placeholder="Enter 6 or 8 character code"
                            maxLength={8}
                            disabled={isLoading}
                        />
                        {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Code expires in:</span>
                            <span className={isExpired ? 'text-red-600 dark:text-red-400 font-semibold' : 'font-semibold'}>
                                {minutes}:{seconds.toString().padStart(2, '0')}
                            </span>
                        </div>
                        {isExpired && (
                            <p className="text-xs text-red-600 dark:text-red-400">
                                ⚠️ Verification code has expired. Please request a new one.
                            </p>
                        )}
                    </div>

                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-900 dark:text-blue-300">
                            💡 Check your {bankAccount.verificationMethod.toLowerCase()} for the verification code. It may take up to 2 minutes to arrive.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="gap-2 justify-between">
                    <Button variant="ghost" onClick={handleResend} disabled={!isExpired && timeLeft > 30} size="sm">
                        {isExpired ? 'Request New Code' : `Resend (${timeLeft}s)`}
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirm} disabled={isLoading || isExpired}>
                            {isLoading ? 'Verifying...' : 'Verify Account'}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default BankAccountVerificationModal;
