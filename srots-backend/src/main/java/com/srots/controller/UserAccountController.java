package com.srots.controller;

import java.io.InputStream;
import java.net.URLConnection;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

import com.srots.dto.Student360Response;
import com.srots.dto.UserCreateRequest;
import com.srots.dto.UserFullProfileResponse;
import com.srots.exception.ResourceNotFoundException;
import com.srots.model.User;
import com.srots.service.FileService;
import com.srots.service.UserAccountService;

@RestController
@RequestMapping("/api/v1/accounts")
public class UserAccountController {

    @Autowired
    private UserAccountService userService;

    @Autowired
    private FileService fileService;

    @PostMapping("/srots")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createSrotsAccount(
            @org.springframework.web.bind.annotation.RequestBody UserCreateRequest dto,
            @RequestParam String role) {
        return ResponseEntity.ok(userService.create(dto, role));
    }

    @PostMapping("/cph")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.isCollegeHead)")
    public ResponseEntity<?> createCphAccount(
            @org.springframework.web.bind.annotation.RequestBody UserCreateRequest dto, @RequestParam String role) {
        return ResponseEntity.ok(userService.create(dto, role));
    }

    @PostMapping("/student")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.isCollegeHead)")
    public ResponseEntity<?> createStudentAccount(
            @org.springframework.web.bind.annotation.RequestBody UserCreateRequest dto) {
        // This will now return UserFullProfileResponse as JSON
        return ResponseEntity.ok(userService.create(dto, "STUDENT"));
    }

    /**
     * RESEND CREDENTIALS: Only accessible by SROTS (ADMIN/DEV) or College Heads
     * (CPH).
     */
    @PostMapping("/{userId}/resend-credentials")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SROTS_DEV') or (hasRole('CPH') and principal.isCollegeHead)")
    public ResponseEntity<?> resendCredentials(@PathVariable String userId) {
        try {
            userService.resendCredentials(userId);
            return ResponseEntity.ok(java.util.Map.of(
                    "message", "Credentials have been resent to the user's registered email."));
        } catch (Exception e) {
            // This will be caught by your GlobalExceptionHandler handleRuntimeException
            throw new RuntimeException("Failed to resend credentials: " + e.getMessage());
        }
    }

    /**
     * UNIFIED UPDATE: Handles self-updates for everyone and Admin updates for
     * Srots/CP.
     * Logic:
     * 1. ADMIN can update anyone.
     * 2. Any user can update their OWN profile (principal.userId == #id).
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV','CPH') or (principal.userId == #id) or hasRole('SROTS_DEV') or (hasRole('CPH') and principal.isCollegeHead)")
    public ResponseEntity<?> updateAccount(@PathVariable String id, @RequestBody UserCreateRequest dto) {
        return ResponseEntity.ok(userService.update(id, dto));
    }

    /**
     * CP ADMIN UPDATE: Allows a College Head to update their staff/students
     * specifically.
     */
    @PutMapping("/manage/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.isCollegeHead)")
    public ResponseEntity<?> manageUserAccount(@PathVariable String id, @RequestBody UserCreateRequest dto) {
        return ResponseEntity.ok(userService.update(id, dto));
    }

    @PostMapping("/{userId}/upload-photo")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (principal.userId == #userId)")
    public ResponseEntity<?> uploadPhoto(
            @PathVariable String userId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "profiles") String category) { // Category from frontend

        // 1. Always get the source of truth from DB for college code
        User user = userService.getById(userId);
        if (user == null)
            return ResponseEntity.notFound().build();

        // 2. Space Management: Delete old photo if it exists
        if (user.getAvatarUrl() != null) {
            fileService.deleteFile(user.getAvatarUrl());
        }

        // 3. Resolve College Code
        String collegeCode = (user.getCollege() != null) ? user.getCollege().getCode() : "SROTS";

        // 4. Upload using the reusable method
        String photoUrl = fileService.uploadFile(file, collegeCode, category, userId);

        // 5. Update DB
        userService.updateAvatarOnly(userId, photoUrl);

        return ResponseEntity.ok(java.util.Map.of("url", photoUrl, "status", "success"));
    }

    @GetMapping("/{collegeCode}/{category}/{userId}/{fileName:.+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV','CPH', 'STAFF','STUDENT')")
    public ResponseEntity<InputStreamResource> getProfileImage(
            @PathVariable String collegeCode,
            @PathVariable String category,
            @PathVariable String userId,
            @PathVariable String fileName) {

        // 1. Reconstruct the internal URL
        String fileUrl = "/api/v1/files/" + collegeCode + "/" + category + "/" + userId + "/" + fileName;

        // 2. Get the stream from your existing LocalFileServiceImpl
        InputStream stream = fileService.getFileStream(fileUrl);

        // 3. Dynamically detect the Media Type (image/jpeg, image/png, etc.)
        String mimeType = URLConnection.guessContentTypeFromName(fileName);
        if (mimeType == null) {
            mimeType = "image/jpeg"; // Default fallback
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mimeType))
                .body(new InputStreamResource(stream));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.isCollegeHead)")
    public ResponseEntity<String> deleteAccount(@PathVariable String id) {
        User user = userService.getById(id);

        // Clean up file system before deleting record
        if (user != null && user.getAvatarUrl() != null) {
            fileService.deleteFile(user.getAvatarUrl());
        }

        userService.delete(id);
        return ResponseEntity.ok("Account deleted successfully");
    }

    // 1. GET ALL USERS (Filtered Global List)
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<List<User>> getAllUsers(
            @RequestParam(name = "branch", required = false) String branch,
            @RequestParam(name = "batch", required = false) Integer batch,
            @RequestParam(name = "gender", required = false) String gender,
            @RequestParam(name = "search", required = false) String search) { // Added search

        List<User> users = userService.getFilteredUsers(null, null, branch, batch, gender, search);
        return ResponseEntity.ok(users);
    }

    // 2. GET USERS BY ROLE (Filtered Global List)
    @GetMapping("/role/{roleName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<List<User>> getUsersByRole(
            @PathVariable String roleName,
            @RequestParam(name = "branch", required = false) String branch,
            @RequestParam(name = "batch", required = false) Integer batch,
            @RequestParam(name = "gender", required = false) String gender,
            @RequestParam(name = "search", required = false) String search) { // Added search

        User.Role role = User.Role.valueOf(roleName.toUpperCase());
        List<User> users = userService.getFilteredUsers(null, role, branch, batch, gender, search);
        return ResponseEntity.ok(users);
    }

    // 3. GET COLLEGE SPECIFIC DATA (Filtered)
    @GetMapping("/college/{collegeId}/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.collegeId == #collegeId)")
    public ResponseEntity<List<User>> getCollegeData(
            @PathVariable String collegeId,
            @RequestParam(name = "branch", required = false) String branch,
            @RequestParam(name = "batch", required = false) Integer batch,
            @RequestParam(name = "gender", required = false) String gender,
            @RequestParam(name = "search", required = false) String search) {

        List<User> users = userService.getFilteredUsers(collegeId, null, branch, batch, gender, search);
        return ResponseEntity.ok(users);
    }

    // 4. GET COLLEGE USERS BY ROLE (Filtered)
    @GetMapping("/college/{collegeId}/role/{roleName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH')")
    public ResponseEntity<List<User>> getCollegeUsersByRole(
            @PathVariable String collegeId,
            @PathVariable String roleName,
            @RequestParam(name = "branch", required = false) String branch,
            @RequestParam(name = "batch", required = false) Integer batch,
            @RequestParam(name = "gender", required = false) String gender,
            @RequestParam(name = "search", required = false) String search) {

        User.Role role = User.Role.valueOf(roleName.toUpperCase());
        List<User> users = userService.getFilteredUsers(collegeId, role, branch, batch, gender, search);
        return ResponseEntity.ok(users);
    }
    // --- INDIVIDUAL FULL DETAILS ---

    @GetMapping("/profile/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH', 'STAFF') or (principal.userId == #id)")
    public ResponseEntity<UserFullProfileResponse> getFullProfile(@PathVariable String id) {
        return ResponseEntity.ok(userService.getFullUserProfile(id));
    }

    /**
     * GET COMPLETE STUDENT 360 DATA
     * Pulls data from: Users, Profiles, Edu, Skills, Projects, Exp, Certs, Pubs,
     * Socials, Resumes, Apps
     */
    @GetMapping("/student-360/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV', 'CPH') or (principal.userId == #id)")
    public ResponseEntity<Student360Response> getFullStudentData(@PathVariable String id) {
        return ResponseEntity.ok(userService.getStudent360(id));
    }

    // --- REPORT EXPORT ENDPOINTS ---

    @GetMapping("/export/all/cp")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<byte[]> downloadAllCpUsers(
            @RequestParam(name = "branch", required = false) String branch,
            @RequestParam(name = "gender", required = false) String gender,
            @RequestParam(name = "format", defaultValue = "excel") String format) {

        byte[] report = userService.exportUsersByRole(null, User.Role.CPH, branch, null, gender, format);

        if (report == null || report.length == 0) {
            throw new ResourceNotFoundException("No CP users found for the selected filters.");
        }

        return createReportResponse(report, "All_Colleges_CP_Users", format);
    }

    @GetMapping("/export/all/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV')")
    public ResponseEntity<byte[]> downloadAllStudents(
            @RequestParam(name = "branch", required = false) String branch,
            @RequestParam(name = "batch", required = false) Integer batch,
            @RequestParam(name = "gender", required = false) String gender,
            @RequestParam(name = "format", defaultValue = "excel") String format) {

        byte[] report = userService.exportUsersByRole(null, User.Role.STUDENT, branch, batch, gender, format);

        if (report == null || report.length == 0) {
            throw new ResourceNotFoundException(
                    "No students found for the selected filters (Branch: " + branch + ", Batch: " + batch + ").");
        }

        return createReportResponse(report, "All_Colleges_Students", format);
    }

    @GetMapping("/export/college/{collegeId}/cp")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.collegeId == #collegeId)")
    public ResponseEntity<byte[]> downloadCollegeCpUsers(
            @PathVariable String collegeId,
            @RequestParam(name = "branch", required = false) String branch,
            @RequestParam(name = "gender", required = false) String gender,
            @RequestParam(name = "format", defaultValue = "excel") String format) {

        String collegeName = userService.getCollegeName(collegeId);
        byte[] report = userService.exportUsersByRole(collegeId, User.Role.CPH, branch, null, gender, format);

        if (report == null || report.length == 0) {
            throw new ResourceNotFoundException("No CP users found in " + collegeName + " for the selected filters.");
        }

        return createReportResponse(report, collegeName + "_CP_Users", format);
    }

    @GetMapping("/export/college/{collegeId}/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.collegeId == #collegeId)")
    public ResponseEntity<byte[]> downloadCollegeStudents(
            @PathVariable String collegeId,
            @RequestParam(name = "branch", required = false) String branch,
            @RequestParam(name = "batch", required = false) Integer batch,
            @RequestParam(name = "gender", required = false) String gender,
            @RequestParam(name = "format", defaultValue = "excel") String format) {

        String collegeName = userService.getCollegeName(collegeId);
        byte[] report = userService.exportUsersByRole(collegeId, User.Role.STUDENT, branch, batch, gender, format);

        if (report == null || report.length == 0) {
            throw new ResourceNotFoundException("No students found in " + collegeName + " for the selected filters.");
        }

        return createReportResponse(report, collegeName + "_Students", format);
    }

    @PutMapping("/{id}/toggle-restriction")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.isCollegeHead)")
    public ResponseEntity<?> toggleRestriction(@PathVariable String id,
            @RequestBody java.util.Map<String, Boolean> body) {
        userService.toggleRestriction(id, body.get("restrict"));
        return ResponseEntity.ok(java.util.Map.of("message", "Restriction toggled successfully"));
    }

    @PostMapping("/{id}/renew")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.isCollegeHead)")
    public ResponseEntity<?> renewAccount(@PathVariable String id, @RequestBody java.util.Map<String, Integer> body) {
        userService.renewAccount(id, body.get("months"));
        return ResponseEntity.ok(java.util.Map.of("message", "Account renewed successfully"));
    }

    @PostMapping("/bulk-renew")
    @PreAuthorize("hasAnyRole('ADMIN', 'SROTS_DEV') or (hasRole('CPH') and principal.isCollegeHead)")
    public ResponseEntity<?> bulkRenewAccounts(
            @RequestBody java.util.Map<String, List<java.util.Map<String, Object>>> body) {
        userService.bulkRenewAccounts(body.get("updates"));
        return ResponseEntity.ok(java.util.Map.of("message", "Accounts renewed successfully"));
    }

    private ResponseEntity<byte[]> createReportResponse(byte[] data, String fileName, String format) {
        String extension = "excel".equalsIgnoreCase(format) ? ".xlsx" : ".csv";

        MediaType mediaType = "excel".equalsIgnoreCase(format)
                ? MediaType.valueOf("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                : MediaType.TEXT_PLAIN;

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=" + fileName.replace(" ", "_") + extension)
                .contentType(mediaType)
                .body(data);
    }

}