# Unified Rule Builder System - Architecture Guide

## Overview

The Unified Rule Builder System provides a consistent, intuitive interface for building rules across all areas of the project. Instead of 5+ different rule-building approaches, we now have:

- **Single unified component**: `BaseRuleBuilder.tsx`
- **Shared logic**: `lib/ruleBuilder.ts` (types, expression builder, validators)
- **Consistent UX**: Same look, feel, and workflow everywhere
- **Extensible design**: Easy to add new rule types

## Problem Solved

**Before**: Fragmented rule-building across the system

| System | Interface | Condition Type | Status |
|--------|-----------|-----------------|--------|
| Webhooks | JavaScript expression + JSON templates | Custom JS | Inconsistent |
| Automations | Conditions with variable tags | JS expression | Inconsistent |
| Attributes | Checkboxes + JS conditions | Multiple UIs | Inconsistent |
| Messages | Placeholders + conditions | Different format | Inconsistent |
| Commission | Formula expressions | Custom syntax | Inconsistent |
| Promotions | Schedule + conditions | Time-based | Inconsistent |

**After**: Single unified builder

```
All Systems → BaseRuleBuilder → Unified UI/UX → Consistent Variables
```

## Core Concepts

### 1. Rule Context

A **Rule Context** defines what variables are available in a specific rule type.

```typescript
interface RuleContext {
  id: string;                    // 'webhook_booking', 'automation_trigger', etc.
  name: string;                  // Display name
  description: string;           // What triggers this context
  variables: VariableDefinition[]; // Available variables
  operators: OperatorType[];     // Allowed operators
}
```

**Example**: `webhook_booking` context provides:
- `booking.id`, `booking.priority`, `booking.price`
- `customer.accountType`
- `driver.status`

### 2. Variable Definition

Variables describe what data is available and how to use it.

```typescript
interface VariableDefinition {
  id: string;              // 'booking.price'
  name: string;            // 'Booking Price'
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  category: 'booking' | 'driver' | 'customer' | 'account' | 'system';
  description: string;     // Help text
  examples?: string[];     // '50.00', '150.00'
  operators?: OperatorType[]; // Which operators work with this var
}
```

### 3. Condition Expression

A single condition in a rule, e.g., "booking.price > 100".

```typescript
interface ConditionExpression {
  id: string;                              // Unique ID
  variable: VariableDefinition | null;     // Selected variable
  operator: OperatorType;                  // ==, !=, >, <, contains, etc.
  value: string | number | boolean | any; // Value to compare
  logicalOperator?: '&&' | '||';           // AND/OR with next condition
}
```

### 4. Expression Builder

Converts UI conditions to JavaScript expressions for execution.

```typescript
const conditions = [
  { variable: bookingPriceVar, operator: '>', value: 100, logicalOperator: '&&' },
  { variable: vipStatusVar, operator: '==', value: true },
];

const expr = ExpressionBuilder.buildExpression(conditions);
// Result: "booking.price > 100 && customer.vipStatus == true"
```

## Component Architecture

### BaseRuleBuilder (Component)

The main UI component for building rules.

```tsx
<BaseRuleBuilder
  title="Add Webhook"
  description="Create a rule to send HTTP requests when events occur"
  context={RULE_CONTEXTS.webhook_booking}
  onSave={(config) => saveWebhook(config)}
  onCancel={() => closeModal()}
  initialConfig={existingRule}
  showAdvancedOptions={true}
/>
```

**Sections**:
1. **Basic Info** - Name, description, enabled toggle
2. **Trigger/Context** - Which context this rule operates in
3. **Conditions** - Visual condition builder
4. **Expression Preview** - Real-time JS expression display
5. **Actions** - Save/Cancel buttons

### Available Contexts

```typescript
RULE_CONTEXTS.webhook_booking        // For webhooks triggered by booking events
RULE_CONTEXTS.automation_trigger     // For automations
RULE_CONTEXTS.message_template       // For message templates
RULE_CONTEXTS.attribute_eligibility  // For auto-applying attributes
```

