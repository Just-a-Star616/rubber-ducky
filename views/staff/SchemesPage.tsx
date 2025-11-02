import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { mockCommissionSchemes } from '../../lib/mockData';
import { CommissionScheme } from '../../types';
import EditableSchemeCard from '../../components/staff/EditableSchemeCard';
import SchemeEditModal from '../../components/staff/SchemeEditModal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

const SchemesPage: React.FC = () => {
  const [schemes, setSchemes] = useState<CommissionScheme[]>(mockCommissionSchemes);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<CommissionScheme | null>(null);

  const handleOpenEditModal = (scheme: CommissionScheme | null) => {
    if (scheme) {
      setEditingScheme(JSON.parse(JSON.stringify(scheme))); // Deep copy to avoid editing state directly
    } else {
      const newScheme: CommissionScheme = {
        id: `new-${Date.now()}`,
        name: 'New Scheme',
        type: '%',
        details: 'A new commission scheme.',
        commissionRate: 0,
        tiers: [],
      };
      setEditingScheme(newScheme);
    }
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingScheme(null);
  };

  const handleSaveScheme = (savedScheme: CommissionScheme) => {
    const isNew = savedScheme.id.startsWith('new-');
    if (isNew) {
      setSchemes(prev => [...prev, { ...savedScheme, id: `S${Math.floor(Math.random() * 1000)}` }]);
    } else {
      setSchemes(prev => prev.map(s => s.id === savedScheme.id ? savedScheme : s));
    }
    handleCloseModal();
  };
  
  const handleDeleteScheme = (schemeId: string) => {
     if (window.confirm('Are you sure you want to delete this scheme? This action cannot be undone.')) {
        setSchemes(prev => prev.filter(s => s.id !== schemeId));
        handleCloseModal();
     }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div className="flex-1">
                    <CardTitle>Commission Schemes</CardTitle>
                    <CardDescription>Define and manage all driver commission structures and fixed charges.</CardDescription>
                </div>
                <Button onClick={() => handleOpenEditModal(null)} className="ml-4 whitespace-nowrap">Add New Scheme</Button>
            </div>
        </CardHeader>
        <CardContent>
             <div className="flex flex-wrap gap-4">
              {schemes.map((scheme) => (
                <EditableSchemeCard
                  key={scheme.id}
                  scheme={scheme}
                  schemeNumber={parseInt(scheme.id)}
                  onEdit={() => handleOpenEditModal(scheme)}
                  className="flex-1 min-w-[300px] max-w-[400px]"
                />
              ))}
            </div>
        </CardContent>
      </Card>
      
      {isModalOpen && editingScheme && (
        <SchemeEditModal
          scheme={editingScheme}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveScheme}
          onDelete={handleDeleteScheme}
        />
      )}
    </div>
  );
};

export default SchemesPage;
