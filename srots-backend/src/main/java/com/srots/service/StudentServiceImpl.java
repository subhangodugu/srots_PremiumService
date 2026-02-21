package com.srots.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.srots.dto.AddressRequest;
import com.srots.dto.StudentProfileRequest;
import com.srots.dto.studentDTOs.SectionRequest;
import com.srots.exception.ResourceNotFoundException;
import com.srots.model.StudentCertification;
import com.srots.model.StudentExperience;
import com.srots.model.StudentLanguage;
import com.srots.model.StudentProfile;
import com.srots.model.StudentProject;
import com.srots.model.StudentPublication;
import com.srots.model.StudentResume;
import com.srots.model.StudentSkill;
import com.srots.model.StudentSocialLink;
import com.srots.model.User;
import com.srots.repository.StudentCertificationRepository;
import com.srots.repository.StudentExperienceRepository;
import com.srots.repository.StudentLanguageRepository;
import com.srots.repository.StudentProfileRepository;
import com.srots.repository.StudentProjectRepository;
import com.srots.repository.StudentPublicationRepository;
import com.srots.repository.StudentRepository;
import com.srots.repository.StudentResumeRepository;
import com.srots.repository.StudentSkillRepository;
import com.srots.repository.StudentSocialLinkRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

@Service
public class StudentServiceImpl implements StudentService {

    @Autowired
    private StudentProfileRepository profileRepo;
    @Autowired
    private StudentSkillRepository skillRepo;
    @Autowired
    private StudentExperienceRepository experienceRepo;
    @Autowired
    private StudentResumeRepository resumeRepo;
    @Autowired
    private StudentProjectRepository prjRepo;
    @Autowired
    private StudentCertificationRepository certRepo;
    @Autowired
    private StudentSocialLinkRepository socialRepo;
    @Autowired
    private StudentLanguageRepository languageRepo;
    @Autowired
    private StudentPublicationRepository publicationRepo;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private FileService fileService;
    @Autowired
    private StudentRepository studentRepo;

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Helper to create a User reference for Foreign Key mapping
     */
    private User getStudentReference(String studentId) {
        User user = new User();
        user.setId(studentId);
        return user;
    }

    /**
     * Helper to verify if an existing record belongs to the authenticated student
     */
    private void verifyOwnership(String recordOwnerId, String authenticatedId) {
        if (!recordOwnerId.equals(authenticatedId)) {
            throw new AccessDeniedException("Unauthorized: You do not own this record.");
        }
    }

    // --- Tab 1: General Profile ---
    @Transactional
    public StudentProfile updateGeneralProfile(String studentId, StudentProfileRequest dto) {
        StudentProfile profile = profileRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        // 1. Contact & Identity (Student Editable)
        if (dto.getPersonalEmail() != null)
            profile.setPersonalEmail(dto.getPersonalEmail());
        if (dto.getWhatsappNumber() != null)
            profile.setWhatsappNumber(dto.getWhatsappNumber());
        if (dto.getLinkedInProfile() != null)
            profile.setLinkedinProfile(dto.getLinkedInProfile());
        if (dto.getPreferredContactMethod() != null)
            profile.setPreferredContactMethod(StudentProfile.ContactMethod.fromString(dto.getPreferredContactMethod()));

        // 2. Professional & Identity
        if (dto.getCareerPath() != null)
            profile.setCareerPath(dto.getCareerPath());
        if (dto.getDrivingLicense() != null)
            profile.setDrivingLicense(dto.getDrivingLicense());

        // 3. Passport (with parsing)
        if (dto.getPassportNumber() != null)
            profile.setPassportNumber(dto.getPassportNumber());
        if (dto.getPassportIssueDate() != null) {
            try {
                profile.setPassportIssueDate(LocalDate.parse(dto.getPassportIssueDate()));
            } catch (Exception e) {
            }
        }
        if (dto.getPassportExpiryDate() != null) {
            try {
                profile.setPassportExpiryDate(LocalDate.parse(dto.getPassportExpiryDate()));
            } catch (Exception e) {
            }
        }

        // 4. Education Gaps & Status
        if (dto.getDayScholar() != null)
            profile.setDayScholar(dto.getDayScholar());
        if (dto.getGapInStudies() != null)
            profile.setGapInStudies(dto.getGapInStudies());
        if (dto.getGapDuration() != null)
            profile.setGapDuration(dto.getGapDuration());
        if (dto.getGapReason() != null)
            profile.setGapReason(dto.getGapReason());

        return profileRepo.save(profile);
    }

