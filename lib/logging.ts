import { LogEntry, LogEventType, LogCategory, LogLevel, LogFilter } from '../types';

const LOGS_STORAGE_KEY = 'app_logs';
const MAX_LOGS = 10000; // Keep last 10k logs to prevent storage overflow

/**
 * Generate a UUID for log entries
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get current user from localStorage or return 'SYSTEM'
 */
function getCurrentUser(): { id: string; name: string } {
  try {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      const user = JSON.parse(userJson);
      return { id: user.id || 'UNKNOWN', name: user.name || 'Unknown User' };
    }
  } catch (e) {
    console.error('Failed to get current user from localStorage', e);
  }
  return { id: 'SYSTEM', name: 'System' };
}

/**
 * Load all logs from localStorage
 */
function loadLogs(): LogEntry[] {
  try {
    const logsJson = localStorage.getItem(LOGS_STORAGE_KEY);
    return logsJson ? JSON.parse(logsJson) : [];
  } catch (e) {
    console.error('Failed to load logs from localStorage', e);
    return [];
  }
}

/**
 * Save logs to localStorage
 */
function saveLogs(logs: LogEntry[]): void {
  try {
    // Keep only the most recent MAX_LOGS entries
    const recentLogs = logs.slice(-MAX_LOGS);
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(recentLogs));
  } catch (e) {
    console.error('Failed to save logs to localStorage', e);
  }
}

/**
 * Create and store a user action log
 */
export function logAction(
  eventType: LogEventType,
  category: LogCategory,
  entityType: string,
  entityId: string,
  action: string,
  options?: {
    entityName?: string;
    description?: string;
    changes?: Array<{ fieldName: string; oldValue: any; newValue: any }>;
    level?: LogLevel;
    siteId?: string;
    metadata?: Record<string, any>;
  }
): LogEntry {
  const user = getCurrentUser();
  const now = new Date().toISOString();

  const logEntry: LogEntry = {
    id: generateId(),
    timestamp: now,
    userId: user.id,
    userName: user.name,
    eventType,
    category,
    level: options?.level || 'info',
    entityType,
    entityId,
    entityName: options?.entityName,
    action,
    description: options?.description,
    changes: options?.changes,
    siteId: options?.siteId,
    metadata: options?.metadata,
  };

  const logs = loadLogs();
  logs.push(logEntry);
  saveLogs(logs);

  console.log(`[${category}] ${action}`, logEntry);

  return logEntry;
}

/**
 * Create and store a system event log (API calls, system updates, etc.)
 */
export function logSystemEvent(
  eventType: LogEventType,
  category: LogCategory,
  action: string,
  options?: {
    endpoint?: string;
    method?: string;
    status?: number;
    errorMessage?: string;
    duration?: number;
    level?: LogLevel;
    description?: string;
    metadata?: Record<string, any>;
  }
): LogEntry {
  const user = getCurrentUser();
  const now = new Date().toISOString();

  const logEntry: LogEntry = {
    id: generateId(),
    timestamp: now,
    userId: user.id,
    userName: user.name,
    eventType,
    category,
    level: options?.level || 'info',
    entityType: 'System',
    entityId: 'SYSTEM',
    action,
    description: options?.description,
    endpoint: options?.endpoint,
    method: options?.method,
    status: options?.status,
    errorMessage: options?.errorMessage,
    duration: options?.duration,
    metadata: options?.metadata,
  };

  const logs = loadLogs();
  logs.push(logEntry);
  saveLogs(logs);

  console.log(`[SYSTEM] ${action}`, logEntry);

  return logEntry;
}

/**
 * Log an error event
 */
export function logError(
  category: LogCategory,
  error: Error | string,
  context?: {
    entityType?: string;
    entityId?: string;
    action?: string;
    metadata?: Record<string, any>;
  }
): LogEntry {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return logAction('ERROR', category, context?.entityType || 'Unknown', context?.entityId || 'UNKNOWN', context?.action || 'Error occurred', {
    level: 'error',
    description: errorMessage,
    metadata: context?.metadata,
  });
}

