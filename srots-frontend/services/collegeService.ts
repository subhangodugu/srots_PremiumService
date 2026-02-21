
// import api from './api';
// import { College, User, AddressFormData, DashboardMetrics, Role, CollegeAboutSection } from '../types';
// import { downloadExcelFile } from '../utils/fileHelper';

// export const CollegeService = {
//     getColleges: async (query?: string): Promise<College[]> => {
//         const response = await api.get('/colleges', { params: { query } });
//         return response.data;
//     },

//     searchColleges: async (query?: string): Promise<College[]> => {
//         return CollegeService.getColleges(query);
//     },

//     getCollegeById: async (id: string): Promise<College> => {
//         const response = await api.get(`/colleges/${id}`);
//         return response.data;
//     },

// getDashboardMetrics: async (collegeId: string): Promise<DashboardMetrics> => {
//     const response = await api.get(`/colleges/${collegeId}/analytics`);
//     return response.data;
// },

//     // Synced with Java: @GetMapping("/college/{collegeId}/role/CPH")
//     searchCPUsers: async (collegeId: string, query: string): Promise<User[]> => {
//         const response = await api.get(`/accounts/college/${collegeId}/role/CPH`, { 
//             params: { search: query } 
//         });
//         return response.data;
//     },

//     // Synced with Java: @PostMapping("/cph")
//     createCPAdmin: async (data: any) => {
//         // Map fullName to name for Java RequestBody
//         const payload = {
//             ...data,
//             name: data.fullName || data.name
//         };
//         const response = await api.post('/accounts/cph', payload);
//         return response.data;
//     },

//     updateCPAdmin: async (user: User, address?: AddressFormData) => {
//         const payload = {
//             ...user,
//             name: user.fullName,
//             address: address
//         };
//         const response = await api.put(`/accounts/${user.id}`, payload);
//         return response.data;
//     },

//     deleteCPAdmin: async (id: string) => {
//         await api.delete(`/accounts/${id}`);
//     },

//     bulkUploadStaff: async (file: File, collegeId: string, adminId: string) => {
//         const formData = new FormData();
//         formData.append('file', file);
//         formData.append('collegeId', collegeId);
//         formData.append('adminId', adminId);
//         const response = await api.post('/admin/bulk/upload-staff', formData, {
//             responseType: 'arraybuffer',
//             headers: { 'Content-Type': 'multipart/form-data' }
//         });
//         return response.data;
//     },

//     downloadCPTeamTemplate: async () => {
//         const response = await api.get('/admin/bulk/template/staff', { responseType: 'blob' });
//         const url = window.URL.createObjectURL(new Blob([response.data]));
//         const link = document.createElement('a');
//         link.href = url;
//         link.setAttribute('download', 'staff_template.xlsx');
//         document.body.appendChild(link);
//         link.click();
//         window.URL.revokeObjectURL(url);
//     },

//     exportCPUsers: async (collegeId: string) => {
//         const response = await api.get(`/accounts/export/college/${collegeId}/cp`, { 
//             params: { format: 'excel' },
//             responseType: 'blob'
//         });
//         const url = window.URL.createObjectURL(new Blob([response.data]));
//         const link = document.createElement('a');
//         link.href = url;
//         link.setAttribute('download', `CP_Users_${collegeId}.xlsx`);
//         document.body.appendChild(link);
//         link.click();
//         window.URL.revokeObjectURL(url);
//     },

//     getCollegeStats: async (collegeId: string) => {
//         const response = await api.get(`/colleges/${collegeId}/analytics`);
//         const d = response.data.stats;
//         return {
//             studentCount: d.totalStudents,
//             cpCount: d.cpCount || 0,
//             totalJobs: d.activeJobs,
//             activeJobs: d.activeJobs
//         };
//     },

//     updateCollege: async (college: College, logoFile?: File, rawAddress?: AddressFormData, modifiedBy?: string) => {
//         const formData = new FormData();
//         formData.append('id', college.id);
//         formData.append('name', college.name);
//         formData.append('code', college.code);
//         formData.append('email', college.email);
//         formData.append('phone', college.phone);
//         if (college.type) formData.append('type', college.type);
//         if (college.socialMedia) formData.append('socialMedia', JSON.stringify(college.socialMedia));
//         if (college.aboutSections) formData.append('aboutSections', JSON.stringify(college.aboutSections));
//         if (logoFile) formData.append('file', logoFile);
//         if (rawAddress) formData.append('address', JSON.stringify(rawAddress));
//         if (modifiedBy) formData.append('lastModifiedBy', modifiedBy);

