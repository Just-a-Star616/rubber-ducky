import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

const AdminPage: React.FC = () => {
    const [defaultDateRange, setDefaultDateRange] = useState('previous-week');
    const [aiInsightsEnabled, setAiInsightsEnabled] = useState(true);

    return (
        <div className="space-y-6">
            <Card>
                <form>
                    <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>Manage default date ranges and application-wide flags.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                             <div>
                                <label htmlFor="default-date-range" className="block text-sm font-medium text-muted-foreground">Default Date Range for Reports</label>
                                <Select value={defaultDateRange} onValueChange={setDefaultDateRange}>
                                    <SelectTrigger id="default-date-range" className="mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="previous-week">Previous Week</SelectItem>
                                        <SelectItem value="current-week">Current Week</SelectItem>
                                        <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                             <div>
                                <label htmlFor="ai-insights" className="block text-sm font-medium text-muted-foreground">AI Insights on Dashboard</label>
                                {/* FIX: The Select component's value prop expects a string. The boolean state `aiInsightsEnabled` must be converted to a string to prevent a type error. */}
                                <Select value={String(aiInsightsEnabled)} onValueChange={(v) => setAiInsightsEnabled(v === 'true')}>
                                    <SelectTrigger id="ai-insights" className="mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Enabled</SelectItem>
                                        <SelectItem value="false">Disabled</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button type="submit">Save Settings</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default AdminPage;
