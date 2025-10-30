import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const SettingsPage: React.FC = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Settings Page Deprecated</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    This page's contents have been moved to other sections of the application:
                </p>
                <ul className="list-disc pl-5 mt-2 text-muted-foreground">
                    <li><b>Appearance settings</b> have been moved to your Profile page.</li>
                    <li><b>General settings</b> have been moved to Admin &gt; System Settings.</li>
                    <li><b>Feature Flags</b> have been moved to Admin &gt; Driver.</li>
                </ul>
            </CardContent>
        </Card>
    );
};

export default SettingsPage;
