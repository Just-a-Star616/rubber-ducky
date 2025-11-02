

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { mockHistoricInvoices } from '../../lib/mockData';
import { HistoricInvoice } from '../../types';
import { CurrencyPoundIcon, CheckIcon, XIcon, ClockIcon, SearchIcon, CalendarIcon } from '../../components/icons/Icon';
import InvoicePreviewModal from '../../components/staff/InvoicePreviewModal';

interface HistoricInvoicesPageProps {
    type: 'driver' | 'account';
}

const ResendModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    count: number;
    onResend: (additionalEmail?: string) => void;
}> = ({ isOpen, onClose, count, onResend }) => {
    const [additionalEmail, setAdditionalEmail] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        onResend(additionalEmail);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <Card className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <CardHeader>
                    <CardTitle>Resend Invoices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>You are about to resend <strong>{count}</strong> selected invoice(s) to their original recipients.</p>
                    <div>
                        <label htmlFor="additional-email" className="block text-sm font-medium text-muted-foreground">
                            Optionally send a copy to another email address:
                        </label>
                        <Input 
                            id="additional-email"
                            type="email" 
                            placeholder="e.g., accounts@example.com"
                            value={additionalEmail}
                            onChange={(e) => setAdditionalEmail(e.target.value)}
                            className="mt-1"
                        />
                    </div>
                </CardContent>
                <CardFooter className="justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleConfirm}>Confirm & Resend</Button>
                </CardFooter>
            </Card>
        </div>
    );
};

const emailStatusConfig: { [key in HistoricInvoice['emailStatus']]: { color: string; icon: React.ElementType } } = {
  Sent: { color: 'text-green-600 dark:text-green-400', icon: CheckIcon },
  Failed: { color: 'text-red-600 dark:text-red-400', icon: XIcon },
  Pending: { color: 'text-yellow-600 dark:text-yellow-400', icon: ClockIcon },
};

