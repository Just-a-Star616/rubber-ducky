

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { mockSystemAttributes } from '../../lib/mockData';
import { SystemAttribute } from '../../types';
import AttributeEditModal from '../../components/staff/AttributeEditModal';
import { PlusCircleIcon, PencilIcon, CodeBracketIcon, CheckIcon, XIcon } from '../../components/icons/Icon';

const statusStyles: { [key: string]: string } = {
  true: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  false: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const formatPricing = (attr: SystemAttribute) => {
    const { type, priceEffect, costEffect } = attr.pricing;
    if (type === 'none') return 'No change';
    
    const format = (val: number) => {
        const sign = val >= 0 ? '+' : '-';
        const absVal = Math.abs(val);
        return `${sign}${type === '%' ? `${absVal}%` : `£${absVal.toFixed(2)}`}`;
    };

    return `Price: ${format(priceEffect)} / Cost: ${format(costEffect)}`;
};

const AttributesAdminPage: React.FC = () => {
    const [attributes, setAttributes] = useState<SystemAttribute[]>(mockSystemAttributes);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAttribute, setEditingAttribute] = useState<SystemAttribute | null>(null);
    
    const handleAdd = () => {
        setEditingAttribute(null);
        setIsModalOpen(true);
    };

    const handleEdit = (attribute: SystemAttribute) => {
        setEditingAttribute(attribute);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAttribute(null);
    };

    const handleSave = (savedAttribute: SystemAttribute) => {
        if (editingAttribute) {
            setAttributes(prev => prev.map(attr => attr.id === savedAttribute.id ? savedAttribute : attr));
        } else {
            setAttributes(prev => [...prev, { ...savedAttribute, id: `ATTR${Date.now()}` }]);
        }
        handleCloseModal();
    };

    const handleDelete = (attributeId: string) => {
        if (window.confirm("Are you sure you want to delete this attribute? This cannot be undone.")) {
            setAttributes(prev => prev.filter(attr => attr.id !== attributeId));
            handleCloseModal();
        }
    };

    return (
        <div className="space-y-6">
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm -mt-4 sm:-mt-6 lg:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 border-b border-border">
                <div className="flex justify-end">
                    <Button onClick={handleAdd}><PlusCircleIcon className="w-4 h-4 mr-2"/> Add Attribute</Button>
                </div>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>System Attributes</CardTitle>
                    <CardDescription>Define attributes that can be applied to drivers, vehicles, customers, or accounts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Attribute</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Eligibility</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Pricing Impact</th>
                                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Commissionable</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Conditions</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {attributes.map(attr => (
                                    <tr key={attr.id}>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <p className="font-semibold">{attr.name}</p>
                                            <p className="text-xs text-muted-foreground truncate max-w-xs">{attr.description}</p>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex flex-wrap gap-1">
                                                {attr.eligibility.map(e => (
                                                    <span key={e} className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">{e}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{formatPricing(attr)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-center">
                                            {attr.pricing.type !== 'none' ? (
                                                attr.pricing.applyCommission 
                                                    ? <span title="Commission is applied"><CheckIcon className="w-5 h-5 text-green-500 mx-auto" /></span>
                                                    : <span title="Commission is not applied"><XIcon className="w-5 h-5 text-red-500 mx-auto" /></span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                            {attr.conditions.autoApplyRule && <span title={`Auto-apply: ${attr.conditions.autoApplyRule}`}><CodeBracketIcon className="w-5 h-5" /></span>}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[String(attr.isActive)]}`}>
                                              {attr.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(attr)}><PencilIcon className="w-4 h-4 mr-1"/> Edit</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {isModalOpen && (
                <AttributeEditModal
                    attribute={editingAttribute}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};

export default AttributesAdminPage;