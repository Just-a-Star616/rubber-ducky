import React, { useMemo } from 'react';
import { HistoricInvoice, FinancialTransaction, Driver, Account, CompanyDetails } from '../../types';
import { Button } from '../ui/button';
import { XIcon, DocumentDownloadIcon, PaperAirplaneIcon } from '../icons/Icon';
import { mockDrivers, mockAccounts, mockFinancialTransactions, mockCompanyDetails } from '../../lib/mockData';

interface InvoicePreviewModalProps {
    invoice: HistoricInvoice | null;
    isOpen: boolean;
    onClose: () => void;
}

const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({ isOpen, onClose, invoice }) => {
    
    const recipient = useMemo(() => {
        if (!invoice) return null;
        if (invoice.type === 'Driver') {
            return mockDrivers.find(d => d.id === invoice.recipientId) as Driver | undefined;
        }
        return mockAccounts.find(a => a.id === invoice.recipientId) as Account | undefined;
    }, [invoice]);
    
    const lineItems = useMemo(() => {
        if (!invoice || !invoice.transactionIds) return [];
        const transactionSet = new Set(invoice.transactionIds);
        return mockFinancialTransactions.filter(t => transactionSet.has(t.id));
    }, [invoice]);

    if (!isOpen || !invoice || !recipient) return null;

    const isDriverInvoice = invoice.type === 'Driver';
    const companyDetails = mockCompanyDetails;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="relative bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="sticky top-0 bg-card px-6 py-4 border-b border-border flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold">Invoice #{invoice.id}</h2>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm"><DocumentDownloadIcon className="w-4 h-4 mr-2"/> Download PDF</Button>
                        <Button variant="outline" size="sm"><PaperAirplaneIcon className="w-4 h-4 mr-2"/> Resend Email</Button>
                        <Button type="button" variant="ghost" size="icon" onClick={onClose}><XIcon className="w-6 h-6" /></Button>
                    </div>
                </header>
                <div id="invoice-printable" className="flex-grow overflow-y-auto p-8 bg-white text-black">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <img src={companyDetails.logoUrl} alt="Company Logo" className="h-16 w-auto object-contain mb-4"/>
                            <h1 className="text-2xl font-bold">{isDriverInvoice ? 'Statement of Earnings' : 'Invoice'}</h1>
                            <p className="text-muted-foreground">Invoice #{invoice.id}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold">{companyDetails.name}</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">{companyDetails.address}</p>
                            <p className="text-sm text-muted-foreground">VAT: {companyDetails.vatNumber}</p>
                        </div>
                    </div>
                    
                    {/* Recipient & Dates */}
                    <div className="grid grid-cols-2 gap-8 my-8">
                        <div>
                             <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">Billed To</p>
                             {/* FIX: Use `firstName` and `lastName` for Driver, and `name` for Account. */}
                             <p className="font-semibold">{'firstName' in recipient ? `${recipient.firstName} ${recipient.lastName}` : recipient.name}</p>
                             <p className="text-sm text-muted-foreground">
                                {'address' in recipient ? recipient.address : recipient.billingAddress}
                             </p>
                             <p className="text-sm text-muted-foreground">{recipient.email}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">Invoice Date</p>
                             <p className="font-semibold">{new Date().toLocaleDateString('en-GB')}</p>
                             <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold mt-2">Period</p>
                             <p className="font-semibold">{new Date(invoice.periodStart).toLocaleDateString('en-GB')} - {new Date(invoice.periodEnd).toLocaleDateString('en-GB')}</p>
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Description</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Type</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {lineItems.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(item.timestamp).toLocaleDateString('en-GB')}</td>
                                        <td className="px-4 py-2 text-sm">{item.description}</td>
                                        <td className="px-4 py-2 text-sm">{item.type}</td>
                                        <td className={`px-4 py-2 text-right text-sm font-mono ${item.amount < 0 ? 'text-red-600' : ''}`}>
                                            £{item.amount.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary */}
                    <div className="flex justify-end mt-8">
                        <div className="w-full max-w-sm space-y-2">
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Gross {isDriverInvoice ? 'Earnings' : 'Amount'}:</span>
                                <span className="font-medium">£{invoice.grossAmount.toFixed(2)}</span>
                             </div>
                             {isDriverInvoice && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Commission:</span>
                                    <span className="font-medium">£({invoice.commission.toFixed(2)})</span>
                                </div>
                             )}
                             <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
                                <span>{isDriverInvoice ? 'Net Earnings' : 'Total Due'}:</span>
                                <span>£{invoice.netAmount.toFixed(2)}</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoicePreviewModal;