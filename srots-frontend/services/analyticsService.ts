import api from './api';

// ── Backend DTO types ──────────────────────────────────────────────────────

export interface BranchDistribution {
    name: string;
    count: number;
}

export interface PlacementProgress {
    year?: number;
    month?: number;
    label: string;  // month name e.g. "January"
    value: number;  // count of placed students
}

export interface JobType {
    name: string;
    count: number;
}

export interface OverviewStats {
    totalStudents: number;
    placedStudents: number;
    placementRate: number;
    companiesVisited: number;
}

export interface RecentJob {
    id: string;
    title: string;
    companyName: string;
    postedAt: string;
    applicantCount: number;
}

/** Response shape from GET /analytics/overview (CPH/STAFF portal) */
export interface AnalyticsOverviewResponse {
    branchDistribution: BranchDistribution[];
    placementProgress: PlacementProgress[];
    jobTypes: JobType[];
    stats: OverviewStats;
    recentJobs: RecentJob[];
}

export interface SystemStats {
    totalColleges: number;
    activeStudents: number;
    expiringAccounts: number;
    totalJobs: number;
}

export interface LeaderboardEntry {
    name: string;
    placement: string;  // e.g. "85%"
    jobs: number;
}

/** Response shape from GET /analytics/system (ADMIN/SROTS_DEV) */
export interface SystemAnalyticsResponse {
    stats: SystemStats;
    leaderboard: LeaderboardEntry[];
    placementProgress: PlacementProgress[];
    branchDistribution: BranchDistribution[];
}

// ── API calls ──────────────────────────────────────────────────────────────

export const AnalyticsService = {
    /**
     * getOverview - Scoped based on user role (College or System-wide)
     */
    async getOverview(): Promise<AnalyticsOverviewResponse> {
        try {
            const res = await api.get('/analytics/overview');

            // Defensive check for empty or unexpected structure
            if (!res.data) throw new Error('Empty response from analytics server');

            return {
                branchDistribution: res.data.branchDistribution || [],
                placementProgress: res.data.placementProgress || [],
                jobTypes: res.data.jobTypes || [],
                stats: res.data.stats || { totalStudents: 0, placedStudents: 0, placementRate: 0, companiesVisited: 0 },
                recentJobs: res.data.recentJobs || []
            };
        } catch (error: any) {
            console.error('Error fetching analytics overview:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * getSystemAnalytics - For Platform Admins
     */
    async getSystemAnalytics(): Promise<SystemAnalyticsResponse> {
        try {
            const res = await api.get('/analytics/system');

            if (!res.data) throw new Error('Empty response from platform analytics');

            return {
                stats: res.data.stats || { totalColleges: 0, activeStudents: 0, expiringAccounts: 0, totalJobs: 0 },
                leaderboard: res.data.leaderboard || [],
                placementProgress: res.data.placementProgress || [],
                branchDistribution: res.data.branchDistribution || []
            };
        } catch (error: any) {
            console.error('Error fetching system analytics:', error.response?.data || error.message);
            throw error;
        }
    }
};
