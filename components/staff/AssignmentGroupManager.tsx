import React, { useState, useMemo } from 'react';
import { AssignmentGroup, StaffMember } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { XIcon, TrashIcon } from '../icons/Icon';

interface AssignmentGroupManagerProps {
  groups: AssignmentGroup[];
  staffList: StaffMember[];
  onSave: (group: AssignmentGroup) => void;
  onDelete: (groupId: string) => void;
}

const AssignmentGroupManager: React.FC<AssignmentGroupManagerProps> = ({
  groups,
  staffList,
  onSave,
  onDelete,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AssignmentGroup>>({});
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStaff = useMemo(() => {
    return staffList.filter(staff =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [staffList, searchTerm]);

  const handleCreate = () => {
    setFormData({ name: '', description: '', memberIds: [] });
    setSelectedMembers(new Set());
    setIsCreating(true);
    setEditingId(null);
  };

  const handleEdit = (group: AssignmentGroup) => {
    setFormData(group);
    setSelectedMembers(new Set(group.memberIds));
    setEditingId(group.id);
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!formData.name?.trim()) {
      alert('Group name is required');
      return;
    }

    const now = new Date().toISOString();
    const groupToSave: AssignmentGroup = {
      id: formData.id || `AG-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      memberIds: Array.from(selectedMembers),
      createdAt: formData.createdAt || now,
      updatedAt: now,
      createdBy: formData.createdBy || 'current-user',
    };

    onSave(groupToSave);
    setIsCreating(false);
    setFormData({});
    setSelectedMembers(new Set());
    setSearchTerm('');
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({});
    setSelectedMembers(new Set());
    setSearchTerm('');
  };

  const handleDelete = (groupId: string) => {
    if (window.confirm('Are you sure you want to delete this assignment group?')) {
      onDelete(groupId);
    }
  };

  if (isCreating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? 'Edit Assignment Group' : 'Create New Assignment Group'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Group Name *</label>
            <Input
              value={formData.name || ''}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Support Team, Dispatch Team"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              placeholder="What is this group for?"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Select Members ({selectedMembers.size} selected)
            </label>
            <Input
              placeholder="Search staff by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-3"
            />
            <div className="border border-border rounded-lg p-3 max-h-[300px] overflow-y-auto space-y-2">
              {filteredStaff.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No staff found</p>
              ) : (
                filteredStaff.map(staff => (
                  <label
                    key={staff.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedMembers.has(staff.id)}
                      onCheckedChange={() => {
                        const newMembers = new Set(selectedMembers);
                        if (newMembers.has(staff.id)) {
                          newMembers.delete(staff.id);
                        } else {
                          newMembers.add(staff.id);
                        }
                        setSelectedMembers(newMembers);
                      }}
                    />
                    <img
                      src={staff.avatarUrl}
                      alt={staff.name}
                      className="h-6 w-6 rounded-full"
                    />
                    <div className="flex-grow">
                      <p className="text-sm font-medium">{staff.name}</p>
                      <p className="text-xs text-muted-foreground">{staff.title}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {editingId ? 'Update' : 'Create'} Group
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Assignment Groups ({groups.length})</h3>
        <Button onClick={handleCreate}>+ New Group</Button>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center italic">
              No assignment groups created yet. Create one to organize staff for targeted messaging.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {groups.map(group => (
            <Card key={group.id} className="relative">
              <CardContent className="pt-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-grow">
                    <h4 className="font-semibold">{group.name}</h4>
                    {group.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {group.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {group.memberIds.length} member{group.memberIds.length !== 1 ? 's' : ''}
                      {group.memberIds.length > 0 && (
                        <span className="block mt-1">
                          {staffList
                            .filter(s => group.memberIds.includes(s.id))
                            .slice(0, 3)
                            .map(s => s.name)
                            .join(', ')}
                          {group.memberIds.length > 3 && ` +${group.memberIds.length - 3} more`}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(group)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(group.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentGroupManager;