## Usage Examples

### Example 1: Webhook Rule

```tsx
import { BaseRuleBuilder, RULE_CONTEXTS, RuleConfig } from '@/components/BaseRuleBuilder';

export const WebhookEditModal = ({ onClose }) => {
  const handleSave = (config: RuleConfig) => {
    // config includes: name, description, conditions, expression, enabled
    const webhook = {
      id: crypto.randomUUID(),
      url: 'https://api.example.com/webhooks',
      ...config,
      trigger: 'booking.created',
    };
    saveWebhook(webhook);
    onClose();
  };

  return (
    <BaseRuleBuilder
      title="Add Webhook"
      description="Send HTTP POST when specific conditions are met"
      context={RULE_CONTEXTS.webhook_booking}
      onSave={handleSave}
      onCancel={onClose}
    />
  );
};
```

### Example 2: Automation Rule

```tsx
export const AutomationEditModal = ({ automation, onClose }) => {
  const handleSave = (config: RuleConfig) => {
    const updated = {
      ...automation,
      ...config,
      actions: ['send_notification', 'create_task'], // Additional config
    };
    saveAutomation(updated);
    onClose();
  };

  return (
    <BaseRuleBuilder
      title="Edit Automation"
      description="Set up automated actions based on system events"
      context={RULE_CONTEXTS.automation_trigger}
      onSave={handleSave}
      onCancel={onClose}
      initialConfig={automation}
    />
  );
};
```

### Example 3: Custom Context

For systems not yet covered, create a new context:

```tsx
const customContext: RuleContext = {
  id: 'my_custom_rule',
  name: 'Custom Rule Type',
  description: 'When specific conditions occur',
  variables: [
    {
      id: 'field1',
      name: 'Field 1',
      type: 'string',
      category: 'system',
      description: 'Description of field1',
      operators: ['==', '!=', 'contains'],
    },
    // ... more variables
  ],
  operators: ['==', '!=', '>', '>=', '<', '<=', '&&', '||'],
};

// Use in component
<BaseRuleBuilder
  context={customContext}
  {...props}
/>
```

## Expression Builder API

### Build Expression

```typescript
import { ExpressionBuilder } from '@/lib/ruleBuilder';

const conditions = [
  { variable: priceVar, operator: '>', value: 100, logicalOperator: '&&' },
  { variable: vipVar, operator: '==', value: true },
];

const expr = ExpressionBuilder.buildExpression(conditions);
// → "booking.price > 100 && customer.vipStatus == true"
```

### Get Suggested Operators

```typescript
const operators = ExpressionBuilder.getSuggestedOperators('number');
// → ['==', '!=', '>', '>=', '<', '<=', 'between', 'in']
```

### Validate Expression

```typescript
const validation = ExpressionBuilder.validateExpression(expr);
if (validation.valid) {
  // Safe to execute
} else {
  console.error(validation.error); // "Unbalanced parentheses"
}
```

## Data Flow

```
User Input (UI)
    ↓
ConditionExpression[] (parsed conditions)
    ↓
ExpressionBuilder.buildExpression()
    ↓
String (JavaScript expression)
    ↓
Store/Execute (backend or client-side)
```

## Migration Path

### Step 1: Add New Context (if needed)

```typescript
// In lib/ruleBuilder.ts
export const RULE_CONTEXTS: Record<string, RuleContext> = {
  // ... existing contexts ...
  my_new_type: {
    id: 'my_new_type',
    name: 'My New Rule Type',
    variables: [/* ... */],
    operators: [/* ... */],
  },
};
```

### Step 2: Update Component to Use BaseRuleBuilder

**Before** (WebhookEditModal - old approach):
```tsx
export const WebhookEditModal = () => {
  const [url, setUrl] = useState('');
  const [conditions, setConditions] = useState('');
  const [headers, setHeaders] = useState('{}');
  const [body, setBody] = useState('{}');
  
  return (
    <Modal>
      <input value={url} onChange={...} />
      <textarea value={conditions} onChange={...} /> {/* Raw JS */}
      <textarea value={headers} onChange={...} /> {/* Raw JSON */}
      <textarea value={body} onChange={...} /> {/* Raw JSON */}
    </Modal>
  );
};
```

