// export enum Role {
//   ADMIN = 'ADMIN',
//   SROTS_DEV = 'SROTS_DEV',
//   CPH = 'CPH',    // College Placement Head
//   STAFF = 'STAFF', // Placement Staff
//   STUDENT = 'STUDENT'
// }

// /**
//  * Maps to 'address_json' columns in DB
//  */
// export interface AddressFormData {
//   addressLine1: string;
//   addressLine2: string;
//   village: string;
//   mandal: string;
//   city: string;
//   state: string;
//   zip: string;
//   country: string;
// }

// /**
//  * Full User interface – now matches backend response exactly
//  */
// export interface User {
//   id: string;                    // DB: id
//   username: string;              // DB: username ← required now
//   email: string;                 // DB: email
//   fullName: string;              // DB: name / fullName
//   role: Role;                    // DB: role
//   collegeId?: string | null;     // DB: college_id
//   token?: string;                // not in DB – auth only
//   avatar?: string;               // DB: avatar_url
//   createdAt?: string;            // DB: created_at
//   updatedAt?: string;            // DB: updated_at

//   // Security & Flags
//   isRestricted?: boolean;        // DB: is_restricted
//   isCollegeHead?: boolean;       // DB: is_college_head

//   // Contact
//   phone?: string;                // DB: phone
//   alternativeEmail?: string;     // DB: alternative_email
//   alternativePhone?: string;     // DB: alternative_phone

//   // Personal / Professional
//   aadhaarNumber?: string;        // DB: aadhaar_number
//   bio?: string;                  // DB: bio
//   department?: string;           // DB: department
//   experience?: string;           // DB: experience
//   education?: string;            // DB: education

//   // Address (parsed from addressJson)
//   address?: AddressFormData | null;
//   fullAddress?: string;          // derived / summary

//   // Reset & Security
//   resetToken?: string | null;
//   tokenExpiry?: string | null;
//   lastDeviceInfo?: string | null;

//   // Extended profile fields (can be null)
//   educationRecords?: any[] | null;
//   experiences?: any[] | null;
//   projects?: any[] | null;
//   certifications?: any[] | null;
//   languages?: any[] | null;
//   socialLinks?: any[] | null;
//   resumes?: any[] | null;
//   skills?: any[] | null;

//   // Frontend-only helpers
//   isProfileComplete?: boolean;
// }

// // export interface Address {
// //   city: string;
// //   district: string;
// //   state: string;
// //   pinCode: string;
// //   country: string;
// //   fullAddress: string;
// // }

// // ... helper interfaces for StudentProfile ...
// // Added salaryRange for ExperienceTab
// export interface WorkExperience { id: string; title: string; company: string; location: string; type: string; startDate: string; endDate: string; isCurrent: boolean; salaryRange?: string; }
// export interface Project { id: string; title: string; domain: string; techUsed: string; link: string; startDate: string; endDate: string; isCurrent: boolean; description: string; }
// // Added hasScore for CertificationsTab
// export interface Certification { id: string; name: string; organizer: string; credentialUrl: string; issueDate: string; hasExpiry: boolean; expiryDate?: string; score?: string; licenseNumber?: string; hasScore?: boolean; }
// export interface Publication { id: string; title: string; publisher: string; url: string; publishDate: string; }
// export interface SocialLink { id: string; platform: string; url: string; }
// export interface Skill { id: string; name: string; proficiency: string; }
// export interface Language { id: string; name: string; proficiency: string; }
// export interface SemesterMark { sem: number; sgpa: string; }
// export interface EducationRecord { id: string; level: string; institution: string; board: string; yearOfPassing: string; score: string; scoreType: string; location: string; specialization?: string; branch?: string; semesters?: SemesterMark[]; currentArrears?: number; }
// export interface Resume { id: string; name: string; url: string; isDefault: boolean; uploadDate: string; }

