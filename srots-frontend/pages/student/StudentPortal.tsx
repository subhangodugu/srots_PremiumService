
import React, { useState, useEffect } from 'react';
import { Student, User, StudentProfile, Skill } from '../../types';
import { CompaniesSection } from '../../components/global/CompaniesSection';
import { FreeCoursesSection } from '../../components/global/FreeCoursesSection';
import { AboutCollegeComponent } from '../../components/colleges/shared/AboutCollegeComponent';
import { PostsSection } from '../../components/colleges/shared/posts/PostsSection';
import { CalendarView } from '../../components/colleges/shared/CalendarView';
import { StudentProfile as StudentProfileComponent } from '../../components/colleges/student-portal/StudentProfile';
import { StudentJobs } from '../../components/colleges/student-portal/StudentJobs';
import { AppTracking } from '../../components/colleges/student-portal/AppTracking';
import { StudentService } from '../../services/studentService';
import {
    CheckCircle, ChevronRight, ChevronLeft, Plus,
    Trash2, User as UserIcon, MapPin, Award, BookOpen, AlertCircle, X
} from 'lucide-react';

interface StudentPortalProps {
    view: string;
    student: Student;
    onUpdateUser?: (user: User) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ view, student, onUpdateUser }) => {
    // --- Onboarding Wizard State ---
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [step, setStep] = useState(1);
    const safeProfile: StudentProfile = {
        userId: student.id,
        rollNumber: student.profile?.rollNumber ?? '',
        branch: student.profile?.branch ?? '',
        course: student.profile?.course ?? '',
        batch: student.profile?.batch ?? new Date().getFullYear(),
        placementCycle: student.profile?.placementCycle ?? '',
        careerPath: student.profile?.careerPath ?? '',
        gender: student.profile?.gender ?? '',
        dob: student.profile?.dob ?? '',
        nationality: student.profile?.nationality ?? '',
        religion: student.profile?.religion ?? '',
        dayScholar: student.profile?.dayScholar ?? false,
        gapInStudies: student.profile?.gapInStudies ?? false,
        gapDuration: student.profile?.gapDuration ?? '',
        gapReason: student.profile?.gapReason ?? '',
        aadhaarNumber: student.profile?.aadhaarNumber ?? '',
        drivingLicense: student.profile?.drivingLicense ?? '',
        passportNumber: student.profile?.passportNumber ?? '',
        passportIssueDate: student.profile?.passportIssueDate ?? '',
        passportExpiryDate: student.profile?.passportExpiryDate ?? '',
        personalEmail: student.profile?.personalEmail ?? '',
        instituteEmail: student.profile?.instituteEmail ?? '',
        parentEmail: student.profile?.parentEmail ?? '',
        whatsappNumber: student.profile?.whatsappNumber ?? '',
        preferredContactMethod: student.profile?.preferredContactMethod ?? '',
        linkedInProfile: student.profile?.linkedInProfile ?? '',
        fatherName: student.profile?.fatherName ?? '',
        fatherOccupation: student.profile?.fatherOccupation ?? '',
        motherName: student.profile?.motherName ?? '',
        motherOccupation: student.profile?.motherOccupation ?? '',
        parentPhone: student.profile?.parentPhone ?? '',
        mentor: student.profile?.mentor ?? '',
        advisor: student.profile?.advisor ?? '',
        coordinator: student.profile?.coordinator ?? '',
        currentAddress: {
            addressLine1: student.profile?.currentAddress?.addressLine1 ?? '',
            addressLine2: student.profile?.currentAddress?.addressLine2 ?? '',
            village: student.profile?.currentAddress?.village ?? '',
            mandal: student.profile?.currentAddress?.mandal ?? '',
            city: student.profile?.currentAddress?.city ?? '',
            state: student.profile?.currentAddress?.state ?? '',
            zip: student.profile?.currentAddress?.zip ?? '',
            country: student.profile?.currentAddress?.country ?? '',
            pinCode: student.profile?.currentAddress?.pinCode ?? '',
        },
        permanentAddress: {
            addressLine1: student.profile?.permanentAddress?.addressLine1 ?? '',
            addressLine2: student.profile?.permanentAddress?.addressLine2 ?? '',
            village: student.profile?.permanentAddress?.village ?? '',
            mandal: student.profile?.permanentAddress?.mandal ?? '',
            city: student.profile?.permanentAddress?.city ?? '',
            state: student.profile?.permanentAddress?.state ?? '',
            zip: student.profile?.permanentAddress?.zip ?? '',
            country: student.profile?.permanentAddress?.country ?? '',
            pinCode: student.profile?.permanentAddress?.pinCode ?? '',
        },
        premiumStartDate: student.profile?.premiumStartDate ?? '',
        premiumEndDate: student.profile?.premiumEndDate ?? '',
        updatedAt: student.profile?.updatedAt ?? new Date().toISOString(),
        skills: student.profile?.skills ?? [],
        experience: student.profile?.experience ?? [],
        projects: student.profile?.projects ?? [],
        certifications: student.profile?.certifications ?? [],
        socialLinks: student.profile?.socialLinks ?? [],
        educationHistory: student.profile?.educationHistory ?? [],
        languages: student.profile?.languages ?? [],
        publications: student.profile?.publications ?? [],
        communicationEmail: student.profile?.communicationEmail ?? '',
        fullName: student.profile?.fullName ?? student.fullName ?? '',
        collegeName: student.profile?.collegeName ?? '',
        phone: student.profile?.phone ?? student.phone ?? '',
        alternativeEmail: student.profile?.alternativeEmail ?? student.alternativeEmail ?? '',
        alternativePhone: student.profile?.alternativePhone ?? student.alternativePhone ?? '',
        bio: student.profile?.bio ?? student.bio ?? '',
    };
    const [wizProfile, setWizProfile] = useState<StudentProfile>(safeProfile);
    const [newSkill, setNewSkill] = useState<{ name: string, proficiency: string }>({ name: '', proficiency: 'Beginner' });

    useEffect(() => {
        const fetchFullStudent = async () => {
            if (!student.profile) {
                const fullStudent = await StudentService.getStudent360(student.id);
                if (onUpdateUser) onUpdateUser(fullStudent as User);
            }
        };
        fetchFullStudent();
    }, [student.id, student.profile, onUpdateUser]);

    useEffect(() => {
        // 3-Tier Sync: Use Backend provided flag
        // If flag is explicitly false, show onboarding
        if (student.isProfileComplete === false) {
            setWizProfile(JSON.parse(JSON.stringify(safeProfile)));
            setShowOnboarding(true);
        }
    }, [student.id, student.isProfileComplete]);

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);
    const handleSkipStep = () => setStep(s => s + 1);

    const handleSkipAll = () => {
        setShowOnboarding(false);
        setWizProfile(JSON.parse(JSON.stringify(student.profile)));
    };

    const handleFinish = async () => {
        // Send Partial Updates to Backend Service
        const updatedStudent = await StudentService.updateStudentProfile(student.id, wizProfile);

        // Update Redux/Local State with the response from backend
        if (onUpdateUser) {
            onUpdateUser(updatedStudent);
        }
        setShowOnboarding(false);
    };

    const addSkill = () => {
        if (!newSkill.name) return;
        // Note: We use a temp ID for UI key. Backend Service will sanitize/replace this with a UUID on save.
        const skill: Skill = {
            id: `sk_temp_${Date.now()}`,
            name: newSkill.name,
            proficiency: newSkill.proficiency as any
        };
        setWizProfile(prev => ({ ...prev, skills: [...prev.skills, skill] }));
        setNewSkill({ name: '', proficiency: 'Beginner' });
    };

    const removeSkill = (index: number) => {
        const skills = [...wizProfile.skills];
        skills.splice(index, 1);
        setWizProfile(prev => ({ ...prev, skills }));
    };

    const renderStepIndicator = () => (
        <div className="flex justify-between items-center mb-8 px-4">
            {[1, 2, 3, 4].map(s => (
                <div key={s} className="flex flex-col items-center gap-1 relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {s}
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">
                        {s === 1 ? 'Personal' : s === 2 ? 'Address' : s === 3 ? 'Skills' : 'Finish'}
                    </span>
                </div>
            ))}
            <div className="absolute top-9 left-0 w-full h-0.5 bg-gray-200 -z-0">
                <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${((step - 1) / 3) * 100}%` }}
                ></div>
            </div>
        </div>
    );

    return (
        <>
            {view === 'jobs' && <StudentJobs student={student} />}
            {view === 'tracker' && <AppTracking student={student} />}
            {view === 'calendar' && <CalendarView user={student} />}
            {view === 'posts' && <PostsSection user={student} />}
            {view === 'profile' && <StudentProfileComponent student={student} onUpdateUser={onUpdateUser} />}
            {view === 'about-college' && <AboutCollegeComponent user={student} />}
            {view === 'free-courses' && <FreeCoursesSection user={student} />}
            {view === 'companies' && <CompaniesSection user={student} />}

            {/* --- ONBOARDING MODAL --- */}
            {showOnboarding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] relative">

                        <button
                            type="button"
                            onClick={handleSkipAll}
                            className="absolute top-4 right-4 text-white/90 hover:text-white z-50 flex items-center gap-1 text-sm font-bold bg-black/20 hover:bg-black/40 px-4 py-2 rounded-full transition-all cursor-pointer shadow-sm"
                        >
                            Skip Setup <X size={18} />
                        </button>

                        <div className="bg-blue-600 p-6 text-white text-center pt-8">
                            <h2 className="text-2xl font-bold">Welcome to Srots!</h2>
                            <p className="opacity-90 text-sm mt-1">Let's complete your profile to get you placement ready.</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 relative">
                            {renderStepIndicator()}

                            {step === 1 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                                        <UserIcon size={20} className="text-blue-600" /> Personal & Contact Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Communication Email *</label>
                                            <input className="w-full border border-gray-300 p-2.5 rounded-lg bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={wizProfile.communicationEmail} onChange={e => setWizProfile({ ...wizProfile, communicationEmail: e.target.value })} placeholder="e.g. work@gmail.com" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Personal Email</label>
                                            <input className="w-full border border-gray-300 p-2.5 rounded-lg bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={wizProfile.personalEmail} onChange={e => setWizProfile({ ...wizProfile, personalEmail: e.target.value })} placeholder="e.g. personal@gmail.com" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">LinkedIn Profile</label>
                                            <input className="w-full border border-gray-300 p-2.5 rounded-lg bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={wizProfile.linkedInProfile} onChange={e => setWizProfile({ ...wizProfile, linkedInProfile: e.target.value })} placeholder="linkedin.com/in/..." />
                                        </div>
                                        <div className="md:col-span-2 flex gap-6 mt-2">
                                            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                                                <input type="checkbox" checked={wizProfile.dayScholar} onChange={e => setWizProfile({ ...wizProfile, dayScholar: e.target.checked })} />
                                                <span className="text-sm font-bold text-gray-700">I am a Day Scholar</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                                                <input type="checkbox" checked={wizProfile.gapInStudies} onChange={e => setWizProfile({ ...wizProfile, gapInStudies: e.target.checked })} />
                                                <span className="text-sm font-bold text-gray-700">Gap in Studies?</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                                        <MapPin size={20} className="text-blue-600" /> Address Details
                                    </h3>

                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <h4 className="text-sm font-bold text-blue-800 mb-3 uppercase">Current Address</h4>
                                        <div className="space-y-3">
                                            <input className="w-full border border-gray-300 p-2.5 rounded-lg bg-white text-gray-900 outline-none text-sm" placeholder="Full Address Line" value={wizProfile.currentAddress?.fullAddress} onChange={e => setWizProfile({ ...wizProfile, currentAddress: { ...wizProfile.currentAddress, fullAddress: e.target.value } })} />
                                            <div className="grid grid-cols-2 gap-3">
                                                <input className="w-full border border-gray-300 p-2.5 rounded-lg bg-white text-gray-900 outline-none text-sm" placeholder="City" value={wizProfile.currentAddress?.city} onChange={e => setWizProfile({ ...wizProfile, currentAddress: { ...wizProfile.currentAddress, city: e.target.value } })} />
                                                <input className="w-full border border-gray-300 p-2.5 rounded-lg bg-white text-gray-900 outline-none text-sm" placeholder="State" value={wizProfile.currentAddress?.state} onChange={e => setWizProfile({ ...wizProfile, currentAddress: { ...wizProfile.currentAddress, state: e.target.value } })} />
                                                <input className="w-full border border-gray-300 p-2.5 rounded-lg bg-white text-gray-900 outline-none text-sm" placeholder="Pincode" value={wizProfile.currentAddress?.pinCode} onChange={e => setWizProfile({ ...wizProfile, currentAddress: { ...wizProfile.currentAddress, pinCode: e.target.value } })} />
                                                <input className="w-full border border-gray-300 p-2.5 rounded-lg bg-white text-gray-900 outline-none text-sm" placeholder="Country" value={wizProfile.currentAddress?.country} onChange={e => setWizProfile({ ...wizProfile, currentAddress: { ...wizProfile.currentAddress, country: e.target.value } })} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-sm font-bold text-blue-800 uppercase">Permanent Address</h4>
                                            <button
                                                onClick={() => setWizProfile({ ...wizProfile, permanentAddress: { ...wizProfile.currentAddress } })}
                                                className="text-xs text-blue-600 hover:underline"
                                            >
                                                Same as Current
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            <input className="w-full border border-gray-300 p-2.5 rounded-lg bg-white text-gray-900 outline-none text-sm" placeholder="Full Address Line" value={wizProfile.permanentAddress?.fullAddress} onChange={e => setWizProfile({ ...wizProfile, permanentAddress: { ...wizProfile.permanentAddress, fullAddress: e.target.value } })} />
                                            <div className="grid grid-cols-2 gap-3">
                                                <input className="w-full border border-gray-300 p-2.5 rounded-lg bg-white text-gray-900 outline-none text-sm" placeholder="City" value={wizProfile.permanentAddress?.city} onChange={e => setWizProfile({ ...wizProfile, permanentAddress: { ...wizProfile.permanentAddress, city: e.target.value } })} />
                                                <input className="w-full border border-gray-300 p-2.5 rounded-lg bg-white text-gray-900 outline-none text-sm" placeholder="State" value={wizProfile.permanentAddress?.state} onChange={e => setWizProfile({ ...wizProfile, permanentAddress: { ...wizProfile.permanentAddress, state: e.target.value } })} />
                                                <input className="w-full border border-gray-300 p-2.5 rounded-lg bg-white text-gray-900 outline-none text-sm" placeholder="Pincode" value={wizProfile.permanentAddress?.pinCode} onChange={e => setWizProfile({ ...wizProfile, permanentAddress: { ...wizProfile.permanentAddress, pinCode: e.target.value } })} />
                                                <input className="w-full border border-gray-300 p-2.5 rounded-lg bg-white text-gray-900 outline-none text-sm" placeholder="Country" value={wizProfile.permanentAddress?.country} onChange={e => setWizProfile({ ...wizProfile, permanentAddress: { ...wizProfile.permanentAddress, country: e.target.value } })} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                                        <Award size={20} className="text-blue-600" /> Skills & Competencies
                                    </h3>
                                    <div className="flex gap-2 mb-6">
                                        <input
                                            className="flex-1 border border-gray-300 p-2.5 rounded-lg bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100"
                                            placeholder="Add a Skill (e.g. Java, React, SQL)"
                                            value={newSkill.name}
                                            onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
                                            onKeyDown={e => e.key === 'Enter' && addSkill()}
                                        />
                                        <select
                                            className="border border-gray-300 p-2.5 rounded-lg bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100"
                                            value={newSkill.proficiency}
                                            onChange={e => setNewSkill({ ...newSkill, proficiency: e.target.value })}
                                        >
                                            <option>Beginner</option>
                                            <option>Intermediate</option>
                                            <option>Advanced</option>
                                            <option>Professional</option>
                                        </select>
                                        <button onClick={addSkill} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                                            <Plus size={20} />
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        {wizProfile.skills && wizProfile.skills.length > 0 ? wizProfile.skills.map((skill, idx) => (
                                            <div key={idx} className="bg-gray-100 px-3 py-1.5 rounded-full border flex items-center gap-2 text-sm font-bold text-gray-700">
                                                {skill.name} <span className="text-[10px] uppercase bg-gray-200 px-1.5 rounded text-gray-500">{skill.proficiency}</span>
                                                <button onClick={() => removeSkill(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                            </div>
                                        )) : (
                                            <div className="text-center w-full py-8 text-gray-400 italic bg-gray-50 rounded-xl border border-dashed">
                                                Add your key technical skills here.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in duration-300 py-10">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                                        <CheckCircle size={40} />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-bold text-gray-900">Setup Complete!</h3>
                                        <p className="text-gray-500 mt-2">Your basic profile is now active.</p>
                                    </div>

                                    <div className="bg-orange-50 border border-orange-100 p-6 rounded-xl max-w-lg mx-auto">
                                        <div className="flex flex-col items-center gap-2 text-orange-800">
                                            <AlertCircle size={24} />
                                            <h4 className="font-bold text-lg">Important Next Steps</h4>
                                        </div>
                                        <p className="text-sm text-orange-700 mt-2 leading-relaxed">
                                            Please navigate to your <strong>Profile Section</strong> to fill in the remaining details including:
                                        </p>
                                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                                            {['Resume', 'Experience', 'Projects', 'Certifications', 'Social Media Links'].map(tag => (
                                                <span key={tag} className="px-3 py-1 bg-white border border-orange-200 rounded-full text-xs font-bold text-orange-600">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
                            {step > 1 ? (
                                <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 font-bold hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200">
                                    <ChevronLeft size={18} /> Back
                                </button>
                            ) : <div></div>}

                            <div className="flex items-center gap-4">
                                {step < 4 && (
                                    <button
                                        onClick={handleSkipStep}
                                        className="text-gray-500 font-bold hover:text-gray-700 text-sm"
                                    >
                                        Skip
                                    </button>
                                )}

                                {step < 4 ? (
                                    <button onClick={handleNext} className="flex items-center gap-2 bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                                        Next <ChevronRight size={18} />
                                    </button>
                                ) : (
                                    <button onClick={handleFinish} className="flex items-center gap-2 bg-green-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all">
                                        Go to Dashboard <BookOpen size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};