const HistoricInvoicesPage: React.FC<HistoricInvoicesPageProps> = ({ type }) => {
    const [invoices, setInvoices] = useState<HistoricInvoice[]>([]);
    const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
    const [isResendModalOpen, setIsResendModalOpen] = useState(false);
    const [viewingInvoice, setViewingInvoice] = useState<HistoricInvoice | null>(null);

    useEffect(() => {
        setInvoices(mockHistoricInvoices.filter(inv => inv.type.toLowerCase() === type));
        setSelectedInvoices(new Set());
    }, [type]);

    const handleSelect = (invoiceId: string) => {
        setSelectedInvoices(prev => {
            const newSet = new Set(prev);
            if (newSet.has(invoiceId)) {
                newSet.delete(invoiceId);
            } else {
                newSet.add(invoiceId);
            }
            return newSet;
        });
    };

    const handleSelectAll = (isChecked: boolean) => {
        if (isChecked) {
            setSelectedInvoices(new Set(invoices.map(inv => inv.id)));
        } else {
            setSelectedInvoices(new Set());
        }
    };

    const handleResend = (additionalEmail?: string) => {
        alert(`Resending ${selectedInvoices.size} invoices. ${additionalEmail ? `A copy will be sent to ${additionalEmail}.` : ''}`);
        // Here you would implement the actual resend logic
        setSelectedInvoices(new Set());
    };

    const handleMarkAsSent = () => {
        if (selectedInvoices.size === 0) return;
        if (window.confirm(`Are you sure you want to mark ${selectedInvoices.size} selected invoice(s) as 'Sent'?`)) {
            const now = new Date().toISOString();
            setInvoices(prev =>
                prev.map(inv =>
                    selectedInvoices.has(inv.id)
                        ? { ...inv, emailStatus: 'Sent', sentDate: now }
                        : inv
                )
            );
            setSelectedInvoices(new Set());
        }
    };

    const handleMarkAsFailed = () => {
        if (selectedInvoices.size === 0) return;
        if (window.confirm(`Are you sure you want to mark ${selectedInvoices.size} selected invoice(s) as 'Failed'?`)) {
            const now = new Date().toISOString();
            setInvoices(prev =>
                prev.map(inv =>
                    selectedInvoices.has(inv.id)
                        ? { ...inv, emailStatus: 'Failed', sentDate: now }
                        : inv
                )
            );
            setSelectedInvoices(new Set());
        }
    };

    const stats = useMemo(() => {
        const selected = invoices.filter(inv => selectedInvoices.has(inv.id));
        return {
            count: selected.length,
            totalValue: selected.reduce((sum, inv) => sum + inv.netAmount, 0),
            statuses: selected.reduce((acc, inv) => {
                acc[inv.emailStatus] = (acc[inv.emailStatus] || 0) + 1;
                return acc;
            }, {} as Record<HistoricInvoice['emailStatus'], number>),
        };
    }, [selectedInvoices, invoices]);

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Selection Statistics</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-muted"><p className="text-sm text-muted-foreground">Selected Count</p><p className="text-2xl font-bold">{stats.count}</p></div>
                    <div className="p-4 rounded-lg bg-muted"><p className="text-sm text-muted-foreground">Total Net Value</p><p className="text-2xl font-bold">£{stats.totalValue.toFixed(2)}</p></div>
                    <div className="p-4 rounded-lg bg-muted"><p className="text-sm text-muted-foreground">Emails Sent</p><p className="text-2xl font-bold text-green-600">{stats.statuses.Sent || 0}</p></div>
                    <div className="p-4 rounded-lg bg-muted"><p className="text-sm text-muted-foreground">Emails Failed</p><p className="text-2xl font-bold text-red-600">{stats.statuses.Failed || 0}</p></div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex gap-2">
                             <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Search recipient..." className="pl-9" />
                            </div>
                             <Input type="date" className="w-auto" />
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
                            <Button variant="outline" onClick={handleMarkAsSent} disabled={selectedInvoices.size === 0}>
                                Mark as Sent
                            </Button>
                            <Button variant="outline" onClick={handleMarkAsFailed} disabled={selectedInvoices.size === 0}>
                                Mark as Failed
                            </Button>
                            <Button onClick={() => setIsResendModalOpen(true)} disabled={selectedInvoices.size === 0}>
                                Resend Selected ({selectedInvoices.size})
                            </Button>
                        </div>
                    </div>

                    <div className="mt-4 border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th scope="col" className="p-4"><Checkbox onCheckedChange={handleSelectAll} checked={selectedInvoices.size === invoices.length && invoices.length > 0} /></th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Ref</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Recipient</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Period</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Net Amount</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email Status</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Sent Date</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-card">
                                    {invoices.map(invoice => {
                                        const StatusIcon = emailStatusConfig[invoice.emailStatus].icon;
                                        return (
                                            <tr key={invoice.id} className={selectedInvoices.has(invoice.id) ? 'bg-muted/50' : ''}>
                                                <td className="p-4"><Checkbox onCheckedChange={() => handleSelect(invoice.id)} checked={selectedInvoices.has(invoice.id)} /></td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-foreground">{invoice.id}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                    <p className="font-semibold text-foreground">{invoice.recipientName}</p>
                                                    <p className="text-xs text-muted-foreground">{invoice.recipientEmail}</p>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                    {new Date(invoice.periodStart).toLocaleDateString('en-GB')} - {new Date(invoice.periodEnd).toLocaleDateString('en-GB')}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-foreground">£{invoice.netAmount.toFixed(2)}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                    <div className={`flex items-center gap-2 ${emailStatusConfig[invoice.emailStatus].color}`}>
                                                        <StatusIcon className="w-4 h-4"/>
                                                        <span>{invoice.emailStatus}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{invoice.sentDate ? new Date(invoice.sentDate).toLocaleString('en-GB') : 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm"><Button variant="outline" size="sm" onClick={() => setViewingInvoice(invoice)}>View</Button></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ResendModal isOpen={isResendModalOpen} onClose={() => setIsResendModalOpen(false)} count={selectedInvoices.size} onResend={handleResend} />

            {viewingInvoice && (
                <InvoicePreviewModal
                    isOpen={!!viewingInvoice}
                    onClose={() => setViewingInvoice(null)}
                    invoice={viewingInvoice}
                />
            )}
        </div>
    );
};

export default HistoricInvoicesPage;
