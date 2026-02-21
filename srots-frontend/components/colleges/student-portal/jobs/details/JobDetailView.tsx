
// import React, { useState, useEffect } from 'react';
// import { Job, Student, StudentJobView } from '../../../../../types';
// import { 
//     ArrowLeft, Building, 
//     CheckCircle, MapPin, Briefcase, Ban, Lock, AlertTriangle, ExternalLink, Calendar as CalendarIcon, FileText, List, Loader2 
// } from 'lucide-react';
// import { JobService } from '../../../../../services/jobService';
// import { JobOverviewTab } from '../../../cp-portal/jobs/details/JobOverviewTab';

// interface JobDetailViewProps {
//     job: Job;
//     student: Student;
//     onBack: () => void;
//     onApply: (id: string) => void;
//     onNotInterested: (id: string) => void;
// }

// export const JobDetailView: React.FC<JobDetailViewProps> = ({ 
//     job, student, onBack, onApply, onNotInterested
// }) => {
//     const [viewData, setViewData] = useState<StudentJobView | null>(null);

//     useEffect(() => {
//         const loadDetails = async () => {
//             if (job?.id && student?.id) {
//                 const data = await JobService.getJobDetailsForStudent(job.id, student.id);
//                 setViewData(data);
//             }
//         };
//         loadDetails();
//     }, [job?.id, student?.id]);

//     if (!job) {
//         return (
//             <div className="p-12 text-center text-gray-500 animate-in fade-in">
//                 <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
//                 <p>Job information is currently unavailable.</p>
//                 <button onClick={onBack} className="mt-4 text-blue-600 font-bold hover:underline">Back to Jobs</button>
//             </div>
//         );
//     }

//     if (!viewData) return <div className="p-12 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2"/> Loading details...</div>;

//     const { isApplied, isEligible, eligibilityReason, isExpired, isNotInterested } = viewData;

//     return (
//         <div className="bg-white rounded-xl border shadow-sm h-full md:h-[calc(100vh-8rem)] flex flex-col animate-in fade-in slide-in-from-right-4 overflow-hidden absolute inset-0 z-20 md:static">
//             <div className="p-4 border-b flex items-center gap-3 bg-white z-10 rounded-t-xl shadow-sm">
//                 <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
//                     <ArrowLeft size={20} />
//                 </button>
//                 <span className="font-bold text-gray-700">Back to Job List</span>
//             </div>

//             <div className="flex-1 overflow-y-auto w-full bg-gray-50/30">
//                 <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-full flex flex-col">
//                     <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
//                         <div className="flex items-start gap-4">
//                             <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-2xl font-bold text-gray-500 border shrink-0">
//                                 {job.company ? job.company[0] : '?'}
//                             </div>
//                             <div>
//                                 <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{job.title || 'Job Title'}</h1>
//                                 <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
//                                     <span className="font-bold flex items-center gap-1"><Building size={14} className="md:w-4 md:h-4"/> {job.company || 'Unknown Company'}</span>
//                                     <span className="hidden md:inline text-gray-300">|</span>
//                                     <span className="flex items-center gap-1"><MapPin size={14} className="md:w-4 md:h-4"/> {job.location || 'Location TBA'}</span>
//                                     <span className="hidden md:inline text-gray-300">|</span>
//                                     <span className="flex items-center gap-1"><Briefcase size={14} className="md:w-4 md:h-4"/> {job.type || 'Full-Time'}</span>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="flex flex-row md:flex-col items-center md:items-end gap-2 w-full md:w-auto justify-between md:justify-start mt-2 md:mt-0">
//                             <div className={`px-4 py-1.5 rounded-full text-sm font-bold border ${isApplied ? 'bg-green-100 text-green-700 border-green-200' : !isEligible ? 'bg-red-50 text-red-700 border-red-200' : isExpired ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
//                                 {isApplied ? (
//                                     <span className="flex items-center gap-1"><CheckCircle size={16}/> Applied</span>
//                                 ) : !isEligible ? (
//                                     <span className="flex items-center gap-1"><Ban size={16}/> Not Eligible</span>
//                                 ) : isExpired ? (
//                                     <span className="flex items-center gap-1"><Lock size={16}/> Closed</span>
//                                 ) : (
//                                     <span className="flex items-center gap-1"><CheckCircle size={16}/> Open</span>
//                                 )}
//                             </div>
//                             <span className="text-xs text-gray-500 font-medium">Posted: {job.postedAt || 'N/A'}</span>
//                         </div>
//                     </div>

