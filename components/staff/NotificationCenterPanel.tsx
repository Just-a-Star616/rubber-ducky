



import React, { useState, useMemo } from 'react';
import { Notification } from '../../types';
import { Button } from '../ui/button';
import { XIcon, BellIcon, ShieldExclamationIcon, ServerStackIcon, UserCircleIcon } from '../icons/Icon';

interface NotificationCenterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onMarkAllAsRead: () => void;
}

const typeConfig: { [key in Notification['type']]: { color: string; icon: React.ElementType } } = {
    System: { color: 'text-blue-500', icon: ServerStackIcon },
    DriverUpdate: { color: 'text-purple-500', icon: UserCircleIcon },
    Message: { color: 'text-green-500', icon: BellIcon },
    Compliance: { color: 'text-red-500', icon: ShieldExclamationIcon },
};

type FilterType = 'All' | Notification['type'];

const NotificationCenterPanel: React.FC<NotificationCenterPanelProps> = ({ isOpen, onClose, notifications, onMarkAllAsRead }) => {
    const [activeFilter, setActiveFilter] = useState<FilterType>('All');

    const filteredNotifications = useMemo(() => {
        if (activeFilter === 'All') return notifications;
        return notifications.filter(n => n.type === activeFilter);
    }, [notifications, activeFilter]);

    const filters: FilterType[] = ['All', 'Compliance', 'System', 'DriverUpdate'];

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <div 
                className={`fixed top-0 bottom-0 right-0 w-full max-w-md bg-card border-l border-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="notification-panel-title"
            >
                <div className="flex flex-col h-full">
                    <header className="flex-shrink-0 px-4 py-3 border-b border-border flex justify-between items-center">
                        <h2 id="notification-panel-title" className="text-lg font-bold flex items-center gap-2">
                            <BellIcon className="w-5 h-5"/>
                            Notifications
                        </h2>
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                            <XIcon className="w-5 h-5"/>
                        </Button>
                    </header>

                    <div className="flex-shrink-0 border-b border-border p-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                {filters.map(filter => (
                                    <Button 
                                        key={filter}
                                        variant={activeFilter === filter ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setActiveFilter(filter)}
                                    >
                                        {filter}
                                    </Button>
                                ))}
                            </div>
                             <Button variant="link" size="sm" onClick={onMarkAllAsRead}>Mark all as read</Button>
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto">
                        {filteredNotifications.length > 0 ? (
                            <ul className="divide-y divide-border">
                                {filteredNotifications.map(notification => {
                                    const Icon = typeConfig[notification.type].icon;
                                    const color = typeConfig[notification.type].color;
                                    return (
                                        <li key={notification.id} className={`p-4 hover:bg-muted/50 transition-colors ${!notification.isRead ? 'bg-primary-500/5 dark:bg-primary-500/10' : ''}`}>
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1 ${color}`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center">
                                                         <p className="text-sm font-semibold">{notification.title}</p>
                                                        {!notification.isRead && <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 ml-2" title="Unread"></div>}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                                                    <div className="flex justify-between items-center mt-2 text-xs">
                                                        <span className="text-muted-foreground">
                                                            {/* FIX: Changed `day: 'short'` to `day: 'numeric'` as 'short' is not a valid value for the day property in toLocaleString options. */}
                                                            {new Date(notification.timestamp).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {notification.link && (
                                                            <a href={notification.link} className="font-semibold text-primary hover:underline">
                                                                {notification.linkText || 'View Details'}
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                             <div className="flex items-center justify-center h-full text-muted-foreground">
                                <p>No notifications</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default NotificationCenterPanel;