    // --- Tab 2: Address ---
    @Transactional
    public StudentProfile updateAddress(String studentId, String type, AddressRequest dto) {
        StudentProfile profile = profileRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        try {
            String jsonString = objectMapper.writeValueAsString(dto);
            if ("current".equalsIgnoreCase(type))
                profile.setCurrentAddress(jsonString);
            else
                profile.setPermanentAddress(jsonString);
            return profileRepo.save(profile);
        } catch (Exception e) {
            throw new RuntimeException("Address conversion failed: " + e.getMessage());
        }
    }

    // --- Tab 3: Resumes (with physical deletion and default flag logic) ---
    // --- Tab 3: Resumes (with physical deletion and default flag logic) ---
    @Transactional
    public StudentResume uploadResume(String studentId, MultipartFile file) {
        // 1. Requirement: Max 3 Resumes
        long count = resumeRepo.countByStudent_Id(studentId);
        if (count >= 3) {
            throw new RuntimeException("Maximum 3 resumes allowed. Please delete an existing one first.");
        }

        // 2. Physical Upload: Category set to "students"
        // Parameters: file, subfolder (e.g., "resumes"), category ("students")
        String fileUrl = fileService.uploadFile(file, "resumes", "students");

        // 3. Database Entry
        StudentResume resume = new StudentResume();
        resume.setStudent(getStudentReference(studentId));
        resume.setFileName(file.getOriginalFilename());
        resume.setFileUrl(fileUrl);
        resume.setUploadedAt(LocalDateTime.now());

        // Logic: First resume uploaded becomes the default automatically
        resume.setIsDefault(count == 0);

        return resumeRepo.save(resume);
    }

    @Transactional
    public String deleteResume(String studentId, String resumeId) {
        // 1. Find the record
        StudentResume resume = resumeRepo.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        // 2. Security: Ensure the student owns this resume
        verifyOwnership(resume.getStudent().getId(), studentId);

        boolean wasDefault = Boolean.TRUE.equals(resume.getIsDefault());
        String fileUrl = resume.getFileUrl();

        // 3. Database Deletion
        resumeRepo.delete(resume);

        // 4. Physical Deletion: Remove file from file system/S3
        fileService.deleteFile(fileUrl);

        // 5. Logic: If the deleted resume was the default, make the next available one
        // default
        if (wasDefault) {
            resumeRepo.findFirstByStudent_Id(studentId).ifPresent(next -> {
                next.setIsDefault(true);
                resumeRepo.save(next);
            });
        }

        return "Resume and physical file deleted successfully";
    }

    @Transactional
    public void setDefaultResume(String studentId, String resumeId) {
        // 1. Verify the resume exists and belongs to the student
        StudentResume targetResume = resumeRepo.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        verifyOwnership(targetResume.getStudent().getId(), studentId);

        // 2. Set all resumes for this student to NOT default
        // Logic: Ensures only one resume is active at a time
        resumeRepo.findAllByStudent_Id(studentId).forEach(r -> {
            r.setIsDefault(false);
            resumeRepo.save(r);
        });

        // 3. Set the chosen resume as default
        targetResume.setIsDefault(true);
        resumeRepo.save(targetResume);

        // Clear cache to ensure the UI gets the updated list
        entityManager.flush();
        entityManager.clear();
    }

    // --- Portfolio Sections (Unified Logic: Create/Update/Delete) ---

