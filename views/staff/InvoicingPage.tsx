
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { UploadIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, TrashIcon, ChevronDownIcon, DocumentDownloadIcon, PlusCircleIcon } from '../../components/icons/Icon';
import { mockDrivers } from '../../lib/mockData';
import { AdjustmentAddModal, AdjustmentData } from '../../components/staff/AdjustmentAddModal';

interface Adjustment extends AdjustmentData {
  id: string;
}

const mockHistoricUploads = [
    { id: 'HU01', fileName: 'adjustments_2025-09-12.csv', uploadedBy: 'Alex Johnson', date: '2025-09-12', url: '#' },
    { id: 'HU02', fileName: 'adjustments_2025-09-05.csv', uploadedBy: 'Alex Johnson', date: '2025-09-05', url: '#' },
];

const mockHistoricItemUploads = [
    { id: 'IU01', fileName: 'items_upload_2025-09-15.csv', generatedBy: 'Alex Johnson', date: '2025-09-15', url: '#' },
    { id: 'IU02', fileName: 'items_upload_2025-09-08.csv', generatedBy: 'Alex Johnson', date: '2025-09-08', url: '#' },
];

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

const schemeGroups = [
    'All Schemes',
    'PAYE',
    '%',
    '% + Fixed',
    '% Upto Fixed £ Value',
    'Fixed',
    'Tiered % on total £',
    'Tiered % Then Fixed',
    'Tiered % per £ banding',
];

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

