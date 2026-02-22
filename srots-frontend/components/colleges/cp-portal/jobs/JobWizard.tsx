import React, { useState, useRef, useEffect } from 'react';
import {
    X, Trash2, FileText, Search,
    ChevronLeft, ChevronRight,
    CheckCircle, UploadCloud, Loader2,
    Building, MapPin, DollarSign, Briefcase, Plus,
    Info, Star, Users, Heart, Shield, Ban, GraduationCap
} from 'lucide-react';
import { Job, User, MarkFormat } from '../../../../types';
import { ALL_PROFILE_FIELDS, AVAILABLE_BATCHES, COMMON_PROFILE_FIELD_KEYS } from '../../../../constants';
import { FieldSelector } from '../../shared/FieldSelector';
import { CollegeService } from '../../../../services/collegeService';

/**
 * Component: JobWizard
 * Path: components/colleges/cp-portal/jobs/JobWizard.tsx
 * 
 * NOTE: ALL business logic (validation, file upload, college data) handled by BACKEND via JobService
 * This component ONLY manages UI state and collects form data
 * 
 * SYNCED WITH: JobController.java - POST /api/v1/jobs, PUT /api/v1/jobs/{id}
 */

interface JobWizardProps {
    isOpen: boolean;
    isEditing: boolean;
    initialData?: Job | null;
    user?: User;
    onClose: () => void;
    onSave: (jobData: Partial<Job>, jdFiles: File[], avoidList?: File) => void;
}

const currentYear = new Date().getFullYear();

