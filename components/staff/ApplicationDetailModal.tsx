import React, { useState, useCallback, useEffect } from 'react';
import { DriverApplication, ApplicationStatus, ApplicationNote, ApplicationTask, Driver } from '../../types';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { XIcon, TrashIcon, CheckIcon, PlusCircleIcon } from '../icons/Icon';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { mockStaffList, mockLicensingCouncils } from '../../lib/mockData';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { DriverForm } from './DriverEditModal';

interface ApplicationDetailModalProps {
    application: DriverApplication;
    isOpen: boolean;
    onClose: () => void;
    onUpdateApplication: (application: DriverApplication) => void;
    onOnboard: (data: Partial<Driver>) => void;
    onArchive: (application: DriverApplication) => void;
}

const applicationStatuses: ApplicationStatus[] = ['Submitted', 'Under Review', 'Contacted', 'Meeting Scheduled', 'Approved', 'Rejected'];

const applicationToDriverData = (app: DriverApplication): Partial<Driver> => ({
    id: app.id,
    firstName: app.firstName,
    lastName: app.lastName,
    email: app.email,
    mobileNumber: app.mobileNumber,
    devicePhone: app.mobileNumber,
    siteId: app.siteId,
    badgeNumber: app.badgeNumber,
    badgeExpiry: app.badgeExpiry,
    badgeIssuingCouncil: app.badgeIssuingCouncil,
    badgeDocumentUrl: app.badgeDocumentUrl,
    drivingLicenseNumber: app.drivingLicenseNumber,
    drivingLicenseExpiry: app.drivingLicenseExpiry,
    drivingLicenseDocumentUrl: app.licenseDocumentUrl,
    status: 'Active',
    address: '',
    niNumber: '',
    schemeCode: '1',
    gender: 'Other',
    badgeType: 'Private Hire',
    schoolBadgeNumber: null,
    schoolBadgeExpiry: null,
    dateOfBirth: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    avatarUrl: `https://picsum.photos/seed/${app.id}/100/100`,
    vehicleRef: '',
    attributes: [],
    // Add pending vehicle data if it exists on the application
    ...( (app.vehicleMake || app.vehicleModel || app.vehicleRegistration) && {
        pendingNewVehicle: {
            id: `V_APP_${app.id}`,
            status: 'Active',
            registration: app.vehicleRegistration || '',
            make: app.vehicleMake || '',
            model: app.vehicleModel || '',
            color: '',
            firstRegistrationDate: new Date().toISOString(),
            v5cDocumentUrl: app.v5cDocumentUrl,
            plateType: 'Private Hire',
            plateIssuingCouncil: app.badgeIssuingCouncil || '',
            plateNumber: '',
            plateExpiry: '',
            insuranceCertificateNumber: '',
            insuranceDocumentUrl: app.insuranceDocumentUrl,
            insuranceExpiry: '',
            motComplianceExpiry: '',
            roadTaxExpiry: '',
            attributes: [],
            ownershipType: 'Private',
            linkedDriverIds: [],
            siteId: app.siteId,
        }
    })
});


