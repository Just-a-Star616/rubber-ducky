

import React, { useMemo } from 'react';
import { mockDrivers, mockAccounts, mockBookingTrendData, mockActivityFeed } from '../../lib/mockData';
import { Driver } from '../../types';
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon, ChartBarIcon, CollectionIcon, CreditCardIcon, CurrencyPoundIcon, SparklesIcon, UserGroupIcon, StarIcon, BriefcaseIcon, MapPinIcon } from '../../components/icons/Icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import BookingsTrendChart from '../../components/staff/charts/BookingsTrendChart';
import DriverStatusPieChart from '../../components/staff/charts/DriverStatusPieChart';
import ActivityFeed from '../../components/staff/ActivityFeed';

const StatCard = ({ title, value, change, icon: Icon }: { title: string, value: string, change: string, icon: React.ElementType }) => (
  <div className="bg-card text-card-foreground p-4 rounded-lg shadow-sm border border-border">
     <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-foreground/70 truncate">{title}</h3>
        <Icon className="w-5 h-5 text-foreground/40" />
     </div>
    <div className="mt-2 flex items-baseline">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className={`ml-2 flex items-baseline text-sm font-semibold ${change.startsWith('+') ? 'text-green-700 dark:text-green-500' : 'text-red-600 dark:text-red-400'}`}>
        {change.startsWith('+') ? 
          <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-4 w-4" /> :
          <ArrowTrendingDownIcon className="self-center flex-shrink-0 h-4 w-4" />
        }
        <span className="sr-only">{change.startsWith('+') ? 'Increased' : 'Decreased'} by</span>
        {change.substring(1)}
      </p>
    </div>
  </div>
);

const AIInsightsCard: React.FC = () => {
    const insights = [
        {
            icon: UserGroupIcon,
            iconClass: 'text-red-500 bg-red-100 dark:bg-red-900/50',
            title: 'Driver Anomaly Detected',
            description: "Driver D002 had a 150% increase in job rejections this week compared to their average.",
        },
        {
            icon: MapPinIcon,
            iconClass: 'text-blue-500 bg-blue-100 dark:bg-blue-900/50',
            title: 'Booking Hotspot Shift',
            description: "Booking hotspots have shifted significantly towards Salford Quays on weekend evenings.",
        },
        {
            icon: CurrencyPoundIcon,
            iconClass: 'text-green-500 bg-green-100 dark:bg-green-900/50',
            title: 'Positive Earning Trend',
            description: "Drivers on 'Tiered by Band' scheme are earning 15% more on average this month.",
        },
    ];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <SparklesIcon className="w-6 h-6 text-primary" />
                    <CardTitle>AI-Powered Insights</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {insights.map((insight, index) => (
                        <li key={index} className="flex items-start space-x-3">
                            <div className={`flex-shrink-0 rounded-full h-8 w-8 flex items-center justify-center ${insight.iconClass}`}>
                                <insight.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold">{insight.title}</h4>
                                <p className="text-sm text-foreground/80">{insight.description}</p>
                                <a href="#" className="text-xs font-semibold text-primary hover:underline">View Details</a>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    )
};


const TopDriversCard = ({ className }: { className?: string }) => {
    const topDrivers = useMemo(() => 
        [...mockDrivers]
            .filter(d => d.status === 'Active')
            .sort((a, b) => b.commissionTotal - a.commissionTotal)
            .slice(0, 5), 
    []);

    const maxCommission = topDrivers[0]?.commissionTotal || 1;

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                    <StarIcon className="w-6 h-6 text-amber-500" />
                    <span>Top Drivers</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {topDrivers.map(driver => (
                        <li key={driver.id}>
                            <div className="flex items-center space-x-3 mb-1">
                                <img className="h-9 w-9 rounded-full" src={driver.avatarUrl} alt={`${driver.firstName} ${driver.lastName}`} />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{driver.firstName} {driver.lastName}</p>
                                    <p className="text-xs text-foreground/70">Commission Total: £{driver.commissionTotal.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-background rounded-full">
                                <div 
                                    className="h-1.5 rounded-full bg-amber-400" 
                                    style={{ width: `${(driver.commissionTotal / maxCommission) * 100}%` }}
                                ></div>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};

const TopAccountsCard = ({ className }: { className?: string }) => {
    const topAccounts = useMemo(() => 
        [...mockAccounts]
            .sort((a, b) => b.totalSpend - a.totalSpend)
            .slice(0, 5), 
    []);
    
    const maxSpend = topAccounts[0]?.totalSpend || 1;

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                    <BriefcaseIcon className="w-6 h-6 text-primary-500" />
                    <span>Top Accounts</span>
                </CardTitle>
            </CardHeader>
             <CardContent>
                <ul className="space-y-4">
                    {topAccounts.map(account => (
                        <li key={account.id}>
                            <div className="flex items-center space-x-3 mb-1">
                               <div className="flex-1">
                                    <p className="text-sm font-medium">{account.name}</p>
                                    <p className="text-xs text-foreground/70">Total Spend: £{account.totalSpend.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-background rounded-full">
                                <div 
                                    className="h-1.5 rounded-full bg-primary-400" 
                                    style={{ width: `${(account.totalSpend / maxSpend) * 100}%` }}
                                ></div>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};

const HomePage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard title="Gross Bookings" value="£8,132" change="+5.2%" icon={CurrencyPoundIcon} />
                <StatCard title="Commission" value="£1,626" change="+5.2%" icon={CurrencyPoundIcon} />
                <StatCard title="Total Jobs" value="541" change="+8.1%" icon={ChartBarIcon} />
                <StatCard title="Card Jobs" value="380" change="+11.3%" icon={CreditCardIcon} />
                <StatCard title="Account Jobs" value="125" change="-2.4%" icon={CollectionIcon} />
                <StatCard title="Cash Jobs" value="36" change="+3.1%" icon={CurrencyPoundIcon} />
            </div>

            <BookingsTrendChart data={mockBookingTrendData} />
            
            <div className="flex flex-wrap gap-6">
                <TopDriversCard className="flex-1 min-w-[320px]" />
                <TopAccountsCard className="flex-1 min-w-[320px]" />
            </div>

        </div>
        <div className="lg:col-span-1 space-y-6">
            <DriverStatusPieChart />
            <AIInsightsCard />
            <ActivityFeed events={mockActivityFeed} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