//         const response = await api.put(`/colleges/${college.id}`, formData, {
//             headers: { 'Content-Type': 'multipart/form-data' }
//         });
//         return response.data;
//     },

//     createCollege: async (data: Partial<College>, logoFile?: File, rawAddress?: AddressFormData) => {
//         const formData = new FormData();
//         if (data.name) formData.append('name', data.name);
//         if (data.code) formData.append('code', data.code);
//         if (data.email) formData.append('email', data.email);
//         if (data.phone) formData.append('phone', data.phone);
//         if (data.type) formData.append('type', data.type);
//         if (logoFile) formData.append('file', logoFile);
//         if (rawAddress) formData.append('address', JSON.stringify(rawAddress));

//         const response = await api.post('/colleges', formData, {
//             headers: { 'Content-Type': 'multipart/form-data' }
//         });
//         return response.data;
//     },

//     deleteCollege: async (id: string) => {
//         await api.delete(`/colleges/${id}`);
//     },

//     updateCollegeAbout: async (id: string, sections: CollegeAboutSection[], modifiedBy: string) => {
//         const response = await api.put(`/colleges/${id}`, { 
//             aboutSections: sections,
//             lastModifiedBy: modifiedBy,
//             lastModifiedAt: new Date().toLocaleString()
//         });
//         return response.data;
//     },

//     getCPStaff: async (collegeId: string): Promise<User[]> => {
//         const response = await api.get(`/accounts/college/${collegeId}/staff`);
//         return response.data;
//     },

//     updateCPStaff: async (user: User, address: AddressFormData) => {
//         return CollegeService.updateCPAdmin(user, address);
//     },

//     createCPStaff: async (data: any) => {
//         const payload = {
//             ...data,
//             name: data.fullName || data.name,
//             role: 'STAFF'
//         };
//         const response = await api.post('/accounts/staff', payload);
//         return response.data;
//     },

//     toggleCPStaffAccess: async (id: string) => {
//         const response = await api.put(`/accounts/${id}/access`);
//         return response.data;
//     },

//     deleteCPStaff: async (id: string) => {
//         await api.delete(`/accounts/${id}`);
//     },

//     addCollegeBranch: async (collegeId: string, branch: { name: string, code: string }) => {
//         const response = await api.post(`/colleges/${collegeId}/branches`, branch);
//         return response.data;
//     },

//     removeCollegeBranch: async (collegeId: string, branchCode: string) => {
//         await api.delete(`/colleges/${collegeId}/branches/${branchCode}`);
//     },

//     exportMasterList: async (type: 'students' | 'cp_admin') => {
//         const response = await api.get(`/accounts/export/master`, { params: { type }, responseType: 'blob' });
//         const url = window.URL.createObjectURL(new Blob([response.data]));
//         const link = document.createElement('a');
//         link.href = url;
//         link.setAttribute('download', `Master_${type}.xlsx`);
//         document.body.appendChild(link);
//         link.click();
//         window.URL.revokeObjectURL(url);
//     }
// };


import api from './api';
import { College, User, AddressFormData, BranchDTO } from '../types';

