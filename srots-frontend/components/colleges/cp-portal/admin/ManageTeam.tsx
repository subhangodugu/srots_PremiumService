
import React, { useState, useEffect, useRef } from 'react';
import { User, AddressFormData } from '../../../../types';
import { CollegeService } from '../../../../services/collegeService';
import { DeleteConfirmationModal } from '../../../common/DeleteConfirmationModal';
import { TeamHeader } from './team/TeamHeader';
import { TeamTable } from './team/TeamTable';
import { TeamMemberModal } from './team/TeamMemberModal';
interface ManageTeamProps {
    user: User;
}
export const ManageTeam: React.FC<ManageTeamProps> = ({ user }) => {
    const [subTPOs, setSubTPOs] = useState<User[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingMember, setEditingMember] = useState<User | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    useEffect(() => { refreshList(); }, [user]);
    const refreshList = async () => {
        if (user?.collegeId) {
            const list = await CollegeService.getCPStaff(user.collegeId);
            setSubTPOs([...list]);
        }
    };
    const handleSaveSubTPO = async (data: { id: string, name: string, email: string, phone: string, department: string, aadhaar: string, address: AddressFormData }) => {
        if (isEditing && editingMember) {
            const updatedUser: User = {
                ...editingMember, fullName: data.name, email: data.email, phone: data.phone, department: data.department,
                aadhaarNumber: data.aadhaar, id: data.id,
            };
            await CollegeService.updateCPStaff(updatedUser, data.address);
        } else {
            await CollegeService.createCPStaff({
                ...data,
                collegeId: user.collegeId || '',
                parentId: user.id
            });
        }
        refreshList(); setShowModal(false); setEditingMember(null); setIsEditing(false);
    };
    const handleOpenEdit = (staff: User) => { setEditingMember(staff); setIsEditing(true); setShowModal(true); };
    const handleOpenCreate = () => { setEditingMember(null); setIsEditing(false); setShowModal(true); };
    const handleToggleSubTPOAccess = async (id: string) => { await CollegeService.toggleCPStaffAccess(id); refreshList(); };
    const requestDelete = (id: string) => { setDeleteId(id); };
    const confirmDelete = async () => { if (deleteId) { await CollegeService.deleteCPStaff(deleteId); refreshList(); setDeleteId(null); } };
    //   const handleDownloadSample = () => {
    //       CollegeService.downloadCPTeamTemplate();
    //   };
    //   const handleBulkUploadSubTPO = async (e: React.ChangeEvent<HTMLInputElement>) => {
    //       if (!e.target.files || !e.target.files[0]) return;
    //       try {
    //           await CollegeService.bulkUploadStaff(e.target.files[0], user.collegeId || '', user.id);
    //           refreshList();
    //           alert(`Bulk Upload Successful! See the downloaded report for details.`);
    //       } catch (err: any) {
    //           console.error(err);
    //           alert("Error processing file: " + err.message);
    //       }
    //       e.target.value = '';
    //   };

    const handleDownloadSample = async () => {
        try {
            await CollegeService.downloadCPTeamTemplate();
        } catch (err: any) {
            console.error("Template download failed", err);
            alert("Could not download template. Please check if you are logged in.");
        }
    };

    const handleBulkUploadSubTPO = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        try {
            // Simplified call
            await CollegeService.bulkUploadStaff(e.target.files[0], user.collegeId || '');
            refreshList();
            alert(`Bulk Upload finished. Please check the downloaded report for any errors.`);
        } catch (err: any) {
            console.error(err);
            alert("Error processing file. Please ensure the file matches the template.");
        }
        e.target.value = '';
    };
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <TeamHeader onDownloadTemplate={handleDownloadSample} onBulkUpload={handleBulkUploadSubTPO} onAddMember={handleOpenCreate} fileInputRef={fileInputRef} />
            <TeamTable staffList={subTPOs} onEdit={handleOpenEdit} onToggleStatus={handleToggleSubTPOAccess} onDelete={requestDelete} />
            <TeamMemberModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleSaveSubTPO} isEditing={isEditing} initialData={editingMember} />
            <DeleteConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} title="Delete Account?" message="Are you sure you want to delete this CP Staff account?" />
        </div>
    );
};