//                     <JobOverviewTab 
//                         job={job} 
//                         validApplicantsCount={0} 
//                         onDownloadList={() => {}} 
//                         showStatsAndExports={false} 
//                     /> 

//                     {job.rounds && job.rounds.length > 0 && (
//                         <div className="mb-8 pb-8 border-b bg-white p-6 rounded-2xl border shadow-sm mt-6">
//                             <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><List size={18} className="text-blue-600"/> Selection Process</h3>
//                             <div className="space-y-3">
//                                 {job.rounds.map((round, idx) => (
//                                     <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
//                                         <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">{idx + 1}</span>
//                                         <div>
//                                             <p className="font-bold text-gray-800 text-sm">{round.name}</p>
//                                             <p className="text-xs text-gray-500 flex items-center gap-1"><CalendarIcon size={10}/> {round.date}</p>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     )}

//                     {job.documents && job.documents.length > 0 && (
//                         <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
//                             <h3 className="text-sm font-bold text-blue-800 mb-3 uppercase tracking-wider">Attachments</h3>
//                             <div className="flex flex-wrap gap-3">
//                                 {job.documents.map((doc, i) => (
//                                     <a key={i} href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 text-blue-700 font-bold text-xs transition-colors shadow-sm w-full md:w-auto justify-center md:justify-start">
//                                         <FileText size={16}/> {doc.name}
//                                     </a>
//                                 ))}
//                             </div>
//                         </div>
//                     )}

//                     <div className="mt-auto pt-8 border-t bg-gray-50/50 p-6 rounded-xl border border-gray-200 pb-20 md:pb-6">
//                         {isApplied ? (
//                             <div className="flex flex-col md:flex-row justify-between items-center gap-6 animate-in fade-in">
//                                 <div className="text-green-800">
//                                     <div className="flex items-center gap-2 font-bold text-xl">
//                                         <CheckCircle size={24}/> Application Submitted
//                                     </div>
//                                     <p className="text-sm opacity-80 mt-1">You have successfully applied for this position. Track your status in the App Status tab.</p>
//                                 </div>
//                                 <button disabled className="w-full md:w-auto px-8 py-3 bg-green-100 text-green-800 font-bold rounded-lg border border-green-200">
//                                     Applied
//                                 </button>
//                             </div>
//                         ) : !isEligible ? (
//                             <div className="flex flex-col gap-4 animate-in fade-in">
//                                     <div className="flex items-center gap-3 text-red-800 font-bold text-xl">
//                                         <div className="p-2 bg-red-100 rounded-full"><AlertTriangle size={24}/></div>
//                                         Not Eligible to Apply
//                                     </div>
//                                     <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-lg shadow-sm">
//                                         <h5 className="text-red-900 font-bold mb-2">Reason:</h5>
//                                         <p className="text-red-700 font-medium text-sm md:text-lg leading-relaxed">
//                                             {eligibilityReason || "You do not meet the academic or batch requirements for this position."}
//                                         </p>
//                                     </div>
//                                     <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
//                                         <div className="flex items-center gap-2">
//                                             <Lock size={14}/> Application Locked
//                                         </div>
//                                         <div>
//                                             Deadline: <span className="font-bold">{job.applicationDeadline}</span>
//                                         </div>
//                                     </div>
//                             </div>
//                         ) : (
//                             <div className="flex flex-col md:flex-row justify-between items-center gap-6">
//                                 <div className="text-sm text-gray-600 w-full md:w-auto flex justify-between md:block">
//                                     <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Last Date to Apply</span>
//                                     <span className={`font-bold text-lg ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>{job.applicationDeadline}</span>
//                                 </div>

