import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { XIcon, BanknotesIcon } from '../icons/Icon';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '../ui/card';

interface WithdrawCreditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number) => void;
    withdrawableBalance: number;
}

const WithdrawCreditModal: React.FC<WithdrawCreditModalProps> = ({ isOpen, onClose, onConfirm, withdrawableBalance }) => {
    const [amount, setAmount] = useState(withdrawableBalance.toFixed(2));

    if (!isOpen) return null;

    const handleConfirm = () => {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0 || numericAmount > withdrawableBalance) {
            alert('Please enter a valid amount to withdraw.');
            return;
        }
        onConfirm(numericAmount);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <Card className="w-full max-w-md" onClick={e => e.stopPropagation()}>
                <CardHeader>
                    <CardTitle>Withdraw Credit</CardTitle>
                    <CardDescription>Transfer funds from your credit balance to your bank account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    <div className="p-3 rounded-lg bg-muted flex items-start space-x-3">
                         <BanknotesIcon className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                         <div>
                            <p className="text-sm font-semibold">Bank Details</p>
                            <p className="text-xs text-muted-foreground">Starling Bank</p>
                            <p className="text-xs text-muted-foreground font-mono">**** **** **** 1234</p>
                         </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Withdrawals are processed within 3-5 working days.
                    </p>
                </CardContent>
                <CardFooter className="justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleConfirm}>Confirm Withdrawal</Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default WithdrawCreditModal;