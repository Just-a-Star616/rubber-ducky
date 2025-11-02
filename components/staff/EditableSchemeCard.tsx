import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { CommissionScheme } from '../../types';
import { PencilIcon } from '../icons/Icon';
import { cn } from '../../lib/utils';

interface EditableSchemeCardProps {
  scheme: CommissionScheme;
  schemeNumber: number;
  onEdit: () => void;
  className?: string;
}

const CalculationDetail = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
    <p className="mt-1 text-sm text-foreground font-medium">{value}</p>
  </div>
);

const EditableSchemeCard: React.FC<EditableSchemeCardProps> = ({ scheme, schemeNumber, onEdit, className }) => {
  const hasCalculationDetails = scheme.commissionRate !== undefined ||
    scheme.minimumCharge !== undefined ||
    scheme.dataCharge !== undefined ||
    scheme.capAmount !== undefined ||
    scheme.vehicleRent !== undefined ||
    scheme.insuranceDeposit !== undefined ||
    (scheme.tiers && scheme.tiers.length > 0);

  return (
    <Card className={cn("flex flex-col bg-white dark:bg-slate-950 border border-border shadow-sm hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-5 flex flex-col flex-grow">
        <div className="flex-grow">
          <div className="flex justify-between items-start gap-3">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-orange-500 rounded-full whitespace-nowrap">
              {`Scheme #${scheme.id}`}
            </span>
            <Button variant="ghost" size="sm" onClick={onEdit} className="text-primary hover:bg-primary/10 -mr-2">
                <PencilIcon className="w-4 h-4 mr-1"/> Edit
            </Button>
          </div>
          <h3 className="mt-4 text-lg font-bold text-foreground">{scheme.name}</h3>
          <p className="mt-1 text-xs text-orange-600 font-semibold uppercase tracking-wide">{scheme.type}</p>
          <p className="mt-2 text-sm text-muted-foreground min-h-[40px] line-clamp-2">{scheme.details}</p>
        </div>
        
        {hasCalculationDetails && (
          <div className="mt-5 pt-5 border-t border-border">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">Calculation</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {scheme.commissionRate !== undefined && <CalculationDetail label="Commission Rate" value={`${scheme.commissionRate}%`} />}
                {scheme.minimumCharge !== undefined && <CalculationDetail label="Min Charge" value={`£${scheme.minimumCharge.toFixed(2)}`} />}
                {scheme.dataCharge !== undefined && <CalculationDetail label="Data Charge" value={`£${scheme.dataCharge.toFixed(2)}`} />}
                {scheme.capAmount !== undefined && <CalculationDetail label="Cap" value={`£${scheme.capAmount.toFixed(2)}`} />}
                {scheme.vehicleRent !== undefined && <CalculationDetail label="Vehicle Rent" value={`£${scheme.vehicleRent.toFixed(2)}`} />}
                {scheme.insuranceDeposit !== undefined && <CalculationDetail label="Insurance" value={`£${scheme.insuranceDeposit.toFixed(2)}`} />}
              </div>
              
              {scheme.tiers && scheme.tiers.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-3 mb-2">Tier Banding</p>
                  <div className="mt-2 space-y-1">
                    {scheme.tiers.map((tier, index) => (
                      <div key={index} className="flex items-center space-x-3 text-sm">
                        <span className="font-mono bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">T{index + 1}</span>
                        <span className="font-semibold text-foreground">{tier.rate}%</span>
                        <span className="text-muted-foreground text-xs">up to {tier.upTo >= 99999 ? '∞' : `£${tier.upTo}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EditableSchemeCard;
