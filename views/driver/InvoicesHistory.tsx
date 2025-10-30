import React from 'react';
import { mockInvoices } from '../../lib/mockData';
import { Button } from '../../components/ui/button';
import { ArrowUpRightIcon } from '../../components/icons/Icon';
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/card';
import { Invoice } from '../../types';

interface InvoicesHistoryProps {
    onViewInvoice: (invoice: Invoice) => void;
}

const InvoicesHistory: React.FC<InvoicesHistoryProps> = ({ onViewInvoice }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">Invoice History</h2>
      {mockInvoices.map((invoice) => (
        <Card key={invoice.id}>
          <CardHeader>
             <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Week Ending</p>
                <p className="font-semibold text-foreground">{invoice.weekEnding}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">Net Earnings</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">£{invoice.netEarnings.toFixed(2)}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Gross: £{invoice.grossEarnings.toFixed(2)}</span>
              <span>Commission: £{invoice.commission.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter>
             <Button
                variant="outline"
                className="w-full"
                onClick={() => onViewInvoice(invoice)}
              >
                <ArrowUpRightIcon className="w-4 h-4 mr-2" />
                View Statement
              </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default InvoicesHistory;