/**
 * Unified Rule Builder System
 * 
 * This module provides a consistent, reusable interface for building rules across the project:
 * - Webhooks (conditions + HTTP config)
 * - Automations (trigger + conditions + actions)
 * - Attributes (eligibility + conditions + pricing)
 * - Message Templates (conditions + scheduling)
 * - Commission Schemes (formulas with conditions)
 * - Promotions (conditions + scheduling)
 */

/**
 * Variable Definition - describes a variable available in the rule context
 */
export interface VariableDefinition {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  category: 'booking' | 'driver' | 'customer' | 'account' | 'system' | 'computed';
  description: string;
  examples?: string[];
  nested?: VariableDefinition[]; // For object/array types
  operators?: OperatorType[]; // Allowed operators for this variable
}

/**
 * Operator Type - comparison and logical operators
 */
export type OperatorType = 
  | '==' | '!=' | '>' | '>=' | '<' | '<='  // Comparison
  | 'contains' | 'startsWith' | 'endsWith' | 'in' // String
  | 'between' | 'in_list'                         // Range/List
  | '&&' | '||' | '!';                            // Logical

/**
 * Condition Expression - a single condition in the rule
 */
export interface ConditionExpression {
  id: string;
  variable: VariableDefinition | null;
  operator: OperatorType;
  value: string | number | boolean | string[]; // Value to compare against
  logicalOperator?: '&&' | '||'; // For combining with next condition
}

/**
 * Rule Context - the environment/trigger that determines available variables
 */
export interface RuleContext {
  id: string;
  name: string;
  description: string;
  variables: VariableDefinition[];
  operators: OperatorType[];
  examples?: string[];
}

/**
 * Available Rule Contexts across the system
 */