// /**
//  * Interface: StudentProfile
//  * Maps to 'profile_json' column in 'students' table
//  */
// export interface StudentProfile {
//   userId: string;
//   rollNumber: string;
//   branch: string;
//   course: string;
//   batch: number;
//   placementCycle: string; 
//   careerPath: string;
//   gender: string;
//   dob: string;
//   nationality: string;
//   religion: string;
//   dayScholar: boolean;
//   aadhaarNumber: string;
//   drivingLicense: string;
//   passportNumber: string;
//   passportIssueDate: string;
//   passportExpiryDate: string;
//   personalEmail: string;
//   instituteEmail: string;
//   parentEmail: string;
//   whatsappNumber: string;
//   preferredContactMethod: string;
//   linkedInProfile: string;
//   fatherName: string;
//   fatherOccupation: string;
//   motherName: string;
//   motherOccupation: string;
//   parentPhone: string;
//   mentor: string;
//   advisor: string;
//   coordinator: string;
//   currentAddress: AddressFormData;
//   permanentAddress: AddressFormData;
//   gapInStudies: boolean;
//   gapDuration: string;
//   gapReason: string;
//   premiumStartDate: string;
//   premiumEndDate: string;
//   updatedAt: string;
//   educationHistory: EducationRecord[];
//   resumes?: Resume[];
//   experience: WorkExperience[];
//   skills: Skill[];
//   languages: Language[];
//   projects: Project[];
//   certifications: Certification[];
//   publications: Publication[];
//   socialLinks: SocialLink[];

//   // Added missing fields for ProfileTab and StudentPortal
//   communicationEmail: string;
//   fullName: string;
//   collegeName: string;
//   phone: string;
//   alternativeEmail: string;
//   alternativePhone: string;
//   bio: string;
// }

// /**
//  * Interface: Student
//  * Maps to 'students' table in MySQL
//  */
// export interface Student extends User {
//   profile: StudentProfile; // DB: 'profile_json'
//   createdAt?: string;      // DB: 'created_at'
// }

// export interface Branch {
//   name: string; 
//   code: string; 
// }

// // Added audit fields for AboutCollegeComponent
// export interface CollegeAboutSection {
//   id: string; 
//   title: string; 
//   content: string; 
//   image?: string;
//   lastModifiedBy?: string;
//   lastModifiedAt?: string;
// }

// /**
//  * Interface: College
//  * Maps to 'colleges' table in MySQL
//  */
// export interface College {
//   id: string;           // DB: 'id'
//   name: string;         // DB: 'name'
//   code: string;         // DB: 'code'
//   type?: string;        // DB: 'type'
//   email: string;        // DB: 'email'
//   phone: string;        // DB: 'phone'
//   logo: string;         // DB: 'logo'
//   studentCount: number; // DB: 'student_count'
//   cphCount: number;     // DB: 'cph_count'
//   activeJobs: number;   // DB: 'active_jobs'
//   address: string;      // Summary string for UI
//   addressDetails?: AddressFormData; // DB: 'address_json'
//   socialMedia?: any;    // DB: 'social_media_json'
//   aboutSections?: CollegeAboutSection[]; // DB: 'about_sections_json'
//   branches?: Branch[];
//   lastModifiedBy?: string;
//   lastModifiedAt?: string;
//   landline?: string; // Added landline for CollegeFormModal
// }

// export interface CollegeAboutSection {
//   id: string;
//   title: string;
//   content: string;
//   image?: string;
//   lastModifiedBy?: string;
//   lastModifiedAt?: string;
// }

// export interface BranchDTO {
//     name: string;
//     code: string;
// }

// export type MarkFormat = 'Percentage' | 'CGPA' | 'Grade' | 'Marks';

