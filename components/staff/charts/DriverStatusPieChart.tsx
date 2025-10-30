import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { mockDrivers } from '../../../lib/mockData';

const COLORS = {
    Active: '#10b981', // green-500
    Inactive: '#f59e0b', // amber-500
    Archived: '#ef4444', // red-500
};

const DriverStatusPieChart: React.FC = () => {
    const statusData = useMemo(() => {
        const counts = mockDrivers.reduce((acc, driver) => {
            acc[driver.status] = (acc[driver.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Driver Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="w-full h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                            <Legend iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default DriverStatusPieChart;
