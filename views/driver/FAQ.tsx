import React, { useState, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { mockFaqs } from '../../lib/mockData';
import { FAQItem, FaqCategory } from '../../types';
import { ChevronDownIcon, VideoCameraIcon, DocumentTextIcon } from '../../components/icons/Icon';
import { Card, CardContent } from '../../components/ui/card';

const FAQItemCard: React.FC<{ item: FAQItem, isOpen: boolean, onToggle: () => void }> = ({ item, isOpen, onToggle }) => {
    return (
        <div className="border-b border-border last:border-b-0">
            <button
                className="w-full flex justify-between items-center text-left py-4"
                onClick={onToggle}
                aria-expanded={isOpen}
            >
                <h3 className="text-base font-medium text-foreground">{item.question}</h3>
                <ChevronDownIcon className={`w-5 h-5 text-muted-foreground transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="pb-4 space-y-4 animate-in fade-in-0 duration-300">
                    <p className="text-sm text-muted-foreground">{item.answer}</p>
                    <div className="flex flex-wrap gap-3">
                        {item.videoUrl && (
                             <Button variant="outline" onClick={() => window.open(item.videoUrl, '_blank')}>
                                <VideoCameraIcon className="w-4 h-4 mr-2" />
                                Watch Video
                            </Button>
                        )}
                        {item.documentUrl && (
                             <Button variant="outline" onClick={() => window.open(item.documentUrl, '_blank')}>
                                <DocumentTextIcon className="w-4 h-4 mr-2" />
                                Open Document
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
};


const FAQ: React.FC = () => {
    const [openId, setOpenId] = useState<string | null>(null);

    const groupedFaqs = useMemo(() => {
        return mockFaqs.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
        }, {} as Record<FaqCategory, FAQItem[]>);
    }, []);

    const toggleItem = (id: string) => {
        setOpenId(openId === id ? null : id);
    };

    const categories: FaqCategory[] = ['General', 'Payments', 'Using the App', 'Training Materials'];

    return (
         <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-foreground">F.A.Q & Training</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Find answers to common questions and access training materials.
                </p>
            </div>
            
            <div className="space-y-6">
                {categories.map(category => (
                    groupedFaqs[category] && (
                        <section key={category}>
                             <h3 className="text-lg font-semibold text-foreground mb-2">{category}</h3>
                             <Card>
                                <CardContent className="p-2 sm:p-4">
                                    {groupedFaqs[category].map(item => (
                                        <FAQItemCard 
                                            key={item.id}
                                            item={item}
                                            isOpen={openId === item.id}
                                            onToggle={() => toggleItem(item.id)}
                                        />
                                    ))}
                                </CardContent>
                             </Card>
                        </section>
                    )
                ))}
            </div>
        </div>
    );
};

export default FAQ;