// /**
//  * Interface: Job
//  * Maps to 'jobs' table in MySQL
//  */
// export interface Job {
//   id: string;              // DB: 'id'
//   collegeId?: string;      // DB: 'college_id'
//   title: string;           // DB: 'title'
//   company: string;         // DB: 'company'
//   type: string;            // DB: 'type'
//   workArrangement: string; // DB: 'work_arrangement'
//   status: 'Active' | 'Closed'; // DB: 'status'
//   location: string;        // DB: 'location'
//   summary: string;         // DB: 'summary'
//   postedBy: string;        // DB: 'posted_by'
//   postedById: string;      // DB: 'posted_by_id'
//   postedAt: string;        // DB: 'posted_at'
//   applicationDeadline: string; // DB: 'application_deadline'

//   eligibility: any;        // DB: 'eligibility_json'
//   rounds: any[];           // DB: 'rounds_json'
//   studentStatus: Record<string, string>; // DB: 'student_status_json'
//   documents: {name: string, url: string}[]; // DB: 'documents_json'

//   // UI helper fields
//   responsibilities: string[];
//   qualifications: string[];
//   preferredQualifications?: string[];
//   salaryRange?: string;
//   benefits?: string[];
//   requiredStudentFields: string[]; 
//   applicants: string[]; 
//   notInterested: string[];

//   // Added missing properties for JobOverviewTab and DetailView
//   internalId?: string;
//   hiringDepartment?: string;
//   companyCulture?: string;
//   physicalDemands?: string;
//   eeoStatement?: string;
//   externalLink?: string;
//   negativeList?: string[];
// }

// export interface StudentJobView {
//     job: Job;
//     isApplied: boolean;
//     isEligible: boolean;
//     eligibilityReason?: string;
//     isExpired: boolean;
//     isNotInterested: boolean;
// }


// /**
//  * Interface: Post
//  * Maps to PostResponse from backend
//  */
// export interface Post {
//   id: string;
//   collegeId: string;
//   authorId: string;
//   authorName: string;
//   authorRole: Role;
//   content: string;
//   images: string[];
//   documents: {name: string, url: string}[];
//   likes: number;
//   commentsCount: number; // NEW: Added to match backend
//   isLikedByMe: boolean;
//   likedBy: string[];
//   commentsDisabled: boolean;
//   createdAt: string;
//   comments: PostComment[];
// }

// /**
//  * Interface: PostComment
//  * Maps to CommentResponse from backend
//  */
// export interface PostComment {
//   id: string;
//   userId: string;
//   user: string;
//   role: Role;
//   text: string;
//   date: string;
//   likes?: number; // NEW: Added for comment likes
//   likedBy?: string[]; // NEW: Added for tracking who liked
//   parentId?: string | null; // NEW: Added for nested replies
//   replies?: PostComment[]; // NEW: Added for nested structure
// }



// /**
//  * Interface: CalendarEvent
//  * Maps to 'events' table in MySQL
//  */
// export interface CalendarEvent {
//   id: string;            // DB: 'id'
//   collegeId?: string;    // DB: 'college_id'
//   title: string;         // DB: 'title'
//   date: string;          // DB: 'date'
//   type: string;          // DB: 'type'
//   startTime?: string;    // DB: 'start_time'
//   endTime?: string;      // DB: 'end_time'
//   targetBranches?: string[]; // DB: 'target_branches_json'
//   postedBy?: string;     // DB: 'posted_by'
//   createdById?: string;  // DB: 'created_by_id'

//   endDate?: string;
//   description?: string;
//   schedule?: ScheduleItem[]; // Updated to use ScheduleItem interface
//   createdAt?: string; 
//   targetYears?: number[]; // Added missing targetYears

//   createdBy?: string; // Added createdBy for audit trail
// }

// /**
//  * Interface: ScheduleItem
//  * Added for Timetable builder
//  */
// export interface ScheduleItem {
//     id: string;
//     timeRange: string;
//     activity: string;
//     type: 'Class' | 'Break' | 'Exam' | 'Activity';
// }

