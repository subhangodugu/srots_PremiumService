
import React, { useState, useEffect } from 'react';
import { Student, StudentProfile, SemesterMark, EducationRecord, MarkFormat, College, Role } from '../../../types';
import { Modal } from '../../common/Modal';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

// Steps
import { Step1Identity } from './wizard/Step1Identity';
import { Step2Contact } from './wizard/Step2Contact';
import { Step3Academics } from './wizard/Step3Academics';

interface StudentFormWizardProps {
    isOpen: boolean;
    onClose: () => void;
    isEditing: boolean;
    initialData?: Student | null;
    collegeDetails?: College;
    collegeId: string;
    onSave: (student: Student) => void;
}

export const StudentFormWizard: React.FC<StudentFormWizardProps> = ({
    isOpen, onClose, isEditing, initialData, collegeDetails, collegeId, onSave
}) => {
    const [wizardStep, setWizardStep] = useState(1);
    const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

    // --- FORM DATA STATES ---
    const [newStudent, setNewStudent] = useState<Partial<StudentProfile>>({
        gender: 'MALE', course: 'B.Tech', nationality: 'Indian', religion: 'Hindu', batch: 2025
    });

    const [edu12Type, setEdu12Type] = useState<'Class 12' | 'Diploma'>('Class 12');
    const [class10, setClass10] = useState({ board: '', institution: '', year: '', score: '', location: '', scoreType: 'CGPA' as MarkFormat, secured: '', total: '' });
    const [class12, setClass12] = useState({ board: '', institution: '', specialization: '', year: '', score: '', location: '', scoreType: 'Percentage' as MarkFormat, secured: '', total: '' });
    const [diploma, setDiploma] = useState({ branch: '', institution: '', year: '', score: '', location: '', scoreType: 'Percentage' as MarkFormat, secured: '', total: '' });
    const [degreeSemesters, setDegreeSemesters] = useState<SemesterMark[]>(Array.from({ length: 8 }, (_, i) => ({ sem: i + 1, sgpa: '' })));
    const [currentCGPA, setCurrentCGPA] = useState('');
    const [currentArrears, setCurrentArrears] = useState('0');

    // Helper to parse score strings like "950/1000" into state
    const parseScore = (scoreStr: string, type: string) => {
        if (type === 'Marks' && scoreStr.includes('/')) {
            const [secured, total] = scoreStr.split('/');
            return { score: scoreStr, secured, total };
        }
        return { score: scoreStr, secured: '', total: '' };
    };

    // Helper to build score string
    const getScoreString = (d: { score: string, scoreType: string, secured: string, total: string }) => {
        return d.scoreType === 'Marks' ? `${d.secured}/${d.total}` : d.score;
    };

    useEffect(() => {
        if (isOpen) {
            setWizardStep(1);
            setFormErrors({});

            if (isEditing && initialData) {
                const p = initialData.profile;
                setNewStudent({ ...p, collegeName: p.collegeName || collegeDetails?.name || '' });

                // Academics
                const edu10 = p.educationHistory.find(e => e.level === 'Class 10');
                if (edu10) {
                    const s10 = parseScore(edu10.score, edu10.scoreType);
                    setClass10({
                        board: edu10.board, institution: edu10.institution, year: edu10.yearOfPassing,
                        score: s10.score, location: edu10.location, scoreType: edu10.scoreType as MarkFormat,
                        secured: s10.secured, total: s10.total
                    });
                } else {
                    setClass10({ board: '', institution: '', year: '', score: '', location: '', scoreType: 'CGPA', secured: '', total: '' });
                }

                const eduDip = p.educationHistory.find(e => e.level === 'Diploma');
                const edu12 = p.educationHistory.find(e => e.level === 'Class 12');

                if (eduDip) {
                    setEdu12Type('Diploma');
                    const sDip = parseScore(eduDip.score, eduDip.scoreType);
                    setDiploma({
                        branch: eduDip.branch || '', institution: eduDip.institution, year: eduDip.yearOfPassing,
                        score: sDip.score, location: eduDip.location, scoreType: eduDip.scoreType as MarkFormat,
                        secured: sDip.secured, total: sDip.total
                    });
                    setClass12({ board: '', institution: '', specialization: '', year: '', score: '', location: '', scoreType: 'Percentage', secured: '', total: '' });
                } else {
                    setEdu12Type('Class 12');
                    if (edu12) {
                        const s12 = parseScore(edu12.score, edu12.scoreType);
                        setClass12({
                            board: edu12.board, institution: edu12.institution, specialization: edu12.specialization || '',
                            year: edu12.yearOfPassing, score: s12.score, location: edu12.location, scoreType: edu12.scoreType as MarkFormat,
                            secured: s12.secured, total: s12.total
                        });
                    } else {
                        setClass12({ board: '', institution: '', specialization: '', year: '', score: '', location: '', scoreType: 'Percentage', secured: '', total: '' });
                    }
                    setDiploma({ branch: '', institution: '', year: '', score: '', location: '', scoreType: 'Percentage', secured: '', total: '' });
                }

                const eduUG = p.educationHistory.find(e => e.level === 'Undergraduate');
                if (eduUG) {
                    setCurrentCGPA(eduUG.score);
                    setCurrentArrears(eduUG.currentArrears?.toString() || '0');
                    if (eduUG.semesters) {
                        const sems = Array.from({ length: 8 }, (_, i) => {
                            const existing = eduUG.semesters?.find(s => s.sem === i + 1);
                            return { sem: i + 1, sgpa: existing ? existing.sgpa : '' };
                        });
                        setDegreeSemesters(sems);
                    } else {
                        setDegreeSemesters(Array.from({ length: 8 }, (_, i) => ({ sem: i + 1, sgpa: '' })));
                    }
                } else {
                    setCurrentCGPA('');
                    setCurrentArrears('0');
                    setDegreeSemesters(Array.from({ length: 8 }, (_, i) => ({ sem: i + 1, sgpa: '' })));
                }
            } else {
                // Reset
                setNewStudent({
                    gender: 'MALE', course: 'B.Tech', nationality: 'Indian', religion: 'Hindu',
                    collegeName: collegeDetails?.name || '',
                    batch: 2025, placementCycle: '2025-2026',
                    rollNumber: '', fullName: '', branch: '', dob: '',
                    instituteEmail: '', phone: '', alternativeEmail: '', whatsappNumber: '',
                    aadhaarNumber: '', mentor: '', advisor: '', coordinator: '',
                    fatherName: '', fatherOccupation: '', motherName: '', motherOccupation: '',
                    parentPhone: '', parentEmail: ''
                });
                setEdu12Type('Class 12');
                setClass10({ board: '', institution: '', year: '', score: '', location: '', scoreType: 'CGPA', secured: '', total: '' });
                setClass12({ board: '', institution: '', specialization: '', year: '', score: '', location: '', scoreType: 'Percentage', secured: '', total: '' });
                setDiploma({ branch: '', institution: '', year: '', score: '', location: '', scoreType: 'Percentage', secured: '', total: '' });
                setDegreeSemesters(Array.from({ length: 8 }, (_, i) => ({ sem: i + 1, sgpa: '' })));
                setCurrentCGPA('');
                setCurrentArrears('0');
            }
        }
    }, [isOpen, isEditing, initialData, collegeDetails]);

    const handleSaveStudent = () => {
        const errors: Record<string, boolean> = {};
        if (!newStudent.rollNumber) errors.rollNumber = true;
        if (!newStudent.fullName) errors.fullName = true;
        if (!newStudent.branch) errors.branch = true;
        if (!newStudent.batch) errors.batch = true;

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            alert("Please fill mandatory fields (Roll No, Name, Branch, Batch).");
            setWizardStep(1);
            return;
        }

        const educationHistory: EducationRecord[] = [];

        if (class10.year || class10.score || class10.secured) {
            educationHistory.push({
                id: '10', level: 'Class 10', board: class10.board, institution: class10.institution,
                yearOfPassing: class10.year, score: getScoreString(class10), scoreType: class10.scoreType, location: class10.location
            });
        }

        if (edu12Type === 'Class 12') {
            if (class12.year || class12.score || class12.secured) {
                educationHistory.push({
                    id: '12', level: 'Class 12', board: class12.board, institution: class12.institution,
                    yearOfPassing: class12.year, score: getScoreString(class12), scoreType: class12.scoreType,
                    location: class12.location, specialization: class12.specialization
                });
            }
        } else {
            if (diploma.year || diploma.score || diploma.secured) {
                educationHistory.push({
                    id: 'dip', level: 'Diploma', board: 'SBTET', institution: diploma.institution,
                    yearOfPassing: diploma.year, score: getScoreString(diploma), scoreType: diploma.scoreType,
                    location: diploma.location, branch: diploma.branch
                });
            }
        }

        const finalSemesters = degreeSemesters.map(s => {
            if (edu12Type === 'Diploma' && (s.sem === 1 || s.sem === 2)) {
                return { sem: s.sem, sgpa: '' };
            }
            return s;
        }).filter(s => s.sgpa !== '');

        educationHistory.push({
            id: 'ug', level: 'Undergraduate', board: 'University', institution: newStudent.collegeName || '',
            yearOfPassing: newStudent.batch?.toString() || '', score: currentCGPA || '0', scoreType: 'CGPA', location: 'Campus',
            branch: newStudent.branch, currentArrears: parseInt(currentArrears) || 0,
            semesters: finalSemesters
        });

        // Backend expects only the student info; roles/permissions/defaults handled in Service
        // Removed premiumStart from here; Backend calculates it.
        // Backend expects UserCreateRequest DTO
        const studentPayload: any = {
            name: newStudent.fullName,
            email: newStudent.instituteEmail || `${newStudent.rollNumber}@college.edu`,
            phone: newStudent.phone,
            aadhaarNumber: newStudent.aadhaarNumber,
            collegeId: collegeId,
            studentProfile: {
                ...newStudent,
                educationHistory
            }
        };

        if (isEditing && initialData) {
            studentPayload.username = initialData.username;
        }

        onSave(studentPayload);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${isEditing ? 'Edit Profile' : 'Add Student'} (Step ${wizardStep}/3)`} maxWidth="max-w-4xl">
            <div className="flex-1 overflow-y-auto p-8 max-h-[80vh]">
                {wizardStep === 1 && (
                    <Step1Identity
                        newStudent={newStudent}
                        setNewStudent={setNewStudent}
                        isEditing={isEditing}
                        collegeDetails={collegeDetails}
                        formErrors={formErrors}
                    />
                )}
                {wizardStep === 2 && (
                    <Step2Contact
                        newStudent={newStudent}
                        setNewStudent={setNewStudent}
                    />
                )}
                {wizardStep === 3 && (
                    <Step3Academics
                        class10={class10} setClass10={setClass10}
                        class12={class12} setClass12={setClass12}
                        diploma={diploma} setDiploma={setDiploma}
                        degreeSemesters={degreeSemesters} setDegreeSemesters={setDegreeSemesters}
                        currentCGPA={currentCGPA} setCurrentCGPA={setCurrentCGPA}
                        currentArrears={currentArrears} setCurrentArrears={setCurrentArrears}
                        edu12Type={edu12Type} setEdu12Type={setEdu12Type}
                    />
                )}
            </div>
            <div className="p-6 border-t flex justify-between bg-gray-50">
                {wizardStep > 1 ? <button onClick={() => setWizardStep(s => s - 1)} className="px-6 py-2 border rounded-lg font-bold flex items-center gap-2 bg-white"><ChevronLeft size={18} /> Back</button> : <div />}
                {wizardStep < 3 ? <button onClick={() => setWizardStep(s => s + 1)} className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700">Next <ChevronRight size={18} /></button> : <button onClick={handleSaveStudent} className="px-8 py-2 bg-green-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-green-700"><CheckCircle size={18} /> Save</button>}
            </div>
        </Modal>
    );
};
