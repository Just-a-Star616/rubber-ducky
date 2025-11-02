import React from 'react';
import { Invoice, CompanyDetails } from '../../types';
import { Button } from '../ui/button';
import { XIcon, DocumentDownloadIcon } from '../icons/Icon';
import { mockCompanyDetails } from '../../lib/mockData';
import { getBrandingConfig } from '../../lib/branding';

interface InvoicePreviewModalProps {
    invoice: Invoice | null;
    isOpen: boolean;
    onClose: () => void;
}

const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({ isOpen, onClose, invoice }) => {
    const branding = getBrandingConfig();
    
    if (!isOpen || !invoice) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="relative bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="sticky top-0 bg-card px-6 py-4 border-b border-border flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold">Statement #{invoice.id}</h2>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm"><DocumentDownloadIcon className="w-4 h-4 mr-2"/> Download PDF</Button>
                        <Button type="button" variant="ghost" size="icon" onClick={onClose}><XIcon className="w-6 h-6" /></Button>
                    </div>
                </header>
                <div id="invoice-printable" className="flex-grow overflow-y-auto p-8 bg-background">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <img src={branding.companyLogoUrl} alt={branding.companyLogoAlt} className="h-16 w-auto object-contain mb-4"/>
                            <h1 className="text-2xl font-bold">Statement of Earnings</h1>
                            <p className="text-muted-foreground">For week ending: {invoice.weekEnding}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold">{branding.companyName}</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">{mockCompanyDetails.address}</p>
                        </div>
                    </div>
                    
                    {/* Line Items Table */}
                    <div className="mt-8 overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Description</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {invoice.items.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(item.date).toLocaleDateString('en-GB')}</td>
                                        <td className="px-4 py-2 text-sm">{item.description}</td>
                                        <td className="px-4 py-2 text-right text-sm font-mono">
                                            £{item.amount.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                 {invoice.items.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="text-center py-4 text-sm text-muted-foreground">Detailed breakdown not available.</td>
                                    </tr>
                                 )}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary */}
                    <div className="flex justify-end mt-8">
                        <div className="w-full max-w-xs space-y-2">
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Gross Earnings:</span>
                                <span className="font-medium">£{invoice.grossEarnings.toFixed(2)}</span>
                             </div>
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Commission:</span>
                                <span className="font-medium text-red-600">£({invoice.commission.toFixed(2)})</span>
                             </div>
                             <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
                                <span>Net Earnings:</span>
                                <span>£{invoice.netEarnings.toFixed(2)}</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoicePreviewModal;