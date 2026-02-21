
// import React, { useState, useRef, useEffect } from 'react';
// // Added AddressFormData to the shared types import
// import { User, Student, StudentProfile, AddressFormData } from '../../../../types';
// import { Camera, Phone, MapPin, Edit2, Shield, User as UserIcon, AlertTriangle, FileText, Loader2, Mail, Lock } from 'lucide-react';
// // Fixed: AddressFormData is now imported from types instead of AddressForm component
// import { AddressForm } from '../../../common/AddressForm';
// import { StudentService } from '../../../../services/studentService';
// import { CompanyService } from '../../../../services/companyService';
// import { AuthService } from '../../../../services/authService';

// interface ProfileTabProps {
//     student: Student;
//     profileData: StudentProfile;
//     onUpdateProfile: (updates: Partial<StudentProfile>) => void;
//     onUpdateUser: (user: User) => void;
// }

// export const ProfileTab: React.FC<ProfileTabProps> = ({ student, profileData, onUpdateProfile, onUpdateUser }) => {
//     const fileInputRef = useRef<HTMLInputElement>(null);
//     const [localData, setLocalData] = useState<StudentProfile>(profileData);
//     const [isUploading, setIsUploading] = useState(false);

//     // Internal state to track which section is currently being edited
//     const [editMode, setEditMode] = useState<{
//         gaps: boolean;
//         contact: boolean;
//         moreInfo: boolean;
//         address: boolean;
//     }>({ gaps: false, contact: false, moreInfo: false, address: false });

//     // Local state for address forms to allow editing before saving
//     const [addrForms, setAddrForms] = useState<{current: AddressFormData, permanent: AddressFormData}>({
//         current: { addressLine1: '', addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India' },
//         permanent: { addressLine1: '', addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India' }
//     });

//     useEffect(() => {
//         setLocalData(profileData);
//     }, [profileData]);

//     const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files && e.target.files[0]) {
//             setIsUploading(true);
//             try {
//                 const file = e.target.files[0];
//                 // 1. Upload file to Storage Service
//                 const imageUrl = await CompanyService.uploadFile(file);

//                 // 2. Prepare updated user object
//                 const updatedStudent = { ...student, avatar: imageUrl };

//                 // 3. Persist to Backend Database (3-Tier Sync)
//                 await AuthService.updateUser(updatedStudent);

//                 // 4. Update Frontend State
//                 onUpdateUser(updatedStudent);
//             } catch (err) {
//                 alert("Upload failed");
//             } finally {
//                 setIsUploading(false);
//             }
//         }
//     };

//     const initAddressForms = () => {
//         setAddrForms({
//             current: {
//                 addressLine1: localData.currentAddress?.fullAddress || '',
//                 addressLine2: '',
//                 village: '',
//                 mandal: localData.currentAddress?.district || '',
//                 city: localData.currentAddress?.city || '',
//                 state: localData.currentAddress?.state || '',
//                 zip: localData.currentAddress?.pinCode || '',
//                 country: localData.currentAddress?.country || 'India'
//             },
//             permanent: {
//                 addressLine1: localData.permanentAddress?.fullAddress || '',
//                 addressLine2: '',
//                 village: '',
//                 mandal: localData.permanentAddress?.district || '',
//                 city: localData.permanentAddress?.city || '',
//                 state: localData.permanentAddress?.state || '',
//                 zip: localData.permanentAddress?.pinCode || '',
//                 country: localData.permanentAddress?.country || 'India'
//             }
//         });
//         setEditMode({...editMode, address: true});
//     };

//     const saveAddresses = async () => {
//         // Validation
//         if (!addrForms.current.addressLine1 || !addrForms.current.city || !addrForms.current.state || !addrForms.current.zip) {
//             alert("Current Address is incomplete. Please fill Line 1, City, State, and Zip.");
//             return;
//         }
//         if (!addrForms.permanent.addressLine1 || !addrForms.permanent.city || !addrForms.permanent.state || !addrForms.permanent.zip) {
//             alert("Permanent Address is incomplete. Please fill Line 1, City, State, and Zip.");
//             return;
//         }

//         // Delegate logic to backend service
//         await StudentService.updateStudentAddress(student.id, 'current', addrForms.current);
//         const updatedStudent = await StudentService.updateStudentAddress(student.id, 'permanent', addrForms.permanent);

//         if (updatedStudent) {
//             onUpdateUser(updatedStudent);
//         }
//         setEditMode({...editMode, address: false});
//     };

//     const handleSaveSection = (section: keyof typeof editMode, updates: Partial<StudentProfile>) => {
//         onUpdateProfile(updates);
//         setEditMode({...editMode, [section]: false});
//     };

