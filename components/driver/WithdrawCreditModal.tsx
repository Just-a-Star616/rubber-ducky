import React, { useState } from 'react';
import { BankAccount } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { XIcon, BanknotesIcon } from '../icons/Icon';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '../ui/card';

interface WithdrawCreditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number, bankAccountId: string) => void;
    withdrawableBalance: number;
    bankAccounts?: BankAccount[];
}

const WithdrawCreditModal: React.FC<WithdrawCreditModalProps> = ({ isOpen, onClose, onConfirm, withdrawableBalance, bankAccounts = [] }) => {
    const [amount, setAmount] = useState(withdrawableBalance.toFixed(2));
    const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>('');

    // Filter to only verified bank accounts
    const verifiedBankAccounts = bankAccounts.filter(b => b.verified);
    const defaultAccount = verifiedBankAccounts.find(b => b.isDefault) || verifiedBankAccounts[0];

    React.useEffect(() => {
        if (defaultAccount && !selectedBankAccountId) {
            setSelectedBankAccountId(defaultAccount.id);
        }
    }, [defaultAccount, selectedBankAccountId]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0 || numericAmount > withdrawableBalance) {
            alert('Please enter a valid amount to withdraw.');
            return;
        }

        if (verifiedBankAccounts.length === 0) {
            alert('Please add and verify a bank account before withdrawing funds.');
            return;
        }

        if (!selectedBankAccountId) {
            alert('Please select a bank account for withdrawal.');
            return;
        }

        onConfirm(numericAmount, selectedBankAccountId);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <Card className="w-full max-w-md" onClick={e => e.stopPropagation()}>
                <CardHeader>
                    <CardTitle>Withdraw Credit</CardTitle>
                    <CardDescription>Transfer funds from your credit balance to your verified bank account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {verifiedBankAccounts.length === 0 ? (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                            <p className="text-sm text-red-900 dark:text-red-300">
                                ⚠️ No verified bank accounts. Please add and verify a bank account in your profile before withdrawing.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div>
                                <p className="text-sm text-muted-foreground">Withdrawable Balance</p>
                                <p className="text-2xl font-bold text-green-600">£{withdrawableBalance.toFixed(2)}</p>
                            </div>
                            <div>
                                <label htmlFor="withdraw-amount" className="block text-sm font-medium text-muted-foreground">
                                    Amount to Withdraw
                                </label>
                                <div className="relative mt-1">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground sm:text-sm">£</span>
                                    <Input
                                        id="withdraw-amount"
                                        type="number"
                                        step="0.01"
                                        max={withdrawableBalance}
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="pl-7"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="bank-account" className="block text-sm font-medium text-muted-foreground mb-2">
                                    Bank Account
                                </label>
                                <select
                                    id="bank-account"
                                    value={selectedBankAccountId}
                                    onChange={(e) => setSelectedBankAccountId(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md bg-background dark:bg-slate-950 text-foreground text-sm"
                                >
                                    {verifiedBankAccounts.map(account => (
                                        <option key={account.id} value={account.id}>
                                            {account.bankName} - {account.accountHolderName} (**** {account.accountNumber.slice(-4)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {defaultAccount && (
                                <div className="p-3 rounded-lg bg-muted flex items-start space-x-3">
                                    <BanknotesIcon className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold">{defaultAccount.accountHolderName}</p>
                                        <p className="text-xs text-muted-foreground">{defaultAccount.bankName}</p>
                                        <p className="text-xs text-muted-foreground font-mono">**** **** **** {defaultAccount.accountNumber.slice(-4)}</p>
                                    </div>
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Withdrawals are processed within 3-5 working days to your selected bank account.
                            </p>
                        </>
                    )}
                </CardContent>
                <CardFooter className="justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={verifiedBankAccounts.length === 0}>
                        {verifiedBankAccounts.length === 0 ? 'Add Bank Account' : 'Confirm Withdrawal'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default WithdrawCreditModal;