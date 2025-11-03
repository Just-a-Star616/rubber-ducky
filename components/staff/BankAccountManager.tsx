import React, { useState } from 'react';
import { BankAccount } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { XIcon } from '../icons/Icon';

interface BankAccountManagerProps {
    bankAccounts: BankAccount[];
    onAdd: (account: BankAccount) => void;
    onEdit: (account: BankAccount) => void;
    onDelete: (accountId: string) => void;
    onSetDefault: (accountId: string) => void;
    isAdmin?: boolean;
    onVerificationRequired?: (account: BankAccount) => void;
}

const BankAccountManager: React.FC<BankAccountManagerProps> = ({
    bankAccounts,
    onAdd,
    onEdit,
    onDelete,
    onSetDefault,
    isAdmin = false,
    onVerificationRequired,
}) => {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        sortCode: '',
        iban: '',
        verificationMethod: 'Email' as 'Email' | 'SMS',
    });

    const handleOpenForm = (account?: BankAccount) => {
        if (account) {
            setEditingId(account.id);
            setFormData({
                accountHolderName: account.accountHolderName,
                bankName: account.bankName,
                accountNumber: account.accountNumber,
                sortCode: account.sortCode,
                iban: account.iban || '',
                verificationMethod: account.verificationMethod,
            });
        } else {
            setEditingId(null);
            setFormData({
                accountHolderName: '',
                bankName: '',
                accountNumber: '',
                sortCode: '',
                iban: '',
                verificationMethod: 'Email',
            });
        }
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingId(null);
    };

    const handleSubmit = () => {
        if (!formData.accountHolderName || !formData.bankName || !formData.accountNumber || !formData.sortCode) {
            alert('Please fill in all required fields.');
            return;
        }

        if (formData.accountNumber.length < 8) {
            alert('Account number must be at least 8 digits.');
            return;
        }

        if (formData.sortCode.replace(/\D/g, '').length !== 6) {
            alert('Sort code must be 6 digits (format: XX-XX-XX).');
            return;
        }

        const newAccount: BankAccount = {
            id: editingId || `bank_${Date.now()}`,
            accountHolderName: formData.accountHolderName,
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
            sortCode: formData.sortCode,
            iban: formData.iban || undefined,
            isDefault: editingId ? (bankAccounts.find(b => b.id === editingId)?.isDefault || false) : bankAccounts.length === 0,
            verified: false,
            verificationMethod: formData.verificationMethod,
            verificationSentAt: new Date().toISOString(),
            createdAt: editingId ? (bankAccounts.find(b => b.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        if (editingId) {
            onEdit(newAccount);
        } else {
            onAdd(newAccount);
        }

        // Trigger verification modal
        if (onVerificationRequired) {
            onVerificationRequired(newAccount);
        }

        handleCloseForm();
    };

    const maskAccountNumber = (accountNumber: string) => {
        if (accountNumber.length <= 4) return accountNumber;
        return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
    };

    const maskSortCode = (sortCode: string) => {
        return '**-**-' + sortCode.slice(-2);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Bank Accounts</h3>
                <Button onClick={() => handleOpenForm()} size="sm">
                    + Add Bank Account
                </Button>
            </div>

            {bankAccounts.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-lg">
                    <p className="text-muted-foreground mb-4">No bank accounts added yet</p>
                    <Button variant="outline" onClick={() => handleOpenForm()}>
                        Add Your First Bank Account
                    </Button>
                </div>
            ) : (
                <div className="grid gap-3">
                    {bankAccounts.map((account) => (
                        <Card key={account.id} className={account.isDefault ? 'border-green-600 border-2' : ''}>
                            <CardContent className="pt-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-semibold">{account.accountHolderName}</h4>
                                            {account.isDefault && (
                                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded font-medium">
                                                    Default
                                                </span>
                                            )}
                                            <span className={`px-2 py-1 text-xs rounded font-medium ${
                                                account.verified
                                                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                                    : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                                            }`}>
                                                {account.verified ? '✓ Verified' : 'Pending Verification'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-1">{account.bankName}</p>
                                        <div className="flex gap-4 text-sm">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Account Number</p>
                                                <p className="font-mono">{maskAccountNumber(account.accountNumber)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Sort Code</p>
                                                <p className="font-mono">{maskSortCode(account.sortCode)}</p>
                                            </div>
                                        </div>
                                        {account.iban && (
                                            <div className="mt-2 text-sm">
                                                <p className="text-xs text-muted-foreground">IBAN</p>
                                                <p className="font-mono text-xs">{account.iban.slice(0, 4)}...{account.iban.slice(-4)}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {!account.isDefault && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onSetDefault(account.id)}
                                                title="Set as default"
                                            >
                                                Set Default
                                            </Button>
                                        )}
                                        {account.verified && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenForm(account)}
                                            >
                                                Edit
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete this bank account?')) {
                                                    onDelete(account.id);
                                                }
                                            }}
                                        >
                                            <XIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={handleCloseForm}>
                    <Card className="w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <CardHeader>
                            <CardTitle>{editingId ? 'Edit Bank Account' : 'Add Bank Account'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Account Holder Name *</label>
                                <Input
                                    type="text"
                                    value={formData.accountHolderName}
                                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                                    placeholder="Full name as it appears on the account"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Bank Name *</label>
                                <Input
                                    type="text"
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    placeholder="e.g., Barclays, Lloyds, Starling"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Account Number *</label>
                                <Input
                                    type="text"
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
                                    placeholder="8-digit account number"
                                    maxLength={8}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Sort Code *</label>
                                <Input
                                    type="text"
                                    value={formData.sortCode}
                                    onChange={(e) => {
                                        let val = e.target.value.replace(/\D/g, '');
                                        if (val.length >= 2) val = val.slice(0, 2) + '-' + val.slice(2);
                                        if (val.length >= 5) val = val.slice(0, 5) + '-' + val.slice(5);
                                        setFormData({ ...formData, sortCode: val.slice(0, 8) });
                                    }}
                                    placeholder="XX-XX-XX"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">IBAN (Optional)</label>
                                <Input
                                    type="text"
                                    value={formData.iban}
                                    onChange={(e) => setFormData({ ...formData, iban: e.target.value.toUpperCase() })}
                                    placeholder="For international transfers"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Verification Method</label>
                                <select
                                    value={formData.verificationMethod}
                                    onChange={(e) => setFormData({ ...formData, verificationMethod: e.target.value as 'Email' | 'SMS' })}
                                    className="w-full px-3 py-2 border rounded-md bg-background dark:bg-slate-950 text-foreground"
                                >
                                    <option value="Email">Email</option>
                                    <option value="SMS">SMS</option>
                                </select>
                            </div>
                            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                                <p className="text-xs text-blue-900 dark:text-blue-300">
                                    ℹ️ A verification code will be sent via {formData.verificationMethod.toLowerCase()} to confirm this bank account.
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="gap-2 justify-end">
                            <Button variant="ghost" onClick={handleCloseForm}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit}>
                                {editingId ? 'Update & Verify' : 'Add & Verify'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default BankAccountManager;
