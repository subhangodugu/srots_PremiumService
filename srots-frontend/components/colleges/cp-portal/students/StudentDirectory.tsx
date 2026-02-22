

import React, { useState, useEffect } from 'react';
import { User, College, Role } from '../../../../types';
import { CollegeService } from '../../../../services/collegeService';
import { ManagingStudentAccounts } from '../../../global/ManagingStudentAccounts';
import { GlobalStudentDirectory } from '../../../global/StudentDirectory';
import { CourseSpecification } from './CourseSpecification';
import { Shield, BookOpen, Lock, LayoutGrid, ShieldCheck, ClipboardList } from 'lucide-react';

/**
 * Component Name: StudentDirectory
 * Directory: components/colleges/cp-portal/students/StudentDirectory.tsx
 * 
 * Functionality:
 * - Central hub for student data management in the CP Portal.
 * - Restores 3-Tab workflow for CPH: Directory, Account Lifecycle, and Course Config.
 * - Restricts Staff to a Read-Only Directory view.
 */

interface StudentDirectoryProps {
    user: User;
}

export const StudentDirectory: React.FC<StudentDirectoryProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'directory' | 'accounts' | 'specifications'>('directory');
    const [collegeDetails, setCollegeDetails] = useState<College | undefined>(undefined);

    // Role Logic
    const isCPH = user.role === Role.CPH;
    const isStaff = user.role === Role.STAFF;

    useEffect(() => {
        if (user.collegeId) {
            CollegeService.getCollegeById(user.collegeId).then(details => {
                setCollegeDetails(details);
            });
        }
    }, [user.collegeId]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        Student Database {isStaff && <Lock className="text-amber-500" size={20} />}
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">
                        {isCPH
                            ? 'Manage student account lifecycles, eligibility, and institutional course configurations.'
                            : 'Search and view student profiles and placement readiness.'}
                    </p>
                </div>

                {/* Tab Navigation - Only visible to CPH */}
                {isCPH && (
                    <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 shadow-inner">
                        {/* Directory is accessible to both roles */}
                        <button
                            onClick={() => setActiveTab('directory')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold ${activeTab === 'directory' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            <LayoutGrid size={18} /> Student Directory
                        </button>

                        {/* Restricted Tabs for Staff */}
                        {[
                            { id: 'accounts', label: 'Student Accounts', icon: ShieldCheck },
                            { id: 'specifications', label: 'Specifications', icon: ClipboardList }
                        ].map(tab => (
                            <div key={tab.id} className="relative group">
                                <button
                                    onClick={() => isCPH ? setActiveTab(tab.id as any) : null}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'} ${!isCPH ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <tab.icon size={18} /> {tab.label}
                                    {!isCPH && <Lock size={14} className="ml-1" />}
                                </button>
                                {!isCPH && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                        Requires CPH Head Permissions
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Staff Badge */}
                {isStaff && (
                    <div className="px-4 py-2 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-sm">
                        <Shield size={14} /> Staff Access (Read Only)
                    </div>
                )}
            </div>

            <div className="min-h-[600px]">
                {/* View 1: Student List (Shared, but permissions differ) */}
                {activeTab === 'directory' && (
                    <div className="space-y-4">
                        {isCPH && (
                            <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Shield size={20} />
                                    </div>
                                    <span className="text-sm font-bold uppercase tracking-tight">Admin Management Mode Active</span>
                                </div>
                                <span className="text-[10px] font-black opacity-80 uppercase">Head Privileges Enabled</span>
                            </div>
                        )}
                        <GlobalStudentDirectory
                            collegeId={user.collegeId || ''}
                            isSrotsAdmin={false}
                            canManage={isCPH} // CPH can edit/add, Staff is Read-Only
                        />
                    </div>
                )}

                {/* View 2: Account Lifecycle (CPH Only) */}
                {activeTab === 'accounts' && isCPH && (
                    <ManagingStudentAccounts
                        collegeId={user.collegeId || ''}
                        isSrotsAdmin={false}
                    />
                )}

                {/* View 3: College Configuration (CPH Only) */}
                {activeTab === 'specifications' && isCPH && (
                    <CourseSpecification
                        collegeDetails={collegeDetails}
                        onRefresh={() => {
                            if (user.collegeId) {
                                CollegeService.getCollegeById(user.collegeId).then(setCollegeDetails);
                            }
                        }}
                    />
                )}

                {/* Permission Guard Fallback */}
                {isStaff && activeTab !== 'directory' && (
                    <div className="flex flex-col items-center justify-center p-32 bg-white rounded-3xl border-4 border-dashed border-gray-50 text-center">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                            <Lock size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Access Restricted</h3>
                        <p className="text-gray-500 mt-2 max-w-md mx-auto font-medium">
                            Advanced account operations and institutional configurations are reserved for the College Placement Head.
                        </p>
                        <button
                            onClick={() => setActiveTab('directory')}
                            className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
                        >
                            Return to Directory
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};