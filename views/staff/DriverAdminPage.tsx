



import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';

const DriverAdminPage: React.FC = () => {
  const [featureFlags, setFeatureFlags] = useState({
    liveBalance: false,
    creditWithdrawals: true,
  });

  const handleFlagChange = (flag: keyof typeof featureFlags) => {
    setFeatureFlags(prev => ({...prev, [flag]: !prev[flag]}));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Driver Feature Flags</CardTitle>
          <CardDescription>
            Enable or disable features across the driver portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-8">
              <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                      <Checkbox
                          id="live-balance"
                          checked={featureFlags.liveBalance}
                          onCheckedChange={() => handleFlagChange('liveBalance')}
                      />
                      <div className="grid gap-1.5 leading-none">
                          <label htmlFor="live-balance" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Live Balance & Goal Tracking
                          </label>
                          <p className="text-sm text-muted-foreground">
                            Enable real-time balance view for drivers.
                          </p>
                      </div>
                  </div>
                   <div className="flex items-start space-x-3">
                      <Checkbox
                          id="credit-withdrawals"
                          checked={featureFlags.creditWithdrawals}
                          onCheckedChange={() => handleFlagChange('creditWithdrawals')}
                      />
                      <div className="grid gap-1.5 leading-none">
                           <label htmlFor="credit-withdrawals" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                             Credit Withdrawals
                           </label>
                           <p className="text-sm text-muted-foreground">
                            Allow drivers to withdraw credits for completed journeys.
                           </p>
                      </div>
                  </div>
              </div>

              <div className="pt-5 border-t border-border">
                  <div className="flex justify-end">
                      <Button type="submit">Save Feature Flags</Button>
                  </div>
              </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverAdminPage;