//     const saveGaps = () => {
//         if (localData.gapInStudies && (!localData.gapDuration?.trim() || !localData.gapReason?.trim())) {
//             alert("Please provide the Duration and Reason for your gap in studies.");
//             return;
//         }
//         handleSaveSection('gaps', { gapInStudies: localData.gapInStudies, gapDuration: localData.gapDuration, gapReason: localData.gapReason });
//     };

//     const saveContact = () => {
//         if (!localData.communicationEmail?.trim() || !localData.personalEmail?.trim()) {
//             alert("Communication Email and Personal Email are required.");
//             return;
//         }
//         handleSaveSection('contact', { 
//             communicationEmail: localData.communicationEmail, 
//             personalEmail: localData.personalEmail, 
//             preferredContactMethod: localData.preferredContactMethod, 
//             linkedInProfile: localData.linkedInProfile 
//         });
//     };

//     const saveMoreInfo = () => {
//         handleSaveSection('moreInfo', { 
//             drivingLicense: localData.drivingLicense, 
//             passportNumber: localData.passportNumber, 
//             passportIssueDate: localData.passportIssueDate, 
//             passportExpiryDate: localData.passportExpiryDate, 
//             dayScholar: localData.dayScholar 
//         });
//     };

//     return (
//         <div className="space-y-6 animate-in slide-in-from-right-2">
//             <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col md:flex-row items-center gap-6">
//                 <div className="relative group cursor-pointer" onClick={() => !isUploading && fileInputRef.current?.click()}>
//                     {isUploading ? (
//                         <div className="w-24 h-24 rounded-full border-4 border-gray-50 flex items-center justify-center bg-gray-100">
//                             <Loader2 className="animate-spin text-blue-600"/>
//                         </div>
//                     ) : (
//                         <img src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullName)}&background=random`} className="w-24 h-24 rounded-full border-4 border-gray-50 object-cover" alt="Profile" />
//                     )}
//                     <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="text-white" size={20}/></div>
//                     <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
//                 </div>
//                 <div className="text-center md:text-left">
//                     <h2 className="text-2xl font-bold text-gray-900">{localData.fullName}</h2>
//                     <p className="text-gray-500 font-medium">{localData.rollNumber} • {localData.branch} • {localData.batch} Batch</p>
//                     <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
//                         <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">{localData.course}</span>
//                         <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">{localData.gender}</span>
//                     </div>
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="bg-white p-6 rounded-xl border shadow-sm">
//                     <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2"><UserIcon size={16}/> About (Official Record)</h3>
//                     <div className="grid grid-cols-2 gap-4 text-sm">
//                         <div><label className="text-xs text-gray-500">Roll Number</label><p className="font-bold">{localData.rollNumber}</p></div>
//                         <div><label className="text-xs text-gray-500">Full Name</label><p className="font-bold">{localData.fullName}</p></div>
//                         <div><label className="text-xs text-gray-500">Branch</label><p className="font-bold">{localData.branch}</p></div>
//                         <div><label className="text-xs text-gray-500">Course</label><p className="font-bold">{localData.course}</p></div>
//                         <div><label className="text-xs text-gray-500">College</label><p className="font-bold truncate" title={localData.collegeName}>{localData.collegeName}</p></div>
//                         <div><label className="text-xs text-gray-500">Passed Out Year</label><p className="font-bold">{localData.batch}</p></div>
//                         <div><label className="text-xs text-gray-500">Nationality</label><p className="font-bold">{localData.nationality}</p></div>
//                         <div><label className="text-xs text-gray-500">Religion</label><p className="font-bold">{localData.religion}</p></div>
//                         <div className="col-span-2"><label className="text-xs text-gray-500">Aadhaar Number</label><p className="font-bold font-mono text-gray-800">{localData.aadhaarNumber}</p></div>
//                         <div><label className="text-xs text-gray-500">Date of Birth</label><p className="font-bold">{localData.dob}</p></div>
//                         <div><label className="text-xs text-gray-500">Placement Cycle</label><p className="font-bold">{localData.placementCycle}</p></div>
//                     </div>
//                 </div>

//                 <div className="bg-white p-6 rounded-xl border shadow-sm">
//                     <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2"><Shield size={16}/> Student Point of Contact</h3>
//                     <div className="space-y-3 text-sm">
//                         <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Mentor</span><span className="font-bold">{localData.mentor}</span></div>
//                         <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Advisor</span><span className="font-bold">{localData.advisor}</span></div>
//                         <div className="flex justify-between"><span className="text-gray-500">Coordinator</span><span className="font-bold">{localData.coordinator}</span></div>
//                     </div>
//                 </div>

