import api from './api';
import { User, AddressFormData, Role } from '../types';

export const AuthService = {
  authenticateUser: async (username: string, password?: string): Promise<User> => {
    const response = await api.post('/auth/login', { username, password });
    const data = response.data;

    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('premiumActive', String(data.premiumActive || false));
    }

    // Direct mapping for login response (no 'user' wrapper)
    const user: User = {
      id: data.userId,
      username: data.username || username,
      email: data.email,
      fullName: data.fullName,
      role: data.role as Role,
      collegeId: data.collegeId || null,
      accountStatus: data.accountStatus, // ADDED
      message: data.message, // ADDED
      token: data.token,
      avatar: data.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName)}&background=0D8ABC&color=fff`,

      isRestricted: data.isRestricted || false,
      isCollegeHead: data.isCollegeHead || false,

      phone: data.phone,
      alternativeEmail: data.alternativeEmail,
      alternativePhone: data.alternativePhone,
      aadhaarNumber: data.aadhaarNumber,
      bio: data.bio,
      department: data.department,
      experience: data.experience,
      education: data.education,

      address: data.addressJson ? JSON.parse(data.addressJson) : null,
      fullAddress: data.addressJson ? JSON.parse(data.addressJson).fullAddress : undefined,

      resetToken: data.resetToken,
      tokenExpiry: data.tokenExpiry,
      lastDeviceInfo: data.lastDeviceInfo,

      createdAt: data.createdAt,
      updatedAt: data.updatedAt,

      educationRecords: data.educationRecords || null,
      experiences: data.experiences || null,
      projects: data.projects || null,
      certifications: data.certifications || null,
      languages: data.languages || null,
      socialLinks: data.socialLinks || null,
      resumes: data.resumes || null,
      skills: data.skills || null,
    };

    return user;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  getFullProfile: async (userId: string): Promise<User> => {
    const response = await api.get(`/accounts/profile/${userId}`);
    const data = response.data.user; // backend wraps in { user: {...} }

    const user: User = {
      id: data.id,
      username: data.username,
      email: data.email,
      fullName: data.fullName,
      role: data.role as Role,
      collegeId: data.collegeId || null,
      accountStatus: data.accountStatus, // ADDED
      message: data.message, // ADDED
      avatar: data.avatarUrl || '',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,

      isRestricted: data.isRestricted || false,
      isCollegeHead: data.isCollegeHead || false,

      phone: data.phone,
      alternativeEmail: data.alternativeEmail,
      alternativePhone: data.alternativePhone,
      aadhaarNumber: data.aadhaarNumber,
      bio: data.bio,
      department: data.department,
      experience: data.experience,
      education: data.education,

      address: data.addressJson ? JSON.parse(data.addressJson) : null,
      fullAddress: data.addressJson ? JSON.parse(data.addressJson).fullAddress : undefined,

      resetToken: data.resetToken,
      tokenExpiry: data.tokenExpiry,
      lastDeviceInfo: data.lastDeviceInfo,

      educationRecords: data.educationRecords || null,
      experiences: data.experiences || null,
      projects: data.projects || null,
      certifications: data.certifications || null,
      languages: data.languages || null,
      socialLinks: data.socialLinks || null,
      resumes: data.resumes || null,
      skills: data.skills || null,
    };

    return user;
  },

  updateUser: async (user: Partial<User>, address?: AddressFormData): Promise<User> => {
    const payload: any = {
      username: user.username,  // Editable? If not, remove
      name: user.fullName,
      email: user.email,  // Official – not editable, but send if changed
      phone: user.phone,  // Official – not editable
      alternativeEmail: user.alternativeEmail,
      alternativePhone: user.alternativePhone,
      aadhaar: user.aadhaarNumber,  // Backend uses 'aadhaar'
      bio: user.bio,
      department: user.department,
      experience: user.experience,
      education: user.education,
      collegeId: user.collegeId,
      isCollegeHead: user.isCollegeHead,
    };

    if (address) {
      payload.address = address;  // Backend expects 'address' as object
    }

    const response = await api.put(`/accounts/${user.id}`, payload);
    return response.data; // direct user object
  },

  uploadAvatar: async (userId: string, file: File, category: string = 'profiles'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/accounts/${userId}/upload-photo?category=${category}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.url;
  },
};