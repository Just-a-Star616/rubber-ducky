import React, { useEffect } from 'react';
import { Automation, AutomationTrigger, AutomationAction, MessageTemplate, SystemAttribute, StaffMember } from '../../types';
import { Button } from '../ui/button';
import { XIcon, TrashIcon } from '../icons/Icon';
import BaseRuleBuilder, { RuleConfig } from '../BaseRuleBuilder';
import { RULE_CONTEXTS } from '../../lib/ruleBuilder';

interface AutomationEditModalProps {
    automation: Automation | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (automation: Automation) => void;
    onDelete: (automationId: string) => void;
    triggers: AutomationTrigger[];
    actions: AutomationAction[];
    messageTemplates: MessageTemplate[];
    systemAttributes: SystemAttribute[];
    staffList: StaffMember[];
}

const AutomationEditModal: React.FC<AutomationEditModalProps> = ({ 
    isOpen, onClose, onSave, onDelete, automation, actions, messageTemplates, systemAttributes, staffList 
}) => {
    if (!isOpen) return null;

    const isNew = !automation;

    const handleSaveRule = (config: RuleConfig) => {
        const newAutomation: Automation = {
            id: automation?.id || `AUTO${Date.now()}`,
            name: config.name,
            description: config.description,
            isActive: config.enabled,
            triggerId: automation?.triggerId || 'TRG01',
            conditions: config.expression,
            actions: automation?.actions || [],
        };
        onSave(newAutomation);
        onClose();
    };

    const handleDeleteClick = () => {
        if (automation?.id && confirm('Delete this automation rule?')) {
            onDelete(automation.id);
            onClose();
        }
    };

    const initialConfig = automation ? {
        name: automation.name,
        description: automation.description,
        trigger: automation.triggerId,
        conditions: [],
        expression: automation.conditions,
        enabled: automation.isActive,
        actions: automation.actions,
    } : undefined;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="relative bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="sticky top-0 bg-card px-6 py-4 border-b border-border flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold">{isNew ? 'Create Automation Rule' : 'Edit Automation Rule'}</h2>
                    <button type="button" onClick={onClose} className="hover:opacity-75"><XIcon className="w-6 h-6" /></button>
                </header>
                
                <div className="flex-grow overflow-y-auto p-6">
                    <BaseRuleBuilder
                        title=""
                        description=""
                        context={RULE_CONTEXTS.automation_trigger}
                        onSave={handleSaveRule}
                        onCancel={onClose}
                        initialConfig={initialConfig}
                    />
                </div>

                <footer className="sticky bottom-0 bg-card/80 backdrop-blur-sm px-6 py-4 border-t border-border flex justify-between items-center">
                    <button 
                        type="button" 
                        onClick={handleDeleteClick}
                        disabled={isNew}
                        className="px-4 py-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <TrashIcon className="w-4 h-4 inline mr-2"/> Delete
                    </button>
                    <div className="space-x-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 border border-border rounded hover:bg-muted"
                        >
                            Cancel
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AutomationEditModal;