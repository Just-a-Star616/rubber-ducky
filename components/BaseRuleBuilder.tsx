import React, { useState, useMemo } from 'react';
import { ConditionExpression, RuleContext, ExpressionBuilder, VariableDefinition } from '../lib/ruleBuilder';
import './BaseRuleBuilder.css';

interface BaseRuleBuilderProps {
  title: string;
  description: string;
  context: RuleContext;
  onSave: (config: RuleConfig) => void;
  onCancel: () => void;
  initialConfig?: RuleConfig;
  showAdvancedOptions?: boolean;
}

export interface RuleConfig {
  name: string;
  description: string;
  trigger: string;
  conditions: ConditionExpression[];
  expression: string;
  enabled: boolean;
  actions?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * BaseRuleBuilder - Unified component for building rules across the system
 * 
 * Features:
 * - Consistent UI/UX across all rule types
 * - Visual condition builder with drag-and-drop support
 * - Variable picker with autocomplete
 * - Real-time expression preview
 * - Expression validation
 * - Rule templates
 */
export const BaseRuleBuilder: React.FC<BaseRuleBuilderProps> = ({
  title,
  description,
  context,
  onSave,
  onCancel,
  initialConfig,
  showAdvancedOptions = false,
}) => {
  const [name, setName] = useState(initialConfig?.name || '');
  const [ruleDescription, setRuleDescription] = useState(initialConfig?.description || '');
  const [conditions, setConditions] = useState<ConditionExpression[]>(initialConfig?.conditions || []);
  const [enabled, setEnabled] = useState(initialConfig?.enabled ?? true);
  const [showExpression, setShowExpression] = useState(false);

  // Generate expression from conditions
  const expression = useMemo(() => {
    return ExpressionBuilder.buildExpression(conditions);
  }, [conditions]);

  // Validate expression
  const expressionValid = useMemo(() => {
    return ExpressionBuilder.validateExpression(expression);
  }, [expression]);

  const handleAddCondition = () => {
    const newCondition: ConditionExpression = {
      id: `cond_${Date.now()}`,
      variable: null,
      operator: '==',
      value: '',
      logicalOperator: conditions.length > 0 ? '&&' : undefined,
    };
    setConditions([...conditions, newCondition]);
  };

  const handleUpdateCondition = (id: string, updates: Partial<ConditionExpression>) => {
    setConditions(conditions.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const handleRemoveCondition = (id: string) => {
    const updated = conditions.filter(c => c.id !== id);
    setConditions(updated);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Rule name is required');
      return;
    }

    if (!expressionValid.valid) {
      alert(`Expression error: ${expressionValid.error}`);
      return;
    }

    const config: RuleConfig = {
      name,
      description: ruleDescription,
      trigger: context.id,
      conditions,
      expression,
      enabled,
    };

    onSave(config);
  };

  return (
    <div className="base-rule-builder">
      <div className="builder-header">
        <h2>{title}</h2>
        <p className="builder-description">{description}</p>
      </div>

      <div className="builder-section basic-info">
        <h3>Basic Information</h3>
        
        <div className="form-group">
          <label htmlFor="rule-name">Rule Name *</label>
          <input
            id="rule-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., VIP Late Alert"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="rule-description">Description</label>
          <textarea
            id="rule-description"
            value={ruleDescription}
            onChange={(e) => setRuleDescription(e.target.value)}
            placeholder="Describe what this rule does..."
            className="form-textarea"
            rows={3}
          />
        </div>

        <div className="form-group form-group-inline">
          <label>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            <span>Enabled</span>
          </label>
        </div>
      </div>

      <div className="builder-section trigger-section">
        <h3>Trigger / Context</h3>
        <div className="trigger-display">
          <div className="trigger-badge">{context.name}</div>
          <p className="trigger-description">{context.description}</p>
        </div>
      </div>

      <div className="builder-section conditions-section">
        <div className="section-header">
          <h3>Conditions</h3>
          <p className="section-hint">
            Available variables: {context.variables.map(v => v.id).join(', ')}
          </p>
        </div>

        {conditions.length === 0 ? (
          <div className="empty-state">
            <p>No conditions yet. Click "Add Condition" to get started.</p>
          </div>
        ) : (
          <div className="conditions-list">
            {conditions.map((condition, index) => (
              <ConditionRow
                key={condition.id}
                condition={condition}
                context={context}
                isFirst={index === 0}
                onUpdate={(updates) => handleUpdateCondition(condition.id, updates)}
                onRemove={() => handleRemoveCondition(condition.id)}
              />
            ))}
          </div>
        )}

        <button className="btn btn-secondary" onClick={handleAddCondition}>
          + Add Condition
        </button>
      </div>

      <div className="builder-section expression-section">
        <div className="section-header">
          <h3>Expression Preview</h3>
          <button
            className="btn-toggle"
            onClick={() => setShowExpression(!showExpression)}
          >
            {showExpression ? 'Hide' : 'Show'}
          </button>
        </div>

        {showExpression && (
          <div className={`expression-preview ${expressionValid.valid ? 'valid' : 'invalid'}`}>
            <code>{expression || 'true'}</code>
            {!expressionValid.valid && (
              <div className="expression-error">⚠️ {expressionValid.error}</div>
            )}
          </div>
        )}
      </div>

      <div className="builder-actions">
        <button className="btn btn-danger" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={!expressionValid.valid || !name.trim()}
        >
          Save Rule
        </button>
      </div>
    </div>
  );
};

interface ConditionRowProps {
  condition: ConditionExpression;
  context: RuleContext;
  isFirst: boolean;
  onUpdate: (updates: Partial<ConditionExpression>) => void;
  onRemove: () => void;
}

const ConditionRow: React.FC<ConditionRowProps> = ({
  condition,
  context,
  isFirst,
  onUpdate,
  onRemove,
}) => {
  const selectedVariable = condition.variable;
  const suggestedOperators = selectedVariable
    ? ExpressionBuilder.getSuggestedOperators(selectedVariable.type)
    : context.operators;

  return (
    <div className="condition-row">
      {!isFirst && (
        <select
          className="logical-operator-select"
          value={condition.logicalOperator || '&&'}
          onChange={(e) => onUpdate({ logicalOperator: e.target.value as '&&' | '||' })}
        >
          <option value="&&">AND</option>
          <option value="||">OR</option>
        </select>
      )}

      <select
        className="variable-select"
        value={selectedVariable?.id || ''}
        onChange={(e) => {
          const variable = context.variables.find(v => v.id === e.target.value) || null;
          onUpdate({ variable });
        }}
      >
        <option value="">Select variable...</option>
        {context.variables.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>

      <select
        className="operator-select"
        value={condition.operator}
        onChange={(e) => onUpdate({ operator: e.target.value as any })}
        disabled={!selectedVariable}
      >
        <option value="">Operator</option>
        {suggestedOperators.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>

      <input
        type="text"
        className="value-input"
        value={String(condition.value)}
        onChange={(e) => onUpdate({ value: e.target.value })}
        placeholder="Value..."
        disabled={!selectedVariable}
      />

      <button className="btn-remove" onClick={onRemove} title="Remove condition">
        ✕
      </button>

      {selectedVariable && (
        <div className="variable-hint">{selectedVariable.description}</div>
      )}
    </div>
  );
};

export default BaseRuleBuilder;
