
import React from 'react';
import { Branch } from '../../../../../types';
import { BookOpen, Trash2 } from 'lucide-react';

/**
 * Component Name: BranchListTable
 * Directory: components/colleges/cp-portal/students/course-spec/BranchListTable.tsx
 * 
 * Functionality:
 * - Table displaying list of branches.
 * - Delete button for each branch.
 * 
 * Used In: CourseSpecification
 */

interface BranchListTableProps {
    branches: Branch[];
    onDelete: (code: string) => void;
}

export const BranchListTable: React.FC<BranchListTableProps> = ({ branches, onDelete }) => {
    return (
        <div className="border rounded-xl overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                    <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase">
                        <tr>
                            <th className="px-6 py-3">Course / Branch Name</th>
                            <th className="px-6 py-3 w-32 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {branches.length > 0 ? branches.map((branch) => (
                            <tr key={branch.code} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-bold text-gray-800">
                                    {branch.name} <span className="text-gray-400 mx-2">::</span> <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-100">{branch.code}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => onDelete(branch.code)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                                        title="Delete Branch"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={2} className="px-6 py-12 text-center text-gray-400 italic bg-gray-50">
                                    <BookOpen size={48} className="mx-auto mb-2 opacity-20" />
                                    No branches added yet. Add your college courses above.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