export const CollegeService = {

  getColleges: async (query?: string): Promise<College[]> => {
    const response = await api.get('/colleges', { params: { query } });
    return response.data;
  },

  searchColleges: async (query?: string): Promise<College[]> => {
    return CollegeService.getColleges(query);
  },

  getCollegeById: async (id: string): Promise<College> => {
    const response = await api.get(`/colleges/${id}`);
    return response.data;
  },

  // getDashboardMetrics: async (collegeId: string): Promise<DashboardMetrics> => {
  //   const response = await api.get(`/colleges/${collegeId}/metrics`); // Adjust endpoint if backend uses different path
  //   return response.data;
  // },

  // === PARTIAL UPDATES (Enterprise: granular, efficient, auditable) ===

  // Update Logo (multipart, backend handles old file delete)
  updateCollegeLogo: async (collegeId: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/colleges/${collegeId}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data; // returns new URL
  },

  // Update Social Media (partial body)
  updateSocialMedia: async (collegeId: string, links: Record<string, string>): Promise<any> => {
    const response = await api.put(`/colleges/${collegeId}/social`, links);
    return response.data;
  },

  // Add About Section
  addAboutSection: async (collegeId: string, data: { title: string; content: string; image?: string }): Promise<any> => {
    const response = await api.post(`/colleges/${collegeId}/about`, data);
    return response.data; // returns new section with ID/audit
  },

  // Update One About Section
  updateAboutSection: async (
    collegeId: string,
    sectionId: string,
    data: { title: string; content: string; image?: string }
  ): Promise<any> => {
    const response = await api.put(`/colleges/${collegeId}/about/${sectionId}`, data);
    return response.data;
  },

  // Delete One About Section (backend cleans old image)
  deleteAboutSection: async (collegeId: string, sectionId: string): Promise<void> => {
    await api.delete(`/colleges/${collegeId}/about/${sectionId}`);
  },

  // === FILE UPLOAD (Synced with backend /colleges/upload) ===
  uploadFile: async (file: File, collegeCode: string, category: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('collegeCode', collegeCode);
    formData.append('category', category);

    const response = await api.post('/colleges/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    // Backend returns { url: "..." } → extract url
    return response.data.url || response.data;
  },

  // NEW: Get real-time stats (students, CP users, jobs)
  getCollegeStats: async (collegeId: string): Promise<{
    studentCount: number;
    cpCount: number;
    totalJobs: number;
    activeJobs: number;
  }> => {
    try {
      const response = await api.get(`/colleges/${collegeId}/stats`);
      return response.data;
    } catch (err) {
      console.error("Stats fetch failed, using fallback", err);
      // Fallback if backend doesn't have /stats yet
      const [students, cpUsers, jobs] = await Promise.all([
        api.get(`/accounts/college/${collegeId}/role/STUDENT`).catch(() => ({ data: [] })),
        api.get(`/accounts/college/${collegeId}/role/CPH`).catch(() => ({ data: [] })),
        api.get(`/jobs?collegeId=${collegeId}`).catch(() => ({ data: [] })),
      ]);

      return {
        studentCount: students.data?.length || 0,
        cpCount: cpUsers.data?.length || 0,
        totalJobs: jobs.data?.length || 0,
        activeJobs: jobs.data?.filter((j: any) => j.status === 'Active')?.length || 0,
      };
    }
  },

  createCollege: async (data: Partial<College>, logoFile?: File, address?: AddressFormData): Promise<College> => {
    const formData = new FormData();
    if (logoFile) formData.append('logo', logoFile);
    formData.append('college', new Blob([JSON.stringify({ ...data, address })], { type: 'application/json' }));

    const response = await api.post('/colleges', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateCollege: async (college: College, logoFile?: File, address?: AddressFormData): Promise<College> => {
    const formData = new FormData();
    if (logoFile) formData.append('logo', logoFile);
    formData.append('college', new Blob([JSON.stringify({ ...college, address })], { type: 'application/json' }));

    const response = await api.put(`/colleges/${college.id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteCollege: async (id: string): Promise<void> => {
    await api.delete(`/colleges/${id}`);
  },

  // CP Users
  searchCPUsers: async (collegeId: string, query?: string): Promise<User[]> => {
    const params = query ? { search: query } : {};
    const [cphRes, staffRes] = await Promise.all([
      api.get(`/accounts/college/${collegeId}/role/CPH`, { params }).catch(() => ({ data: [] })),
      api.get(`/accounts/college/${collegeId}/role/STAFF`, { params }).catch(() => ({ data: [] })),
    ]);
    return [...(cphRes.data || []), ...(staffRes.data || [])];
  },

  createCPAdmin: async (data: any): Promise<User> => {
    const response = await api.post('/accounts/cph', data);
    return response.data;
  },

  // updateCPAdmin: async (user: User, address?: AddressFormData): Promise<User> => {
  //   const payload = { ...user, address };
  //   const response = await api.put(`/accounts/${user.id}`, payload);
  //   return response.data;
  // },

  updateCPAdmin: async (user: User, address?: AddressFormData) => {
    const payload = {
      username: user.id, // Assuming id is used as username
      name: user.fullName,
      email: user.email,
      phone: user.phone,
      department: user.department,
      aadhaarNumber: user.aadhaarNumber,
      address,
      collegeId: user.collegeId,
      isCollegeHead: user.isCollegeHead || false,
    };
    const response = await api.put(`/accounts/${user.id}`, payload);
    return response.data;
  },

  deleteCPAdmin: async (id: string): Promise<void> => {
    await api.delete(`/accounts/${id}`);
  },

  exportCPUsers: async (collegeId: string): Promise<void> => {
    const response = await api.get(`/accounts/export/college/${collegeId}/cp`, {
      params: { format: 'excel' },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CP_Users_${collegeId}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  exportMasterList: async (type: 'students' | 'cp_admin'): Promise<void> => {
    const endpoint = type === 'students' ? '/accounts/export/all/students' : '/accounts/export/all/cp';
    const response = await api.get(endpoint, {
      params: { format: 'excel' },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${type === 'students' ? 'Students' : 'CP_Admins'}_Master_List.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },


  // getCPStaff: async (collegeId: string): Promise<User[]> => {
  //     const response = await api.get(`/accounts/college/${collegeId}/staff`);
  //     return response.data;
  // },

  // updateCPStaff: async (user: User, address: AddressFormData) => {
  //     return CollegeService.updateCPAdmin(user, address);
  // },

  // createCPStaff: async (data: any) => {
  //     const payload = {
  //         ...data,
  //         name: data.fullName || data.name,
  //         role: 'STAFF'
  //     };
  //     const response = await api.post('/accounts/staff', payload);
  //     return response.data;
  // },

  // toggleCPStaffAccess: async (id: string) => {
  //     const response = await api.put(`/accounts/${id}/access`);
  //     return response.data;
  // },

  // deleteCPStaff: async (id: string) => {
  //     await api.delete(`/accounts/${id}`);
  // },

  getCPStaff: async (collegeId: string): Promise<User[]> => {
    const response = await api.get(`/accounts/college/${collegeId}/role/STAFF`);
    return response.data;
  },

  createCPStaff: async (data: any) => {
    const payload = {
      username: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      department: data.department,
      aadhaarNumber: data.aadhaar,
      address: data.address,
      collegeId: data.collegeId,
      isCollegeHead: false,
    };
    // Backend expects role as a query param
    const response = await api.post('/accounts/cph?role=STAFF', payload);
    return response.data;
  },

  updateCPStaff: async (user: User, address: AddressFormData) => {
    const payload = {
      username: user.username,
      name: user.fullName,
      email: user.email,
      phone: user.phone,
      department: user.department,
      aadhaarNumber: user.aadhaarNumber,
      address,
      collegeId: user.collegeId,
      isCollegeHead: user.isCollegeHead || false,
    };
    const response = await api.put(`/accounts/${user.id}`, payload);
    return response.data;
  },

  toggleCPStaffAccess: async (id: string) => {
    const response = await api.put(`/accounts/${id}/access`);
    return response.data;
  },

  deleteCPStaff: async (id: string) => {
    await api.delete(`/accounts/${id}`);
  },

  downloadCPTeamTemplate: async () => {
    // Updated URL to include /api/admin/bulk as per your Controller
    const response = await api.get('/admin/bulk/template/staff', {
      responseType: 'blob',
      params: { format: 'excel' }
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Staff_Bulk_Template.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  bulkUploadStaff: async (file: File, collegeId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('collegeId', collegeId);
    formData.append('reportFormat', 'excel');

    const response = await api.post('/admin/bulk/upload-staff', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Staff_Upload_Report.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // addCollegeBranch: async (collegeId: string, branch: { name: string, code: string }) => {
  //     const response = await api.post(`/colleges/${collegeId}/branches`, branch);
  //     return response.data;
  // },

  // removeCollegeBranch: async (collegeId: string, branchCode: string) => {
  //     await api.delete(`/colleges/${collegeId}/branches/${branchCode}`);
  // },

  // getCollegeById: async (id: string): Promise<College> => {
  //     const response = await api.get(`/colleges/${id}`);
  //     return response.data;
  // },

  // 1. Add Branch
  addCollegeBranch: async (collegeId: string, branch: BranchDTO): Promise<College> => {
    const response = await api.post(`/colleges/${collegeId}/branches`, branch);
    return response.data;
  },

  // 2. Update Branch (Targeted by code)
  updateCollegeBranch: async (collegeId: string, branchCode: string, branch: BranchDTO): Promise<College> => {
    const response = await api.put(`/colleges/${collegeId}/branches/${branchCode}`, branch);
    return response.data;
  },

  // 3. Delete Branch
  removeCollegeBranch: async (collegeId: string, branchCode: string): Promise<College> => {
    const response = await api.delete(`/colleges/${collegeId}/branches/${branchCode}`);
    return response.data;
  }


};