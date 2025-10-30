import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { ActivityEvent } from '../../types';
import { ClipboardDocumentListIcon, UserPlusIcon, ExclamationTriangleIcon, BanknotesIcon } from '../icons/Icon';

interface ActivityFeedProps {
    events: ActivityEvent[];
}

const eventConfig = {
    'New Booking': { icon: ClipboardDocumentListIcon, color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300' },
    'New Driver': { icon: UserPlusIcon, color: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300' },
    'System Alert': { icon: ExclamationTriangleIcon, color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-300' },
    'Account Payment': { icon: BanknotesIcon, color: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300' },
};

const timeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({ events }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {events.map(event => {
                        const config = eventConfig[event.type];
                        const Icon = config.icon;
                        return (
                            <li key={event.id} className="flex items-start space-x-3">
                                <div className={`flex-shrink-0 rounded-full h-8 w-8 flex items-center justify-center ${config.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-foreground">{event.description}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {timeSince(new Date(event.timestamp))}
                                        {event.actor && ` by ${event.actor}`}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </CardContent>
        </Card>
    );
};

export default ActivityFeed;
