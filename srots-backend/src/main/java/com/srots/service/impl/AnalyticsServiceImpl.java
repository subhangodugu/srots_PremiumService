package com.srots.service.impl;

import com.srots.dto.analytics.*;
import com.srots.model.User;
import com.srots.repository.*;
import com.srots.service.AnalyticsService;
import com.srots.service.JobMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

        private final StudentAnalyticsRepository studentRepo;
        private final JobAnalyticsRepository jobRepo;
        private final ApplicationAnalyticsRepository appRepo;
        private final UserRepository userRepo;
        private final CollegeRepository collegeRepo;
        private final StudentRepository studentRepoMain;
        private final JobMapper jobMapper;

        @Override
        public AnalyticsOverviewDTO getOverview() {
                List<BranchDistributionDTO> branchData = studentRepo.getBranchDistribution();
                List<PlacementProgressDTO> progressData = appRepo
                                .getMonthlyPlacements(com.srots.model.Application.AppStatus.PLACED);
                List<JobTypeDTO> jobTypes = jobRepo.getJobTypeDistribution();

                Long totalStudents = appRepo.countTotalStudents(com.srots.model.User.Role.STUDENT);
                Long placedStudents = appRepo.countPlacedStudents(com.srots.model.Application.AppStatus.PLACED);

                Double rate = totalStudents > 0 ? (placedStudents * 100.0) / totalStudents : 0.0;

                StatsDTO stats = StatsDTO.builder()
                                .totalStudents(totalStudents)
                                .placedStudents(placedStudents)
                                .placementRate(rate)
                                .companiesVisited(25L) // Hardcoded placeholder
                                .build();

                List<com.srots.dto.jobdto.JobResponseDTO> recentJobs = jobRepo.findTop5ByOrderByPostedAtDesc().stream()
                                .map(job -> jobMapper.toResponseDTO(job, null, "ADMIN"))
                                .collect(Collectors.toList());

                return AnalyticsOverviewDTO.builder()
                                .branchDistribution(branchData)
                                .placementProgress(progressData)
                                .jobTypes(jobTypes)
                                .stats(stats)
                                .recentJobs(recentJobs)
                                .build();
        }

        @Override
        public AnalyticsOverviewDTO getOverviewByCollege(String collegeId) {
                List<BranchDistributionDTO> branchData = studentRepo.getBranchDistributionByCollege(collegeId);
                List<PlacementProgressDTO> progressData = appRepo
                                .getMonthlyPlacementsByCollege(com.srots.model.Application.AppStatus.PLACED, collegeId);
                List<JobTypeDTO> jobTypes = jobRepo.getJobTypeDistributionByCollege(collegeId);

                Long totalStudents = appRepo.countTotalStudentsByCollege(com.srots.model.User.Role.STUDENT, collegeId);
                Long placedStudents = appRepo.countPlacedStudentsByCollege(
                                com.srots.model.Application.AppStatus.PLACED, collegeId);

                Double rate = totalStudents > 0 ? (placedStudents * 100.0) / totalStudents : 0.0;

                // Count distinct companies from active jobs for this college
                Long companiesVisited = jobRepo.findTop5ByCollege_IdOrderByPostedAtDesc(collegeId)
                                .stream().map(j -> j.getCompanyName()).filter(c -> c != null).distinct().count();

                StatsDTO stats = StatsDTO.builder()
                                .totalStudents(totalStudents)
                                .placedStudents(placedStudents)
                                .placementRate(rate)
                                .companiesVisited(companiesVisited)
                                .build();

                List<com.srots.dto.jobdto.JobResponseDTO> recentJobs = jobRepo
                                .findTop5ByCollege_IdOrderByPostedAtDesc(collegeId).stream()
                                .map(job -> jobMapper.toResponseDTO(job, null, "CPH"))
                                .collect(Collectors.toList());

                return AnalyticsOverviewDTO.builder()
                                .branchDistribution(branchData)
                                .placementProgress(progressData)
                                .jobTypes(jobTypes)
                                .stats(stats)
                                .recentJobs(recentJobs)
                                .build();
        }

        @Override
        public SystemAnalyticsDTO getSystemAnalytics() {
                long totalColleges = collegeRepo.count();
                long activeStudents = userRepo.countByRole(User.Role.STUDENT);

                java.time.LocalDate next30 = java.time.LocalDate.now().plusDays(30);
                long expiringAccounts = studentRepoMain.findAll().stream()
                                .filter(s -> s.getPremiumExpiryDate() != null
                                                && s.getPremiumExpiryDate().isBefore(next30))
                                .count();

                long totalJobs = jobRepo.count();

                SystemStatsDTO stats = SystemStatsDTO.builder()
                                .totalColleges(totalColleges)
                                .activeStudents(activeStudents)
                                .expiringAccounts(expiringAccounts)
                                .totalJobs(totalJobs)
                                .build();

                List<LeaderboardDTO> leaderboard = collegeRepo.getLeaderboard();

                // Chart data for admin analytics dashboard
                List<BranchDistributionDTO> branchData = studentRepo.getBranchDistribution();
                List<PlacementProgressDTO> progressData = appRepo
                                .getMonthlyPlacements(com.srots.model.Application.AppStatus.PLACED);

                return SystemAnalyticsDTO.builder()
                                .stats(stats)
                                .leaderboard(leaderboard)
                                .placementProgress(progressData)
                                .branchDistribution(branchData)
                                .build();
        }
}
