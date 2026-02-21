package com.srots.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.srots.dto.AddressRequest;
import com.srots.dto.StudentProfileRequest;
import com.srots.dto.studentDTOs.SectionRequest;
import com.srots.model.StudentCertification;
import com.srots.model.StudentExperience;
import com.srots.model.StudentLanguage;
import com.srots.model.StudentProject;
import com.srots.model.StudentPublication;
import com.srots.model.StudentSkill;
import com.srots.model.StudentSocialLink;
import com.srots.service.StudentService;

@RestController
@RequestMapping("/api/v1/students/profile")
public class StudentController {

    @Autowired
    private StudentService studentService;

    // Standard way to extract the ID from the Auth Token
    private String getAuthUserId(Authentication auth) {
        if (auth == null)
            throw new RuntimeException("User not authenticated");
        return auth.getName();
    }

    @PutMapping
    public ResponseEntity<?> updateGeneralProfile(Authentication auth, @RequestBody StudentProfileRequest profile) {
        return ResponseEntity.ok(studentService.updateGeneralProfile(getAuthUserId(auth), profile));
    }

    @PutMapping("/sections/skills")
    public ResponseEntity<?> updateSkills(Authentication auth, @RequestBody SectionRequest<StudentSkill> request) {
        return ResponseEntity.ok(studentService.manageSkill(getAuthUserId(auth), request));
    }

    @PutMapping("/sections/languages")
    public ResponseEntity<?> updateLanguages(Authentication auth,
            @RequestBody SectionRequest<StudentLanguage> request) {
        return ResponseEntity.ok(studentService.manageLanguage(getAuthUserId(auth), request));
    }

    @PutMapping("/sections/experience")
    public ResponseEntity<?> updateExperience(Authentication auth,
            @RequestBody SectionRequest<StudentExperience> request) {
        return ResponseEntity.ok(studentService.manageExperience(getAuthUserId(auth), request));
    }

    @PutMapping("/sections/projects")
    public ResponseEntity<?> updateProjects(Authentication auth, @RequestBody SectionRequest<StudentProject> request) {
        return ResponseEntity.ok(studentService.manageProject(getAuthUserId(auth), request));
    }

    @PutMapping("/sections/certifications")
    public ResponseEntity<?> manageCertifications(Authentication auth,
            @RequestBody SectionRequest<StudentCertification> request) {
        return ResponseEntity.ok(studentService.manageCertification(getAuthUserId(auth), request));
    }

    @PutMapping("/sections/publications")
    public ResponseEntity<?> managePublications(Authentication auth,
            @RequestBody SectionRequest<StudentPublication> request) {
        return ResponseEntity.ok(studentService.managePublication(getAuthUserId(auth), request));
    }

    @PutMapping("/sections/social-links")
    public ResponseEntity<?> manageSocialLinks(Authentication auth,
            @RequestBody SectionRequest<StudentSocialLink> request) {
        return ResponseEntity.ok(studentService.manageSocialLink(getAuthUserId(auth), request));
    }

    @PutMapping("/address/{addressType}")
    public ResponseEntity<?> updateAddress(Authentication auth, @PathVariable String addressType,
            @RequestBody AddressRequest address) {
        return ResponseEntity.ok(studentService.updateAddress(getAuthUserId(auth), addressType, address));
    }

    @PostMapping(value = "/resumes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadResume(Authentication auth, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(studentService.uploadResume(getAuthUserId(auth), file));
    }

    @DeleteMapping("/resumes/{resumeId}")
    public ResponseEntity<?> deleteResume(Authentication auth, @PathVariable String resumeId) {
        return ResponseEntity.ok(studentService.deleteResume(getAuthUserId(auth), resumeId));
    }

    @PutMapping("/resumes/{resumeId}/set-default")
    public ResponseEntity<?> setDefaultResume(Authentication auth, @PathVariable String resumeId) {
        studentService.setDefaultResume(getAuthUserId(auth), resumeId);
        return ResponseEntity.ok("Resume set as default successfully");
    }

    // --- Dedicated Delete Endpoints ---

    @DeleteMapping("/sections/skills/{id}")
    public ResponseEntity<?> deleteSkill(Authentication auth, @PathVariable String id) {
        studentService.removeSkill(getAuthUserId(auth), id);
        return ResponseEntity.ok("Skill removed successfully");
    }

    @DeleteMapping("/sections/projects/{id}")
    public ResponseEntity<?> deleteProject(Authentication auth, @PathVariable String id) {
        studentService.removeProject(getAuthUserId(auth), id);
        return ResponseEntity.ok("Project removed successfully");
    }

    @DeleteMapping("/sections/experience/{id}")
    public ResponseEntity<?> deleteExperience(Authentication auth, @PathVariable String id) {
        studentService.removeExperience(getAuthUserId(auth), id);
        return ResponseEntity.ok("Experience removed successfully");
    }

    @DeleteMapping("/sections/certifications/{id}")
    public ResponseEntity<?> deleteCertification(Authentication auth, @PathVariable String id) {
        studentService.removeCertification(getAuthUserId(auth), id);
        return ResponseEntity.ok("Certification removed successfully");
    }

    @DeleteMapping("/sections/languages/{id}")
    public ResponseEntity<?> deleteLanguage(Authentication auth, @PathVariable String id) {
        studentService.removeLanguage(getAuthUserId(auth), id);
        return ResponseEntity.ok("Language removed successfully");
    }

    @DeleteMapping("/sections/publications/{id}")
    public ResponseEntity<?> deletePublication(Authentication auth, @PathVariable String id) {
        studentService.removePublication(getAuthUserId(auth), id);
        return ResponseEntity.ok("Publication removed successfully");
    }

    @DeleteMapping("/sections/social-links/{id}")
    public ResponseEntity<?> deleteSocialLink(Authentication auth, @PathVariable String id) {
        studentService.removeSocialLink(getAuthUserId(auth), id);
        return ResponseEntity.ok("Social link removed successfully");
    }

    @GetMapping("/expiring")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.isCollegeHead)")
    public ResponseEntity<?> getExpiringStudents(@RequestParam String collegeId) {
        return ResponseEntity.ok(studentService.getExpiringStudents(collegeId));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.isCollegeHead)")
    public ResponseEntity<?> getAccountStats(@RequestParam String collegeId) {
        return ResponseEntity.ok(studentService.getAccountStats(collegeId));
    }
}