// /**
//  * Interface: Notice
//  * Maps to 'notices' table in MySQL
//  */
// export interface Notice {
//   id: string;          // DB: 'id'
//   collegeId?: string;  // DB: 'college_id'
//   title: string;       // DB: 'title'
//   description: string; // DB: 'description'
//   date: string;        // DB: 'date'
//   createdBy?: string;  // Changed from postedBy for consistency with backend
//   type: string;        // DB: 'type'
//   fileName?: string;   // DB: 'file_name'
//   fileUrl?: string;    // DB: 'file_url'
//   createdById?: string; // DB: 'created_by'
// }

// export interface GlobalCompany { id: string; name: string; website: string; description: string; logo?: string; headquarters?: string; isSubscribed?: boolean; }
// export interface FreeCourse { id: string; name: string; technology: string; platform: CoursePlatform; description: string; link: string; postedBy: string; status: CourseStatus; lastVerifiedAt?: string; }

// // Added missing enums for FreeCourses
// export enum CoursePlatform {
//   YOUTUBE = 'YouTube',
//   COURSERA = 'Coursera',
//   UDEMY = 'Udemy',
//   LINKEDIN = 'LinkedIn',
//   OTHER = 'Other'
// }

// export enum CourseStatus {
//   ACTIVE = 'ACTIVE',
//   INACTIVE = 'INACTIVE'
// }


// export interface DashboardMetrics {
//     stats: {
//         placedCount: number;
//         totalStudents: number;
//         activeJobs: number;
//         participatingCompanies: number;
//     };
//     branchDistribution: { name: string; count: number }[];
//     placementProgress: { name: string; placed: number }[];
//     jobTypeDistribution: { name: string; value: number }[];
//     recentJobs: Job[];
// }

export enum Role {
  ADMIN = 'ADMIN',
  SROTS_DEV = 'SROTS_DEV',
  CPH = 'CPH',
  STAFF = 'STAFF',
  STUDENT = 'STUDENT'
}

export interface AddressFormData {
  addressLine1: string;
  addressLine2: string;
  village: string;
  mandal: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  // Extended fields used in StudentPortal & ProfileTab
  fullAddress?: string;
  district?: string;
  pinCode?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  collegeId?: string | null;
  accountStatus?: string;
  premiumActive?: boolean; // ADDED
  premiumExpiryDate?: string; // ADDED
  message?: string;
  token?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  isRestricted?: boolean;
  isCollegeHead?: boolean;
  phone?: string;
  alternativeEmail?: string;
  alternativePhone?: string;
  aadhaarNumber?: string;
  bio?: string;
  department?: string;
  experience?: string;
  education?: string;
  address?: AddressFormData | null;
  fullAddress?: string;
  resetToken?: string | null;
  tokenExpiry?: string | null;
  lastDeviceInfo?: string | null;
  educationRecords?: any[] | null;
  experiences?: any[] | null;
  projects?: any[] | null;
  certifications?: any[] | null;
  languages?: any[] | null;
  socialLinks?: any[] | null;
  resumes?: any[] | null;
  skills?: any[] | null;
  isProfileComplete?: boolean;
  userId?: string;           // Alias sometimes sent by backend
  publications?: any[] | null;
}

export interface WorkExperience { id: string; title: string; company: string; location: string; type: string; startDate: string; endDate: string; isCurrent: boolean; salaryRange?: string; }
export interface Project { id: string; title: string; domain: string; techUsed: string; link: string; startDate: string; endDate: string; isCurrent: boolean; description: string; }
export interface Certification { id: string; name: string; organizer: string; credentialUrl: string; issueDate: string; hasExpiry: boolean; expiryDate?: string; score?: string; licenseNumber?: string; hasScore?: boolean; }
export interface Publication { id: string; title: string; publisher: string; url: string; publishDate: string; }
export interface SocialLink { id: string; platform: string; url: string; }
export interface Skill { id: string; name: string; proficiency: string; }
export interface Language { id: string; name: string; proficiency: string; }
export interface SemesterMark { sem: number; sgpa: string; }
export interface EducationRecord { id: string; level: string; institution: string; board: string; yearOfPassing: string; score: string; scoreType: string; location: string; specialization?: string; branch?: string; semesters?: SemesterMark[]; currentArrears?: number; }
export interface Resume { id: string; name: string; url: string; isDefault: boolean; uploadDate: string; }

