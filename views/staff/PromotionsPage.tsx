

import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { mockRewardSchemes, mockPromotions, mockPartnerOffers, mockPromotionParticipants, mockDrivers } from '../../lib/mockData';
import { RewardScheme, Promotion, PartnerOffer, PromotionParticipant } from '../../types';
import RewardSchemeEditModal from '../../components/staff/RewardSchemeEditModal';
import PromotionEditModal from '../../components/staff/PromotionEditModal';
import PartnerOfferEditModal from '../../components/staff/PartnerOfferEditModal';
import PromotionParticipantsModal from '../../components/staff/PromotionParticipantsModal';
import { UserGroupIcon, CodeBracketIcon, PencilIcon } from '../../components/icons/Icon';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';

const PromotionsPage: React.FC = () => {
    // State for data
    const [rewardSchemes, setRewardSchemes] = useState<RewardScheme[]>(mockRewardSchemes);
    const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
    const [partnerOffers, setPartnerOffers] = useState<PartnerOffer[]>(mockPartnerOffers);
    const [participants, setParticipants] = useState<PromotionParticipant[]>(mockPromotionParticipants);

    // State for modals
    const [editingRewardScheme, setEditingRewardScheme] = useState<RewardScheme | null>(null);
    const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
    
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
    const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);

    const [editingPartnerOffer, setEditingPartnerOffer] = useState<PartnerOffer | null>(null);
    const [isPartnerOfferModalOpen, setIsPartnerOfferModalOpen] = useState(false);

    const [viewingParticipantsOf, setViewingParticipantsOf] = useState<{id: string, title: string} | null>(null);
    const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);


    // Handlers for Reward Schemes
    const handleEditRewardScheme = (scheme: RewardScheme) => {
        setEditingRewardScheme(scheme);
        setIsRewardModalOpen(true);
    };
    const handleAddRewardScheme = () => {
        setEditingRewardScheme(null);
        setIsRewardModalOpen(true);
    };
    const handleSaveRewardScheme = (scheme: RewardScheme) => {
        if (scheme.id && !scheme.id.startsWith('new-')) {
            setRewardSchemes(prev => prev.map(s => s.id === scheme.id ? scheme : s));
        } else {
            setRewardSchemes(prev => [...prev, { ...scheme, id: `R${Date.now()}`, participantIds: [] }]);
        }
        setIsRewardModalOpen(false);
    };
    const handleDeleteRewardScheme = (id: string) => {
        if (window.confirm('Are you sure you want to delete this reward scheme?')) {
            setRewardSchemes(prev => prev.filter(s => s.id !== id));
            setIsRewardModalOpen(false);
        }
    };

    // Handlers for Promotions
    const handleEditPromotion = (promo: Promotion) => {
        setEditingPromotion(promo);
        setIsPromotionModalOpen(true);
    };
    const handleAddPromotion = () => {
        setEditingPromotion(null);
        setIsPromotionModalOpen(true);
    };
    const handleSavePromotion = (promo: Promotion) => {
        if (promo.id && !promo.id.startsWith('new-')) {
            setPromotions(prev => prev.map(p => p.id === promo.id ? promo : p));
        } else {
            setPromotions(prev => [...prev, { ...promo, id: `P${Date.now()}`, participantIds: [] }]);
        }
        setIsPromotionModalOpen(false);
    };
    const handleDeletePromotion = (id: string) => {
        if (window.confirm('Are you sure you want to delete this promotion?')) {
            setPromotions(prev => prev.filter(p => p.id !== id));
            setIsPromotionModalOpen(false);
        }
    };

    // Handlers for Partner Offers
    const handleEditPartnerOffer = (offer: PartnerOffer) => {
        setEditingPartnerOffer(offer);
        setIsPartnerOfferModalOpen(true);
    };
    const handleAddPartnerOffer = () => {
        setEditingPartnerOffer(null);
        setIsPartnerOfferModalOpen(true);
    };
    const handleSavePartnerOffer = (offer: PartnerOffer) => {
        if (offer.id && !offer.id.startsWith('new-')) {
            setPartnerOffers(prev => prev.map(o => o.id === offer.id ? offer : o));
        } else {
            setPartnerOffers(prev => [...prev, { ...offer, id: `O${Date.now()}`, participantIds: [] }]);
        }
        setIsPartnerOfferModalOpen(false);
    };
    const handleDeletePartnerOffer = (id: string) => {
        if (window.confirm('Are you sure you want to delete this partner offer?')) {
            setPartnerOffers(prev => prev.filter(o => o.id !== id));
            setIsPartnerOfferModalOpen(false);
        }
    };

    // Handlers for Participants Modal
    const handleViewParticipants = (promotion: {id: string, title: string}) => {
        setViewingParticipantsOf(promotion);
        setIsParticipantModalOpen(true);
    };

    const handleUpdateParticipantStatus = (participantId: string, status: PromotionParticipant['status']) => {
        setParticipants(prev => prev.map(p => p.id === participantId ? { ...p, status } : p));
    };


    const renderEligibilityRules = (rules: string[]) => {
        if (rules.length === 0) {
            return <span className="text-muted-foreground italic">All drivers</span>;
        }
        return (
            <div className="flex items-center space-x-1">
                <CodeBracketIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">{rules.length} rule(s)</span>
            </div>
        )
    };

    return (
        <div className="space-y-6">
             <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm -mt-4 sm:-mt-6 lg:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 border-b border-border">
                <div className="flex justify-end gap-2">
                    <Button onClick={handleAddRewardScheme}>Add Reward Scheme</Button>
                    <Button onClick={handleAddPromotion}>Add Promotion</Button>
                    <Button onClick={handleAddPartnerOffer}>Add Partner Offer</Button>
                </div>
            </div>

            <div className="space-y-8">
                {/* Reward Schemes Section */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-foreground">Reward Schemes</h3>
                    </div>
                    <div className="flex flex-wrap gap-6">
                        {rewardSchemes.map(scheme => (
                            <Card key={scheme.id} className="flex flex-col flex-1 min-w-[320px]">
                                <CardHeader>
                                    <CardTitle>{scheme.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-3">
                                    <p className="text-sm text-muted-foreground min-h-[60px]">{scheme.description}</p>
                                    <div className="text-center bg-primary/10 p-2 rounded-lg">
                                        <p className="text-xs text-muted-foreground">Reward: <span className="font-bold text-primary">{scheme.rewardDescription}</span></p>
                                        <p className="text-xs text-muted-foreground">Target: <span className="font-semibold">{scheme.target} jobs</span></p>
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center justify-between">
                                        <span className="font-semibold text-foreground">Eligibility:</span>
                                        {renderEligibilityRules(scheme.eligibilityRules)}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex space-x-2">
                                    <Button className="w-full" variant="outline" onClick={() => handleEditRewardScheme(scheme)}><PencilIcon className="w-4 h-4 mr-2" />Edit</Button>
                                    <Button className="w-full" variant="outline" onClick={() => handleViewParticipants({id: scheme.id, title: scheme.title})}>
                                        <UserGroupIcon className="w-4 h-4 mr-2" />
                                        Participants ({participants.filter(p => p.promotionId === scheme.id).length})
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Promotions Section */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-foreground">Promotions</h3>
                    </div>
                    <div className="flex flex-wrap gap-6">
                        {promotions.map(promo => (
                            <Card key={promo.id} className="flex flex-col flex-1 min-w-[320px]">
                                <CardHeader><CardTitle>{promo.title}</CardTitle></CardHeader>
                                <CardContent className="flex-grow space-y-3">
                                    <p className="text-sm text-muted-foreground">{promo.description}</p>
                                    <div className="text-xs text-muted-foreground flex items-center justify-between">
                                        <span className="font-semibold text-foreground">Eligibility:</span>
                                        {renderEligibilityRules(promo.eligibilityRules)}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex space-x-2">
                                    <Button className="w-full" variant="outline" onClick={() => handleEditPromotion(promo)}><PencilIcon className="w-4 h-4 mr-2" />Edit</Button>
                                    <Button className="w-full" variant="outline" onClick={() => handleViewParticipants({id: promo.id, title: promo.title})}>
                                        <UserGroupIcon className="w-4 h-4 mr-2" />
                                        Participants ({participants.filter(p => p.promotionId === promo.id).length})
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Partner Offers Section */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-foreground">Partner Offers</h3>
                    </div>
                    <div className="flex flex-wrap gap-6">
                        {partnerOffers.map(offer => (
                            <Card key={offer.id} className="flex flex-col flex-1 min-w-[320px]">
                            <CardHeader>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">{offer.partnerName}</p>
                                    <CardTitle>{offer.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-3">
                                    <p className="text-sm text-muted-foreground">{offer.description}</p>
                                    <div className="text-xs text-muted-foreground flex items-center justify-between">
                                        <span className="font-semibold text-foreground">Eligibility:</span>
                                        {renderEligibilityRules(offer.eligibilityRules)}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex space-x-2">
                                    <Button className="w-full" variant="outline" onClick={() => handleEditPartnerOffer(offer)}><PencilIcon className="w-4 h-4 mr-2" />Edit</Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>

            {isRewardModalOpen && (
                <RewardSchemeEditModal
                    scheme={editingRewardScheme}
                    isOpen={isRewardModalOpen}
                    onClose={() => setIsRewardModalOpen(false)}
                    onSave={handleSaveRewardScheme}
                    onDelete={handleDeleteRewardScheme}
                />
            )}
            {isPromotionModalOpen && (
                <PromotionEditModal
                    promotion={editingPromotion}
                    isOpen={isPromotionModalOpen}
                    onClose={() => setIsPromotionModalOpen(false)}
                    onSave={handleSavePromotion}
                    onDelete={handleDeletePromotion}
                />
            )}
            {isPartnerOfferModalOpen && (
                <PartnerOfferEditModal
                    offer={editingPartnerOffer}
                    isOpen={isPartnerOfferModalOpen}
                    onClose={() => setIsPartnerOfferModalOpen(false)}
                    onSave={handleSavePartnerOffer}
                    onDelete={handleDeletePartnerOffer}
                />
            )}
            {isParticipantModalOpen && viewingParticipantsOf && (
                <PromotionParticipantsModal
                    isOpen={isParticipantModalOpen}
                    onClose={() => setIsParticipantModalOpen(false)}
                    promotion={viewingParticipantsOf}
                    participants={participants.filter(p => p.promotionId === viewingParticipantsOf.id)}
                    drivers={mockDrivers}
                    onUpdateParticipantStatus={handleUpdateParticipantStatus}
                />
            )}

        </div>
    );
};

export default PromotionsPage;