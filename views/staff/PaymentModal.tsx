
import React, { useState, useCallback, useEffect } from 'react';
import { Booking } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { XIcon, CreditCardIcon, CurrencyPoundIcon, PaperAirplaneIcon, ArrowUturnLeftIcon } from '../icons/Icon';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';

interface PaymentModalProps {
    booking: Booking;
    isOpen: boolean;
    onClose: () => void;
    onSave: (booking: Booking) => void;
}

const statusConfig: { [key in Booking['paymentStatus']]: { color: string; text: string } } = {
  Pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', text: 'Pending' },
  Paid: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', text: 'Paid' },
  Failed: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', text: 'Failed' },
  Refunded: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', text: 'Refunded' },
};

const mockTransactions = [
    { id: 'T1', date: '2025-09-15 14:30', description: 'Card payment attempt', amount: 90.00, status: 'Failed' },
    { id: 'T2', date: '2025-09-15 14:32', description: 'Payment link sent', amount: 90.00, status: 'Sent' },
];

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSave, booking }) => {
    const [formData, setFormData] = useState<Booking>(booking);
    const [refundAmount, setRefundAmount] = useState<number>(booking.price);

    const handleKeyDown = useCallback((event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }, [onClose]);
    useEffect(() => { if (isOpen) document.addEventListener('keydown', handleKeyDown); return () => document.removeEventListener('keydown', handleKeyDown); }, [isOpen, handleKeyDown]);
    
    useEffect(() => {
        setFormData(booking);
        setRefundAmount(booking.price);
    }, [booking]);

    if (!isOpen) return null;
    
    const handleStatusUpdate = (status: Booking['paymentStatus'], method?: Booking['paymentMethod']) => {
        const updatedBooking = { ...formData, paymentStatus: status };
        if (method) {
            updatedBooking.paymentMethod = method;
        }
        onSave(updatedBooking);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Payment for Booking #{booking.id}</CardTitle>
                    <Button type="button" variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 -mt-1 -mr-2"><XIcon className="w-5 h-5" /></Button>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-muted">
                        <div>
                            <p className="text-sm text-muted-foreground">Customer</p>
                            <p className="font-semibold">{booking.customerName}</p>
                        </div>
                         <div>
                            <p className="text-sm text-muted-foreground">Amount</p>
                            <p className="font-semibold text-2xl">£{booking.price.toFixed(2)}</p>
                        </div>
                         <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <p className={`px-2 py-1 text-sm font-semibold rounded-full inline-block ${statusConfig[formData.paymentStatus].color}`}>{statusConfig[formData.paymentStatus].text}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">Actions</h3>
                        {formData.paymentStatus === 'Pending' && (
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <Button size="lg" className="w-full"><CreditCardIcon className="w-5 h-5 mr-2"/> Take Card Payment</Button>
                                <Button size="lg" variant="secondary" className="w-full" onClick={() => handleStatusUpdate('Paid', 'Cash')}><CurrencyPoundIcon className="w-5 h-5 mr-2"/> Mark as Paid (Cash)</Button>
                                <Button size="lg" variant="secondary" className="w-full sm:col-span-2 lg:col-span-1"><PaperAirplaneIcon className="w-5 h-5 mr-2"/> Send Payment Link</Button>
                            </div>
                        )}
                         {(formData.paymentStatus === 'Paid' || formData.paymentStatus === 'Refunded') && (
                            <div className="p-4 border rounded-lg bg-background">
                                <h4 className="font-semibold">Refund</h4>
                                <div className="mt-2 flex items-center gap-2">
                                    <Input 
                                        type="number" 
                                        step="0.01"
                                        max={booking.price}
                                        value={refundAmount}
                                        onChange={(e) => setRefundAmount(Math.min(booking.price, parseFloat(e.target.value) || 0))}
                                    />
                                    <Button onClick={() => handleStatusUpdate('Refunded')}><ArrowUturnLeftIcon className="w-4 h-4 mr-2"/> Process Refund</Button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Transaction History</h3>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Description</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Amount</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {mockTransactions.map(t => (
                                        <tr key={t.id}>
                                            <td className="px-4 py-2 text-sm whitespace-nowrap">{t.date}</td>
                                            <td className="px-4 py-2 text-sm">{t.description}</td>
                                            <td className="px-4 py-2 text-sm">£{t.amount.toFixed(2)}</td>
                                            <td className="px-4 py-2 text-sm font-semibold">{t.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="justify-end">
                    <Button type="button" variant="outline" onClick={onClose}>Close</Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default PaymentModal;