export const RULE_CONTEXTS: Record<string, RuleContext> = {
  webhook_booking: {
    id: 'webhook_booking',
    name: 'Booking Event',
    description: 'When a booking is created, confirmed, or status changes',
    variables: [
      {
        id: 'booking.id',
        name: 'Booking ID',
        type: 'string',
        category: 'booking',
        description: 'Unique booking identifier',
        examples: ['BK_12345', 'BK_67890'],
        operators: ['==', '!=', 'in'],
      },
      {
        id: 'booking.priority',
        name: 'Priority Level',
        type: 'string',
        category: 'booking',
        description: 'Priority: URGENT, HIGH, NORMAL, LOW',
        examples: ['URGENT', 'NORMAL'],
        operators: ['==', '!=', 'in'],
      },
      {
        id: 'booking.price',
        name: 'Booking Price',
        type: 'number',
        category: 'booking',
        description: 'Total fare for the booking',
        examples: ['50.00', '150.00'],
        operators: ['==', '!=', '>', '>=', '<', '<=', 'between'],
      },
      {
        id: 'customer.accountType',
        name: 'Customer Account Type',
        type: 'string',
        category: 'customer',
        description: 'VIP, STANDARD, CORPORATE, etc.',
        examples: ['VIP', 'STANDARD'],
        operators: ['==', '!=', 'in'],
      },
      {
        id: 'driver.status',
        name: 'Driver Status',
        type: 'string',
        category: 'driver',
        description: 'AVAILABLE, BUSY, OFFLINE, ON_BREAK',
        examples: ['AVAILABLE'],
        operators: ['==', '!=', 'in'],
      },
    ],
    operators: ['==', '!=', '>', '>=', '<', '<=', '&&', '||'],
  },
  automation_trigger: {
    id: 'automation_trigger',
    name: 'Automation Trigger',
    description: 'Event-based automation execution',
    variables: [
      {
        id: 'trigger.event',
        name: 'Trigger Event',
        type: 'string',
        category: 'system',
        description: 'The event that fired',
        examples: ['booking.created', 'driver.online'],
        operators: ['==', '!=', 'in'],
      },
      {
        id: 'driver.consecutive_rejections',
        name: 'Consecutive Job Rejections',
        type: 'number',
        category: 'driver',
        description: 'Number of jobs rejected in a row',
        examples: ['3', '5'],
        operators: ['==', '!=', '>', '>=', '<', '<='],
      },
      {
        id: 'customer.vipStatus',
        name: 'VIP Status',
        type: 'boolean',
        category: 'customer',
        description: 'Whether customer has VIP status',
        examples: ['true', 'false'],
        operators: ['==', '!='],
      },
    ],
    operators: ['==', '!=', '>', '>=', '<', '<=', '&&', '||', '!'],
  },
  message_template: {
    id: 'message_template',
    name: 'Message Template',
    description: 'Variables available in message content and conditions',
    variables: [
      {
        id: 'customer.name',
        name: 'Customer Name',
        type: 'string',
        category: 'customer',
        description: 'Full name of customer',
        examples: ['John Smith', 'Jane Doe'],
        operators: ['contains', 'startsWith', '=='],
      },
      {
        id: 'booking.pickupTime',
        name: 'Pickup Time',
        type: 'date',
        category: 'booking',
        description: 'Scheduled pickup time',
        examples: ['2024-11-03T14:30:00Z'],
        operators: ['==', '!=', '>', '>=', '<', '<=', 'between'],
      },
      {
        id: 'booking.fare',
        name: 'Booking Fare',
        type: 'number',
        category: 'booking',
        description: 'Total fare amount',
        examples: ['45.50', '120.00'],
        operators: ['>', '>=', '<', '<=', 'between'],
      },
    ],
    operators: ['==', '!=', '>', '>=', '<', '<=', '&&', '||', 'contains'],
  },
  attribute_eligibility: {
    id: 'attribute_eligibility',
    name: 'Attribute Eligibility',
    description: 'When to automatically apply an attribute',
    variables: [
      {
        id: 'booking.destination',
        name: 'Destination Address',
        type: 'string',
        category: 'booking',
        description: 'Destination location',
        examples: ['Airport', 'Downtown'],
        operators: ['contains', 'startsWith', '==', 'in'],
      },
      {
        id: 'vehicle.type',
        name: 'Vehicle Type',
        type: 'string',
        category: 'system',
        description: 'Standard, SUV, Luxury, etc.',
        examples: ['SUV', 'Luxury'],
        operators: ['==', 'in'],
      },
      {
        id: 'booking.passengerCount',
        name: 'Passenger Count',
        type: 'number',
        category: 'booking',
        description: 'Number of passengers',
        examples: ['1', '4', '6'],
        operators: ['==', '>', '>=', '<', '<='],
      },
    ],
    operators: ['==', '!=', '>', '>=', '<', '<=', '&&', '||', 'contains', 'in'],
  },
  promotion_eligibility: {
    id: 'promotion_eligibility',
    name: 'Promotion Eligibility',
    description: 'Define who is eligible for this promotion',
    variables: [
      {
        id: 'driver.prefix',
        name: 'Driver Prefix',
        type: 'string',
        category: 'driver',
        description: 'Driver badge prefix (e.g., CR, TH, CB)',
        examples: ['CR', 'TH', 'CB'],
        operators: ['==', '!=', 'in', 'startsWith'],
      },
      {
        id: 'driver.schemeCode',
        name: 'Scheme Code',
        type: 'string',
        category: 'driver',
        description: 'Licensing scheme code',
        examples: ['S07', 'S01', 'S02'],
        operators: ['==', '!=', 'in'],
      },
      {
        id: 'driver.totalEarnings',
        name: 'Total Earnings',
        type: 'number',
        category: 'driver',
        description: 'Cumulative earnings since signup',
        examples: ['1000', '5000', '10000'],
        operators: ['>', '>=', '<', '<=', 'between'],
      },
      {
        id: 'driver.joiningMonth',
        name: 'Joining Month',
        type: 'string',
        category: 'driver',
        description: 'Month driver joined (Jan-Dec)',
        examples: ['January', 'March', 'July'],
        operators: ['==', 'in'],
      },
      {
        id: 'driver.jobsCompleted',
        name: 'Jobs Completed',
        type: 'number',
        category: 'driver',
        description: 'Number of completed bookings',
        examples: ['10', '50', '100'],
        operators: ['>', '>=', '<', '<=', 'between'],
      },
    ],
    operators: ['==', '!=', '>', '>=', '<', '<=', 'between', '&&', '||', 'in', 'startsWith'],
  },
  promotion_targeting: {
    id: 'promotion_targeting',
    name: 'Promotion Targeting',
    description: 'Target specific customer/driver segments',
    variables: [
      {
        id: 'audience',
        name: 'Audience Segment',
        type: 'string',
        category: 'system',
        description: 'Customer segment to target',
        examples: ['all', 'new-drivers', 'inactive-drivers', 'high-value-drivers'],
        operators: ['=='],
      },
      {
        id: 'driver.status',
        name: 'Driver Status',
        type: 'string',
        category: 'driver',
        description: 'Current driver status',
        examples: ['Active', 'Inactive', 'New'],
        operators: ['==', 'in'],
      },
      {
        id: 'driver.rating',
        name: 'Driver Rating',
        type: 'number',
        category: 'driver',
        description: 'Average customer rating',
        examples: ['4.5', '4.0', '3.5'],
        operators: ['>', '>=', '<', '<=', 'between'],
      },
      {
        id: 'driver.accountAge',
        name: 'Account Age (days)',
        type: 'number',
        category: 'driver',
        description: 'Days since driver joined',
        examples: ['7', '30', '90'],
        operators: ['<', '<=', '>', '>=', 'between'],
      },
    ],
    operators: ['==', '!=', '>', '>=', '<', '<=', 'between', 'in'],
  },
};