//                                 <div className="w-full md:w-auto">
//                                     {isExpired ? (
//                                         <div className="px-8 py-3 bg-gray-200 text-gray-500 font-bold rounded-lg flex items-center justify-center gap-2 cursor-not-allowed w-full md:w-auto">
//                                             <Lock size={20}/> Applications Closed
//                                         </div>
//                                     ) : isNotInterested ? (
//                                         <div className="px-8 py-3 bg-gray-100 text-gray-600 font-bold rounded-lg border border-gray-200 flex items-center justify-center gap-2 w-full md:w-auto">
//                                             <Ban size={20}/> Marked as Not Interested
//                                         </div>
//                                     ) : (
//                                         <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
//                                             <button onClick={() => onNotInterested(job.id)} className="w-full md:w-auto flex-1 px-5 py-3 bg-white border border-gray-300 text-gray-600 font-bold rounded-lg hover:bg-gray-100 transition-colors">
//                                                 Not Interested
//                                             </button>

//                                             {job.externalLink ? (
//                                                 <a 
//                                                     href={job.externalLink} 
//                                                     target="_blank" 
//                                                     rel="noreferrer"
//                                                     className="w-full md:w-auto flex-1 px-8 py-3 bg-blue-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md"
//                                                 >
//                                                     Apply Externally <ExternalLink size={18}/>
//                                                 </a>
//                                             ) : (
//                                                 <button 
//                                                     onClick={() => onApply(job.id)} 
//                                                     className="w-full md:w-auto flex-[2] px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2"
//                                                 >
//                                                     Apply Now <Briefcase size={20}/>
//                                                 </button>
//                                             )}
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

import React, { useState, useEffect } from 'react';
import { Job, Student, StudentJobView } from '../../../../../types';
import {
    ArrowLeft, Building,
    CheckCircle, MapPin, Briefcase, Ban, Lock, AlertTriangle, ExternalLink, Calendar as CalendarIcon, FileText, List, Loader2,
    Shield
} from 'lucide-react';
import { JobService } from '../../../../../services/jobService';
import { JobOverviewTab } from '../../../cp-portal/jobs/details/JobOverviewTab';

/**
 * COMPLETE FIXED: JobDetailView with proper status syncing
 * 
 * KEY FIXES:
 * 1. Receives viewData prop with student eligibility/application status
 * 2. Shows correct status badge based on viewData flags
 * 3. Shows/hides action buttons based on actual state
 * 4. Properly maps job field values (responsibilities, qualifications, etc.)
 */

interface JobDetailViewProps {
    job: Job;
    student: Student;
    viewData: StudentJobView;  // CRITICAL: Added this prop
    onBack: () => void;
    onApply: (id: string) => void;
    onNotInterested: (id: string) => void;
}

