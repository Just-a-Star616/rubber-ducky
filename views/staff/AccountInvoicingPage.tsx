import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { UploadIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '../../components/icons/Icon';

const UploadSection = ({ title, description }: { title: string, description: string }) => (
    <Card className="flex-1">
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex justify-center px-6 py-10 border-2 border-border border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="flex text-sm text-muted-foreground">
                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none">
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-muted-foreground/80">CSV up to 10MB</p>
                </div>
            </div>
        </CardContent>
    </Card>
);


const StatCard = ({ title, value, change }: { title: string, value: string, change: string }) => (
  <div className="bg-background p-4 rounded-lg border">
    <h3 className="text-sm font-medium text-muted-foreground truncate">{title}</h3>
    <div className="mt-1 flex items-baseline">
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className={`ml-2 flex items-baseline text-sm font-semibold ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
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

const AccountInvoicingPage: React.FC = () => {
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex flex-col lg:flex-row gap-6">
                <UploadSection title="1. Upload Bookings" description="Upload a booking CSV file to begin processing." />
                <UploadSection title="2. Upload Adjustments" description="Upload a CSV of credits/debits for inclusion in the report." />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>3. Filter & Process</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label htmlFor="start-datetime" className="block text-sm font-medium text-muted-foreground mb-1">Start Date & Time</label>
                            <Input type="datetime-local" name="start-datetime" id="start-datetime" />
                        </div>
                        <div>
                            <label htmlFor="end-datetime" className="block text-sm font-medium text-muted-foreground mb-1">End Date & Time</label>
                            <Input type="datetime-local" name="end-datetime" id="end-datetime" />
                        </div>
                        <div>
                            <label htmlFor="account-refs" className="block text-sm font-medium text-muted-foreground mb-1">Account Refs</label>
                            <Input type="text" name="account-refs" id="account-refs" placeholder="e.g., ACC001,ACC005" />
                        </div>
                        <div className="self-end">
                            <Button className="w-full">Process Invoices</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>4. Results</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard title="Total Invoice Value" value="£125,678.45" change="+8.2%" />
                        <StatCard title="Total Service Charges" value="£12,567.84" change="+8.2%" />
                        <StatCard title="Processed Accounts" value="42" change="+1" />
                        <StatCard title="Generated Invoices" value="42" change="+1" />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <Button variant="outline">Export as XLSX</Button>
                        <Button variant="outline">Export as CSV</Button>
                        <Button variant="outline">Export as JSON</Button>
                        <Button>View HTML Report</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AccountInvoicingPage;
