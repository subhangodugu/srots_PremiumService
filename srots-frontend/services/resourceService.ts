import api from './api';
import { User, GlobalCompany, FreeCourse, Role } from '../types';

/**
 * Resource Service
 * Manages platform-wide resources: SROTS Team, Global Companies, and Learning resources.
 */

export const ResourceService = {
    // --- Srots Team Management ---
    searchSrotsTeam: async (query: string): Promise<User[]> => {
        const response = await api.get('/team/srots', { params: { query } });
        return response.data;
    },

    createSrotsUser: async (data: any) => {
        const response = await api.post('/team/srots', data);
        return response.data;
    },

    updateSrotsUser: async (data: User) => {
        const response = await api.put(`/team/srots/${data.id}`, data);
        return response.data;
    },

    toggleSrotsUserAccess: async (id: string) => {
        const response = await api.put(`/team/srots/${id}/access`);
        return response.data;
    },

    deleteSrotsUser: async (id: string) => {
        await api.delete(`/team/srots/${id}`);
    },

    // --- Global Companies Management ---
    searchGlobalCompanies: async (query: string, collegeId?: string): Promise<GlobalCompany[]> => {
        const response = await api.get('/companies', { params: { query, collegeId } });
        return response.data;
    },

    searchCollegeCompanies: async (collegeId: string, query: string): Promise<GlobalCompany[]> => {
        const response = await api.get('/companies', { params: { collegeId, query, linkedOnly: 'true' } });
        return response.data;
    },

    addCompanyToCollege: async (collegeId: string, companyId: string) => {
        await api.post('/companies/subscribe', { collegeId, companyId });
    },

    updateGlobalCompany: async (data: GlobalCompany) => {
        const response = await api.put(`/companies/${data.id}`, data);
        return response.data;
    },

    createGlobalCompany: async (data: any) => {
        const response = await api.post('/companies', data);
        return response.data;
    },

    deleteGlobalCompany: async (id: string) => {
        await api.delete(`/companies/${id}`);
    },

    removeCompanyFromCollege: async (collegeId: string, companyId: string) => {
        await api.delete(`/companies/subscribe/${collegeId}/${companyId}`);
    },

    // --- Learning ---
    searchFreeCourses: async (query: string, tech: string, platform: string, status: string): Promise<FreeCourse[]> => {
        const response = await api.get('/free-courses', { params: { query, technology: tech, platform, status } });
        return response.data;
    },

    getCourseCategories: async (): Promise<string[]> => {
        const response = await api.get('/free-courses/categories');
        return response.data;
    },

    getCoursePlatformsList: async (): Promise<string[]> => {
        const response = await api.get('/free-courses/platforms');
        return response.data;
    },

    toggleFreeCourseStatus: async (id: string) => {
        const response = await api.put(`/free-courses/${id}/status-toggle`);
        return response.data;
    },

    verifyFreeCourseLink: async (id: string) => {
        const response = await api.put(`/free-courses/${id}/verify`);
        return response.data;
    },

    deleteFreeCourse: async (id: string) => {
        await api.delete(`/free-courses/${id}`);
    },

    updateFreeCourse: async (course: FreeCourse) => {
        const response = await api.put(`/free-courses/${course.id}`, course);
        return response.data;
    },

    createFreeCourse: async (courseData: Partial<FreeCourse>, postedBy: string) => {
        const response = await api.post('/free-courses', { ...courseData, postedBy });
        return response.data;
    },

    // --- Global File Handling ---
    uploadFile: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/upload', formData);
        return response.data.url;
    },

    getSystemAnalytics: async () => {
        const response = await api.get('/analytics/system');
        return response.data;
    },

    // UI Policy Helpers
    canModerateSrotsResource: (user: User): boolean => {
        return user.role === Role.ADMIN || user.role === Role.SROTS_DEV;
    }
};
