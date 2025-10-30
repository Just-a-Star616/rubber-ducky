import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';

interface BookingData {
    date: string;
    bookings: number;
    revenue: number;
}

interface BookingsTrendChartProps {
    data: BookingData[];
}

const BookingsTrendChart: React.FC<BookingsTrendChartProps> = ({ data }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Bookings Trend (Last 30 Days)</CardTitle>
                <CardDescription>A summary of total bookings and revenue over the past month.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                             <defs>
                                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis 
                                dataKey="date" 
                                tickFormatter={(str) => new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                interval={6}
                            />
                            <YAxis 
                                yAxisId="left" 
                                dataKey="bookings" 
                                orientation="left" 
                                stroke="hsl(var(--primary))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                             <YAxis 
                                yAxisId="right" 
                                dataKey="revenue" 
                                orientation="right" 
                                stroke="hsl(var(--foreground))"
                                opacity={0.5}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `£${(val/1000).toFixed(1)}k`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--card-foreground))', borderRadius: 'var(--radius)' }}
                                formatter={(value: number, name: string) => name === 'revenue' ? `£${value.toFixed(2)}` : value}
                            />
                            <Area yAxisId="left" type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorBookings)" name="Bookings" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default BookingsTrendChart;
