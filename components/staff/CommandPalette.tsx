import React, { useState, useEffect, useRef } from 'react';
import { SparklesIcon, PaperAirplaneIcon, XIcon, UserGroupIcon } from '../icons/Icon';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { mockDrivers } from '../../lib/mockData';
import { Driver } from '../../types';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

// Copied from HomePage.tsx
const ReportResponse: React.FC<{ reportTitle: string; children: React.ReactNode }> = ({ reportTitle, children }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center space-x-2"><SparklesIcon className="w-5 h-5 text-primary" /> <span>{reportTitle}</span></CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            {children}
        </CardContent>
    </Card>
)

// Copied from HomePage.tsx
const DriverListResponse: React.FC<{ drivers: Driver[]; title: string; }> = ({ drivers, title }) => (
     <Card>
        <CardHeader>
            <CardTitle className="flex items-center space-x-2"><SparklesIcon className="w-5 h-5 text-primary" /> <span>{title}</span></CardTitle>
            <CardDescription>{drivers.length} drivers found matching your criteria.</CardDescription>
        </CardHeader>
        <CardContent>
           <ul className="divide-y divide-border">
                {drivers.map(driver => (
                    <li key={driver.id} className="py-2 flex items-center justify-between">
                         <div className="flex items-center space-x-3">
                            <img className="h-9 w-9 rounded-full" src={driver.avatarUrl} alt="" />
                            <div>
                                <p className="text-sm font-medium">{driver.firstName} {driver.lastName} ({driver.id})</p>
                                <p className="text-xs text-foreground/70">Badge expires: {new Date(driver.badgeExpiry).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm">View Driver</Button>
                    </li>
                ))}
           </ul>
        </CardContent>
    </Card>
);

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<React.ReactNode | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Reset state on open
            setPrompt('');
            setAiResponse(null);
            // Auto-focus input
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);
    
    // Same mock logic from HomePage
    const handleCommandSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt || isLoading) return;

        setIsLoading(true);
        setAiResponse(null);

        setTimeout(() => {
            const lowerPrompt = prompt.toLowerCase();
            if (lowerPrompt.includes("expiring")) {
                const drivers = mockDrivers.filter(d => d.id === 'D001' || d.id === 'D003');
                setAiResponse(<DriverListResponse drivers={drivers} title="Drivers with Expiring Badges" />);
            } else if (lowerPrompt.includes("report") || lowerPrompt.includes("review")) {
                const driver = mockDrivers.find(d => d.id === 'D001');
                setAiResponse(
                    <ReportResponse reportTitle={`Q3 Performance Review: ${driver?.firstName} ${driver?.lastName}`}>
                        <p>Here is a summary of the Q3 performance for driver D001, John Doe.</p>
                        <ul>
                            <li><strong>Total Earnings:</strong> £12,450.75</li>
                            <li><strong>Jobs Completed:</strong> 312</li>
                            <li><strong>Average Job Value:</strong> £39.91</li>
                            <li><strong>Promotions Participated:</strong> Rush Hour Cashback (Completed 3 times)</li>
                        </ul>
                        <p>Overall, John Doe has demonstrated excellent performance and consistency throughout the quarter. His participation in reward schemes is high.</p>
                    </ReportResponse>
                );
            } else {
                 setAiResponse(
                    <Card><CardContent className="pt-6"><p>Sorry, I can't answer that. Please try asking about drivers with expiring documents or requesting a performance review.</p></CardContent></Card>
                );
            }
            setIsLoading(false);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in-0" 
            onClick={onClose}
        >
            <div 
                className="bg-card rounded-xl shadow-2xl w-full max-w-2xl mx-auto mt-[15vh] animate-in fade-in-0 zoom-in-95"
                onClick={e => e.stopPropagation()}
            >
                <form onSubmit={handleCommandSubmit}>
                    <div className="relative">
                        <SparklesIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary pointer-events-none" />
                        <Input 
                            ref={inputRef}
                            placeholder="Ask AI anything..."
                            className="pl-11 h-14 text-base bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                        <Button size="icon" className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9" type="submit" disabled={isLoading || !prompt}>
                            <PaperAirplaneIcon className="w-4 h-4" />
                        </Button>
                    </div>
                </form>

                <div className="p-4 border-t border-border min-h-[200px] max-h-[50vh] overflow-y-auto">
                    {isLoading && (
                        <div className="flex items-center justify-center h-full">
                            <div className="flex items-center space-x-3 text-muted-foreground">
                                <SparklesIcon className="w-5 h-5 text-primary animate-pulse" />
                                <p className="text-sm font-medium">Thinking...</p>
                            </div>
                        </div>
                    )}
                    {aiResponse && (
                        <div className="animate-in fade-in-50 duration-500">
                           {aiResponse}
                        </div>
                    )}
                    {!isLoading && !aiResponse && (
                         <div>
                            <p className="text-sm font-semibold text-foreground mb-3">Suggestions</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <button type="button" onClick={() => setPrompt("Show drivers in Manchester with expiring badges")} className="text-left p-3 rounded-lg hover:bg-muted text-sm">Show drivers with expiring badges</button>
                                <button type="button" onClick={() => setPrompt("Generate Q3 performance review for D001")} className="text-left p-3 rounded-lg hover:bg-muted text-sm">Generate Q3 report for D001</button>
                                <button type="button" onClick={() => setPrompt("List all active vehicles")} className="text-left p-3 rounded-lg hover:bg-muted text-sm">List all active vehicles</button>
                                <button type="button" onClick={() => setPrompt("Find accounts with overdue balances")} className="text-left p-3 rounded-lg hover:bg-muted text-sm">Find accounts with overdue balances</button>
                            </div>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