export interface StudentProfile {
  userId: string;
  rollNumber: string;
  branch: string;
  course: string;
  batch: number;
  placementCycle: string;
  careerPath: string;
  gender: string;
  dob: string;
  nationality: string;
  religion: string;
  dayScholar: boolean;
  aadhaarNumber: string;
  drivingLicense: string;
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  personalEmail: string;
  instituteEmail: string;
  parentEmail: string;
  whatsappNumber: string;
  preferredContactMethod: string;
  linkedInProfile: string;
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  parentPhone: string;
  mentor: string;
  advisor: string;
  coordinator: string;
  currentAddress: AddressFormData;
  permanentAddress: AddressFormData;
  gapInStudies: boolean;
  gapDuration: string;
  gapReason: string;
  premiumStartDate: string;
  premiumEndDate: string;
  updatedAt: string;
  educationHistory: EducationRecord[];
  resumes?: Resume[];
  experience: WorkExperience[];
  skills: Skill[];
  languages: Language[];
  projects: Project[];
  certifications: Certification[];
  publications: Publication[];
  socialLinks: SocialLink[];
  communicationEmail: string;
  fullName: string;
  collegeName: string;
  phone: string;
  alternativeEmail: string;
  alternativePhone: string;
  bio: string;
}

export interface Student extends User {
  profile: StudentProfile;
  createdAt?: string;
}

export interface Branch {
  name: string;
  code: string;
}

export interface CollegeAboutSection {
  id: string;
  title: string;
  content: string;
  image?: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

export interface College {
  id: string;
  name: string;
  code: string;
  type?: string;
  email: string;
  phone: string;
  logo: string;
  studentCount: number;
  cphCount: number;
  activeJobs: number;
  address: string;
  addressDetails?: AddressFormData;
  socialMedia?: any;
  aboutSections?: CollegeAboutSection[];
  branches?: Branch[];
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  landline?: string;
}

export interface BranchDTO {
  name: string;
  code: string;
}

export type MarkFormat = 'Percentage' | 'CGPA' | 'Grade' | 'Marks';

/**
 * CRITICAL FIX: Job interface updated to match backend response exactly
 * Backend sends JobResponseDTO with these exact fields
 */
export interface Job {
  id: string;
  collegeId?: string;

  // Basic Info (matches backend exactly)
  title: string;
  companyName: string;          // Backend uses companyName, NOT company
  hiringDepartment?: string;

  // Enums (backend sends display values like "Full Time", "Remote")
  jobType: string;              // "Full Time", "Internship", "Contract"
  workMode: string;             // "On-Site", "Remote", "Hybrid"
  status: 'Active' | 'Closed' | 'Draft';

  location: string;
  salaryRange?: string;
  summary: string;

  // JSON Arrays (backend sends as arrays, not JSON strings)
  responsibilitiesJson?: string[];
  qualificationsJson?: string[];
  preferredQualificationsJson?: string[];
  benefitsJson?: string[];

  // Convenience aliases used by JobWizard form (same data, different field name)
  responsibilities?: string[];
  qualifications?: string[];
  preferredQualifications?: string[];
  benefits?: string[];

  // Additional details
  companyCulture?: string;
  physicalDemands?: string;
  eeoStatement?: string;
  internalId?: string;

  // Dates
  applicationDeadline: string;
  postedAt: string;

  // Relations
  postedBy?: string;            // Staff/CPH name
  postedById?: string;