const InvoicingPage: React.FC = () => {
    const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsExportMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSaveAdjustment = (adjustmentData: AdjustmentData) => {
        const newAdjustment: Adjustment = {
            id: `ADJ-${Date.now()}`,
            ...adjustmentData,
        };
        setAdjustments(prev => [newAdjustment, ...prev]);
    };
    
    const handleRemoveAdjustment = (id: string) => {
        setAdjustments(prev => prev.filter(adj => adj.id !== id));
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row gap-6">
                <UploadSection title="1. Upload Bookings" description="Upload a booking CSV file to begin processing." />
                <UploadSection title="2. Upload Rejections" description="Upload a CSV of rejected jobs for inclusion in the report." />
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Weekly Adjustments</CardTitle>
                            <CardDescription>Add credits or debits for drivers before the invoice run.</CardDescription>
                        </div>
                        <Button onClick={() => setIsAdjustmentModalOpen(true)}>
                            <PlusCircleIcon className="w-4 h-4 mr-2" />
                            Add Adjustment
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h4 className="font-semibold">Current Pending Adjustments</h4>
                        <div className="mt-2 border rounded-lg max-h-60 overflow-y-auto">
                            {adjustments.length > 0 ? (
                                <ul className="divide-y divide-border">
                                    {adjustments.map(adj => (
                                         <li key={adj.id} className="p-2 flex justify-between items-center">
                                             <div>
                                                 <p className="text-sm font-medium">{adj.driverName} ({adj.driverRef})</p>
                                                 <p className="text-xs text-muted-foreground">
                                                    <span className="font-semibold">{adj.type}</span>
                                                    {adj.description && `: ${adj.description}`}
                                                 </p>
                                             </div>
                                             <div className="flex items-center gap-2">
                                                 <span className={`font-semibold text-sm ${adj.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                     {adj.amount >= 0 ? `+£${adj.amount.toFixed(2)}` : `-£${Math.abs(adj.amount).toFixed(2)}`}
                                                 </span>
                                                 <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveAdjustment(adj.id)}><TrashIcon className="w-4 h-4 text-destructive/80" /></Button>
                                             </div>
                                         </li>
                                    ))}
                                </ul>
                            ) : <p className="p-4 text-center text-sm text-muted-foreground">No pending adjustments.</p>}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold">Historic Adjustment Uploads</h4>
                        <div className="mt-2 border rounded-lg">
                             <ul className="divide-y divide-border">
                                {mockHistoricUploads.map(upload => (
                                     <li key={upload.id} className="p-2 flex justify-between items-center">
                                         <div>
                                             <p className="text-sm font-medium">{upload.fileName}</p>
                                             <p className="text-xs text-muted-foreground">Uploaded by {upload.uploadedBy} on {upload.date}</p>
                                         </div>
                                         <Button variant="outline" size="sm"><DocumentDownloadIcon className="w-4 h-4 mr-1"/> Download</Button>
                                     </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>3. Filter & Process</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <label htmlFor="start-datetime" className="block text-sm font-medium text-muted-foreground mb-1">Start Date & Time</label>
                            <Input type="datetime-local" name="start-datetime" id="start-datetime" />
                        </div>
                        <div>
                            <label htmlFor="end-datetime" className="block text-sm font-medium text-muted-foreground mb-1">End Date & Time</label>
                            <Input type="datetime-local" name="end-datetime" id="end-datetime" />
                        </div>
                        <div>
                            <label htmlFor="driver-prefix" className="block text-sm font-medium text-muted-foreground mb-1">Driver Refs</label>
                            <Input type="text" name="driver-prefix" id="driver-prefix" placeholder="e.g., 1,15,LE10 or LE,ST or 1-500" />
                        </div>
                        <div>
                            <label htmlFor="scheme-group" className="block text-sm font-medium text-muted-foreground mb-1">Scheme Group</label>
                            <Select><SelectTrigger><SelectValue placeholder="All Schemes" /></SelectTrigger><SelectContent>{schemeGroups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}</SelectContent></Select>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard title="Total Gross Earnings" value="£45,231.89" change="+12.5%" />
                        <StatCard title="Total Commission" value="£9,046.38" change="+12.5%" />
                        <StatCard title="Processed Drivers" value="138" change="-2" />
                        <StatCard title="Rejected Jobs" value="12" change="+3" />
                    </div>
                     <div className="mt-6 flex flex-wrap justify-end gap-3">
                        <div className="relative" ref={exportMenuRef}>
                            <Button variant="outline" onClick={() => setIsExportMenuOpen(prev => !prev)}>
                                Export <ChevronDownIcon className="w-4 h-4 ml-2" />
                            </Button>
                            {isExportMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card border z-10">
                                    <div className="py-1">
                                        <a href="#" className="block px-4 py-2 text-sm text-card-foreground hover:bg-muted">XLSX</a>
                                        <a href="#" className="block px-4 py-2 text-sm text-card-foreground hover:bg-muted">CSV</a>
                                        <a href="#" className="block px-4 py-2 text-sm text-card-foreground hover:bg-muted">Google Drive</a>
                                        <a href="#" className="block px-4 py-2 text-sm text-card-foreground hover:bg-muted">One Drive</a>
                                        <a href="#" className="block px-4 py-2 text-sm text-card-foreground hover:bg-muted">JSON</a>
                                    </div>
                                </div>
                            )}
                        </div>
                        <Button>View HTML Report</Button>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Item Uploads</CardTitle>
                            <CardDescription>Generate a CSV of all items for external accounting systems and view past uploads.</CardDescription>
                        </div>
                        <Button>Generate Items Upload</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <h4 className="font-semibold mb-2">Historic Item Uploads</h4>
                    <div className="border rounded-lg">
                         <ul className="divide-y divide-border">
                            {mockHistoricItemUploads.map(upload => (
                                 <li key={upload.id} className="p-2 flex justify-between items-center">
                                     <div>
                                         <p className="text-sm font-medium">{upload.fileName}</p>
                                         <p className="text-xs text-muted-foreground">Generated by {upload.generatedBy} on {upload.date}</p>
                                     </div>
                                     <Button variant="outline" size="sm"><DocumentDownloadIcon className="w-4 h-4 mr-1"/> Download</Button>
                                 </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>
            <AdjustmentAddModal
                isOpen={isAdjustmentModalOpen}
                onClose={() => setIsAdjustmentModalOpen(false)}
                onSave={handleSaveAdjustment}
            />
        </div>
    );
};

export default InvoicingPage;
