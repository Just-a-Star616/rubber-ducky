

import React, { useState, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { mockStaffList, mockShortcutLinks, mockMessageTemplates } from '../../lib/mockData';
import { StaffMember, OfficeHours, ShortcutLink, StaffNotice } from '../../types';
import { PencilIcon, ClipboardDocumentCheckIcon, LinkIcon, ClockIcon } from '../../components/icons/Icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { themes } from '../../lib/themes';

interface ThemeSelectorProps {
    onThemeChange: (themeName: string) => void;
}

const mockStaffMember = mockStaffList[0];

const ProfileHeader = ({ staffMember }: { staffMember: StaffMember }) => (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <img
            className="h-24 w-24 rounded-full object-cover shadow-lg"
            src={staffMember.avatarUrl}
            alt={staffMember.name}
        />
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{staffMember.name}</h1>
            <p className="text-lg text-primary-600 dark:text-primary-400 font-medium">{staffMember.title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{staffMember.email}</p>
        </div>
    </div>
);

const OfficeHoursSection = ({ initialHours, onHoursSave }: { initialHours: OfficeHours[], onHoursSave?: (hours: OfficeHours[]) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [hours, setHours] = useState<OfficeHours[]>(initialHours);

    const handleHourChange = (day: string, field: keyof OfficeHours, value: string | boolean) => {
        setHours(prev => prev.map(h => h.day === day ? { ...h, [field]: value } : h));
    };

    const handleSave = () => {
        // Call the callback if provided to persist the hours
        if (onHoursSave) {
            onHoursSave(hours);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setHours(initialHours);
        setIsEditing(false);
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Office Hours</CardTitle>
                    {!isEditing && <Button variant="secondary" onClick={() => setIsEditing(true)}><PencilIcon className="w-4 h-4 mr-2"/>Edit Hours</Button>}
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-3">
                    {hours.map(h => (
                        <div key={h.day} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50">
                            {isEditing ? (
                                <>
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{h.day}</span>
                                        <div className="flex items-center">
                                            <label htmlFor={`isOff-${h.day}`} className="mr-2 text-sm text-gray-500 dark:text-gray-400">Off</label>
                                            <input
                                                type="checkbox"
                                                id={`isOff-${h.day}`}
                                                checked={h.isOff}
                                                onChange={(e) => handleHourChange(h.day, 'isOff', e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <div>
                                            <label className="text-xs text-muted-foreground block mb-1">Start</label>
                                            <Input type="time" value={h.start} onChange={e => handleHourChange(h.day, 'start', e.target.value)} disabled={h.isOff} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground block mb-1">End</label>
                                            <Input type="time" value={h.end} onChange={e => handleHourChange(h.day, 'end', e.target.value)} disabled={h.isOff} />
                                        </div>
                                        <div className="sm:col-span-3">
                                            <label className="text-xs text-muted-foreground block mb-1">Location</label>
                                            <Input type="text" placeholder="Location (optional)" value={h.location || ''} onChange={e => handleHourChange(h.day, 'location', e.target.value)} disabled={h.isOff} />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 items-center gap-2">
                                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{h.day}</span>
                                    <div className="col-span-2 sm:col-span-3 text-center sm:text-left">
                                        <span className={`text-sm font-medium ${h.isOff ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>
                                            {h.isOff ? 'Away' : `${h.start} - ${h.end}`}
                                        </span>
                                        {!h.isOff && h.location && (
                                            <span className="text-sm text-gray-500 dark:text-gray-400 sm:ml-2">
                                                <span className="hidden sm:inline"> @ </span>
                                                <span className="sm:hidden"> / </span>
                                                {h.location}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                {isEditing && (
                    <div className="mt-4 flex justify-end gap-3">
                        <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                        <Button onClick={handleSave}>Save Hours</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const ShortcutsSection = ({ links }: { links: ShortcutLink[] }) => {
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Quick Links & Shortcuts</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {links.map(link => (
                        <div key={link.id} className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{link.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{link.description}</p>
                            </div>
                            {link.isCopyable ? (
                                <Button 
                                    size="sm"
                                    variant={copiedUrl === link.url ? 'default' : 'secondary'} 
                                    className="flex-shrink-0"
                                    onClick={() => handleCopy(link.url)}
                                >
                                    <ClipboardDocumentCheckIcon className="w-4 h-4 mr-2"/>
                                    <span className="text-xs">{copiedUrl === link.url ? 'Copied!' : 'Copy'}</span>
                                </Button>
                            ) : (
                                <a href={link.url} target="_blank" rel="noopener noreferrer">
                                    <Button variant="secondary" size="sm" className="flex-shrink-0">
                                        <LinkIcon className="w-4 h-4 mr-2"/>
                                        <span className="text-xs">Open</span>
                                    </Button>
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

const NoticesSection = ({ notices }: { notices: StaffNotice[] }) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-lg">Company Notices</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col gap-4">
                {notices.map(notice => (
                     <div key={notice.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                         <div className="flex justify-between items-start">
                             <h4 className="font-bold text-gray-900 dark:text-white">{notice.title}</h4>
                             {!notice.isRead && <span className="flex-shrink-0 ml-4 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">New</span>}
                         </div>
                         <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{notice.content}</p>
                         <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <ClockIcon className="w-4 h-4"/>
                            <span>Posted by <strong>{notice.author}</strong> on {new Date(notice.date).toLocaleDateString('en-GB')}</span>
                         </div>
                     </div>
                ))}
            </div>
        </CardContent>
    </Card>
);

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onThemeChange }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {themes.map(theme => {
            const themeColors = theme.light;
            return (
                <div key={theme.name} onClick={() => onThemeChange(theme.name)} className="cursor-pointer">
                    <div className={`w-full rounded-lg border-2 p-1 transition-colors border-transparent hover:border-primary-500/50`}>
                       <div className="aspect-video w-full flex rounded-md overflow-hidden shadow-inner" style={{ backgroundColor: themeColors.card }}>
                            <div className="w-1/3" style={{ backgroundColor: themeColors.sidebar }}></div>
                            <div className="w-2/3 p-2 flex flex-col justify-end" style={{ backgroundColor: themeColors.background }}>
                                <div className="space-y-1">
                                    <div className="h-2 rounded-sm" style={{ backgroundColor: themeColors.primary['400'] }}></div>
                                    <div className="h-2 rounded-sm" style={{ backgroundColor: themeColors.primary['600'] }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className={`mt-2 text-center text-sm font-medium text-foreground/80`}>
                        {theme.name}
                    </p>
                </div>
            )
        })}
    </div>
);


const ProfilePage: React.FC = () => {
    const [readNoticeIds, setReadNoticeIds] = useState(new Set<string>());
    const [staffMember, setStaffMember] = useState<StaffMember>(mockStaffMember);

    const handleOfficeHoursSave = (updatedHours: OfficeHours[]) => {
        setStaffMember(prev => ({
            ...prev,
            officeHours: updatedHours
        }));
        // In a real app, you would also call an API to persist the changes
    };

    const staffNotices = useMemo(() => {
        return mockMessageTemplates
            .filter(t => t.target === 'Staff' && t.isNotice)
            .map((template, index): StaffNotice => ({
                id: template.id,
                title: template.name,
                content: template.content,
                author: 'System',
                date: template.scheduledTime || new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
                isRead: readNoticeIds.has(template.id),
            }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [readNoticeIds]);

    return (
        <div className="flex flex-col gap-8">
            <ProfileHeader staffMember={staffMember} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex flex-col gap-8">
                    <OfficeHoursSection initialHours={staffMember.officeHours} onHoursSave={handleOfficeHoursSave} />
                    <NoticesSection notices={staffNotices} />
                </div>
                <div className="flex flex-col gap-8">
                    <ShortcutsSection links={mockShortcutLinks} />
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>Choose a color theme for the application.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ThemeSelector onThemeChange={(themeName) => {
                                localStorage.setItem('themeName', themeName);
                                window.location.reload();
                            }} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;