//                 <div className="bg-white p-6 rounded-xl border shadow-sm">
//                     <div className="flex justify-between items-center mb-4">
//                         <h3 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2"><AlertTriangle size={16}/> Education Gaps</h3>
//                         {!editMode.gaps && <button onClick={() => setEditMode({...editMode, gaps: true})} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Edit2 size={16}/></button>}
//                     </div>
//                     {editMode.gaps ? (
//                         <div className="space-y-3">
//                             <label className="flex items-center gap-2 text-sm font-bold text-gray-700"><input type="checkbox" checked={localData.gapInStudies} onChange={e => setLocalData({...localData, gapInStudies: e.target.checked})} /> Any Gap in Studies?</label>
//                             {localData.gapInStudies && (
//                                 <>
//                                     <input className="w-full border border-gray-300 p-2 rounded text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" placeholder="Duration (e.g. 1 Year)" value={localData.gapDuration} onChange={e => setLocalData({...localData, gapDuration: e.target.value})} />
//                                     <input className="w-full border border-gray-300 p-2 rounded text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" placeholder="Reason" value={localData.gapReason} onChange={e => setLocalData({...localData, gapReason: e.target.value})} />
//                                 </>
//                             )}
//                             <div className="flex justify-end gap-2">
//                                 <button onClick={() => { setEditMode({...editMode, gaps: false}); setLocalData(profileData); }} className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
//                                 <button onClick={saveGaps} className="text-xs px-3 py-1 bg-blue-600 text-white rounded font-bold">Save</button>
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="text-sm">
//                             <p><span className="text-gray-500">Gap in Studies:</span> <span className={`font-bold ${localData.gapInStudies ? 'text-red-600' : 'text-green-600'}`}>{localData.gapInStudies ? 'YES' : 'NO'}</span></p>
//                             {localData.gapInStudies && (
//                                 <>
//                                     <p><span className="text-gray-500">Duration:</span> {localData.gapDuration}</p>
//                                     <p><span className="text-gray-500">Reason:</span> {localData.gapReason}</p>
//                                 </>
//                             )}
//                         </div>
//                     )}
//                 </div>

//                 <div className="bg-white p-6 rounded-xl border shadow-sm row-span-2">
//                     <div className="flex justify-between items-center mb-4">
//                         <h3 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2"><Phone size={16}/> Contact Information</h3>
//                         {!editMode.contact && <button onClick={() => setEditMode({...editMode, contact: true})} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Edit2 size={16}/></button>}
//                     </div>
//                     <div className="space-y-4 text-sm">
//                         <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
//                             <div className="flex justify-between items-center mb-2">
//                                 <p className="text-xs font-bold text-gray-400 uppercase">Official / Locked</p>
//                                 <Lock size={12} className="text-gray-400" />
//                             </div>
//                             <div className="space-y-2">
//                                 <div><label className="text-xs text-gray-500">Institute Email</label><p className="font-bold">{localData.instituteEmail}</p></div>
//                                 <div><label className="text-xs text-gray-500">Alternative Email</label><p className="font-bold">{localData.alternativeEmail}</p></div>
//                                 <div><label className="text-xs text-gray-500">Phone</label><p className="font-bold">{localData.phone}</p></div>
//                                 <div><label className="text-xs text-gray-500">WhatsApp</label><p className="font-bold">{localData.whatsappNumber}</p></div>
//                                 <div><label className="text-xs text-gray-500">Parent Phone</label><p className="font-bold">{localData.parentPhone}</p></div>
//                                 <div><label className="text-xs text-gray-500">Parent Email</label><p className="font-bold">{localData.parentEmail}</p></div>
//                             </div>
//                         </div>