export const JobWizard: React.FC<JobWizardProps> = ({
    isOpen,
    isEditing,
    initialData,
    user,
    onClose,
    onSave
}) => {
    const [step, setStep] = useState(1);
    const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
    const [isUploading, setIsUploading] = useState(false);
    const [branchSearch, setBranchSearch] = useState('');
    const jobDocInputRef = useRef<HTMLInputElement>(null);
    const avoidListInputRef = useRef<HTMLInputElement>(null);
    const [collegeBranches, setCollegeBranches] = useState<string[]>([]);

    // NEW: Track files separately from document URLs
    const [jdFiles, setJdFiles] = useState<File[]>([]);
    const [avoidListFile, setAvoidListFile] = useState<File | null>(null);

    const initialFormState: Partial<Job> = {
        title: '', company: '', summary: '', type: 'Full-Time', location: '', workArrangement: 'On-site', salaryRange: '',
        internalId: '', companyCulture: '', physicalDemands: '', eeoStatement: '', hiringDepartment: '',
        responsibilities: [''], qualifications: [''], preferredQualifications: [''], benefits: [''],
        eligibility: {
            minCGPA: 0, maxBacklogs: 0, allowedBranches: [], min10th: 60, format10th: 'Percentage',
            min12th: 60, format12th: 'Percentage', batch: currentYear, eligibleBatches: [currentYear],
            isDiplomaEligible: false, minDiploma: 60, formatDiploma: 'Percentage', educationalGapsAllowed: false, maxGapYears: 0
        },
        rounds: [{ name: 'Online Assessment', date: '', status: 'Pending' }],
        requiredStudentFields: COMMON_PROFILE_FIELD_KEYS, documents: [], applicationDeadline: '', negativeList: []
    };

    const [newJob, setNewJob] = useState<Partial<Job>>(initialFormState);
    const [excludedInput, setExcludedInput] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (isEditing && initialData) {
                setNewJob(JSON.parse(JSON.stringify(initialData)));
                setExcludedInput(initialData.negativeList?.join('\n') || '');
                // Reset file uploads when editing (user can re-upload if needed)
                setJdFiles([]);
                setAvoidListFile(null);
            } else {
                setNewJob(JSON.parse(JSON.stringify(initialFormState)));
                setExcludedInput('');
                setJdFiles([]);
                setAvoidListFile(null);
            }
            setStep(1);
            setFormErrors({});

            // Fetch branches from backend via CollegeService
            if (user?.collegeId) {
                CollegeService.getCollegeById(user.collegeId).then(college => {
                    if (college?.branches) {
                        setCollegeBranches(college.branches.map(b => b.code));
                    }
                }).catch(err => {
                    console.error("Failed to fetch college branches", err);
                    setCollegeBranches(['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT']); // Fallback
                });
            }
        }
    }, [isOpen, isEditing, initialData, user?.collegeId]);

    if (!isOpen) return null;

    const handleArrayChange = (field: 'responsibilities' | 'qualifications' | 'benefits' | 'preferredQualifications', index: number, value: string) => {
        const list = [...(newJob[field] || [])];
        list[index] = value;
        setNewJob({ ...newJob, [field]: list });
    };

    const addArrayItem = (field: 'responsibilities' | 'qualifications' | 'benefits' | 'preferredQualifications') => {
        setNewJob({ ...newJob, [field]: [...(newJob[field] || []), ''] });
    };

    const removeArrayItem = (field: 'responsibilities' | 'qualifications' | 'benefits' | 'preferredQualifications', index: number) => {
        const list = [...(newJob[field] || [])];
        if (list.length > 1) {
            list.splice(index, 1);
            setNewJob({ ...newJob, [field]: list });
        }
    };

    const validateStep = () => {
        const errors: Record<string, boolean> = {};
        if (step === 1) {
            if (!newJob.title) errors.title = true;
            if (!newJob.company) errors.company = true;
            if (!newJob.location) errors.location = true;
            if (!newJob.summary) errors.summary = true;
        }
        if (step === 4 && !newJob.applicationDeadline) errors.applicationDeadline = true;
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => { if (validateStep()) setStep(s => s + 1); };

    const handleFinalSave = () => {
        const negativeList = excludedInput.split(/[\n,]+/).map(s => s.trim()).filter(s => s);
        onSave({ ...newJob, negativeList }, jdFiles, avoidListFile || undefined);
    };

    const handleJDFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setJdFiles(prev => [...prev, file]);
            // Add placeholder to documents array for display
            const placeholder = { name: file.name, url: '' };
            setNewJob({ ...newJob, documents: [...(newJob.documents || []), placeholder] });
        }
    };

    const handleAvoidListUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvoidListFile(e.target.files[0]);
            alert(`Avoid list file "${e.target.files[0].name}" attached. It will be uploaded when you save the job.`);
        }
    };

    const removeJDFile = (index: number) => {
        setJdFiles(prev => prev.filter((_, i) => i !== index));
        setNewJob({ ...newJob, documents: newJob.documents?.filter((_, i) => i !== index) });
    };

    const filteredBranches = collegeBranches.filter(b => b.toLowerCase().includes(branchSearch.toLowerCase()));

    const toggleBranch = (code: string) => {
        const current = newJob.eligibility?.allowedBranches || [];
        const updated = current.includes(code) ? current.filter((c: string) => c !== code) : [...current, code];
        setNewJob({ ...newJob, eligibility: { ...newJob.eligibility!, allowedBranches: updated } });
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[95vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b bg-gray-50 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{isEditing ? 'Edit Job Posting' : 'Create New Job Opportunity'}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            {[1, 2, 3, 4, 5].map(s => (
                                <div key={s} className="flex flex-col items-center gap-1">
                                    <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= s ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                                </div>
                            ))}
                            <span className="text-xs font-bold text-blue-600 ml-2 uppercase tracking-wider">Step {step} of 5</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {step === 1 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4">
                            <h3 className="font-bold text-xl text-gray-800 border-b pb-3 flex items-center gap-2"><Briefcase size={20} className="text-blue-600" /> 1. Position & Role Basics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Job Title *</label>
                                    <input className={`w-full p-3 border rounded-xl bg-white text-gray-900 outline-none transition-all focus:ring-2 focus:ring-blue-100 ${formErrors.title ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} placeholder="e.g. Senior Software Engineer" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Company Name *</label>
                                    <input className={`w-full p-3 border rounded-xl bg-white text-gray-900 outline-none transition-all focus:ring-2 focus:ring-blue-100 ${formErrors.company ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })} placeholder="e.g. Google" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Hiring Department</label>
                                    <input className="w-full p-3 border rounded-xl border-gray-200 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={newJob.hiringDepartment || ''} onChange={e => setNewJob({ ...newJob, hiringDepartment: e.target.value })} placeholder="e.g. Cloud Infrastructure" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Job Type *</label>
                                    <select className="w-full p-3 border rounded-xl border-gray-200 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 font-medium" value={newJob.type} onChange={e => setNewJob({ ...newJob, type: e.target.value as any })}>
                                        <option>Full-Time</option><option>Internship</option><option>Contract</option><option>Part-Time</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Work Arrangement</label>
                                    <select className="w-full p-3 border rounded-xl border-gray-200 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 font-medium" value={newJob.workArrangement} onChange={e => setNewJob({ ...newJob, workArrangement: e.target.value as any })}>
                                        <option>On-site</option><option>Remote</option><option>Hybrid</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Location *</label>
                                    <input className={`w-full p-3 border rounded-xl bg-white text-gray-900 outline-none transition-all focus:ring-2 focus:ring-blue-100 ${formErrors.location ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} placeholder="e.g. Hyderabad, TS" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Salary Package (LPA)</label>
                                    <input className="w-full p-3 border rounded-xl border-gray-200 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={newJob.salaryRange || ''} onChange={e => setNewJob({ ...newJob, salaryRange: e.target.value })} placeholder="e.g. 6.5 - 12.0 LPA" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Job Summary *</label>
                                    <textarea className={`w-full p-3 border rounded-xl bg-white text-gray-900 outline-none transition-all focus:ring-2 focus:ring-blue-100 min-h-[120px] ${formErrors.summary ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} value={newJob.summary} onChange={e => setNewJob({ ...newJob, summary: e.target.value })} placeholder="Provide a brief overview of the role..." />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4">
                            <h3 className="font-bold text-xl text-gray-800 border-b pb-3 flex items-center gap-2"><Star size={20} className="text-blue-600" /> 2. Responsibilities & Description</h3>

                            <div className="space-y-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Key Responsibilities</label>
                                {newJob.responsibilities?.map((res, i) => (
                                    <div key={i} className="flex gap-2 group">
                                        <input className="flex-1 p-3 border border-gray-200 rounded-xl bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={res} onChange={e => handleArrayChange('responsibilities', i, e.target.value)} placeholder="Enter a responsibility point..." />
                                        <button onClick={() => removeArrayItem('responsibilities', i)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                                    </div>
                                ))}
                                <button onClick={() => addArrayItem('responsibilities')} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors border border-dashed border-blue-200"><Plus size={16} /> Add Point</button>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Required Qualifications</label>
                                {newJob.qualifications?.map((q, i) => (
                                    <div key={i} className="flex gap-2 group">
                                        <input className="flex-1 p-3 border border-gray-200 rounded-xl bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={q} onChange={e => handleArrayChange('qualifications', i, e.target.value)} placeholder="e.g. B.Tech in CSE/IT" />
                                        <button onClick={() => removeArrayItem('qualifications', i)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                                    </div>
                                ))}
                                <button onClick={() => addArrayItem('qualifications')} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors border border-dashed border-blue-200"><Plus size={16} /> Add Qualification</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                                <div className="col-span-2"><h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Extended Details</h4></div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5"><Heart size={14} className="text-pink-500" /> Company Culture</label>
                                    <textarea className="w-full p-3 border border-gray-200 rounded-xl bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 text-sm min-h-[100px]" value={newJob.companyCulture || ''} onChange={e => setNewJob({ ...newJob, companyCulture: e.target.value })} placeholder="Describe the working environment..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5"><Info size={14} className="text-blue-500" /> Physical Demands</label>
                                    <textarea className="w-full p-3 border border-gray-200 rounded-xl bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 text-sm min-h-[100px]" value={newJob.physicalDemands || ''} onChange={e => setNewJob({ ...newJob, physicalDemands: e.target.value })} placeholder="Any specific physical requirements?" />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4">
                            <h3 className="font-bold text-xl text-gray-800 border-b pb-3 flex items-center gap-2"><Shield size={20} className="text-indigo-600" /> 3. Eligibility & Branch Criteria</h3>

                            {/* Searchable Branches */}
                            <div className="space-y-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Allowed Branches</label>
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <input
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                        placeholder="Search branches to add (e.g. CSE, ECE)..."
                                        value={branchSearch}
                                        onChange={e => setBranchSearch(e.target.value)}
                                    />
                                    {branchSearch && (
                                        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto animate-in slide-in-from-top-2">
                                            {filteredBranches.length > 0 ? filteredBranches.map(b => (
                                                <button
                                                    key={b}
                                                    type="button"
                                                    onClick={() => { toggleBranch(b); setBranchSearch(''); }}
                                                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex justify-between items-center"
                                                >
                                                    <span className="font-bold text-gray-700">{b}</span>
                                                    {newJob.eligibility?.allowedBranches.includes(b) && <CheckCircle size={16} className="text-blue-600" />}
                                                </button>
                                            )) : <div className="p-4 text-center text-gray-400 text-sm">No branches matching your search</div>}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-200 min-h-[60px]">
                                    {newJob.eligibility?.allowedBranches.length === 0 ? (
                                        <span className="text-xs text-gray-400 italic font-medium">No branches selected. All students will be barred by default.</span>
                                    ) : (
                                        newJob.eligibility?.allowedBranches.map((b: string) => (
                                            <span key={b} className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                                                {b} <button onClick={() => toggleBranch(b)}><X size={14} /></button>
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Flexible Academic Cutoffs */}
                            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-6">
                                <h4 className="font-bold text-blue-900 text-sm uppercase tracking-widest flex items-center gap-2"><GraduationCap size={18} /> Academic Performance Cutoffs</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* UG Cutoff */}
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-blue-800 uppercase">Undergraduate (B.Tech) *</label>
                                        <div className="flex gap-2">
                                            <select
                                                className="w-32 p-2.5 border border-blue-200 rounded-xl bg-white text-gray-900 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-400"
                                                value={newJob.eligibility?.formatUG || 'CGPA'}
                                                onChange={e => setNewJob({ ...newJob, eligibility: { ...newJob.eligibility!, formatUG: e.target.value as any } })}
                                            >
                                                <option value="CGPA">CGPA</option>
                                                <option value="Percentage">Percentage</option>
                                                <option value="Marks">Total Marks</option>
                                            </select>
                                            <input type="number" step="0.01" className="flex-1 p-2.5 border border-blue-200 rounded-xl bg-white text-gray-900 font-bold outline-none focus:ring-2 focus:ring-blue-400" value={newJob.eligibility?.minCGPA} onChange={e => setNewJob({ ...newJob, eligibility: { ...newJob.eligibility!, minCGPA: parseFloat(e.target.value) } })} placeholder="Value" />
                                        </div>
                                    </div>

                                    {/* 10th Cutoff */}
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-blue-800 uppercase">Class 10th (SSC) *</label>
                                        <div className="flex gap-2">
                                            <select
                                                className="w-32 p-2.5 border border-blue-200 rounded-xl bg-white text-gray-900 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-400"
                                                value={newJob.eligibility?.format10th}
                                                onChange={e => setNewJob({ ...newJob, eligibility: { ...newJob.eligibility!, format10th: e.target.value as any } })}
                                            >
                                                <option value="Percentage">Percentage</option>
                                                <option value="CGPA">CGPA</option>
                                                <option value="Marks">Total Marks</option>
                                            </select>
                                            <input type="number" step="0.01" className="flex-1 p-2.5 border border-blue-200 rounded-xl bg-white text-gray-900 font-bold outline-none focus:ring-2 focus:ring-blue-400" value={newJob.eligibility?.min10th} onChange={e => setNewJob({ ...newJob, eligibility: { ...newJob.eligibility!, min10th: parseFloat(e.target.value) } })} placeholder="Value" />
                                        </div>
                                    </div>

                                    {/* 12th Cutoff */}
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-blue-800 uppercase">Class 12th (Inter) *</label>
                                        <div className="flex gap-2">
                                            <select
                                                className="w-32 p-2.5 border border-blue-200 rounded-xl bg-white text-gray-900 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-400"
                                                value={newJob.eligibility?.format12th}
                                                onChange={e => setNewJob({ ...newJob, eligibility: { ...newJob.eligibility!, format12th: e.target.value as any } })}
                                            >
                                                <option value="Percentage">Percentage</option>
                                                <option value="CGPA">CGPA</option>
                                                <option value="Marks">Total Marks</option>
                                            </select>
                                            <input type="number" step="0.01" className="flex-1 p-2.5 border border-blue-200 rounded-xl bg-white text-gray-900 font-bold outline-none focus:ring-2 focus:ring-blue-400" value={newJob.eligibility?.min12th} onChange={e => setNewJob({ ...newJob, eligibility: { ...newJob.eligibility!, min12th: parseFloat(e.target.value) } })} placeholder="Value" />
                                        </div>
                                    </div>

                                    {/* Diploma Cutoff */}
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-blue-800 uppercase">Diploma (Lateral)</label>
                                        <div className="flex gap-2">
                                            <select
                                                className="w-32 p-2.5 border border-blue-200 rounded-xl bg-white text-gray-900 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-400"
                                                value={newJob.eligibility?.formatDiploma}
                                                onChange={e => setNewJob({ ...newJob, eligibility: { ...newJob.eligibility!, formatDiploma: e.target.value as any } })}
                                            >
                                                <option value="Percentage">Percentage</option>
                                                <option value="CGPA">CGPA</option>
                                                <option value="Marks">Total Marks</option>
                                            </select>
                                            <input type="number" step="0.01" className="flex-1 p-2.5 border border-blue-200 rounded-xl bg-white text-gray-900 font-bold outline-none focus:ring-2 focus:ring-blue-400" value={newJob.eligibility?.minDiploma} onChange={e => setNewJob({ ...newJob, eligibility: { ...newJob.eligibility!, minDiploma: parseFloat(e.target.value) } })} placeholder="Value" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Target Batch Year</label>
                                    <input type="number" className="w-full p-3 border border-gray-200 rounded-xl bg-white text-gray-900 font-bold outline-none focus:ring-2 focus:ring-blue-100" value={newJob.eligibility?.batch} onChange={e => setNewJob({ ...newJob, eligibility: { ...newJob.eligibility!, batch: parseInt(e.target.value) } })} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Maximum Allowed Backlogs</label>
                                    <input type="number" className="w-full p-3 border border-gray-200 rounded-xl bg-white text-gray-900 font-bold outline-none focus:ring-2 focus:ring-blue-100" value={newJob.eligibility?.maxBacklogs} onChange={e => setNewJob({ ...newJob, eligibility: { ...newJob.eligibility!, maxBacklogs: parseInt(e.target.value) } })} />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4">
                            <h3 className="font-bold text-xl text-gray-800 border-b pb-3 flex items-center gap-2"><CheckCircle size={20} className="text-green-600" /> 4. Timeline & Selection</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Application Deadline *</label>
                                    <input type="date" className={`w-full p-3 border rounded-xl bg-white font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 ${formErrors.applicationDeadline ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} value={newJob.applicationDeadline} onChange={e => setNewJob({ ...newJob, applicationDeadline: e.target.value })} />
                                    <p className="text-[10px] text-gray-400">Applications will auto-close after this date.</p>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">External Link (Optional)</label>
                                    <input className="w-full p-3 border rounded-xl border-gray-200 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={newJob.externalLink || ''} onChange={e => setNewJob({ ...newJob, externalLink: e.target.value })} placeholder="https://..." />
                                    <p className="text-[10px] text-gray-400">Direct students to company career portal.</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h4 className="font-bold text-gray-800">Selection Rounds</h4>
                                        <p className="text-xs text-gray-500">Add dates for the upcoming drive stages.</p>
                                    </div>
                                    <button onClick={() => setNewJob({ ...newJob, rounds: [...(newJob.rounds || []), { name: '', date: '', status: 'Pending' }] })} className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors flex items-center gap-2"><Plus size={14} /> Add Round</button>
                                </div>
                                <div className="space-y-3">
                                    {newJob.rounds?.map((r, i) => (
                                        <div key={i} className="flex gap-4 items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm animate-in slide-in-from-top-2">
                                            <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">{i + 1}</span>
                                            <input className="flex-1 p-2.5 border-b border-transparent hover:border-gray-200 focus:border-blue-500 outline-none bg-transparent font-bold text-gray-800" placeholder="e.g. Technical Interview" value={r.name} onChange={(e) => {
                                                const rs = [...(newJob.rounds || [])];
                                                rs[i].name = e.target.value;
                                                setNewJob({ ...newJob, rounds: rs });
                                            }} />
                                            <input type="date" className="w-40 p-2 border rounded-lg bg-gray-50 text-sm font-medium" value={r.date} onChange={(e) => {
                                                const rs = [...(newJob.rounds || [])];
                                                rs[i].date = e.target.value;
                                                setNewJob({ ...newJob, rounds: rs });
                                            }} />
                                            <button onClick={() => setNewJob({ ...newJob, rounds: newJob.rounds?.filter((_, idx) => idx !== i) })} className="text-gray-300 hover:text-red-500 p-2 transition-colors"><Trash2 size={18} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
                                <label className="block text-xs font-bold text-indigo-900 uppercase mb-3">JD & Policy Attachments</label>
                                <div className="flex flex-wrap gap-4">
                                    {jdFiles.map((file, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border shadow-sm text-xs font-bold text-blue-700">
                                            <FileText size={14} /> <span className="max-w-[120px] truncate">{file.name}</span>
                                            <button onClick={() => removeJDFile(i)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => jobDocInputRef.current?.click()} className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-indigo-200 rounded-2xl bg-white hover:bg-indigo-50 transition-all text-indigo-400 hover:text-indigo-600 group">
                                        {isUploading ? <Loader2 size={24} className="animate-spin" /> : <UploadCloud size={24} className="group-hover:scale-110 transition-transform" />}
                                        <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">{isUploading ? '...' : 'Upload'}</span>
                                        <input type="file" multiple className="hidden" ref={jobDocInputRef} onChange={handleJDFileAdd} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4">
                            <h3 className="font-bold text-xl text-gray-800 border-b pb-3 flex items-center gap-2"><Users size={20} className="text-blue-600" /> 5. Data Extraction & Negative List</h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <FieldSelector
                                    selectedFields={newJob.requiredStudentFields || []}
                                    onToggle={(v) => setNewJob({ ...newJob, requiredStudentFields: newJob.requiredStudentFields?.includes(v) ? newJob.requiredStudentFields.filter(x => x !== v) : [...(newJob.requiredStudentFields || []), v] })}
                                    options={ALL_PROFILE_FIELDS}
                                    commonIds={COMMON_PROFILE_FIELD_KEYS}
                                    colorTheme="blue"
                                    labels={{
                                        title: 'Required Profile Data',
                                        description: 'Select which student profile fields should be exported to the applicant sheet.',
                                        searchPlaceholder: 'Search fields...'
                                    }}
                                />

                                <div className="space-y-6">
                                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex flex-col">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Ban size={20} className="text-red-600" />
                                            <h4 className="font-bold text-red-900 text-sm uppercase">Negative List (Excluded Students)</h4>
                                        </div>
                                        <p className="text-xs text-red-700 leading-relaxed mb-4">Paste Roll Numbers of students who are strictly prohibited from applying (e.g. already placed). Use comma or new lines.</p>
                                        <textarea
                                            className="flex-1 w-full p-4 border border-red-200 rounded-xl bg-white text-gray-900 font-mono text-xs focus:ring-2 focus:ring-red-300 outline-none min-h-[150px]"
                                            placeholder={`20701A0501\n20701A0588\n...`}
                                            value={excludedInput}
                                            onChange={e => setExcludedInput(e.target.value)}
                                        />
                                        <p className="text-[10px] text-red-500 mt-2 font-bold uppercase tracking-wider">Identified {excludedInput.split(/[\n,]+/).filter(x => x.trim()).length} students for exclusion.</p>
                                    </div>

                                    <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
                                        <label className="block text-xs font-bold text-yellow-900 uppercase mb-3">Or Upload Avoid List (Excel/CSV)</label>
                                        <p className="text-xs text-yellow-700 mb-3">Upload an Excel/CSV with roll numbers to exclude. Backend will parse automatically.</p>
                                        <button
                                            onClick={() => avoidListInputRef.current?.click()}
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 text-yellow-900 rounded-xl font-bold text-sm transition-all"
                                        >
                                            <UploadCloud size={18} /> {avoidListFile ? avoidListFile.name : 'Upload File'}
                                        </button>
                                        <input type="file" className="hidden" ref={avoidListInputRef} accept=".csv,.xlsx,.xls" onChange={handleAvoidListUpload} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl flex gap-4">
                                <Info size={24} className="text-yellow-600 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-yellow-900 text-sm">Review & Finalize</h4>
                                    <p className="text-xs text-yellow-700 leading-relaxed mt-1">Once you post this job, all eligible students in the target branches will receive a notification. Students in the negative list will see the job but will be unable to apply.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t bg-gray-50 flex justify-between items-center shrink-0">
                    {step > 1 ? (
                        <button onClick={() => setStep(s => s - 1)} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 flex items-center gap-2 transition-all shadow-sm">
                            <ChevronLeft size={18} /> Previous
                        </button>
                    ) : <div />}

                    <div className="flex gap-4">
                        {step < 5 ? (
                            <button onClick={handleNext} className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2 transition-all active:scale-95">
                                Next <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button onClick={handleFinalSave} className="px-10 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 flex items-center gap-2 transition-all active:scale-95">
                                <CheckCircle size={20} /> {isEditing ? 'Update Opportunity' : 'Launch Opportunity'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