/**
 * Query logs with filtering
 */
export function queryLogs(filter?: LogFilter): LogEntry[] {
  const logs = loadLogs();

  if (!filter) {
    return logs;
  }

  return logs.filter((log) => {
    if (filter.startDate && log.timestamp < filter.startDate) return false;
    if (filter.endDate && log.timestamp > filter.endDate) return false;
    if (filter.userId && log.userId !== filter.userId) return false;
    if (filter.eventType && log.eventType !== filter.eventType) return false;
    if (filter.category && log.category !== filter.category) return false;
    if (filter.entityType && log.entityType !== filter.entityType) return false;
    if (filter.level && log.level !== filter.level) return false;
    if (filter.entityId && log.entityId !== filter.entityId) return false;
    return true;
  });
}

/**
 * Get recent logs (last N entries)
 */
export function getRecentLogs(limit: number = 50): LogEntry[] {
  const logs = loadLogs();
  return logs.slice(-limit);
}

/**
 * Get logs for a specific entity
 */
export function getEntityLogs(entityType: string, entityId: string): LogEntry[] {
  return queryLogs({
    entityType,
    entityId,
  });
}

/**
 * Get user's activity logs
 */
export function getUserLogs(userId: string, limit?: number): LogEntry[] {
  const logs = queryLogs({ userId });
  if (limit) {
    return logs.slice(-limit);
  }
  return logs;
}

/**
 * Get logs for a specific category
 */
export function getCategoryLogs(category: LogCategory, limit?: number): LogEntry[] {
  const logs = queryLogs({ category });
  if (limit) {
    return logs.slice(-limit);
  }
  return logs;
}

/**
 * Get logs in a date range
 */
export function getLogsByDateRange(startDate: string, endDate: string): LogEntry[] {
  return queryLogs({
    startDate,
    endDate,
  });
}

/**
 * Clear all logs (admin only - implement permission checks)
 */
export function clearLogs(): void {
  localStorage.removeItem(LOGS_STORAGE_KEY);
  console.log('All logs cleared');
}

/**
 * Export logs as JSON
 */
export function exportLogs(filter?: LogFilter): string {
  const logs = queryLogs(filter);
  return JSON.stringify(logs, null, 2);
}

/**
 * Export logs as CSV
 */
export function exportLogsAsCSV(filter?: LogFilter): string {
  const logs = queryLogs(filter);

  if (logs.length === 0) {
    return 'No logs to export';
  }

  const headers = [
    'ID',
    'Timestamp',
    'User ID',
    'User Name',
    'Event Type',
    'Category',
    'Level',
    'Entity Type',
    'Entity ID',
    'Entity Name',
    'Action',
    'Description',
    'Endpoint',
    'Status',
  ];

  const rows = logs.map((log) => [
    log.id,
    log.timestamp,
    log.userId,
    log.userName,
    log.eventType,
    log.category,
    log.level,
    log.entityType,
    log.entityId,
    log.entityName || '',
    log.action,
    log.description || '',
    log.endpoint || '',
    log.status || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Get log statistics
 */
export function getLogStatistics(filter?: LogFilter): {
  totalLogs: number;
  byEventType: Record<LogEventType, number>;
  byCategory: Record<LogCategory, number>;
  byLevel: Record<LogLevel, number>;
  byUser: Record<string, number>;
} {
  const logs = queryLogs(filter);

  const stats = {
    totalLogs: logs.length,
    byEventType: {} as Record<LogEventType, number>,
    byCategory: {} as Record<LogCategory, number>,
    byLevel: {} as Record<LogLevel, number>,
    byUser: {} as Record<string, number>,
  };

  logs.forEach((log) => {
    stats.byEventType[log.eventType] = (stats.byEventType[log.eventType] || 0) + 1;
    stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
    stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
    stats.byUser[log.userName] = (stats.byUser[log.userName] || 0) + 1;
  });

  return stats;
}
