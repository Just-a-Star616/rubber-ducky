
import React, { useState, useEffect, useMemo } from 'react';
import { PromotionParticipant, Driver } from '../../types';
import { Button } from '../ui/button';
import { XIcon } from '../icons/Icon';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../ui/card';

interface PromotionParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotion: { id: string, title: string };
  participants: PromotionParticipant[];
  drivers: Driver[];
  onUpdateParticipantStatus: (participantId: string, status: PromotionParticipant['status']) => void;
}

type SortKey = 'driverName' | 'joinDate' | 'progress' | 'status';
type SortDirection = 'asc' | 'desc';

const statusStyles: { [key in PromotionParticipant['status']]: string } = {
  Active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Removed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const PromotionParticipantsModal: React.FC<PromotionParticipantsModalProps> = ({ isOpen, onClose, promotion, participants, drivers, onUpdateParticipantStatus }) => {
  const [sortBy, setSortBy] = useState<SortKey>('driverName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    if (!isOpen) {
      setSortBy('driverName');
      setSortDirection('asc');
    }
  }, [isOpen]);

  const driverMap = useMemo(() => new Map(drivers.map(d => [d.id, d])), [drivers]);

  const sortedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => {
      let valA: string | number;
      let valB: string | number;

      switch (sortBy) {
        case 'driverName':
          valA = `${driverMap.get(a.driverId)?.firstName} ${driverMap.get(a.driverId)?.lastName}`.toLowerCase();
          valB = `${driverMap.get(b.driverId)?.firstName} ${driverMap.get(b.driverId)?.lastName}`.toLowerCase();
          break;
        case 'joinDate':
          valA = new Date(a.joinDate).getTime();
          valB = new Date(b.joinDate).getTime();
          break;
        default:
          valA = a[sortBy];
          valB = b[sortBy];
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [participants, sortBy, sortDirection, driverMap]);

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDirection('asc');
    }
  };

  const SortableHeader = ({ sortKey, children }: { sortKey: SortKey, children: React.ReactNode }) => (
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer" onClick={() => handleSort(sortKey)}>
      <div className="flex items-center">
        <span>{children}</span>
        {sortBy === sortKey && (
          <span className="ml-2">{sortDirection === 'asc' ? '▲' : '▼'}</span>
        )}
      </div>
    </th>
  );
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 transition-opacity" onClick={onClose}>
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Manage Participants</CardTitle>
            <CardDescription>{promotion.title}</CardDescription>
          </div>
           <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 -mt-1 -mr-2">
            <XIcon className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="flex-grow overflow-y-auto p-0">
           <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <SortableHeader sortKey="driverName">Driver</SortableHeader>
                    <SortableHeader sortKey="joinDate">Join Date</SortableHeader>
                    <SortableHeader sortKey="progress">Progress</SortableHeader>
                    <SortableHeader sortKey="status">Status</SortableHeader>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {sortedParticipants.map(participant => {
                    const driver = driverMap.get(participant.driverId);
                    return (
                    <tr key={participant.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img className="h-8 w-8 rounded-full" src={driver?.avatarUrl} alt="" />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-foreground">{driver?.firstName} {driver?.lastName}</div>
                            <div className="text-xs text-muted-foreground">{driver?.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{new Date(participant.joinDate).toLocaleDateString('en-GB')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{participant.progress}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[participant.status]}`}>
                            {participant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {participant.status === 'Active' && (
                            <button onClick={() => onUpdateParticipantStatus(participant.id, 'Removed')} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">Remove</button>
                        )}
                         {participant.status === 'Removed' && (
                            <button onClick={() => onUpdateParticipantStatus(participant.id, 'Active')} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200">Re-activate</button>
                        )}
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
              {sortedParticipants.length === 0 && (
                <p className="text-center py-8 text-sm text-muted-foreground">No participants found for this promotion.</p>
              )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
             <Button onClick={onClose} variant="outline">Close</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PromotionParticipantsModal;