    // --- 1. Skills ---
    @Transactional
    public Object manageSkill(String studentId, SectionRequest<StudentSkill> request) {
        StudentSkill data = request.getData();
        if (data.getId() != null && !data.getId().trim().isEmpty()) {
            StudentSkill existing = skillRepo.findById(data.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Skill not found"));
            verifyOwnership(existing.getStudent().getId(), studentId);
            existing.setName(data.getName());
            existing.setProficiency(data.getProficiency());
            return skillRepo.save(existing);
        }
        data.setId(UUID.randomUUID().toString());
        data.setStudent(getStudentReference(studentId));
        return skillRepo.save(data);
    }

    // --- Manage Certification ---
    @Transactional
    public Object manageCertification(String studentId, SectionRequest<StudentCertification> request) {
        StudentCertification data = request.getData();
        if (data.getId() != null && !data.getId().trim().isEmpty()) {
            StudentCertification existing = certRepo.findById(data.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Certification not found"));
            verifyOwnership(existing.getStudent().getId(), studentId);

            existing.setName(data.getName());
            existing.setOrganizer(data.getOrganizer()); // Using your field name
            existing.setCredentialUrl(data.getCredentialUrl());
            existing.setIssueDate(data.getIssueDate());
            existing.setExpiryDate(data.getExpiryDate());
            existing.setScore(data.getScore());
            return certRepo.save(existing);
        }
        data.setId(UUID.randomUUID().toString());
        data.setStudent(getStudentReference(studentId));
        return certRepo.save(data);
    }

    // --- Manage Project ---
    @Transactional
    public Object manageProject(String studentId, SectionRequest<StudentProject> request) {
        StudentProject data = request.getData();
        if (data.getId() != null && !data.getId().trim().isEmpty()) {
            StudentProject existing = prjRepo.findById(data.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
            verifyOwnership(existing.getStudent().getId(), studentId);

            existing.setTitle(data.getTitle());
            existing.setDomain(data.getDomain()); // Using your field name
            existing.setTechUsed(data.getTechUsed()); // Using your field name
            existing.setProjectLink(data.getProjectLink());
            existing.setDescription(data.getDescription());
            existing.setStartDate(data.getStartDate());
            existing.setEndDate(data.getEndDate());
            existing.setIsCurrent(data.getIsCurrent());
            return prjRepo.save(existing);
        }
        data.setId(UUID.randomUUID().toString());
        data.setStudent(getStudentReference(studentId));
        return prjRepo.save(data);
    }

    // --- Manage Experience ---
    @Transactional
    public Object manageExperience(String studentId, SectionRequest<StudentExperience> request) {
        StudentExperience data = request.getData();
        if (data.getId() != null && !data.getId().trim().isEmpty()) {
            StudentExperience existing = experienceRepo.findById(data.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Experience not found"));
            verifyOwnership(existing.getStudent().getId(), studentId);

            existing.setTitle(data.getTitle());
            existing.setCompany(data.getCompany());
            existing.setLocation(data.getLocation());
            existing.setType(data.getType());
            existing.setStartDate(data.getStartDate());
            existing.setEndDate(data.getEndDate());
            existing.setIsCurrent(data.getIsCurrent());
            existing.setDescription(data.getDescription());
            return experienceRepo.save(existing);
        }
        data.setId(UUID.randomUUID().toString());
        data.setStudent(getStudentReference(studentId));
        return experienceRepo.save(data);
    }

    // --- Manage Languages ---
    @Transactional
    public Object manageLanguage(String studentId, SectionRequest<StudentLanguage> request) {
        StudentLanguage data = request.getData();
        if (data.getId() != null && !data.getId().trim().isEmpty()) {
            StudentLanguage existing = languageRepo.findById(data.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Language not found"));
            verifyOwnership(existing.getStudent().getId(), studentId);

            existing.setName(data.getName()); // Matches your 'name' field
            existing.setProficiency(data.getProficiency()); // Matches your 'LangProficiency' enum
            return languageRepo.save(existing);
        }
        data.setId(UUID.randomUUID().toString());
        data.setStudent(getStudentReference(studentId));
        return languageRepo.save(data);
    }

    // --- Manage Publications ---
    @Transactional
    public Object managePublication(String studentId, SectionRequest<StudentPublication> request) {
        StudentPublication data = request.getData();
        if (data.getId() != null && !data.getId().trim().isEmpty()) {
            StudentPublication existing = publicationRepo.findById(data.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Publication not found"));
            verifyOwnership(existing.getStudent().getId(), studentId);

            existing.setTitle(data.getTitle());
            existing.setPublisher(data.getPublisher()); // Matches your 'publisher' field
            existing.setPublicationUrl(data.getPublicationUrl());
            existing.setPublishDate(data.getPublishDate());
            return publicationRepo.save(existing);
        }
        data.setId(UUID.randomUUID().toString());
        data.setStudent(getStudentReference(studentId));
        return publicationRepo.save(data);
    }

    // --- Manage Social Links ---
    @Transactional
    public Object manageSocialLink(String studentId, SectionRequest<StudentSocialLink> request) {
        StudentSocialLink data = request.getData();
        if (data.getId() != null && !data.getId().trim().isEmpty()) {
            StudentSocialLink existing = socialRepo.findById(data.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Social link not found"));
            verifyOwnership(existing.getStudent().getId(), studentId);

            existing.setPlatform(data.getPlatform()); // Matches your 'Platform' enum
            existing.setUrl(data.getUrl());
            return socialRepo.save(existing);
        }
        data.setId(UUID.randomUUID().toString());
        data.setStudent(getStudentReference(studentId));
        return socialRepo.save(data);
    }

    // --- Helper for Bulletproof Deletion ---
    // --- Optimized Deletion Methods ---

    @Transactional
    public void removeSkill(String studentId, String skillId) {
        int deleted = skillRepo.deleteBySkillIdAndStudentId(skillId, studentId);
        validateDelete(deleted, "Skill");
    }

    @Transactional
    public void removeProject(String studentId, String id) {
        int deleted = prjRepo.deleteByProjectIdAndStudentId(id, studentId);
        validateDelete(deleted, "Project");
    }

    @Transactional
    public void removeExperience(String studentId, String id) {
        int deleted = experienceRepo.deleteByExperienceIdAndStudentId(id, studentId);
        validateDelete(deleted, "Experience");
    }

    @Transactional
    public void removeCertification(String studentId, String id) {
        int deleted = certRepo.deleteByCertificationIdAndStudentId(id, studentId);
        validateDelete(deleted, "Certification");
    }

    @Transactional
    public void removeLanguage(String studentId, String id) {
        int deleted = languageRepo.deleteByLanguageIdAndStudentId(id, studentId);
        validateDelete(deleted, "Language");
    }

    @Transactional
    public void removePublication(String studentId, String id) {
        int deleted = publicationRepo.deleteByPublicationIdAndStudentId(id, studentId);
        validateDelete(deleted, "Publication");
    }

    @Transactional
    public void removeSocialLink(String studentId, String id) {
        int deleted = socialRepo.deleteBySocialLinkIdAndStudentId(id, studentId);
        validateDelete(deleted, "Social Link");
    }

    /**
     * Shared logic to finalize deletion and sync persistence context.
     * 1. Check if the database actually removed a row.
     * 2. Flush the SQL DELETE command immediately.
     * 3. Clear the EntityManager to prevent Hibernate from 'resurrecting'
     * the deleted object from its internal cache.
     */
    @Override
    public List<com.srots.model.Student> getExpiringStudents(String collegeId) {
        LocalDate targetDate = LocalDate.now().plusDays(30);
        return studentRepo.findByCollegeId(collegeId).stream()
                .filter(s -> s.getPremiumExpiryDate() != null && s.getPremiumExpiryDate().isBefore(targetDate))
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Long> getAccountStats(String collegeId) {
        List<com.srots.model.Student> students = studentRepo.findByCollegeId(collegeId);
        LocalDate today = LocalDate.now();
        LocalDate next7 = today.plusDays(7);
        LocalDate next30 = today.plusDays(30);

        Map<String, Long> stats = new HashMap<>();
        stats.put("total", (long) students.size());
        stats.put("active", students.stream().filter(s -> "ACTIVE".equals(s.getAccountStatus())).count());
        stats.put("expiring30", students.stream()
                .filter(s -> s.getPremiumExpiryDate() != null && s.getPremiumExpiryDate().isBefore(next30)
                        && s.getPremiumExpiryDate().isAfter(today))
                .count());
        stats.put("expiring7", students.stream()
                .filter(s -> s.getPremiumExpiryDate() != null && s.getPremiumExpiryDate().isBefore(next7)
                        && s.getPremiumExpiryDate().isAfter(today))
                .count());
        stats.put("expired", students.stream()
                .filter(s -> "HOLD".equals(s.getAccountStatus())
                        || (s.getPremiumExpiryDate() != null && s.getPremiumExpiryDate().isBefore(today)))
                .count());

        return stats;
    }

    private void validateDelete(int rowsAffected, String section) {
        if (rowsAffected == 0) {
            // If rowsAffected is 0, it means either the ID doesn't exist
            // OR the studentId didn't match (Security breach attempt)
            throw new ResourceNotFoundException(section + " not found or unauthorized");
        }
        entityManager.flush();
        entityManager.clear();
    }

}