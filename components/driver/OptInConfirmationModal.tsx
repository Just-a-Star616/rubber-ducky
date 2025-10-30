import React from 'react';
import { RewardScheme, Promotion } from '../../types';
import { Button } from '../ui/button';
import { XIcon } from '../icons/Icon';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';

interface OptInConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  promotion: RewardScheme | Promotion;
}

const OptInConfirmationModal: React.FC<OptInConfirmationModalProps> = ({ isOpen, onClose, onConfirm, promotion }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <Card className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{promotion.title}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
            <XIcon className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent>
          <h3 className="text-base font-medium text-foreground">Terms & Conditions Summary</h3>
          <div className="mt-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            {promotion.termsSummary || 'Please review the full terms and conditions for this promotion.'}
          </div>
          {promotion.termsUrl && (
            <div className="mt-4">
              <a href={promotion.termsUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline">
                View Full Terms & Conditions
              </a>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm}>Agree & Opt-In</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OptInConfirmationModal;
