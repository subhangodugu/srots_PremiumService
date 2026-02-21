
import React, { useState, useEffect } from 'react';
import { StudentService } from '../../services/studentService';
import { Info, RefreshCw, Download, CheckCircle, Trash2 } from 'lucide-react';
import { Student } from '../../types';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';

// Sub-components
import { AccountStats } from './account-management/AccountStats';
import { AtRiskStudentList } from './account-management/AtRiskStudentList';
import RenewalModal from './account-management/RenewalModal';
import { BulkRenewalModal } from './account-management/BulkRenewalModal';
import { BulkDeleteModal } from './account-management/BulkDeleteModal';

interface ManagingStudentAccountsProps {
    collegeId: string;
    onRefresh?: () => void;
    isSrotsAdmin?: boolean;
}

interface BulkDeletePreview {
    found: Student[];
    notFound: string[];
}

interface RenewalItem {
    student: Student;
    months: number;
    oldEnd: string;
    newEnd: string;
    status: 'Expired' | 'Active';
}

interface BulkRenewalPreview {
    found: RenewalItem[];
    notFound: string[];
}

export const ManagingStudentAccounts: React.FC<ManagingStudentAccountsProps> = ({ collegeId, onRefresh, isSrotsAdmin = false }) => {
    const [expiringStudents, setExpiringStudents] = useState<any[]>([]);
    const [atRiskSearch, setAtRiskSearch] = useState('');

    // Renewal State
    const [showExtensionModal, setShowExtensionModal] = useState(false);
    const [extensionTarget, setExtensionTarget] = useState<{ id: string, name: string } | null>(null);
    const [extensionMonths, setExtensionMonths] = useState('6');

    // Delete State
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Bulk Actions State
    const [bulkDeletePreview, setBulkDeletePreview] = useState<BulkDeletePreview | null>(null);
    const [bulkRenewalPreview, setBulkRenewalPreview] = useState<BulkRenewalPreview | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Stats State (Backend Calculated)
    const [accountStats, setAccountStats] = useState({ expiring: 0, grace: 0, toBeDeleted: 0 });

    useEffect(() => {
        refreshList();
    }, [collegeId]);

    const refreshList = async () => {
        // 1. Get List for Table via async API
        const students = await StudentService.getExpiringStudents(collegeId);
        setExpiringStudents(students);

        // 2. Get Calculated Stats via async API
        const stats = await StudentService.getAccountStats(collegeId);
        setAccountStats(stats);

        if (onRefresh) onRefresh();
    };

    const filteredExpiringStudents = expiringStudents.filter(s =>
        s.name.toLowerCase().includes(atRiskSearch.toLowerCase()) ||
        s.id.toLowerCase().includes(atRiskSearch.toLowerCase())
    );

    const openExtensionDialog = (student: { id: string, name: string }) => {
        setExtensionTarget(student);
        setExtensionMonths('6');
        setShowExtensionModal(true);
    };

    const confirmExtension = async () => {
        if (extensionTarget) {
            try {
                await StudentService.renewStudent(extensionTarget.id, parseInt(extensionMonths));
                alert(`Extended validity for ${extensionTarget.name} by ${extensionMonths} months.`);
                setShowExtensionModal(false);
                setExtensionTarget(null);
                refreshList();
            } catch (err: any) {
                alert(err.message || 'Failed to renew account');
            }
        }
    };

    const handleDeleteAtRiskStudent = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            try {
                await StudentService.deleteStudent(deleteId);
                refreshList();
                setDeleteId(null);
            } catch (err: any) {
                alert(err.message || 'Failed to delete account');
            }
        }
    };

    const handleExportExpiringList = () => {
        try {
            StudentService.downloadExpiringStudentsReport(collegeId, filteredExpiringStudents);
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleBulkRenewalUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx, .xls, .csv';

        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            setIsProcessing(true);
            try {
                const result = await StudentService.previewBulkRenewal(file, collegeId);
                setBulkRenewalPreview(result);
            } catch (err) {
                console.error(err);
                alert("Error processing file. Please ensure it's a valid Excel/CSV.");
            } finally {
                setIsProcessing(false);
            }
        };
        input.click();
    };

    const confirmBulkRenewal = async () => {
        if (!bulkRenewalPreview) return;
        setIsProcessing(true);
        const count = bulkRenewalPreview.found.length;
        try {
            const updates = bulkRenewalPreview.found.map(item => ({
                id: item.student.id,
                months: item.months
            }));
            await StudentService.bulkRenewStudents(updates);
            refreshList();
            setBulkRenewalPreview(null);
            alert(`Successfully renewed ${count} student accounts.`);
        } catch (e) {
            console.error("Renewal failed", e);
            alert("An error occurred during renewal.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBulkDeletionUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx, .xls, .csv';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            setIsProcessing(true);
            try {
                const result = await StudentService.previewBulkDeletion(file, collegeId);
                setBulkDeletePreview(result);
            } catch (err) {
                console.error(err);
                alert("Error processing file.");
            } finally {
                setIsProcessing(false);
            }
        };
        input.click();
    };

    const confirmBulkDelete = async () => {
        if (!bulkDeletePreview) return;
        setIsProcessing(true);
        const count = bulkDeletePreview.found.length;
        try {
            const idsToDelete = bulkDeletePreview.found.map(s => s.id);
            await StudentService.bulkDeleteStudents(idsToDelete);
            refreshList();
            setBulkDeletePreview(null);
            alert(`Successfully deleted ${count} student accounts.`);
        } catch (e) {
            console.error("Deletion failed", e);
            alert("An error occurred during deletion.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <AccountStats stats={accountStats} />

            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Info size={20} className="text-blue-600" /> Account Lifecycle & Policies</h3>
                <div className="prose prose-sm text-gray-600 bg-blue-50/50 p-6 rounded-lg border border-blue-100 max-w-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <ul className="space-y-3 list-none p-0 m-0">
                            <li className="flex gap-3"><span className="font-bold text-blue-800 w-32 shrink-0">Account Creation:</span> <span>All student accounts are created with <strong className="text-green-700">18 Months</strong> of Premium Access.</span></li>
                            <li className="flex gap-3"><span className="font-bold text-blue-800 w-32 shrink-0">Expiry Warning:</span> <span>Accounts appear in the "Expiring" list exactly 30 days before their end date.</span></li>
                        </ul>
                        <ul className="space-y-3 list-none p-0 m-0">
                            <li className="flex gap-3"><span className="font-bold text-blue-800 w-32 shrink-0">Grace Period:</span> <span>Once expired, accounts enter a <strong>90-Day Grace Period</strong>. Access is restricted.</span></li>
                            <li className="flex gap-3"><span className="font-bold text-blue-800 w-32 shrink-0">Auto-Deletion:</span> <span>Data is permanently deleted after the grace period if no renewal is processed.</span></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-800"><RefreshCw size={20} className="text-blue-600" /> Bulk Account Operations</h3>
                <div className="flex flex-wrap gap-4">
                    <button onClick={handleExportExpiringList} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 bg-white shadow-sm font-bold text-sm text-gray-700 transition-colors">
                        <Download size={16} /> Export Student List (Expiring &lt; 30 Days)
                    </button>
                    {isSrotsAdmin && (
                        <button onClick={handleBulkRenewalUpload} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm font-bold text-sm transition-colors">
                            <CheckCircle size={16} /> Renewal Account (Upload Excel)
                        </button>
                    )}
                    <button onClick={handleBulkDeletionUpload} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm font-bold text-sm transition-colors">
                        <Trash2 size={16} /> Delete Students (Upload Excel)
                    </button>
                </div>
            </div>
            <AtRiskStudentList
                students={filteredExpiringStudents}
                searchQuery={atRiskSearch}
                setSearchQuery={setAtRiskSearch}
                isSrotsAdmin={isSrotsAdmin}
                onRenew={openExtensionDialog}
                onDelete={handleDeleteAtRiskStudent}
            />
            <RenewalModal isOpen={showExtensionModal} onClose={() => setShowExtensionModal(false)} student={extensionTarget} extensionMonths={extensionMonths} setExtensionMonths={setExtensionMonths} onConfirm={confirmExtension} />
            <BulkRenewalModal isOpen={!!bulkRenewalPreview} onClose={() => setBulkRenewalPreview(null)} preview={bulkRenewalPreview} isProcessing={isProcessing} onConfirm={confirmBulkRenewal} />
            <BulkDeleteModal isOpen={!!bulkDeletePreview} onClose={() => setBulkDeletePreview(null)} preview={bulkDeletePreview} isProcessing={isProcessing} onConfirm={confirmBulkDelete} />
            <DeleteConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} title="Delete Account?" message="This will permanently delete the student account and all their records." />
        </div>
    );
};