**After** (using BaseRuleBuilder - new unified approach):
```tsx
export const WebhookEditModal = ({ onClose }) => {
  const handleSave = (config: RuleConfig) => {
    // config.expression is already validated JS
    const webhook = {
      url: 'https://api.example.com/webhook',
      ...config,
    };
    saveWebhook(webhook);
    onClose();
  };

  return (
    <BaseRuleBuilder
      title="Add Webhook"
      context={RULE_CONTEXTS.webhook_booking}
      onSave={handleSave}
      onCancel={onClose}
    />
  );
};
```

### Step 3: Test

```typescript
// Test the migration
describe('WebhookEditModal', () => {
  it('should use BaseRuleBuilder', () => {
    render(<WebhookEditModal />);
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('Trigger / Context')).toBeInTheDocument();
    expect(screen.getByText('Conditions')).toBeInTheDocument();
  });

  it('should save rule with expression', async () => {
    render(<WebhookEditModal />);
    const saveSpy = jest.fn();
    
    // ... add conditions
    // ... click save
    
    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        expression: 'booking.price > 100',
      })
    );
  });
});
```

## Benefits

| Aspect | Before | After |
|--------|--------|-------|
| **UI Consistency** | 5+ different styles | One unified style |
| **Learning Curve** | High - learn each system | Low - learn once, use everywhere |
| **Maintenance** | Bug fixes in 5 places | Bug fixes in 1 place |
| **New Features** | Add to all 5 systems | Add to BaseRuleBuilder, works everywhere |
| **Type Safety** | Mixed - some type-safe, some not | Full TypeScript coverage |
| **Expression Validation** | Inconsistent | Unified validator |
| **Documentation** | Scattered | Centralized |

## Advanced Features (Future Enhancements)

1. **Visual Condition Builder** - Drag-and-drop condition groups
2. **Rule Templates** - Pre-built rules for common scenarios
3. **Variable Autocomplete** - Smart suggestions as user types
4. **Expression Import** - Paste raw JavaScript expression
5. **Rule Testing** - Test conditions against sample data
6. **Version History** - Track changes to rules
7. **Rule Sharing** - Share rules between teams/accounts
8. **Performance Metrics** - Show rule execution stats

## File Structure

```
lib/
├── ruleBuilder.ts              # Types, contexts, expression builder
views/
├── admin/
│   ├── ConnectorsPage.tsx       # ← Update to use BaseRuleBuilder
│   ├── AutomationsPage.tsx      # ← Update to use BaseRuleBuilder
│   ├── AttributesPage.tsx       # ← Update to use BaseRuleBuilder
│   ├── MessagingPage.tsx        # ← Update to use BaseRuleBuilder
│   └── CommissionPage.tsx       # ← Update to use BaseRuleBuilder
components/
├── BaseRuleBuilder.tsx          # Main unified builder component
├── BaseRuleBuilder.css          # Styles
├── ConditionBuilder.tsx         # (Future: visual condition editor)
└── VariableSelector.tsx         # (Future: smart variable picker)
docs/
├── RULE_BUILDER_GUIDE.md        # This document
└── RULE_BUILDER_MIGRATION.md    # Step-by-step migration guide
```

## Summary

The Unified Rule Builder System simplifies rule creation across the entire project by:

1. ✅ **Standardizing UI/UX** - Same component, look, and feel everywhere
2. ✅ **Centralizing logic** - Expression building and validation in one place
3. ✅ **Defining contexts** - Clear specification of what variables are available
4. ✅ **Ensuring type safety** - Full TypeScript support throughout
5. ✅ **Easing maintenance** - Bug fixes and features benefit all systems
6. ✅ **Reducing cognitive load** - Users learn once, apply everywhere

Start migrating existing modals to use `BaseRuleBuilder` following the steps above. Questions? See examples in `components/` directory.