//                         <div className="p-1">
//                             <p className="text-xs font-bold text-gray-400 uppercase mb-2">Student Editable</p>
//                             {editMode.contact ? (
//                                 <div className="space-y-3">
//                                     <div><label className="text-xs font-bold">Comm. Email *</label><input className="w-full border border-gray-300 p-2 rounded mt-1 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={localData.communicationEmail} onChange={e => setLocalData({...localData, communicationEmail: e.target.value})} /></div>
//                                     <div><label className="text-xs font-bold">Personal Email *</label><input className="w-full border border-gray-300 p-2 rounded mt-1 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={localData.personalEmail} onChange={e => setLocalData({...localData, personalEmail: e.target.value})} /></div>
//                                     <div><label className="text-xs font-bold">Preferred Contact</label><select className="w-full border border-gray-300 p-2 rounded mt-1 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={localData.preferredContactMethod} onChange={e => setLocalData({...localData, preferredContactMethod: e.target.value as any})}><option>Email</option><option>Phone</option><option>WhatsApp</option></select></div>
//                                     <div><label className="text-xs font-bold">LinkedIn URL</label><input className="w-full border border-gray-300 p-2 rounded mt-1 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={localData.linkedInProfile} onChange={e => setLocalData({...localData, linkedInProfile: e.target.value})} /></div>
//                                     <div className="flex justify-end gap-2 pt-2">
//                                         <button onClick={() => { setEditMode({...editMode, contact: false}); setLocalData(profileData); }} className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
//                                         <button onClick={saveContact} className="text-xs px-3 py-1 bg-blue-600 text-white rounded font-bold">Save</button>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <div className="space-y-2">
//                                     <div><label className="text-xs text-gray-500">Communication Email</label><p className="font-bold">{localData.communicationEmail}</p></div>
//                                     <div><label className="text-xs text-gray-500">Personal Email</label><p className="font-bold">{localData.personalEmail}</p></div>
//                                     <div><label className="text-xs text-gray-500">Preferred Method</label><p className="font-bold">{localData.preferredContactMethod}</p></div>
//                                     <div><label className="text-xs text-gray-500">LinkedIn</label><a href={localData.linkedInProfile} target="_blank" rel="noreferrer" className="font-bold text-blue-600 hover:underline block truncate">{localData.linkedInProfile || '-'}</a></div>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>

//                 <div className="bg-white p-6 rounded-xl border shadow-sm">
//                     <div className="flex justify-between items-center mb-4">
//                         <h3 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2"><FileText size={16}/> More Info</h3>
//                         {!editMode.moreInfo && <button onClick={() => setEditMode({...editMode, moreInfo: true})} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Edit2 size={16}/></button>}
//                     </div>
//                     {editMode.moreInfo ? (
//                         <div className="grid grid-cols-2 gap-3 text-sm">
//                             <div className="col-span-2"><label className="text-xs font-bold">Driving License</label><input className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={localData.drivingLicense} onChange={e => setLocalData({...localData, drivingLicense: e.target.value})} /></div>
//                             <div className="col-span-2"><label className="text-xs font-bold">Passport Number</label><input className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={localData.passportNumber} onChange={e => setLocalData({...localData, passportNumber: e.target.value})} /></div>
//                             <div><label className="text-xs font-bold">Issue Date</label><input type="date" className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={localData.passportIssueDate} onChange={e => setLocalData({...localData, passportIssueDate: e.target.value})} /></div>
//                             <div><label className="text-xs font-bold">Expiry Date</label><input type="date" className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={localData.passportExpiryDate} onChange={e => setLocalData({...localData, passportExpiryDate: e.target.value})} /></div>
//                             <div className="col-span-2 flex items-center gap-2 mt-2"><input type="checkbox" checked={localData.dayScholar} onChange={e => setLocalData({...localData, dayScholar: e.target.checked})}/> <label className="font-bold">Day Scholar?</label></div>
//                             <div className="col-span-2 flex justify-end gap-2 pt-2">
//                                 <button onClick={() => { setEditMode({...editMode, moreInfo: false}); setLocalData(profileData); }} className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
//                                 <button onClick={saveMoreInfo} className="text-xs px-3 py-1 bg-blue-600 text-white rounded font-bold">Save</button>
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
//                             <div className="col-span-2"><label className="text-xs text-gray-500">Driving License</label><p className="font-bold font-mono">{localData.drivingLicense || 'N/A'}</p></div>
//                             <div className="col-span-2"><label className="text-xs text-gray-500">Passport</label><p className="font-bold font-mono">{localData.passportNumber || 'N/A'}</p></div>
//                             <div><label className="text-xs text-gray-500">Day Scholar</label><p className="font-bold">{localData.dayScholar ? 'Yes' : 'No'}</p></div>
//                         </div>
//                     )}
//                 </div>

