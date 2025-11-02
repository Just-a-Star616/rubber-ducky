import React, { useState, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { mockRewardSchemes, mockPromotions, mockPartnerOffers, mockPromotionParticipants } from '../../lib/mockData';
import { RewardScheme, Driver, Promotion, PromotionParticipant, PartnerOffer } from '../../types';
import OptInConfirmationModal from '../../components/driver/OptInConfirmationModal';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { cn } from '../../lib/utils';

const ProgressBar = ({ current, target }: { current: number, target: number }) => {
    const percentage = Math.min((current / target) * 100, 100);
    const isComplete = current >= target;

    return (
        <div>
            <div className="flex justify-between mb-1 text-sm font-medium text-muted-foreground">
                <span>Progress</span>
                <span className={isComplete ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                    {current} / {target} Jobs
                </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
                <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-primary'}`} 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

interface RewardSchemeCardProps {
  scheme: RewardScheme;
  isParticipant: boolean;
  participantProgress?: number;
  onOptIn: (scheme: RewardScheme) => void;
  onOptOut: (schemeId: string) => void;
  className?: string;
}

const RewardSchemeCard: React.FC<RewardSchemeCardProps> = ({ scheme, isParticipant, participantProgress, onOptIn, onOptOut, className }) => (
    <Card className={cn("flex flex-col", className)}>
        <CardHeader>
            <CardTitle className="text-base">{scheme.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow space-y-3">
            <p className="text-sm text-muted-foreground">{scheme.description}</p>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch space-y-3 pt-4 border-t">
            {isParticipant ? (
                <ProgressBar current={participantProgress || 0} target={scheme.target} />
            ) : (
                <Button onClick={() => onOptIn(scheme)} className="w-full">Opt-In to Scheme</Button>
            )}
            <div className="text-center bg-primary/10 p-2 rounded-lg">
                <p className="text-xs text-muted-foreground">Reward</p>
                <p className="text-sm font-bold text-primary">{scheme.rewardDescription}</p>
            </div>
            {isParticipant && (
                 <div className="text-center">
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">✓ Enrolled</span>
                    <button onClick={() => onOptOut(scheme.id)} className="ml-2 text-xs text-muted-foreground hover:text-destructive underline">Opt-Out</button>
                 </div>
            )}
        </CardFooter>
    </Card>
);

const Rewards: React.FC<{ driver: Driver }> = ({ driver }) => {
    // Local state for interactive data
    const [participants, setParticipants] = useState<PromotionParticipant[]>(mockPromotionParticipants);

    // Modal state
    const [confirmingOptIn, setConfirmingOptIn] = useState<{ promotion: RewardScheme | Promotion, type: 'scheme' | 'promotion' } | null>(null);

    const driverParticipantPromotionIds = useMemo(() => {
        return new Set(
            participants
                .filter(p => p.driverId === driver.id && p.status === 'Active')
                .map(p => p.promotionId)
        );
    }, [participants, driver.id]);

    const handleOpenConfirmation = (promotion: RewardScheme | Promotion, type: 'scheme' | 'promotion') => {
        setConfirmingOptIn({ promotion, type });
    };

    const handleConfirmOptIn = () => {
        if (!confirmingOptIn) return;
        
        const { promotion } = confirmingOptIn;
        const existingParticipant = participants.find(p => p.promotionId === promotion.id && p.driverId === driver.id);

        if (existingParticipant) {
             // If driver had previously opted out, re-activate them
             setParticipants(prev => prev.map(p => p.id === existingParticipant.id ? { ...p, status: 'Active', joinDate: new Date().toISOString() } : p));
        } else {
            // Otherwise, create a new participant record
            const newParticipant: PromotionParticipant = {
                id: `PP${Date.now()}`,
                promotionId: promotion.id,
                driverId: driver.id,
                status: 'Active',
                progress: 0,
                joinDate: new Date().toISOString(),
            };
            setParticipants(prev => [...prev, newParticipant]);
        }
        
        setConfirmingOptIn(null);
    };

    const handleOptOut = (promotionId: string) => {
        if (window.confirm("Are you sure you want to opt-out of this promotion? Any progress will be lost and you will no longer be eligible for its rewards unless you opt-in again.")) {
            setParticipants(prev => prev.map(p =>
                p.promotionId === promotionId && p.driverId === driver.id
                    ? { ...p, status: 'Removed' }
                    : p
            ));
        }
    };


    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-foreground">Rewards & Offers</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Check out active reward schemes, promotions, and exclusive partner offers.
                </p>
            </div>

            <section>
                <h3 className="text-lg font-semibold text-foreground mb-3">Active Reward Schemes</h3>
                <div className="flex flex-wrap gap-4">
                    {mockRewardSchemes.map(scheme => {
                        const isParticipant = driverParticipantPromotionIds.has(scheme.id);
                        const participantData = isParticipant 
                            ? participants.find(p => p.promotionId === scheme.id && p.driverId === driver.id)
                            : undefined;
                        
                        return (
                            <RewardSchemeCard 
                                key={scheme.id} 
                                scheme={scheme} 
                                isParticipant={isParticipant}
                                participantProgress={participantData?.progress}
                                onOptIn={(s) => handleOpenConfirmation(s, 'scheme')}
                                onOptOut={handleOptOut}
                                className="flex-1 min-w-[320px]"
                            />
                        );
                    })}
                </div>
            </section>
            
             <section>
                <h3 className="text-lg font-semibold text-foreground mb-3">Promotions</h3>
                <div className="flex flex-wrap gap-4">
                   {mockPromotions.map(promo => {
                       const isParticipant = driverParticipantPromotionIds.has(promo.id);
                       return (
                           <Card key={promo.id} className="flex flex-col justify-between flex-1 min-w-[320px]">
                               <CardHeader><CardTitle className="text-base">{promo.title}</CardTitle></CardHeader>
                               <CardContent className="flex-grow">
                                   <p className="text-sm text-muted-foreground">{promo.description}</p>
                               </CardContent>
                               <CardFooter>
                                   {isParticipant ? (
                                       <div className="flex items-center justify-between w-full">
                                           <Button variant="outline" disabled>{promo.callToAction}</Button>
                                           <div>
                                                <span className="text-sm font-medium text-green-600 dark:text-green-400">✓ Enrolled</span>
                                                <button onClick={() => handleOptOut(promo.id)} className="ml-2 text-xs text-muted-foreground hover:text-destructive underline">Opt-Out</button>
                                           </div>
                                       </div>
                                   ) : (
                                       <Button onClick={() => handleOpenConfirmation(promo, 'promotion')}>Opt-In to Promotion</Button>
                                   )}
                               </CardFooter>
                           </Card>
                       );
                   })}
                </div>
            </section>
            
            <section>
                <h3 className="text-lg font-semibold text-foreground mb-3">Partner Offers</h3>
                {mockPartnerOffers.map(offer => (
                    <Card key={offer.id}>
                      <CardHeader>
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary">{offer.partnerName}</p>
                        <CardTitle className="text-base !mt-1">{offer.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{offer.description}</p>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 bg-muted p-3 rounded-lg">
                            <div className="flex items-center gap-4">
                                <p className="text-sm font-medium text-muted-foreground">Your Code:</p>
                                <p className="text-lg font-bold font-mono tracking-widest text-foreground">{offer.promoCode}</p>
                            </div>
                            {offer.offerUrl && (
                                <Button variant="secondary" onClick={() => window.open(offer.offerUrl, '_blank')}>
                                    Go to Offer
                                </Button>
                            )}
                        </div>
                      </CardContent>
                    </Card>
                ))}
            </section>

            {confirmingOptIn && (
                 <OptInConfirmationModal 
                    isOpen={!!confirmingOptIn}
                    onClose={() => setConfirmingOptIn(null)}
                    onConfirm={handleConfirmOptIn}
                    promotion={confirmingOptIn.promotion}
                 />
            )}
        </div>
    );
};

export default Rewards;