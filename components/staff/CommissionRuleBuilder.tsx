import React, { useState } from 'react';
import { CommissionFieldRule, CommissionOutputRule } from '../../types';
import { Button } from '../ui/button';
import { TrashIcon, PlusCircleIcon } from '../icons/Icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface CommissionRuleBuilderProps {
  stage: 1 | 2 | 3;
  fieldRules?: CommissionFieldRule[];
  commissionFormula?: string;
  outputRules?: CommissionOutputRule[];
  onFieldRulesChange?: (rules: CommissionFieldRule[]) => void;
  onFormulaChange?: (formula: string) => void;
  onOutputRulesChange?: (rules: CommissionOutputRule[]) => void;
}

// UK Airports
const UK_AIRPORTS = [
  'Heathrow',
  'Gatwick',
  'Stansted',
  'Luton',
  'City Airport',
  'Southend',
  'Bristol',
  'Manchester',
  'Birmingham',
  'Leeds',
  'Glasgow',
  'Edinburgh',
];

// Available booking CSV fields
const AVAILABLE_BOOKING_FIELDS = [
  { name: 'price', description: 'Customer price charged', group: 'Financial' },
  { name: 'cost', description: 'Operational cost', group: 'Financial' },
  { name: 'toll_fee', description: 'Toll charges', group: 'Charges', airportAware: true },
  { name: 'surge_charge', description: 'Surge pricing charge', group: 'Charges', airportAware: true },
  { name: 'platform_fee', description: 'Platform/booking fee', group: 'Charges' },
  { name: 'congestion_charge', description: 'London congestion charge', group: 'Charges' },
  { name: 'fuel_surcharge', description: 'Fuel surcharge', group: 'Charges' },
  { name: 'passenger_tip', description: 'Passenger tip/gratuity', group: 'Income', airportAware: true },
  { name: 'bonus', description: 'Quest or promotional bonus', group: 'Income' },
  { name: 'pickup_distance', description: 'Distance traveled (km)', group: 'Metrics' },
  { name: 'waiting_time', description: 'Waiting time (minutes)', group: 'Metrics' },
  { name: 'num_passengers', description: 'Number of passengers', group: 'Metrics' },
];

const PREDEFINED_OUTPUT_RULES: CommissionOutputRule[] = [
  { outputName: 'Driver Income', formula: 'sum - commission', description: 'What driver receives' },
  { outputName: 'Company Income', formula: 'commission', description: 'What company retains' },
  { outputName: 'Total Booking Value', formula: 'sum', description: 'Total booking value' },
  { outputName: 'Net to Driver', formula: '(sum - commission) - fixed_charges', description: 'After fixed fees' },
  { outputName: 'Driver Income (Cash)', formula: 'sum - commission', description: 'Driver income from cash payments only', paymentMethods: ['Cash'] },
  { outputName: 'Driver Income (Card)', formula: 'sum - commission', description: 'Driver income from card payments only', paymentMethods: ['Card'] },
  { outputName: 'Driver Income (Invoice)', formula: 'sum - commission', description: 'Driver income from invoice/account bookings', paymentMethods: ['Invoice'] },
  { outputName: 'Company Income (Cash)', formula: 'commission', description: 'Company commission from cash only', paymentMethods: ['Cash'] },
  { outputName: 'Company Income (Card)', formula: 'commission', description: 'Company commission from card only', paymentMethods: ['Card'] },
];