//                 <div className="bg-white p-6 rounded-xl border shadow-sm md:col-span-2">
//                     <div className="flex justify-between items-center mb-4">
//                         <h3 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2"><MapPin size={16}/> Address Details</h3>
//                         {!editMode.address && <button onClick={initAddressForms} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Edit2 size={16}/></button>}
//                     </div>
//                     {editMode.address ? (
//                         <div className="space-y-6 relative">
//                             <AddressForm 
//                                 title="Current Address"
//                                 data={addrForms.current} 
//                                 onChange={(d) => setAddrForms(prev => ({...prev, current: d}))} 
//                             />
//                             <AddressForm 
//                                 title="Permanent Address"
//                                 data={addrForms.permanent} 
//                                 onChange={(d) => setAddrForms(prev => ({...prev, permanent: d}))}
//                                 onCopy={() => setAddrForms(prev => ({...prev, permanent: {...prev.current}}))}
//                                 copyLabel="Same as Current"
//                             />
//                             <div className="flex justify-end gap-2 pt-2">
//                                 <button onClick={() => { setEditMode({...editMode, address: false}); }} className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
//                                 <button onClick={saveAddresses} className="text-xs px-3 py-1 bg-blue-600 text-white rounded font-bold">Save</button>
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
//                             <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
//                                 <h4 className="font-bold text-gray-400 text-xs uppercase mb-2">Current</h4>
//                                 <p className="font-bold text-gray-800">{localData.currentAddress?.fullAddress || 'N/A'}</p>
//                                 <p className="text-gray-500 mt-1">{localData.currentAddress?.city}, {localData.currentAddress?.state} - {localData.currentAddress?.pinCode}</p>
//                             </div>
//                             <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
//                                 <h4 className="font-bold text-gray-400 text-xs uppercase mb-2">Permanent</h4>
//                                 <p className="font-bold text-gray-800">{localData.permanentAddress?.fullAddress || 'N/A'}</p>
//                                 <p className="text-gray-500 mt-1">{localData.permanentAddress?.city}, {localData.permanentAddress?.state} - {localData.permanentAddress?.pinCode}</p>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };


import React, { useState, useRef, useEffect } from 'react';
import { User, Student, StudentProfile, AddressFormData } from '../../../../types';
import { Camera, Phone, MapPin, Edit2, Shield, User as UserIcon, AlertTriangle, FileText, Loader2, Mail, Lock } from 'lucide-react';
import { AddressForm } from '../../../common/AddressForm';
import { StudentService } from '../../../../services/studentService';
import { CompanyService } from '../../../../services/companyService';
import { AuthService } from '../../../../services/authService';

