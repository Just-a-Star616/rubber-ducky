import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { LogEntry, LogEventType, LogCategory, LogLevel } from '../../types';
import { queryLogs, exportLogs, exportLogsAsCSV, getLogStatistics } from '../../lib/logging';

interface ActivityLogViewerProps {
  limit?: number;
  showFilters?: boolean;
  showStats?: boolean;
}

const EventTypeColors: Record<LogEventType, string> = {
  CREATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  UPDATE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  VIEW: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  EXPORT: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  IMPORT: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  API_CALL: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  SYSTEM_EVENT: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  ERROR: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const LevelColors: Record<LogLevel, string> = {
  info: 'text-blue-600 dark:text-blue-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400',
  success: 'text-green-600 dark:text-green-400',
};

const ActivityLogViewer: React.FC<ActivityLogViewerProps> = ({ limit = 100, showFilters = true, showStats = true }) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedEventTypes, setSelectedEventTypes] = useState<Set<LogEventType>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<LogCategory>>(new Set());
  const [selectedLevels, setSelectedLevels] = useState<Set<LogLevel>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const itemsPerPage = 20;

  // Filter logs
  const filteredLogs = useMemo(() => {
    const filter: any = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    if (selectedEventTypes.size > 0) {
      filter.eventType = Array.from(selectedEventTypes)[0];
    }
    if (selectedCategories.size > 0) {
      filter.category = Array.from(selectedCategories)[0];
    }
    if (selectedLevels.size > 0) {
      filter.level = Array.from(selectedLevels)[0];
    }

    const logs = queryLogs(filter);
    return logs.slice(-limit);
  }, [startDate, endDate, selectedEventTypes, selectedCategories, selectedLevels, limit]);

  // Pagination
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredLogs.slice(-end).slice(-itemsPerPage);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  // Statistics
  const stats = useMemo(
    () => getLogStatistics({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    [startDate, endDate]
  );

  const handleEventTypeToggle = (type: LogEventType) => {
    const newTypes = new Set(selectedEventTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.clear(); // Single select
      newTypes.add(type);
    }
    setSelectedEventTypes(newTypes);
    setCurrentPage(1);
  };

  const handleCategoryToggle = (category: LogCategory) => {
    const newCategories = new Set(selectedCategories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.clear(); // Single select
      newCategories.add(category);
    }
    setSelectedCategories(newCategories);
    setCurrentPage(1);
  };

  const handleLevelToggle = (level: LogLevel) => {
    const newLevels = new Set(selectedLevels);
    if (newLevels.has(level)) {
      newLevels.delete(level);
    } else {
      newLevels.clear(); // Single select
      newLevels.add(level);
    }
    setSelectedLevels(newLevels);
    setCurrentPage(1);
  };

  const handleExportJSON = () => {
    const json = exportLogs({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csv = exportLogsAsCSV({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {showStats && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Total Logs</div>
                <div className="text-2xl font-bold">{stats.totalLogs}</div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Events</div>
                <div className="text-2xl font-bold">{Object.keys(stats.byEventType).length}</div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Categories</div>
                <div className="text-2xl font-bold">{Object.keys(stats.byCategory).length}</div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Users</div>
                <div className="text-2xl font-bold">{Object.keys(stats.byUser).length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>

              {/* Event Types */}
              <div>
                <label className="block text-sm font-medium mb-2">Event Types</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(EventTypeColors).map((type) => (
                    <label key={type} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={selectedEventTypes.has(type as LogEventType)}
                        onCheckedChange={() => handleEventTypeToggle(type as LogEventType)}
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium mb-2">Categories</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['STAFF', 'DRIVER', 'COMMISSION', 'INVOICE', 'PERMISSION', 'SITE', 'BOOKING', 'PAYMENT', 'SYSTEM'] as LogCategory[]).map(
                    (cat) => (
                      <label key={cat} className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          checked={selectedCategories.has(cat)}
                          onCheckedChange={() => handleCategoryToggle(cat)}
                        />
                        <span className="text-sm">{cat}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Levels */}
              <div>
                <label className="block text-sm font-medium mb-2">Log Levels</label>
                <div className="flex gap-2">
                  {(['info', 'warning', 'error', 'success'] as LogLevel[]).map((level) => (
                    <label key={level} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={selectedLevels.has(level)}
                        onCheckedChange={() => handleLevelToggle(level)}
                      />
                      <span className="text-sm">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Export Buttons */}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleExportJSON} variant="outline" size="sm">
                  Export JSON
                </Button>
                <Button onClick={handleExportCSV} variant="outline" size="sm">
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log ({filteredLogs.length} entries)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Timestamp</th>
                  <th className="px-4 py-3 text-left font-medium">User</th>
                  <th className="px-4 py-3 text-left font-medium">Event</th>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-left font-medium">Entity</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.length > 0 ? (
                  paginatedLogs.map((log) => (
                    <React.Fragment key={log.id}>
                      <tr className="border-b border-border hover:bg-muted/50 cursor-pointer" onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm">{log.userName}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${EventTypeColors[log.eventType]}`}>
                            {log.eventType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{log.category}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {log.entityName ? `${log.entityName} (${log.entityId})` : log.entityId}
                        </td>
                        <td className="px-4 py-3 text-sm max-w-xs truncate">{log.action}</td>
                      </tr>
                      {expandedLogId === log.id && (
                        <tr className="bg-muted/30 border-b border-border">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="space-y-3 text-sm">
                              <div>
                                <div className="font-medium text-muted-foreground">Log Level</div>
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${LevelColors[log.level]}`}>
                                  {log.level}
                                </span>
                              </div>

                              {log.description && (
                                <div>
                                  <div className="font-medium text-muted-foreground">Description</div>
                                  <div className="text-foreground">{log.description}</div>
                                </div>
                              )}

                              {log.changes && log.changes.length > 0 && (
                                <div>
                                  <div className="font-medium text-muted-foreground">Changes</div>
                                  <div className="space-y-2">
                                    {log.changes.map((change, idx) => (
                                      <div key={idx} className="bg-background p-2 rounded border border-border">
                                        <div className="font-medium">{change.fieldName}</div>
                                        <div className="text-xs">
                                          <span className="text-red-600">Old: {JSON.stringify(change.oldValue)}</span>
                                          <span className="mx-2">→</span>
                                          <span className="text-green-600">New: {JSON.stringify(change.newValue)}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {log.endpoint && (
                                <div>
                                  <div className="font-medium text-muted-foreground">API</div>
                                  <div className="text-foreground">
                                    {log.method} {log.endpoint}
                                    {log.status && <span className="ml-2 text-xs font-mono">[{log.status}]</span>}
                                    {log.duration && <span className="ml-2 text-xs">({log.duration}ms)</span>}
                                  </div>
                                </div>
                              )}

                              {log.errorMessage && (
                                <div>
                                  <div className="font-medium text-muted-foreground text-red-600">Error</div>
                                  <div className="text-foreground">{log.errorMessage}</div>
                                </div>
                              )}

                              {log.metadata && Object.keys(log.metadata).length > 0 && (
                                <div>
                                  <div className="font-medium text-muted-foreground">Metadata</div>
                                  <pre className="bg-background p-2 rounded text-xs overflow-x-auto">
                                    {JSON.stringify(log.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No activity logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLogViewer;