export const JobDetailView: React.FC<JobDetailViewProps> = ({
    job, student, viewData, onBack, onApply, onNotInterested
}) => {
    const [loading, setLoading] = useState(false);

    // CRITICAL: Use viewData that was passed from parent
    const { isApplied, isEligible, eligibilityReason, isExpired, isNotInterested } = viewData;

    if (!job) {
        return (
            <div className="p-12 text-center text-gray-500 animate-in fade-in">
                <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
                <p>Job information is currently unavailable.</p>
                <button onClick={onBack} className="mt-4 text-blue-600 font-bold hover:underline">Back to Jobs</button>
            </div>
        );
    }

    // CRITICAL FIX: Use job fields directly (already mapped in JobService)
    const companyName = job.companyName || job.company || 'Unknown Company';
    const jobType = job.jobType || job.type || 'Full-Time';
    const workMode = job.workMode || job.workArrangement || 'On-site';

    // Parse JSON fields for display
    const responsibilities = (() => {
        try {
            if (Array.isArray(job.responsibilitiesJson)) return job.responsibilitiesJson;
            if (typeof job.responsibilitiesJson === 'string') {
                return JSON.parse(job.responsibilitiesJson);
            }
            return [];
        } catch (e) {
            return [];
        }
    })();

    const qualifications = (() => {
        try {
            if (Array.isArray(job.qualificationsJson)) return job.qualificationsJson;
            if (typeof job.qualificationsJson === 'string') {
                return JSON.parse(job.qualificationsJson);
            }
            return [];
        } catch (e) {
            return [];
        }
    })();

    const preferredQualifications = (() => {
        try {
            if (Array.isArray(job.preferredQualificationsJson)) return job.preferredQualificationsJson;
            if (typeof job.preferredQualificationsJson === 'string') {
                return JSON.parse(job.preferredQualificationsJson);
            }
            return [];
        } catch (e) {
            return [];
        }
    })();

    const benefits = (() => {
        try {
            if (Array.isArray(job.benefitsJson)) return job.benefitsJson;
            if (typeof job.benefitsJson === 'string') {
                return JSON.parse(job.benefitsJson);
            }
            return [];
        } catch (e) {
            return [];
        }
    })();

    const rounds = (() => {
        try {
            if (Array.isArray(job.rounds)) return job.rounds;
            if (typeof job.roundsJson === 'string') {
                return JSON.parse(job.roundsJson);
            }
            return [];
        } catch (e) {
            return [];
        }
    })();

    const documents = (() => {
        try {
            if (Array.isArray(job.documents)) return job.documents;
            if (typeof job.attachmentsJson === 'string') {
                return JSON.parse(job.attachmentsJson);
            }
            return [];
        } catch (e) {
            return [];
        }
    })();

    return (
        <div className="bg-white rounded-xl border shadow-sm h-full md:h-[calc(100vh-8rem)] flex flex-col animate-in fade-in slide-in-from-right-4 overflow-hidden absolute inset-0 z-20 md:static">
            <div className="p-4 border-b flex items-center gap-3 bg-white z-10 rounded-t-xl shadow-sm">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <span className="font-bold text-gray-700">Back to Job List</span>
            </div>

            <div className="flex-1 overflow-y-auto w-full bg-gray-50/30">
                <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-full flex flex-col">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-2xl font-bold text-gray-500 border shrink-0">
                                {companyName[0] || '?'}
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{job.title || 'Job Title'}</h1>
                                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
                                    <span className="font-bold flex items-center gap-1"><Building size={14} className="md:w-4 md:h-4" /> {companyName}</span>
                                    <span className="hidden md:inline text-gray-300">|</span>
                                    <span className="flex items-center gap-1"><MapPin size={14} className="md:w-4 md:h-4" /> {job.location || 'Location TBA'}</span>
                                    <span className="hidden md:inline text-gray-300">|</span>
                                    <span className="flex items-center gap-1"><Briefcase size={14} className="md:w-4 md:h-4" /> {jobType}</span>
                                    <span className="hidden md:inline text-gray-300">|</span>
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full">{workMode}</span>
                                </div>
                            </div>
                        </div>

                        {/* CRITICAL FIX: Status badge properly synced with viewData */}
                        <div className="flex flex-row md:flex-col items-center md:items-end gap-2 w-full md:w-auto justify-between md:justify-start mt-2 md:mt-0">
                            <div className={`px-4 py-1.5 rounded-full text-sm font-bold border ${isApplied ? 'bg-green-100 text-green-700 border-green-200' :
                                    !isEligible ? 'bg-red-50 text-red-700 border-red-200' :
                                        isExpired ? 'bg-gray-100 text-gray-500 border-gray-200' :
                                            'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                {isApplied ? (
                                    <span className="flex items-center gap-1"><CheckCircle size={16} /> Applied</span>
                                ) : !isEligible ? (
                                    <span className="flex items-center gap-1"><Ban size={16} /> Not Eligible</span>
                                ) : isExpired ? (
                                    <span className="flex items-center gap-1"><Lock size={16} /> Closed</span>
                                ) : (
                                    <span className="flex items-center gap-1"><CheckCircle size={16} /> Open</span>
                                )}
                            </div>
                            <span className="text-xs text-gray-500 font-medium">Posted: {job.postedAt || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Job Summary */}
                    {job.summary && (
                        <div className="mb-6 p-6 bg-white rounded-2xl border shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">About this Role</h3>
                            <p className="text-gray-700 leading-relaxed">{job.summary}</p>
                        </div>
                    )}

                    {/* Responsibilities */}
                    {responsibilities.length > 0 && (
                        <div className="mb-6 p-6 bg-white rounded-2xl border shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Key Responsibilities</h3>
                            <ul className="space-y-2">
                                {responsibilities.map((resp: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-1">•</span>
                                        <span className="text-gray-700">{resp}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Qualifications */}
                    {qualifications.length > 0 && (
                        <div className="mb-6 p-6 bg-white rounded-2xl border shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Required Qualifications</h3>
                            <ul className="space-y-2">
                                {qualifications.map((qual: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-green-600 mt-1">✓</span>
                                        <span className="text-gray-700">{qual}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Preferred Qualifications */}
                    {preferredQualifications.length > 0 && (
                        <div className="mb-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                            <h3 className="text-lg font-bold text-blue-900 mb-4">Preferred Qualifications</h3>
                            <ul className="space-y-2">
                                {preferredQualifications.map((pref: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-1">⭐</span>
                                        <span className="text-blue-800">{pref}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Eligibility Criteria */}
                    <div className="mb-6 p-6 bg-purple-50 rounded-2xl border border-purple-100">
                        <h3 className="text-lg font-bold text-purple-900 mb-4">Eligibility Criteria</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {job.minUgScore && (
                                <div className="flex justify-between items-center py-2 border-b border-purple-100">
                                    <span className="text-purple-800 font-medium">Min UG Score:</span>
                                    <span className="text-purple-900 font-bold">{job.minUgScore} {job.formatUg || '%'}</span>
                                </div>
                            )}
                            {job.min10thScore && (
                                <div className="flex justify-between items-center py-2 border-b border-purple-100">
                                    <span className="text-purple-800 font-medium">Min 10th Score:</span>
                                    <span className="text-purple-900 font-bold">{job.min10thScore} {job.format10th || '%'}</span>
                                </div>
                            )}
                            {job.min12thScore && (
                                <div className="flex justify-between items-center py-2 border-b border-purple-100">
                                    <span className="text-purple-800 font-medium">Min 12th Score:</span>
                                    <span className="text-purple-900 font-bold">{job.min12thScore} {job.format12th || '%'}</span>
                                </div>
                            )}
                            {job.maxBacklogs !== undefined && (
                                <div className="flex justify-between items-center py-2 border-b border-purple-100">
                                    <span className="text-purple-800 font-medium">Max Backlogs:</span>
                                    <span className="text-purple-900 font-bold">{job.maxBacklogs}</span>
                                </div>
                            )}
                            {job.allowGaps !== undefined && (
                                <div className="flex justify-between items-center py-2 border-b border-purple-100">
                                    <span className="text-purple-800 font-medium">Gap Years Allowed:</span>
                                    <span className="text-purple-900 font-bold">{job.allowGaps ? 'Yes' : 'No'}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Benefits */}
                    {benefits.length > 0 && (
                        <div className="mb-6 p-6 bg-green-50 rounded-2xl border border-green-100">
                            <h3 className="text-lg font-bold text-green-900 mb-4">Benefits & Perks</h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {benefits.map((benefit: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-green-600 mt-1">✓</span>
                                        <span className="text-green-800">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Selection Process */}
                    {rounds.length > 0 && (
                        <div className="mb-8 pb-8 border-b bg-white p-6 rounded-2xl border shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><List size={18} className="text-blue-600" /> Selection Process</h3>
                            <div className="space-y-3">
                                {rounds.map((round: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">{idx + 1}</span>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{round.name}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1"><CalendarIcon size={10} /> {round.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Attachments */}
                    {documents.length > 0 && (
                        <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
                            <h3 className="text-sm font-bold text-blue-800 mb-3 uppercase tracking-wider">Attachments</h3>
                            <div className="flex flex-wrap gap-3">
                                {documents.map((doc: any, i: number) => (
                                    <a key={i} href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 text-blue-700 font-bold text-xs transition-colors shadow-sm w-full md:w-auto justify-center md:justify-start">
                                        <FileText size={16} /> {doc.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CRITICAL FIX: Action buttons properly synced with viewData */}
                    <div className="mt-auto pt-8 border-t bg-gray-50/50 p-6 rounded-xl border border-gray-200 pb-20 md:pb-6">
                        {isApplied ? (
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6 animate-in fade-in">
                                <div className="text-green-800">
                                    <div className="flex items-center gap-2 font-bold text-xl">
                                        <CheckCircle size={24} /> Application Submitted
                                    </div>
                                    <p className="text-sm opacity-80 mt-1">You have successfully applied for this position. Track your status in the App Status tab.</p>
                                </div>
                                <button disabled className="w-full md:w-auto px-8 py-3 bg-green-100 text-green-800 font-bold rounded-lg border border-green-200">
                                    Applied
                                </button>
                            </div>
                        ) : !isEligible ? (
                            <div className="flex flex-col gap-4 animate-in fade-in">
                                <div className="flex items-center gap-3 text-red-800 font-bold text-xl">
                                    <div className="p-2 bg-red-100 rounded-full"><AlertTriangle size={24} /></div>
                                    Not Eligible to Apply
                                </div>
                                <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-lg shadow-sm">
                                    <h5 className="text-red-900 font-bold mb-2">Reason:</h5>
                                    <p className="text-red-700 font-medium text-sm md:text-lg leading-relaxed">
                                        {eligibilityReason || "You do not meet the academic or batch requirements for this position."}
                                    </p>
                                </div>
                                <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <Lock size={14} /> Application Locked
                                    </div>
                                    <div>
                                        Deadline: <span className="font-bold">{job.applicationDeadline}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="text-sm text-gray-600 w-full md:w-auto flex justify-between md:block">
                                    <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Last Date to Apply</span>
                                    <span className={`font-bold text-lg ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>{job.applicationDeadline}</span>
                                </div>

                                <div className="w-full md:w-auto">
                                    {isExpired ? (
                                        <div className="px-8 py-3 bg-gray-200 text-gray-500 font-bold rounded-lg flex items-center justify-center gap-2 cursor-not-allowed w-full md:w-auto">
                                            <Lock size={20} /> Applications Closed
                                        </div>
                                    ) : isNotInterested ? (
                                        <div className="px-8 py-3 bg-gray-100 text-gray-600 font-bold rounded-lg border border-gray-200 flex items-center justify-center gap-2 w-full md:w-auto">
                                            <Ban size={20} /> Marked as Not Interested
                                        </div>
                                    ) : (
                                        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                                            <button onClick={() => onNotInterested(job.id)} className="w-full md:w-auto flex-1 px-5 py-3 bg-white border border-gray-300 text-gray-600 font-bold rounded-lg hover:bg-gray-100 transition-colors">
                                                Not Interested
                                            </button>

                                            {!student.premiumActive ? (
                                                <a
                                                    href="/student/premium"
                                                    className="w-full md:w-auto flex-[2] px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all shadow-md flex items-center justify-center gap-2 group"
                                                >
                                                    <Shield size={20} className="group-hover:scale-110 transition-transform" />
                                                    Get Premium to Apply
                                                </a>
                                            ) : job.externalLink ? (
                                                <a
                                                    href={job.externalLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="w-full md:w-auto flex-1 px-8 py-3 bg-blue-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md"
                                                >
                                                    Apply Externally <ExternalLink size={18} />
                                                </a>
                                            ) : (
                                                <button
                                                    onClick={() => onApply(job.id)}
                                                    className="w-full md:w-auto flex-[2] px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2"
                                                >
                                                    Apply Now <Briefcase size={20} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};