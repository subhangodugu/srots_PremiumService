import api from './api';
import { Student, AddressFormData } from '../types';
import { downloadExcelFile } from '../utils/fileHelper';

export const StudentService = {
  searchStudents: async (collegeId: string, filters: any): Promise<Student[]> => {
    const params = {
      search: filters.query || undefined,
      batch: filters.year !== 'All' ? filters.year : undefined,
      branch: filters.branch !== 'All' ? filters.branch : undefined,
    };
    const response = await api.get(`/accounts/college/${collegeId}/role/STUDENT`, { params });
    return response.data;
  },

  createStudent: async (payload: any): Promise<Student> => {
    // Payload should be UserCreateRequest structure
    const response = await api.post('/accounts/student', payload);
    return response.data;
  },

  adminUpdateStudent: async (id: string, payload: any): Promise<Student> => {
    // Admin update using the management endpoint
    const response = await api.put(`/accounts/manage/${id}`, payload);
    return response.data;
  },

  // Updated to use /students/profile
  updateStudentProfile: async (studentId: string, updates: any): Promise<Student> => {
    const response = await api.put(`/students/profile`, updates);  // backend expects direct StudentProfileRequest
    return response.data;
  },

  // General section update (e.g., gaps, contact)
  updateProfileSection: async (studentId: string, section: string, data: any): Promise<Student> => {
    const response = await api.put(`/students/profile/sections/${section}`, { data });
    return response.data;
  },

  // Delete section item
  deleteProfileSectionItem: async (studentId: string, section: string, id: string): Promise<Student> => {
    const response = await api.delete(`/students/profile/sections/${section}/${id}`);
    return response.data;
  },

  // Specific for skills
  manageSkill: async (studentId: string, data: any): Promise<Student> => {
    return StudentService.updateProfileSection(studentId, 'skills', data);
  },

  deleteSkill: async (studentId: string, id: string): Promise<Student> => {
    return StudentService.deleteProfileSectionItem(studentId, 'skills', id);
  },

  // Specific for languages
  manageLanguage: async (studentId: string, data: any): Promise<Student> => {
    return StudentService.updateProfileSection(studentId, 'languages', data);
  },

  deleteLanguage: async (studentId: string, id: string): Promise<Student> => {
    return StudentService.deleteProfileSectionItem(studentId, 'languages', id);
  },

  // For experience
  manageExperience: async (studentId: string, data: any): Promise<Student> => {
    return StudentService.updateProfileSection(studentId, 'experience', data);
  },

  deleteExperience: async (studentId: string, id: string): Promise<Student> => {
    return StudentService.deleteProfileSectionItem(studentId, 'experience', id);
  },

  // For projects
  manageProject: async (studentId: string, data: any): Promise<Student> => {
    return StudentService.updateProfileSection(studentId, 'projects', data);
  },

  deleteProject: async (studentId: string, id: string): Promise<Student> => {
    return StudentService.deleteProfileSectionItem(studentId, 'projects', id);
  },

  // For certifications
  manageCertification: async (studentId: string, data: any): Promise<Student> => {
    return StudentService.updateProfileSection(studentId, 'certifications', data);
  },

  deleteCertification: async (studentId: string, id: string): Promise<Student> => {
    return StudentService.deleteProfileSectionItem(studentId, 'certifications', id);
  },

  // For publications
  managePublication: async (studentId: string, data: any): Promise<Student> => {
    return StudentService.updateProfileSection(studentId, 'publications', data);
  },

  deletePublication: async (studentId: string, id: string): Promise<Student> => {
    return StudentService.deleteProfileSectionItem(studentId, 'publications', id);
  },

  // For social links
  manageSocialLink: async (studentId: string, data: any): Promise<Student> => {
    return StudentService.updateProfileSection(studentId, 'social-links', data);
  },

  deleteSocialLink: async (studentId: string, id: string): Promise<Student> => {
    return StudentService.deleteProfileSectionItem(studentId, 'social-links', id);
  },

  // For address
  updateStudentAddress: async (studentId: string, type: 'current' | 'permanent', data: AddressFormData): Promise<Student> => {
    const response = await api.put(`/students/profile/address/${type}`, data);
    return response.data;
  },

  // For resumes
  uploadResume: async (studentId: string, file: File): Promise<Student> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/students/profile/resumes`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  setResumeAsDefault: async (studentId: string, resumeId: string): Promise<Student> => {
    const response = await api.put(`/students/profile/resumes/${resumeId}/set-default`);
    return response.data;
  },

  deleteResume: async (studentId: string, resumeId: string): Promise<Student> => {
    const response = await api.delete(`/students/profile/resumes/${resumeId}`);
    return response.data;
  },

  // Get full student 360
  getStudent360: async (studentId: string): Promise<Student> => {
    const response = await api.get(`/accounts/student-360/${studentId}`);
    const data = response.data;
    // Map the response to Student type
    return {
      ...data.user,
      profile: data.profile,
      educationRecords: data.education,
      experiences: data.experience,
      projects: data.projects,
      certifications: data.certifications,
      languages: data.languages,
      publications: data.publications,
      socialLinks: data.socialLinks,
      resumes: data.resumes,
      skills: data.skills,
    } as Student;
  },

  bulkUploadStudents: async (file: File, collegeId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('collegeId', collegeId);
    const response = await api.post('/admin/bulk/upload-students', formData, {
      responseType: 'arraybuffer',
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  bulkDeleteStudents: async (idsOrFile: string[] | File, collegeId?: string) => {
    if (Array.isArray(idsOrFile)) {
      await api.post('/accounts/bulk-delete', { ids: idsOrFile });
      return;
    }
    const formData = new FormData();
    formData.append('file', idsOrFile);
    formData.append('collegeId', collegeId || '');
    const response = await api.post('/admin/bulk/delete-students', formData, {
      responseType: 'arraybuffer'
    });
    return response.data;
  },

  previewBulkDeletion: async (file: File, collegeId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('collegeId', collegeId);
    const response = await api.post('/admin/bulk/preview-delete', formData);
    return response.data;
  },

  getExpiringStudents: async (collegeId: string) => {
    const response = await api.get(`/students/profile/expiring`, { params: { collegeId } });
    return response.data;
  },

  downloadExpiringStudentsReport: async (collegeId: string, data?: any[]) => {
    if (data) {
      const excelData: string[][] = [['Roll Number', 'Name', 'Email', 'Days to Expiry', 'Status']];
      data.forEach(s => excelData.push([s.id, s.name, s.email, s.expiryIn, s.status]));
      const csv = excelData.map(row => row.join(',')).join('\n');
      downloadExcelFile(new Blob([csv], { type: 'text/csv' }), `Expiring_Students_${collegeId}.xlsx`);
      return;
    }
    const response = await api.get(`/accounts/export/college/${collegeId}/students`, {
      params: { format: 'excel' },
      responseType: 'blob'
    });
    return response.data;
  },

  renewStudent: async (studentId: string, months: number) => {
    await api.post(`/accounts/${studentId}/renew`, { months });
  },

  previewBulkRenewal: async (file: File, collegeId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('collegeId', collegeId);
    const response = await api.post('/admin/bulk/preview-renew', formData);
    return response.data;
  },

  bulkRenewStudents: async (updates: { id: string, months: number }[]) => {
    await api.post('/accounts/bulk-renew', { updates });
  },

  getAccountStats: async (collegeId: string) => {
    const response = await api.get(`/students/profile/stats`, { params: { collegeId } });
    return response.data;
  },

  deleteStudent: async (id: string) => {
    await api.delete(`/accounts/${id}`);
  },

  toggleStudentRestriction: async (studentId: string, restrict: boolean) => {
    await api.put(`/accounts/${studentId}/toggle-restriction`, { restrict });
  },

  downloadBulkUploadTemplate: async () => {
    const response = await api.get('/admin/bulk/template/students', { responseType: 'blob' });
    return response.data;
  },

  processCustomReport: async (file: File, excludeCols: string[], excludeIds: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('excludeCols', JSON.stringify(excludeCols));
    formData.append('excludeIds', excludeIds);
    const response = await api.post('/tools/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  downloadCustomReport: (data: any[][], format: 'csv' | 'xlsx') => {
    const csv = data.map((row: any[]) => row.join(',')).join('\n');
    downloadExcelFile(new Blob([csv], { type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `Custom_Report.${format}`);
  },

  generateCustomGatheringReport: async (collegeId: string, rollNumbers: string, fields: string[]) => {
    const response = await api.post('/tools/gather', { collegeId, rollNumbers, fields });
    return response.data;
  },

  downloadGatheredDataReport: (data: any[][], format: 'csv' | 'xlsx') => {
    const csv = data.map((row: any[]) => row.join(',')).join('\n');
    downloadExcelFile(new Blob([csv], { type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `Gathered_Data.${format}`);
  },

  exportStudentRegistry: async (collegeId: string, filters: any) => {
    const response = await api.get(`/accounts/college/${collegeId}/export`, { params: filters });
    downloadExcelFile(response.data, `Student_Registry_${collegeId}.xlsx`);
  },

  /**
     * Get student's applications
     * Backend uses auth token to identify student
     */
  getStudentApplications: async (studentId: string): Promise<any[]> => {
    // Backend endpoint doesn't need studentId - uses auth token
    const response = await api.get('/jobs/students/applications/my');
    return response.data;
  },

  /**
   * Get application timeline for a specific job
   * Backend uses auth token to identify student
   */
  getStudentApplicationTimeline: async (jobId: string, studentId: string): Promise<any[]> => {
    // Backend endpoint doesn't need studentId in path - uses auth token
    const response = await api.get(`/jobs/students/${jobId}/timeline`);
    return response.data;
  }
};