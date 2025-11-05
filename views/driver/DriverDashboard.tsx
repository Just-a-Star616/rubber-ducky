import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Driver, Transaction, Invoice } from '../../types';
import { Button } from '../../components/ui/button';
import { getInvoicesForDriver, getTransactionsForDriver } from '../../lib/mockFinancialData';
import { ArrowUpRightIcon, CurrencyPoundIcon, FilterIcon, CalendarIcon, DocumentDownloadIcon } from '../../components/icons/Icon';
import { DriverPage } from './DriverPortal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

interface DriverDashboardProps {
  driver: Driver;
  onNavigate: (page: DriverPage) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onOpenWithdrawModal: () => void;
}

type Period = 'this_week' | 'last_7_days' | 'this_month';
type ViewType = 'daily' | 'hourly';
type PaymentType = 'All' | 'Cash' | 'Card' | 'Account';

const FilterButton = ({ onClick, isActive, children }: { onClick: () => void, isActive: boolean, children: React.ReactNode }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            isActive
                ? 'bg-primary text-primary-foreground shadow'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
        }`}
    >
        {children}
    </button>
);

const BalanceCard: React.FC<{ driver: Driver, onOpenWithdrawModal: () => void; }> = ({ driver, onOpenWithdrawModal }) => {
    const isDebt = driver.currentBalance < 0;
    
    return (
        <Card className={`${isDebt ? 'bg-destructive' : 'bg-green-600 dark:bg-green-700'} text-white border-0`}>
            <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                    <p className="text-lg font-medium text-white/80">Current Balance</p>
                    <p className="text-5xl font-bold my-2">£{Math.abs(driver.currentBalance).toFixed(2)}</p>
                    <p className={`text-sm font-semibold px-2 py-0.5 rounded-full ${isDebt ? 'bg-destructive/80' : 'bg-green-700 dark:bg-green-800'}`}>
                        {isDebt ? 'You Owe' : 'In Credit'}
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {isDebt ? (
                            <>
                                <Button className="bg-white text-destructive hover:bg-white/90" size="sm"><CurrencyPoundIcon className="w-4 h-4 mr-2"/>Pay by Card</Button>
                                <Button className="bg-white/20 text-white hover:bg-white/30" disabled={driver.earnedCreditSinceInvoice <= 0} size="sm">
                                    Pay with £{driver.earnedCreditSinceInvoice.toFixed(2)} Credit
                                </Button>
                            </>
                        ) : (
                            driver.canWithdrawCredit && <Button onClick={onOpenWithdrawModal} className="bg-white text-green-600 hover:bg-white/90" size="sm"><ArrowUpRightIcon className="w-4 h-4 mr-2"/>Withdraw Credit</Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ driver, onNavigate, onViewInvoice, onOpenWithdrawModal }) => {
    const [period, setPeriod] = useState<Period>('this_week');
    const [viewType, setViewType] = useState<ViewType>('daily');
    const [paymentType, setPaymentType] = useState<PaymentType>('All');
    
    // Get driver-specific financial data
    const driverInvoices = useMemo(() => getInvoicesForDriver(driver.id), [driver.id]);
    const driverTransactions = useMemo(() => getTransactionsForDriver(driver.id), [driver.id]);
    
    const chartData = useMemo(() => {
        const now = new Date();
        let startDate = new Date();
        
        if (period === 'this_week') {
            const dayOfWeek = now.getDay();
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            startDate.setHours(0, 0, 0, 0);
        } else if (period === 'last_7_days') {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (period === 'this_month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const filtered = driverTransactions.filter(t => {
            const tDate = new Date(t.datetime);
            const paymentMatch = paymentType === 'All' || t.type === paymentType;
            return paymentMatch && tDate >= startDate;
        });
        
        if (viewType === 'daily') {
            const dailyTotals: { [key: string]: number } = {};
            const dateLabels: string[] = [];
            
            for (let i=0; i < 7; i++) {
                const d = new Date(startDate);
                if (period !== 'last_7_days') {
                    d.setDate(startDate.getDate() + i);
                } else {
                    d.setDate(now.getDate() - 6 + i);
                }

                if (d > now) break;

                const key = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
                const label = d.toLocaleDateString('en-GB', { weekday: 'short' });
                dailyTotals[key] = 0;
                if (!dateLabels.includes(label)) {
                    dateLabels.push(label)
                }
            }
            
            filtered.forEach(t => {
                const key = new Date(t.datetime).toLocaleDateString('en-CA');
                if (dailyTotals.hasOwnProperty(key)) {
                    dailyTotals[key] += t.amount;
                }
            });

            return Object.entries(dailyTotals).map(([date, earnings]) => ({
                name: new Date(date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
                earnings: parseFloat(earnings.toFixed(2)),
            }));
        } else { // hourly
            const hourlyTotals: { [key: string]: number } = {};
             for (let i = 0; i < 24; i++) { hourlyTotals[i] = 0; }

            filtered.forEach(t => {
                const hour = new Date(t.datetime).getHours();
                hourlyTotals[hour] += t.amount;
            });

            return Object.entries(hourlyTotals).map(([hour, earnings]) => ({
                name: `${hour.padStart(2, '0')}:00`,
                earnings: parseFloat(earnings.toFixed(2)),
            }));
        }
    }, [period, viewType, paymentType, driverTransactions]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <BalanceCard driver={driver} onOpenWithdrawModal={onOpenWithdrawModal} />
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between min-w-0">
            <CardTitle className="text-lg truncate">Recent Invoices</CardTitle>
            <Button variant="link" onClick={() => onNavigate('invoices')} className="text-xs">View Full History</Button>
        </CardHeader>
        <CardContent>
            <ul className="divide-y divide-border">
                {driverInvoices.slice(0, 3).map(invoice => (
                    <li key={invoice.id} className="py-3 flex justify-between items-center min-w-0">
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">Week Ending: {invoice.weekEnding}</p>
                            <p className="text-sm text-muted-foreground">Net: <span className="font-medium text-green-600">£{invoice.netEarnings.toFixed(2)}</span></p>
                        </div>
                        <Button variant="ghost" size="icon" title="View Statement" onClick={() => onViewInvoice(invoice)}>
                            <ArrowUpRightIcon className="h-5 w-5" />
                        </Button>
                    </li>
                ))}
            </ul>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 min-w-0">
                <CardTitle className="text-lg truncate">Earnings Breakdown</CardTitle>
                <div className="flex items-center gap-2 p-1 bg-muted rounded-full flex-shrink-0">
                    <FilterButton onClick={() => setViewType('daily')} isActive={viewType === 'daily'}>Daily View</FilterButton>
                    <FilterButton onClick={() => setViewType('hourly')} isActive={viewType === 'hourly'}>Hourly View</FilterButton>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
                 <div className="flex items-center gap-2 flex-wrap">
                    <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                    <FilterButton onClick={() => setPeriod('this_week')} isActive={period === 'this_week'}>This Week</FilterButton>
                    <FilterButton onClick={() => setPeriod('last_7_days')} isActive={period === 'last_7_days'}>Last 7 Days</FilterButton>
                    <FilterButton onClick={() => setPeriod('this_month')} isActive={period === 'this_month'}>This Month</FilterButton>
                </div>
                 <div className="flex items-center gap-2 flex-wrap">
                    <FilterIcon className="w-5 h-5 text-muted-foreground" />
                    {(['All', 'Cash', 'Card', 'Account'] as PaymentType[]).map(type => (
                        <div key={type}>
                            <FilterButton onClick={() => setPaymentType(type)} isActive={paymentType === type}>{type}</FilterButton>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 h-72 -ml-4 min-h-0 min-w-0">
                {/* Parent has h-72 (18rem = 288px). Use an explicit pixel height so Recharts can measure reliably. */}
                <ResponsiveContainer width="100%" height={288}>
                     {viewType === 'daily' ? (
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                            <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `£${value}`} />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--card-foreground))', borderRadius: 'var(--radius)' }} cursor={{ fill: 'hsl(var(--accent))' }}/>
                            <Area type="monotone" dataKey="earnings" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorEarnings)" />
                        </AreaChart>
                     ) : (
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                            <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `£${value}`} />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--card-foreground))', borderRadius: 'var(--radius)' }} cursor={{ fill: 'hsl(var(--accent))' }}/>
                            <Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                     )}
                </ResponsiveContainer>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverDashboard;