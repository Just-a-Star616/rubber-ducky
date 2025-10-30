import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Input } from '../ui/input';

interface DecimalChargeCardProps {
  title: string;
  description: string;
  labels: string[];
  values: string[];
  onValueChange: (index: number, value: string) => void;
}

const DecimalChargeCard: React.FC<DecimalChargeCardProps> = ({ title, description, labels, values, onValueChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {labels.map((label, index) => (
              <div key={label}>
                <label htmlFor={`${title}-${index}`} className="block text-sm font-medium text-muted-foreground mb-1">
                  {label}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground sm:text-sm">£</span>
                  <Input
                    type="text"
                    name={`${title}-${index}`}
                    id={`${title}-${index}`}
                    className="pl-7"
                    value={values[index]}
                    onChange={(e) => onValueChange(index, e.target.value)}
                    placeholder="0.00"
                    aria-label={`Charge for ${label}`}
                  />
                </div>
              </div>
            ))}
          </div>
      </CardContent>
    </Card>
  );
};

export default DecimalChargeCard;