interface ProfileTabProps {
  student: Student;
  profileData: StudentProfile;
  onUpdateProfile: (updates: Partial<StudentProfile>) => void;
  onUpdateUser: (user: User) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ student, profileData, onUpdateProfile, onUpdateUser }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localData, setLocalData] = useState<StudentProfile>(profileData);
  const [isUploading, setIsUploading] = useState(false);

  const [editMode, setEditMode] = useState<{
    gaps: boolean;
    contact: boolean;
    moreInfo: boolean;
    address: boolean;
  }>({ gaps: false, contact: false, moreInfo: false, address: false });

  const [addrForms, setAddrForms] = useState<{ current: AddressFormData, permanent: AddressFormData }>({
    current: { addressLine1: '', addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India' },
    permanent: { addressLine1: '', addressLine2: '', village: '', mandal: '', city: '', state: '', zip: '', country: 'India' }
  });

  useEffect(() => {
    setLocalData(profileData);
  }, [profileData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        const file = e.target.files[0];
        const imageUrl = await AuthService.uploadAvatar(student.id, file, 'profiles');

        const updatedStudent = { ...student, avatar: imageUrl };

        await AuthService.updateUser(updatedStudent);

        onUpdateUser(updatedStudent);
      } catch (err) {
        alert("Upload failed");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const initAddressForms = () => {
    setAddrForms({
      current: {
        addressLine1: localData.currentAddress?.fullAddress || '',
        addressLine2: '',
        village: '',
        mandal: localData.currentAddress?.district || '',
        city: localData.currentAddress?.city || '',
        state: localData.currentAddress?.state || '',
        zip: localData.currentAddress?.pinCode || '',
        country: localData.currentAddress?.country || 'India'
      },
      permanent: {
        addressLine1: localData.permanentAddress?.fullAddress || '',
        addressLine2: '',
        village: '',
        mandal: localData.permanentAddress?.district || '',
        city: localData.permanentAddress?.city || '',
        state: localData.permanentAddress?.state || '',
        zip: localData.permanentAddress?.pinCode || '',
        country: localData.permanentAddress?.country || 'India'
      }
    });
    setEditMode({ ...editMode, address: true });
  };

  const saveAddresses = async () => {
    if (!addrForms.current.addressLine1 || !addrForms.current.city || !addrForms.current.state || !addrForms.current.zip) {
      alert("Current Address is incomplete. Please fill Line 1, City, State, and Zip.");
      return;
    }
    if (!addrForms.permanent.addressLine1 || !addrForms.permanent.city || !addrForms.permanent.state || !addrForms.permanent.zip) {
      alert("Permanent Address is incomplete. Please fill Line 1, City, State, and Zip.");
      return;
    }

    const updatedStudentCurrent = await StudentService.updateStudentAddress(student.id, 'current', addrForms.current);
    const updatedStudent = await StudentService.updateStudentAddress(student.id, 'permanent', addrForms.permanent);

    if (updatedStudent) {
      onUpdateUser(updatedStudent);
    }
    setEditMode({ ...editMode, address: false });
  };

  const handleSaveSection = (section: keyof typeof editMode, updates: Partial<StudentProfile>) => {
    onUpdateProfile(updates);
    setEditMode({ ...editMode, [section]: false });
  };

  const saveGaps = () => {
    if (localData.gapInStudies && (!localData.gapDuration?.trim() || !localData.gapReason?.trim())) {
      alert("Please provide the Duration and Reason for your gap in studies.");
      return;
    }
    handleSaveSection('gaps', { gapInStudies: localData.gapInStudies, gapDuration: localData.gapDuration, gapReason: localData.gapReason });
  };

  const saveContact = () => {
    if (!localData.communicationEmail?.trim() || !localData.personalEmail?.trim()) {
      alert("Communication Email and Personal Email are required.");
      return;
    }
    handleSaveSection('contact', {
      communicationEmail: localData.communicationEmail,
      personalEmail: localData.personalEmail,
      preferredContactMethod: localData.preferredContactMethod,
      linkedInProfile: localData.linkedInProfile
    });
  };

  const saveMoreInfo = () => {
    handleSaveSection('moreInfo', {
      drivingLicense: localData.drivingLicense,
      passportNumber: localData.passportNumber,
      passportIssueDate: localData.passportIssueDate,
      passportExpiryDate: localData.passportExpiryDate,
      dayScholar: localData.dayScholar
    });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-2">
      <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="relative group cursor-pointer" onClick={() => !isUploading && fileInputRef.current?.click()}>
          {isUploading ? (
            <div className="w-24 h-24 rounded-full border-4 border-gray-50 flex items-center justify-center bg-gray-100">
              <Loader2 className="animate-spin text-blue-600" />
            </div>
          ) : (
            <img src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullName)}&background=random`} className="w-24 h-24 rounded-full border-4 border-gray-50 object-cover" alt="Profile" />
          )}
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="text-white" size={20} /></div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-900">{localData.fullName}</h2>
          <p className="text-gray-500 font-medium">{localData.rollNumber} • {localData.branch} • {localData.batch} Batch</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">{localData.course}</span>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">{localData.gender}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2"><UserIcon size={16} /> About (Official Record)</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><label className="text-xs text-gray-500">Roll Number</label><p className="font-bold">{localData.rollNumber}</p></div>
            <div><label className="text-xs text-gray-500">Full Name</label><p className="font-bold">{localData.fullName}</p></div>
            <div><label className="text-xs text-gray-500">Branch</label><p className="font-bold">{localData.branch}</p></div>
            <div><label className="text-xs text-gray-500">Course</label><p className="font-bold">{localData.course}</p></div>
            <div><label className="text-xs text-gray-500">College</label><p className="font-bold truncate" title={localData.collegeName}>{localData.collegeName}</p></div>
            <div><label className="text-xs text-gray-500">Passed Out Year</label><p className="font-bold">{localData.batch}</p></div>
            <div><label className="text-xs text-gray-500">Nationality</label><p className="font-bold">{localData.nationality}</p></div>
            <div><label className="text-xs text-gray-500">Religion</label><p className="font-bold">{localData.religion}</p></div>
            <div className="col-span-2"><label className="text-xs text-gray-500">Aadhaar Number</label><p className="font-bold font-mono text-gray-800">{localData.aadhaarNumber}</p></div>
            <div><label className="text-xs text-gray-500">Date of Birth</label><p className="font-bold">{localData.dob}</p></div>
            <div><label className="text-xs text-gray-500">Placement Cycle</label><p className="font-bold">{localData.placementCycle}</p></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2"><Shield size={16} /> Premium Membership</h3>
          {student.premiumActive ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600 font-bold">
                <Shield size={20} /> Active Premium Member
              </div>
              <div className="text-sm text-gray-600">
                <p>Your premium features are active.</p>
                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <p className="text-xs text-amber-700 font-bold uppercase">Expires On</p>
                  <p className="text-lg font-black text-amber-900">{student.premiumExpiryDate ? new Date(student.premiumExpiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Lifetime'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-400 font-bold">
                <Shield size={20} /> Free Account
              </div>
              <p className="text-sm text-gray-500">Upgrade to premium to apply for premium job postings and get priority placement support.</p>
              <a
                href="/student/premium"
                className="block w-full text-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all shadow-md mt-2"
              >
                Upgrade to Premium
              </a>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2"><Shield size={16} /> Student Point of Contact</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Mentor</span><span className="font-bold">{localData.mentor}</span></div>
            <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Advisor</span><span className="font-bold">{localData.advisor}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Coordinator</span><span className="font-bold">{localData.coordinator}</span></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2"><AlertTriangle size={16} /> Education Gaps</h3>
            {!editMode.gaps && <button onClick={() => setEditMode({ ...editMode, gaps: true })} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Edit2 size={16} /></button>}
          </div>
          {editMode.gaps ? (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700"><input type="checkbox" checked={localData.gapInStudies} onChange={e => setLocalData({ ...localData, gapInStudies: e.target.checked })} /> Any Gap in Studies?</label>
              {localData.gapInStudies && (
                <>
                  <input className="w-full border border-gray-300 p-2 rounded text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" placeholder="Duration (e.g. 1 Year)" value={localData.gapDuration} onChange={e => setLocalData({ ...localData, gapDuration: e.target.value })} />
                  <input className="w-full border border-gray-300 p-2 rounded text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" placeholder="Reason" value={localData.gapReason} onChange={e => setLocalData({ ...localData, gapReason: e.target.value })} />
                </>
              )}
              <div className="flex justify-end gap-2">
                <button onClick={() => { setEditMode({ ...editMode, gaps: false }); setLocalData(profileData); }} className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={saveGaps} className="text-xs px-3 py-1 bg-blue-600 text-white rounded font-bold">Save</button>
              </div>
            </div>
          ) : (
            <div className="text-sm">
              <p><span className="text-gray-500">Gap in Studies:</span> <span className={`font-bold ${localData.gapInStudies ? 'text-red-600' : 'text-green-600'}`}>{localData.gapInStudies ? 'YES' : 'NO'}</span></p>
              {localData.gapInStudies && (
                <>
                  <p><span className="text-gray-500">Duration:</span> {localData.gapDuration}</p>
                  <p><span className="text-gray-500">Reason:</span> {localData.gapReason}</p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm row-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2"><Phone size={16} /> Contact Information</h3>
            {!editMode.contact && <button onClick={() => setEditMode({ ...editMode, contact: true })} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Edit2 size={16} /></button>}
          </div>
          <div className="space-y-4 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-bold text-gray-400 uppercase">Official / Locked</p>
                <Lock size={12} className="text-gray-400" />
              </div>
              <div className="space-y-2">
                <div><label className="text-xs text-gray-500">Institute Email</label><p className="font-bold">{localData.instituteEmail}</p></div>
                <div><label className="text-xs text-gray-500">Alternative Email</label><p className="font-bold">{localData.alternativeEmail}</p></div>
                <div><label className="text-xs text-gray-500">Phone</label><p className="font-bold">{localData.phone}</p></div>
                <div><label className="text-xs text-gray-500">WhatsApp</label><p className="font-bold">{localData.whatsappNumber}</p></div>
                <div><label className="text-xs text-gray-500">Parent Phone</label><p className="font-bold">{localData.parentPhone}</p></div>
                <div><label className="text-xs text-gray-500">Parent Email</label><p className="font-bold">{localData.parentEmail}</p></div>
              </div>
            </div>

            <div className="p-1">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Student Editable</p>
              {editMode.contact ? (
                <div className="space-y-3">
                  <div><label className="text-xs font-bold">Comm. Email *</label><input className="w-full border border-gray-300 p-2 rounded mt-1 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={localData.communicationEmail} onChange={e => setLocalData({ ...localData, communicationEmail: e.target.value })} /></div>
                  <div><label className="text-xs font-bold">Personal Email *</label><input className="w-full border border-gray-300 p-2 rounded mt-1 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={localData.personalEmail} onChange={e => setLocalData({ ...localData, personalEmail: e.target.value })} /></div>
                  <div><label className="text-xs font-bold">Preferred Contact</label><select className="w-full border border-gray-300 p-2 rounded mt-1 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={localData.preferredContactMethod} onChange={e => setLocalData({ ...localData, preferredContactMethod: e.target.value as any })}><option>Email</option><option>Phone</option><option>WhatsApp</option></select></div>
                  <div><label className="text-xs font-bold">LinkedIn URL</label><input className="w-full border border-gray-300 p-2 rounded mt-1 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={localData.linkedInProfile} onChange={e => setLocalData({ ...localData, linkedInProfile: e.target.value })} /></div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => { setEditMode({ ...editMode, contact: false }); setLocalData(profileData); }} className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button onClick={saveContact} className="text-xs px-3 py-1 bg-blue-600 text-white rounded font-bold">Save</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div><label className="text-xs text-gray-500">Communication Email</label><p className="font-bold">{localData.communicationEmail}</p></div>
                  <div><label className="text-xs text-gray-500">Personal Email</label><p className="font-bold">{localData.personalEmail}</p></div>
                  <div><label className="text-xs text-gray-500">Preferred Method</label><p className="font-bold">{localData.preferredContactMethod}</p></div>
                  <div><label className="text-xs text-gray-500">LinkedIn</label><a href={localData.linkedInProfile} target="_blank" rel="noreferrer" className="font-bold text-blue-600 hover:underline block truncate">{localData.linkedInProfile || '-'}</a></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2"><FileText size={16} /> More Info</h3>
            {!editMode.moreInfo && <button onClick={() => setEditMode({ ...editMode, moreInfo: true })} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Edit2 size={16} /></button>}
          </div>
          {editMode.moreInfo ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2"><label className="text-xs font-bold">Driving License</label><input className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={localData.drivingLicense} onChange={e => setLocalData({ ...localData, drivingLicense: e.target.value })} /></div>
              <div className="col-span-2"><label className="text-xs font-bold">Passport Number</label><input className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={localData.passportNumber} onChange={e => setLocalData({ ...localData, passportNumber: e.target.value })} /></div>
              <div><label className="text-xs font-bold">Issue Date</label><input type="date" className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={localData.passportIssueDate} onChange={e => setLocalData({ ...localData, passportIssueDate: e.target.value })} /></div>
              <div><label className="text-xs font-bold">Expiry Date</label><input type="date" className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" value={localData.passportExpiryDate} onChange={e => setLocalData({ ...localData, passportExpiryDate: e.target.value })} /></div>
              <div className="col-span-2 flex items-center gap-2 mt-2"><input type="checkbox" checked={localData.dayScholar} onChange={e => setLocalData({ ...localData, dayScholar: e.target.checked })} /> <label className="font-bold">Day Scholar?</label></div>
              <div className="col-span-2 flex justify-end gap-2 pt-2">
                <button onClick={() => { setEditMode({ ...editMode, moreInfo: false }); setLocalData(profileData); }} className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={saveMoreInfo} className="text-xs px-3 py-1 bg-blue-600 text-white rounded font-bold">Save</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <div className="col-span-2"><label className="text-xs text-gray-500">Driving License</label><p className="font-bold font-mono">{localData.drivingLicense || 'N/A'}</p></div>
              <div className="col-span-2"><label className="text-xs text-gray-500">Passport</label><p className="font-bold font-mono">{localData.passportNumber || 'N/A'}</p></div>
              <div><label className="text-xs text-gray-500">Day Scholar</label><p className="font-bold">{localData.dayScholar ? 'Yes' : 'No'}</p></div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2"><MapPin size={16} /> Address Details</h3>
            {!editMode.address && <button onClick={initAddressForms} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Edit2 size={16} /></button>}
          </div>
          {editMode.address ? (
            <div className="space-y-6 relative">
              <AddressForm
                title="Current Address"
                data={addrForms.current}
                onChange={(d) => setAddrForms(prev => ({ ...prev, current: d }))}
              />
              <AddressForm
                title="Permanent Address"
                data={addrForms.permanent}
                onChange={(d) => setAddrForms(prev => ({ ...prev, permanent: d }))}
                onCopy={() => setAddrForms(prev => ({ ...prev, permanent: { ...prev.current } }))}
                copyLabel="Same as Current"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => { setEditMode({ ...editMode, address: false }); }} className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={saveAddresses} className="text-xs px-3 py-1 bg-blue-600 text-white rounded font-bold">Save</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <h4 className="font-bold text-gray-400 text-xs uppercase mb-2">Current</h4>
                <p className="font-bold text-gray-800">{localData.currentAddress?.fullAddress || 'N/A'}</p>
                <p className="text-gray-500 mt-1">{localData.currentAddress?.city}, {localData.currentAddress?.state} - {localData.currentAddress?.pinCode}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <h4 className="font-bold text-gray-400 text-xs uppercase mb-2">Permanent</h4>
                <p className="font-bold text-gray-800">{localData.permanentAddress?.fullAddress || 'N/A'}</p>
                <p className="text-gray-500 mt-1">{localData.permanentAddress?.city}, {localData.permanentAddress?.state} - {localData.permanentAddress?.pinCode}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};