const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({ isOpen, onClose, onUpdateApplication, onOnboard, onArchive, application }) => {
    const [formData, setFormData] = useState<DriverApplication>(application);
    const [editableData, setEditableData] = useState<Partial<Driver>>(() => applicationToDriverData(application));
    const [showVehicleDetails, setShowVehicleDetails] = useState(!!applicationToDriverData(application).pendingNewVehicle);
    const [newNote, setNewNote] = useState('');
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTask, setNewTask] = useState<{taskType: ApplicationTask['taskType'], assignedToId: string, dueDate?: string}>({
        taskType: 'Re-contact',
        assignedToId: '',
    });

    const handleKeyDown = useCallback((event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }, [onClose]);
    useEffect(() => {
        const driverData = applicationToDriverData(application);
        setFormData(application);
        setEditableData(driverData);
        setShowVehicleDetails(!!driverData.pendingNewVehicle);
        if (isOpen) document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [application, isOpen, handleKeyDown]);

    const handleToggleVehicleDetails = () => {
        if (!showVehicleDetails && !editableData.pendingNewVehicle) {
            setEditableData(currentData => ({
               ...currentData,
               pendingNewVehicle: {
                 id: `V_NEW_${Date.now()}`,
                 status: 'Active',
                 registration: '', make: '', model: '', color: '',
                 firstRegistrationDate: new Date().toISOString().split('T')[0],
                 plateType: 'Private Hire',
                 plateIssuingCouncil: mockLicensingCouncils[0],
                 plateNumber: '', plateExpiry: '', insuranceCertificateNumber: '', insuranceExpiry: '',
                 motComplianceExpiry: '', roadTaxExpiry: '', attributes: [],
                 ownershipType: 'Private',
                 linkedDriverIds: [currentData.id!],
                 siteId: currentData.siteId!,
             }
           }));
        }
        setShowVehicleDetails(prev => !prev);
    };
    
    if (!isOpen) return null;

    const handleStatusChange = (status: ApplicationStatus) => {
        const updatedApp = { ...formData, status };
        setFormData(updatedApp);
        onUpdateApplication(updatedApp);
    };

    const handleAddNote = () => {
        if (!newNote.trim()) return;
        const note: ApplicationNote = {
            date: new Date().toISOString(),
            author: 'Alex Johnson', // Mocked staff member
            text: newNote.trim(),
        };
        const updatedApp = { ...formData, notes: [note, ...(formData.notes || [])] };
        setFormData(updatedApp);
        onUpdateApplication(updatedApp);
        setNewNote('');
    };
    
    const handleToggleTask = (taskId: string) => {
        const updatedTasks = (formData.tasks || []).map(task => 
            task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
        );
        const updatedApp = { ...formData, tasks: updatedTasks };
        setFormData(updatedApp);
        onUpdateApplication(updatedApp);
    };
    
    const handleAddTask = () => {
        if (!newTask.assignedToId || !newTask.taskType) return alert('Please select a task type and assignee.');
        const assignee = mockStaffList.find(s => s.id === newTask.assignedToId);
        if (!assignee) return;
        const taskToAdd: ApplicationTask = {
            id: `TASK-${Date.now()}`, createdAt: new Date().toISOString(), author: 'Alex Johnson',
            assignedToId: assignee.id, assignedToName: assignee.name, taskType: newTask.taskType,
            dueDate: newTask.dueDate, isCompleted: false,
        };
        const updatedApp = { ...formData, tasks: [taskToAdd, ...(formData.tasks || [])] };
        setFormData(updatedApp);
        onUpdateApplication(updatedApp);
        setIsAddingTask(false);
        setNewTask({ taskType: 'Re-contact', assignedToId: '' });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="relative bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="sticky top-0 bg-card px-6 py-4 border-b border-border flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-xl font-bold">Application: {application.firstName} {application.lastName}</h2>
                        <p className="text-sm text-muted-foreground">Applied on {new Date(application.applicationDate).toLocaleDateString()}</p>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={onClose}><XIcon className="w-6 h-6" /></Button>
                </header>
                <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <DriverForm
                            formData={editableData}
                            setFormData={setEditableData}
                            showVehicleDetails={showVehicleDetails}
                        />
                         <div className="mt-8 pt-6 border-t">
                            <Button type="button" variant="outline" onClick={handleToggleVehicleDetails}>
                                {showVehicleDetails ? 'Hide Vehicle Details' : 'Add/Update Vehicle Details'}
                            </Button>
                        </div>
                    </div>
                    <div className="lg:col-span-1 space-y-4">
                        <Card>
                            <CardHeader><CardTitle>Tracking & Status</CardTitle></CardHeader>
                            <CardContent>
                                <Select value={formData.status} onValueChange={handleStatusChange}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>{applicationStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                </Select>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Tasks</CardTitle></CardHeader>
                            <CardContent>
                                {!isAddingTask && <Button size="sm" variant="outline" className="w-full" onClick={() => setIsAddingTask(true)}><PlusCircleIcon className="w-4 h-4 mr-2"/> Add Task</Button>}
                                {isAddingTask && (
                                    <div className="space-y-2 p-2 border rounded-md mb-2">
                                        <Select value={newTask.taskType} onValueChange={(v) => setNewTask(p => ({...p, taskType: v as any}))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{['Re-contact', 'Schedule F2F', 'Check References', 'Document Verification'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                                        <Select value={newTask.assignedToId} onValueChange={(v) => setNewTask(p => ({...p, assignedToId: v}))}><SelectTrigger><SelectValue placeholder="Assign to..."/></SelectTrigger><SelectContent>{mockStaffList.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select>
                                        <Input type="date" value={newTask.dueDate || ''} onChange={(e) => setNewTask(p => ({...p, dueDate: e.target.value}))}/>
                                        <div className="flex justify-end gap-2"><Button size="sm" variant="ghost" onClick={() => setIsAddingTask(false)}>Cancel</Button><Button size="sm" onClick={handleAddTask}>Save Task</Button></div>
                                    </div>
                                )}
                                <div className="space-y-2 max-h-32 overflow-y-auto mt-2">
                                    {(formData.tasks || []).map(task => (
                                        <div key={task.id} className="text-xs p-2 bg-muted rounded-lg">
                                            <div className="flex items-start justify-between"><label className="flex items-start space-x-2"><Checkbox checked={task.isCompleted} onCheckedChange={() => handleToggleTask(task.id)} className="mt-0.5"/><span className={`${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>{task.taskType}</span></label><span className="text-muted-foreground/80">{task.assignedToName}</span></div>
                                            {task.dueDate && <p className="pl-6 text-muted-foreground/80">Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                                        </div>
                                    ))}
                                    {(formData.tasks || []).length === 0 && !isAddingTask && <p className="text-xs text-center text-muted-foreground py-2">No tasks yet.</p>}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Internal Notes</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <Textarea placeholder="Add a new note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} />
                                <Button size="sm" onClick={handleAddNote} className="w-full">Add Note</Button>
                                <div className="space-y-2 max-h-32 overflow-y-auto pt-2">
                                    {(formData.notes || []).map((note, i) => (
                                        <div key={i} className="text-xs p-2 bg-muted rounded-lg"><p>{note.text}</p><p className="text-right text-muted-foreground/80 mt-1">- {note.author}, {new Date(note.date).toLocaleString()}</p></div>
                                    ))}
                                    {(formData.notes || []).length === 0 && <p className="text-xs text-center text-muted-foreground">No notes yet.</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <footer className="sticky bottom-0 bg-card/80 backdrop-blur-sm p-4 border-t border-border flex justify-between items-center">
                    <div>
                        <Button variant="destructive" onClick={() => onArchive(formData)}><TrashIcon className="w-4 h-4 mr-2"/> Archive Application</Button>
                    </div>
                    <div className="space-x-2">
                         <Button variant="outline" onClick={onClose}>Close</Button>
                         <Button onClick={() => onOnboard(editableData)}><CheckIcon className="w-4 h-4 mr-2"/> Onboard Driver</Button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default ApplicationDetailModal;