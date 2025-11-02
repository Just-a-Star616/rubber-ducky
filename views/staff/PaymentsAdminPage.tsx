
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

const PaymentsAdminPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment System Settings</CardTitle>
          <CardDescription>
            Manage default payment gateways, transaction fees, and withdrawal policies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section is under construction. Future settings will allow for configuring payment processor integrations (e.g., Stripe, PayPal), setting driver withdrawal limits and schedules, and defining transaction fee structures.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsAdminPage;
