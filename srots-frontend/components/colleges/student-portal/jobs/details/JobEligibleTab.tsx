
import React, { useState, useEffect } from 'react';
import { Job, Student } from '../../../../../types';
import { JobService } from '../../../../../services/jobService';
import { Search, Layers, Filter, SortAsc, ArrowDown, Download, Loader2 } from 'lucide-react';

interface JobEligibleTabProps {
    job: Job;
    collegeBranches: string[];
}

export const JobEligibleTab: React.FC<JobEligibleTabProps> = ({ job, collegeBranches }) => {
    const [eligibleStudents, setEligibleStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [eligibleSearch, setEligibleSearch] = useState('');
    const [eligibleBranchFilter, setEligibleBranchFilter] = useState('All');
    const [eligibleFilter, setEligibleFilter] = useState<'all' | 'applied' | 'not-applied'>('all');

    useEffect(() => {
        refreshData();
    }, [job.id, eligibleSearch, eligibleBranchFilter, eligibleFilter]);

    const refreshData = async () => {
        setLoading(true);
        try {
            const filters = {
                query: eligibleSearch,
                branch: eligibleBranchFilter,
                status: eligibleFilter
            };
            // 3-Tier Sync: Await API response
            const results = await JobService.searchEligibleStudents(job.id, filters);
            setEligibleStudents(results);
        } catch (error) {
            console.error("Error fetching eligible students:", error);
        } finally {
            setLoading(false);
        }
    };

    const downloadEligibleList = () => {
        if (eligibleStudents.length === 0) {
            alert("No students in the current filtered list.");
            return;
        }
        JobService.exportJobEligibleStudents(job.id);
    };

    return (
        <div className="space-y-4 animate-in fade-in">
            <div className="flex flex-col lg:flex-row justify-between gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div className="flex gap-2 items-center flex-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                            placeholder="Search Name or Roll Number..."
                            value={eligibleSearch}
                            onChange={(e) => setEligibleSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1 bg-white border rounded-lg px-2 py-1">
                        <Layers size={12} className="text-gray-400" />
                        <select className="text-xs font-bold text-gray-700 bg-transparent outline-none max-w-[120px]" value={eligibleBranchFilter} onChange={(e) => setEligibleBranchFilter(e.target.value)}>
                            <option value="All">All Branches</option>
                            {collegeBranches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-1 bg-white border rounded-lg px-2 py-1">
                        <Filter size={12} className="text-gray-400" />
                        <select className="text-xs font-bold text-gray-700 bg-transparent outline-none" value={eligibleFilter} onChange={(e) => setEligibleFilter(e.target.value as any)}>
                            <option value="all">All Eligible</option>
                            <option value="applied">Applied</option>
                            <option value="not-applied">Not Applied</option>
                        </select>
                    </div>
                    <button onClick={downloadEligibleList} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-sm">
                        <Download size={12} /> Export List
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden min-h-[200px]">
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-gray-500">
                        <Loader2 className="animate-spin mr-2" /> Searching database...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Roll Number</th>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Branch</th>
                                    <th className="px-6 py-3">CGPA</th>
                                    <th className="px-6 py-3 text-center">Application Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {eligibleStudents.map(student => {
                                    const isApplied = job.applicants?.includes(student.id) || false;
                                    return (
                                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-3 font-mono text-gray-600 font-medium">{student.profile?.rollNumber || 'N/A'}</td>
                                            {/* Fix: Use student.fullName instead of student.name */}
                                            <td className="px-6 py-3 font-bold text-gray-900">{student.fullName}</td>
                                            <td className="px-6 py-3 text-gray-600"><span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-bold">{student.profile?.branch || 'N/A'}</span></td>
                                            <td className="px-6 py-3 text-gray-600 text-xs font-bold">{student.profile?.educationHistory?.find(e => e.level === 'Undergraduate')?.score || 'N/A'}</td>
                                            <td className="px-6 py-3 text-center">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${isApplied ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                                                    {isApplied ? 'Applied' : 'Not Applied'}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {eligibleStudents.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No eligible students found matching filters.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
