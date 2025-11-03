import React, { useState } from 'react';
import { PromotionSchedule, DayOfWeek, TimePeriod } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { getScheduleDescription, getPromotionCoverage } from '../../lib/promotionScheduling';

interface PromotionScheduleBuilderProps {
  schedule?: PromotionSchedule;
  onChange: (schedule: PromotionSchedule) => void;
}

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const PromotionScheduleBuilder: React.FC<PromotionScheduleBuilderProps> = ({
  schedule,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<'type' | 'config'>('type');
  
  const currentSchedule: PromotionSchedule = schedule || {
    type: 'always-on',
    timezone: 'Europe/London',
  };

  const handleTypeChange = (type: PromotionSchedule['type']) => {
    let newSchedule: PromotionSchedule = { ...currentSchedule, type };
    
    // Initialize structure based on type
    if (type === 'specific-days-and-times') {
      newSchedule.daysOfWeek = DAYS_OF_WEEK.map(day => ({
        day,
        enabled: false,
        timePeriods: [{ startTime: '09:00', endTime: '17:00' }],
      }));
    } else if (type === 'specific-dates') {
      newSchedule.specificDates = [];
    }
    
    onChange(newSchedule);
    setActiveTab('config');
  };

  const handleDayToggle = (day: DayOfWeek) => {
    if (!currentSchedule.daysOfWeek) return;
    
    const updated = {
      ...currentSchedule,
      daysOfWeek: currentSchedule.daysOfWeek.map(d =>
        d.day === day ? { ...d, enabled: !d.enabled } : d
      ),
    };
    onChange(updated);
  };

  const handleTimeChange = (
    day: DayOfWeek,
    periodIndex: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    if (!currentSchedule.daysOfWeek) return;
    
    const updated = {
      ...currentSchedule,
      daysOfWeek: currentSchedule.daysOfWeek.map(d =>
        d.day === day
          ? {
              ...d,
              timePeriods: d.timePeriods.map((p, i) =>
                i === periodIndex ? { ...p, [field]: value } : p
              ),
            }
          : d
      ),
    };
    onChange(updated);
  };

  const handleAddTimePeriod = (day: DayOfWeek) => {
    if (!currentSchedule.daysOfWeek) return;
    
    const updated = {
      ...currentSchedule,
      daysOfWeek: currentSchedule.daysOfWeek.map(d =>
        d.day === day
          ? {
              ...d,
              timePeriods: [...d.timePeriods, { startTime: '17:00', endTime: '20:00' }],
            }
          : d
      ),
    };
    onChange(updated);
  };

  const handleRemoveTimePeriod = (day: DayOfWeek, periodIndex: number) => {
    if (!currentSchedule.daysOfWeek) return;
    
    const updated = {
      ...currentSchedule,
      daysOfWeek: currentSchedule.daysOfWeek.map(d =>
        d.day === day
          ? {
              ...d,
              timePeriods: d.timePeriods.filter((_, i) => i !== periodIndex),
            }
          : d
      ),
    };
    onChange(updated);
  };

  const coverage = getPromotionCoverage(currentSchedule);
  const description = getScheduleDescription(currentSchedule);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Promotion Schedule</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Schedule Type Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">Schedule Type</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(['always-on', 'specific-days-and-times', 'specific-dates', 'blackout-dates'] as const).map(type => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`p-2 text-xs rounded-lg border-2 transition-colors text-center ${
                  currentSchedule.type === type
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-semibold capitalize">{type.replace(/-/g, ' ')}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration based on type */}
        {currentSchedule.type === 'specific-days-and-times' && currentSchedule.daysOfWeek && (
          <div className="space-y-3 p-3 bg-muted rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-medium">Active Hours</p>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                {coverage}% coverage
              </span>
            </div>

            {currentSchedule.daysOfWeek.map(daySchedule => (
              <div key={daySchedule.day} className="space-y-2 p-2 bg-background rounded-lg">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={daySchedule.enabled}
                    onChange={() => handleDayToggle(daySchedule.day)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="font-medium text-sm w-20">{daySchedule.day}</span>
                </div>

                {daySchedule.enabled && (
                  <div className="ml-6 space-y-2">
                    {daySchedule.timePeriods.map((period, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="time"
                          value={period.startTime}
                          onChange={e =>
                            handleTimeChange(daySchedule.day, idx, 'startTime', e.target.value)
                          }
                          className="px-2 py-1 border border-border rounded text-sm"
                        />
                        <span className="text-xs text-muted-foreground">to</span>
                        <input
                          type="time"
                          value={period.endTime}
                          onChange={e =>
                            handleTimeChange(daySchedule.day, idx, 'endTime', e.target.value)
                          }
                          className="px-2 py-1 border border-border rounded text-sm"
                        />
                        {daySchedule.timePeriods.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveTimePeriod(daySchedule.day, idx)}
                            className="text-xs h-7 px-2"
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTimePeriod(daySchedule.day)}
                      className="w-full text-xs h-7"
                    >
                      + Add Time Period
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {currentSchedule.type === 'specific-dates' && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-sm text-muted-foreground">
            <p>📅 <strong>Coming Soon:</strong> Configure specific dates with custom time periods</p>
            <p className="text-xs mt-1">Example: Holiday sales on Dec 25, Dec 26, and New Year's Eve</p>
          </div>
        )}

        {currentSchedule.type === 'blackout-dates' && (
          <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg text-sm text-muted-foreground">
            <p>🚫 <strong>Coming Soon:</strong> Define dates when promotion is NOT available</p>
            <p className="text-xs mt-1">Example: Exclude bank holidays or maintenance windows</p>
          </div>
        )}

        {currentSchedule.type === 'always-on' && (
          <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg text-sm">
            <p>✓ Promotion is always available during its campaign period</p>
          </div>
        )}

        {/* Timezone Selection */}
        {currentSchedule.type !== 'always-on' && (
          <div>
            <label className="block text-sm font-medium mb-2">Timezone</label>
            <select
              value={currentSchedule.timezone || 'Europe/London'}
              onChange={e =>
                onChange({ ...currentSchedule, timezone: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            >
              <option value="Europe/London">Europe/London</option>
              <option value="Europe/Paris">Europe/Paris</option>
              <option value="Europe/Berlin">Europe/Berlin</option>
              <option value="America/New_York">America/New_York</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
              <option value="Australia/Sydney">Australia/Sydney</option>
            </select>
          </div>
        )}

        {/* Quick Presets */}
        <div>
          <label className="block text-sm font-medium mb-2">Quick Presets</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const schedule: PromotionSchedule = {
                  type: 'specific-days-and-times',
                  timezone: 'Europe/London',
                  daysOfWeek: DAYS_OF_WEEK.map(day => ({
                    day,
                    enabled: ['Monday', 'Wednesday', 'Friday'].includes(day),
                    timePeriods: [{ startTime: '10:00', endTime: '13:00' }],
                  })),
                };
                onChange(schedule);
              }}
              className="text-xs"
            >
              Mon/Wed/Fri 10-1pm
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const schedule: PromotionSchedule = {
                  type: 'specific-days-and-times',
                  timezone: 'Europe/London',
                  daysOfWeek: DAYS_OF_WEEK.map(day => ({
                    day,
                    enabled: !['Saturday', 'Sunday'].includes(day),
                    timePeriods: [{ startTime: '09:00', endTime: '17:00' }],
                  })),
                };
                onChange(schedule);
              }}
              className="text-xs"
            >
              Weekdays 9am-5pm
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const schedule: PromotionSchedule = {
                  type: 'specific-days-and-times',
                  timezone: 'Europe/London',
                  daysOfWeek: DAYS_OF_WEEK.map(day => ({
                    day,
                    enabled: ['Friday', 'Saturday', 'Sunday'].includes(day),
                    timePeriods: [{ startTime: '17:00', endTime: '23:59' }],
                  })),
                };
                onChange(schedule);
              }}
              className="text-xs"
            >
              Weekend Nights
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const schedule: PromotionSchedule = {
                  type: 'specific-days-and-times',
                  timezone: 'Europe/London',
                  daysOfWeek: DAYS_OF_WEEK.map(day => ({
                    day,
                    enabled: true,
                    timePeriods: [
                      { startTime: '07:00', endTime: '10:00' },
                      { startTime: '17:00', endTime: '20:00' },
                    ],
                  })),
                };
                onChange(schedule);
              }}
              className="text-xs"
            >
              Rush Hours
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const schedule: PromotionSchedule = {
                  type: 'specific-days-and-times',
                  timezone: 'Europe/London',
                  daysOfWeek: DAYS_OF_WEEK.map(day => ({
                    day,
                    enabled: ['Friday', 'Saturday'].includes(day),
                    timePeriods: [{ startTime: '20:00', endTime: '23:59' }],
                  })),
                };
                onChange(schedule);
              }}
              className="text-xs"
            >
              Night Out Hours
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onChange({ type: 'always-on' });
              }}
              className="text-xs"
            >
              Always Active
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromotionScheduleBuilder;
