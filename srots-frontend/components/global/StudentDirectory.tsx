
import React, { useState, useEffect } from 'react';
import { StudentService } from '../../services/studentService';
import { CollegeService } from '../../services/collegeService';
import { Student, College } from '../../types';
import { DeleteConfirmationModal } from '../../components/common/DeleteConfirmationModal';
import { StudentList } from './student-directory/StudentList';
import { StudentFormWizard } from './student-directory/StudentFormWizard';

interface GlobalStudentDirectoryProps {
    collegeId: string;
    isSrotsAdmin: boolean;
    canManage?: boolean;
    onRefresh?: () => void; // Parent callback to update stats
}

export const GlobalStudentDirectory: React.FC<GlobalStudentDirectoryProps> = ({
    collegeId, isSrotsAdmin, canManage = true, onRefresh
}) => {
    const [studentsList, setStudentsList] = useState<Student[]>([]);
    const [studentSearch, setStudentSearch] = useState('');
    const [yearFilter, setYearFilter] = useState('All');
    const [branchFilter, setBranchFilter] = useState('All');
    const [collegeDetails, setCollegeDetails] = useState<College | undefined>(undefined);

    const [showAddStudent, setShowAddStudent] = useState(false);
    const [isEditingStudent, setIsEditingStudent] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    const [deleteStudentId, setDeleteStudentId] = useState<string | null>(null);

    // Fetch Logic delegated to Services
    useEffect(() => {
        refreshData();
    }, [collegeId, studentSearch, yearFilter, branchFilter]);

    const refreshData = async () => {
        if (collegeId) {
            const filters = {
                query: studentSearch,
                year: yearFilter,
                branch: branchFilter
            };
            setStudentsList(await StudentService.searchStudents(collegeId, filters));
            setCollegeDetails(await CollegeService.getCollegeById(collegeId));

            // 3-Tier Sync: Notify parent (CMS Dashboard / College Detail) to update counters immediately
            if (onRefresh) {
                onRefresh();
            }
        }
    };

    const getCollegeBranches = () => collegeDetails?.branches || [];

    const handleOpenAddStudent = () => {
        setIsEditingStudent(false);
        setEditingStudent(null);
        setShowAddStudent(true);
    };

    const handleOpenEditStudent = (e: React.MouseEvent, student: Student) => {
        e.stopPropagation();
        setIsEditingStudent(true);
        setEditingStudent(student);
        setShowAddStudent(true);
    };

    const handleSaveStudent = async (studentPayload: any) => {
        try {
            if (isEditingStudent && editingStudent) {
                await StudentService.adminUpdateStudent(editingStudent.id, studentPayload);
            } else {
                await StudentService.createStudent(studentPayload);
            }
            refreshData();
            setShowAddStudent(false);
        } catch (err: any) {
            alert(err.response?.data?.message || err.message || 'Failed to save student');
        }
    };

    const requestDeleteStudent = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); e.preventDefault();
        setDeleteStudentId(id);
    };

    const confirmDeleteStudent = async () => {
        if (deleteStudentId) {
            await StudentService.deleteStudent(deleteStudentId);
            refreshData();
            setDeleteStudentId(null);
        }
    };

    const handleToggleStudentRestriction = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); e.preventDefault();
        const student = studentsList.find(s => s.id === id);
        if (student) {
            try {
                await StudentService.toggleStudentRestriction(id, !student.isRestricted);
                refreshData();
            } catch (err: any) {
                alert(err.message || 'Failed to toggle restriction');
            }
        }
    };

    const handleDownloadSample = () => {
        StudentService.downloadBulkUploadTemplate();
    };

    const handleDownloadFilteredReport = () => {
        try {
            const filters = {
                query: studentSearch,
                year: yearFilter,
                branch: branchFilter
            };
            StudentService.exportStudentRegistry(collegeId, filters);
        } catch (e: any) {
            alert(e.message);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <StudentList
                students={studentsList}
                searchQuery={studentSearch}
                setSearchQuery={setStudentSearch}
                yearFilter={yearFilter}
                setYearFilter={setYearFilter}
                branchFilter={branchFilter}
                setBranchFilter={setBranchFilter}
                collegeBranches={getCollegeBranches()}
                canManage={canManage}
                isSrotsAdmin={isSrotsAdmin}
                onEdit={handleOpenEditStudent}
                onDelete={requestDeleteStudent}
                onToggleRestriction={handleToggleStudentRestriction}
                onDownloadReport={handleDownloadFilteredReport}
                onAdd={handleOpenAddStudent}
                onBulkUpload={() => { }} // Handled inside StudentFilters which calls refreshData
                onDownloadSample={handleDownloadSample}
                collegeId={collegeId}
                onRefresh={refreshData}
            />

            <StudentFormWizard
                isOpen={showAddStudent}
                onClose={() => setShowAddStudent(false)}
                isEditing={isEditingStudent}
                initialData={editingStudent}
                collegeDetails={collegeDetails}
                collegeId={collegeId}
                onSave={handleSaveStudent}
            />

            <DeleteConfirmationModal
                isOpen={!!deleteStudentId}
                onClose={() => setDeleteStudentId(null)}
                onConfirm={confirmDeleteStudent}
                title="Delete Student?"
                message="This will permanently remove the student record and cannot be undone."
            />
        </div>
    );
};