/**
 * Expression Parser - converts UI conditions to JavaScript expressions
 */
export class ExpressionBuilder {
  static buildExpression(conditions: ConditionExpression[]): string {
    if (conditions.length === 0) return 'true';

    return conditions
      .map(cond => this.buildCondition(cond))
      .join(' ');
  }

  private static buildCondition(cond: ConditionExpression): string {
    if (!cond.variable) return 'true';

    const varName = cond.variable.id;
    const value = this.formatValue(cond.value, cond.variable.type);

    let expr = '';
    switch (cond.operator) {
      case '==':
        expr = `${varName} == ${value}`;
        break;
      case '!=':
        expr = `${varName} != ${value}`;
        break;
      case '>':
        expr = `${varName} > ${value}`;
        break;
      case '>=':
        expr = `${varName} >= ${value}`;
        break;
      case '<':
        expr = `${varName} < ${value}`;
        break;
      case '<=':
        expr = `${varName} <= ${value}`;
        break;
      case 'contains':
        expr = `${varName}.includes(${value})`;
        break;
      case 'startsWith':
        expr = `${varName}.startsWith(${value})`;
        break;
      case 'endsWith':
        expr = `${varName}.endsWith(${value})`;
        break;
      case 'in':
        expr = `[${Array.isArray(cond.value) ? cond.value.join(', ') : value}].includes(${varName})`;
        break;
      case 'between':
        const [min, max] = Array.isArray(cond.value) ? cond.value : [0, 0];
        expr = `${varName} >= ${min} && ${varName} <= ${max}`;
        break;
      default:
        expr = 'true';
    }

    // Append logical operator if provided
    if (cond.logicalOperator) {
      expr += ` ${cond.logicalOperator}`;
    }

    return expr;
  }

  private static formatValue(value: any, type: string): string {
    if (type === 'string' && typeof value === 'string') {
      return `"${value}"`;
    }
    if (type === 'boolean') {
      return value === true || value === 'true' ? 'true' : 'false';
    }
    if (type === 'number') {
      return String(value);
    }
    if (Array.isArray(value)) {
      return `[${value.map(v => this.formatValue(v, type)).join(', ')}]`;
    }
    return String(value);
  }

  /**
   * Get suggested operators for a variable type
   */
  static getSuggestedOperators(varType: string): OperatorType[] {
    const suggestions: Record<string, OperatorType[]> = {
      string: ['==', '!=', 'contains', 'startsWith', 'endsWith', 'in'],
      number: ['==', '!=', '>', '>=', '<', '<=', 'between', 'in'],
      boolean: ['==', '!='],
      date: ['==', '!=', '>', '>=', '<', '<=', 'between'],
      array: ['contains', 'in'],
      object: ['==', '!='],
    };
    return suggestions[varType] || ['==', '!='];
  }

  /**
   * Validate expression syntax
   */
  static validateExpression(expr: string): { valid: boolean; error?: string } {
    try {
      // Basic validation - ensure balanced parentheses and quotes
      let parenCount = 0;
      let quoteChar: string | null = null;

      for (const char of expr) {
        if ((char === '"' || char === "'") && quoteChar === null) {
          quoteChar = char;
        } else if (char === quoteChar) {
          quoteChar = null;
        } else if (quoteChar === null) {
          if (char === '(') parenCount++;
          if (char === ')') parenCount--;
        }
      }

      if (parenCount !== 0) {
        return { valid: false, error: 'Unbalanced parentheses' };
      }
      if (quoteChar !== null) {
        return { valid: false, error: 'Unclosed quote' };
      }

      return { valid: true };
    } catch (e) {
      return { valid: false, error: String(e) };
    }
  }
}

/**
 * Rule Template - predefined rules for quick setup
 */
export interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  category: 'webhook' | 'automation' | 'attribute' | 'template' | 'commission';
  conditions: ConditionExpression[];
  config: Record<string, any>;
}

export const RULE_TEMPLATES: RuleTemplate[] = [
  {
    id: 'vip_booking_alert',
    name: 'VIP Booking Alert',
    description: 'Alert when VIP customer creates booking',
    category: 'automation',
    conditions: [
      {
        id: 'cond1',
        variable: RULE_CONTEXTS.automation_trigger.variables.find(v => v.id === 'customer.vipStatus') || null,
        operator: '==',
        value: true,
      },
    ],
    config: {
      actions: ['send_email', 'notify_staff'],
    },
  },
  {
    id: 'high_value_booking',
    name: 'High Value Booking',
    description: 'Flag bookings over $100',
    category: 'webhook',
    conditions: [
      {
        id: 'cond1',
        variable: RULE_CONTEXTS.webhook_booking.variables.find(v => v.id === 'booking.price') || null,
        operator: '>',
        value: 100,
      },
    ],
    config: {
      webhook_url: '',
      retry_policy: 'exponential_backoff',
    },
  },
];