const Stage1FieldSelector: React.FC<{
  rules?: CommissionFieldRule[];
  onChange: (rules: CommissionFieldRule[]) => void;
}> = ({ rules = [], onChange }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleToggleField = (fieldName: string, include: boolean) => {
    const updated = [...rules];
    const index = updated.findIndex(r => r.fieldName === fieldName);
    if (index >= 0) {
      updated[index] = { ...updated[index], include };
    } else {
      const field = AVAILABLE_BOOKING_FIELDS.find(f => f.name === fieldName);
      updated.push({
        fieldName,
        include,
        description: field?.description,
      });
    }
    onChange(updated);
  };

  const handleUpdateCondition = (index: number, condition: string) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], condition: condition || undefined };
    onChange(updated);
  };

  const handleUpdateAirportHandling = (index: number, handling: 'all' | 'airport_only' | 'exclude_airport') => {
    const updated = [...rules];
    updated[index] = { ...updated[index], airportHandling: handling };
    onChange(updated);
  };

  const handleUpdateAirportLocationType = (index: number, locationType: 'pickup' | 'destination') => {
    const updated = [...rules];
    updated[index] = { ...updated[index], airportLocationType: locationType };
    onChange(updated);
  };

  const groupedFields = AVAILABLE_BOOKING_FIELDS.reduce((acc, field) => {
    if (!acc[field.group]) acc[field.group] = [];
    acc[field.group].push(field);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_BOOKING_FIELDS>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedFields).map(([group, fields]) => (
        <div key={group}>
          <h4 className="text-sm font-semibold text-foreground mb-2">{group}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-2">
            {fields.map(field => {
              const rule = rules.find(r => r.fieldName === field.name);
              const isIncluded = rule?.include ?? false;
              const ruleIndex = rules.findIndex(r => r.fieldName === field.name);
              return (
                <div key={field.name}>
                  <div
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      isIncluded
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-border hover:border-primary-300'
                    }`}
                    onClick={() => handleToggleField(field.name, !isIncluded)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{field.name}</p>
                        <p className="text-xs text-muted-foreground">{field.description}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={isIncluded}
                        onChange={() => {}}
                        className="h-4 w-4"
                      />
                    </div>
                  </div>
                  {isIncluded && ruleIndex >= 0 && (
                    <div className="mt-2 ml-2 p-2 bg-muted rounded text-xs space-y-2">
                      {/* Airport Handling for airport-aware fields */}
                      {field.airportAware && (
                        <div className="space-y-2 pb-2 border-b border-border">
                          <p className="font-medium text-muted-foreground">Airports: {UK_AIRPORTS.join(', ')}</p>
                          
                          {/* Select Pickup or Destination */}
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground block">Check airport at:</label>
                            {(['pickup', 'destination'] as const).map((locType) => (
                              <label key={locType} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`location-type-${ruleIndex}`}
                                  checked={rule?.airportLocationType === locType || (locType === 'pickup' && !rule?.airportLocationType)}
                                  onChange={() => handleUpdateAirportLocationType(ruleIndex, locType)}
                                  className="h-3 w-3"
                                />
                                <span className="capitalize">{locType}</span>
                              </label>
                            ))}
                          </div>
                          
                          {/* Include/Exclude Options */}
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground block">Include this field for:</label>
                            {(['all', 'airport_only', 'exclude_airport'] as const).map((option) => (
                              <label key={option} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`airport-${ruleIndex}`}
                                  checked={rule?.airportHandling === option || (option === 'all' && !rule?.airportHandling)}
                                  onChange={() => handleUpdateAirportHandling(ruleIndex, option)}
                                  className="h-3 w-3"
                                />
                                <span>
                                  {option === 'all' && 'All bookings'}
                                  {option === 'airport_only' && 'Airport only'}
                                  {option === 'exclude_airport' && 'Non-airport only'}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Condition Editor */}
                      <button
                        onClick={() => setExpandedIndex(expandedIndex === ruleIndex ? null : ruleIndex)}
                        className="text-primary hover:underline text-left"
                      >
                        {rule?.condition ? '✓ Condition set' : '+ Add condition (optional)'}
                      </button>
                      {expandedIndex === ruleIndex && (
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Condition (JavaScript expression)
                          </label>
                          <Textarea
                            value={rule?.condition || ''}
                            onChange={(e) => handleUpdateCondition(ruleIndex, e.target.value)}
                            placeholder="e.g., pickup_address.includes('Heathrow') || pickup_address.includes('Gatwick')"
                            className="font-mono text-xs min-h-12"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Only include this field when the condition is true. Leave empty to always include.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const Stage2FormulaEditor: React.FC<{
  formula?: string;
  onChange: (formula: string) => void;
}> = ({ formula = '', onChange }) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">Commission Formula</label>
        <p className="text-xs text-muted-foreground mb-2">
          Define how commission is calculated from the selected fields sum. Available variables: <code className="bg-muted px-1 rounded">sum</code>, <code className="bg-muted px-1 rounded">commissionRate</code>
        </p>
        <Textarea
          value={formula}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Examples:
sum * commissionRate / 100
Math.min(sum * 0.20, 50)  // Max £50 commission
sum > 500 ? sum * 0.15 : sum * 0.20"
          className="font-mono text-xs min-h-24"
        />
      </div>
      <div className="bg-muted p-3 rounded text-xs space-y-1">
        <p className="font-semibold">Example Formulas:</p>
        <p>• <code>sum * commissionRate / 100</code> - Standard percentage</p>
        <p>• <code>Math.min(sum * 0.20, 100)</code> - Capped at £100</p>
        <p>• Tiered logic using conditional operators</p>
      </div>
    </div>
  );
};

const Stage3OutputRules: React.FC<{
  rules?: CommissionOutputRule[];
  onChange: (rules: CommissionOutputRule[]) => void;
}> = ({ rules = [], onChange }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleAddRule = (preset?: typeof PREDEFINED_OUTPUT_RULES[0]) => {
    const newRule: CommissionOutputRule = preset ? { ...preset } : {
      outputName: 'New Output',
      formula: '',
      description: '',
    };
    onChange([...rules, newRule]);
    setExpandedIndex(rules.length);
  };

  const handleUpdateRule = (index: number, updates: Partial<CommissionOutputRule>) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const handleDeleteRule = (index: number) => {
    onChange(rules.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAddRule()}
          className="text-xs"
        >
          <PlusCircleIcon className="w-3 h-3 mr-1" /> Custom Output
        </Button>
        <div className="relative group">
          <Button size="sm" variant="outline" className="text-xs">
            <PlusCircleIcon className="w-3 h-3 mr-1" /> Preset
          </Button>
          <div className="absolute left-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
            {PREDEFINED_OUTPUT_RULES.map((preset) => (
              <button
                key={preset.outputName}
                onClick={() => handleAddRule(preset)}
                className="block w-full text-left px-3 py-2 text-xs hover:bg-muted first:rounded-t-lg last:rounded-b-lg"
              >
                <p className="font-medium">{preset.outputName}</p>
                <p className="text-muted-foreground text-xs">{preset.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {rules.map((rule, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader
              className="pb-2 cursor-pointer hover:bg-muted/50"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm">{rule.outputName}</CardTitle>
                  {rule.description && (
                    <CardDescription className="text-xs mt-1">{rule.description}</CardDescription>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteRule(index);
                  }}
                  className="h-6 w-6"
                >
                  <TrashIcon className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            {expandedIndex === index && (
              <CardContent className="space-y-3 pt-2 pb-4">
                <Input
                  label="Output Name"
                  placeholder="e.g., Driver Income"
                  value={rule.outputName}
                  onChange={(e) => handleUpdateRule(index, { outputName: e.target.value })}
                  className="text-sm"
                />
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Formula</label>
                  <Textarea
                    value={rule.formula}
                    onChange={(e) => handleUpdateRule(index, { formula: e.target.value })}
                    placeholder="e.g., sum - commission"
                    className="font-mono text-xs min-h-16"
                  />
                </div>
                <Input
                  placeholder="Description (optional)"
                  value={rule.description || ''}
                  onChange={(e) => handleUpdateRule(index, { description: e.target.value })}
                  className="text-sm"
                />
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Payment Methods (Optional)</label>
                  <div className="flex gap-3">
                    {(['Cash', 'Card', 'Invoice'] as const).map((method) => (
                      <label key={method} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rule.paymentMethods?.includes(method) ?? false}
                          onChange={(e) => {
                            const current = rule.paymentMethods || [];
                            const updated = e.target.checked
                              ? [...current, method]
                              : current.filter(m => m !== method);
                            handleUpdateRule(index, { paymentMethods: updated.length > 0 ? updated : undefined });
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{method}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Leave unchecked to apply to all payment methods</p>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <div className="bg-muted p-3 rounded text-xs space-y-1">
        <p className="font-semibold">Available Variables in Formula:</p>
        <p>• <code className="bg-background px-1 rounded">sum</code> - Total of selected Stage 1 fields</p>
        <p>• <code className="bg-background px-1 rounded">commission</code> - Result from Stage 2 formula</p>
        <p>• <code className="bg-background px-1 rounded">fixed_charges</code> - Vehicle rent + insurance + data charge</p>
      </div>
    </div>
  );
};

const CommissionRuleBuilder: React.FC<CommissionRuleBuilderProps> = ({
  stage,
  fieldRules,
  commissionFormula,
  outputRules,
  onFieldRulesChange,
  onFormulaChange,
  onOutputRulesChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Stage {stage}: {stage === 1 ? 'Select Booking Fields' : stage === 2 ? 'Commission Formula' : 'Output Distribution'}
        </CardTitle>
        <CardDescription>
          {stage === 1
            ? 'Select which booking fields to include in the sum that commission will be applied to'
            : stage === 2
            ? 'Define how commission is calculated from the field sum'
            : 'Define how calculated values should be distributed (driver income, company income, etc.)'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stage === 1 && onFieldRulesChange && (
          <Stage1FieldSelector rules={fieldRules} onChange={onFieldRulesChange} />
        )}
        {stage === 2 && onFormulaChange && (
          <Stage2FormulaEditor formula={commissionFormula} onChange={onFormulaChange} />
        )}
        {stage === 3 && onOutputRulesChange && (
          <Stage3OutputRules rules={outputRules} onChange={onOutputRulesChange} />
        )}
      </CardContent>
    </Card>
  );
};

export default CommissionRuleBuilder;
export { Stage1FieldSelector, Stage2FormulaEditor, Stage3OutputRules };