  // Eligibility (backend sends these at root level)
  minUgScore?: number;
  formatUg?: string;
  min10thScore?: number;
  format10th?: string;
  min12thScore?: number;
  format12th?: string;
  maxBacklogs?: number;
  allowGaps?: boolean;
  maxGapYears?: number;
  isDiplomaEligible?: boolean;

  // JSON strings from backend
  allowedBranches?: string;     // JSON string
  eligibleBatches?: string;     // JSON string
  roundsJson?: string;          // JSON string
  requiredFieldsJson?: string;  // JSON string
  attachmentsJson?: string;     // JSON string

  // Parsed rounds for UI
  rounds?: any[];

  // Documents (parsed from attachmentsJson)
  documents?: { name: string, url: string }[];

  externalLink?: string;

  // UI helpers
  applicants?: string[];
  notInterested?: string[];
  studentStatus?: Record<string, string>;
  requiredStudentFields?: string[];
  negativeList?: string[];

  // DEPRECATED: These are old field names, kept for backward compatibility
  company?: string;             // Maps to companyName
  type?: string;                // Maps to jobType
  workArrangement?: string;     // Maps to workMode
  eligibility?: any;            // Deprecated - fields now at root level
}

/**
 * CRITICAL FIX: StudentJobView interface matching backend StudentJobViewDTO exactly
 */
export interface StudentJobView {
  job: Job;

  // Backend flags (exact names from StudentJobViewDTO)
  isApplied: boolean;       // Backend: applied
  isEligible: boolean;      // Backend: eligible
  isExpired: boolean;       // Backend: expired
  isNotInterested: boolean; // Backend: notInterested

  // Reason string
  eligibilityReason?: string;  // Backend: reason or notEligibilityReason
}

export interface Post {
  id: string;
  collegeId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  content: string;
  images: string[];
  documents: { name: string, url: string }[];
  likes: number;
  commentsCount: number;
  isLikedByMe: boolean;
  likedBy: string[];
  commentsDisabled: boolean;
  createdAt: string;
  comments: PostComment[];
}

export interface PostComment {
  id: string;
  userId: string;
  user: string;
  role: Role;
  text: string;
  date: string;
  likes?: number;
  likedBy?: string[];
  parentId?: string | null;
  replies?: PostComment[];
}

export interface CalendarEvent {
  id: string;
  collegeId?: string;
  title: string;
  date: string;
  type: string;
  startTime?: string;
  endTime?: string;
  targetBranches?: string[];
  postedBy?: string;
  createdById?: string;
  endDate?: string;
  description?: string;
  schedule?: ScheduleItem[];
  createdAt?: string;
  targetYears?: number[];
  createdBy?: string;
}

export interface ScheduleItem {
  id: string;
  timeRange: string;
  activity: string;
  type: 'Class' | 'Break' | 'Exam' | 'Activity';
}

export interface Notice {
  id: string;
  collegeId?: string;
  title: string;
  description: string;
  date: string;
  createdBy?: string;
  type: string;
  fileName?: string;
  fileUrl?: string;
  createdById?: string;
}

export interface GlobalCompany { id: string; name: string; website: string; description: string; logo?: string; headquarters?: string; isSubscribed?: boolean; }
export interface FreeCourse { id: string; name: string; technology: string; platform: CoursePlatform; description: string; link: string; postedBy: string; status: CourseStatus; lastVerifiedAt?: string; }

export enum CoursePlatform {
  YOUTUBE = 'YouTube',
  COURSERA = 'Coursera',
  UDEMY = 'Udemy',
  LINKEDIN = 'LinkedIn',
  OTHER = 'Other'
}

export enum CourseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface DashboardMetrics {
  stats: {
    placedCount: number;
    totalStudents: number;
    activeJobs: number;
    participatingCompanies: number;
  };
  branchDistribution: { name: string; count: number }[];
  placementProgress: { name: string; placed: number }[];
  jobTypeDistribution: { name: string; value: number }[];
  recentJobs: Job[];
}