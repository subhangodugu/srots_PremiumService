package com.srots.service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

// Use .ss NOT .sl
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.srots.dto.EducationHistoryDTO;
import com.srots.dto.Student360Response;
import com.srots.dto.StudentProfileRequest;
import com.srots.dto.UserCreateRequest;
import com.srots.dto.UserFullProfileResponse;
import com.srots.exception.PasswordValidationException;
import com.srots.model.College;
import com.srots.model.EducationRecord;
import com.srots.model.Student;
import com.srots.model.StudentProfile;
import com.srots.model.User;
import com.srots.repository.ApplicationRepository;
import com.srots.repository.CollegeRepository;
import com.srots.repository.EducationRecordRepository;
import com.srots.repository.StudentRepository;
import com.srots.repository.StudentCertificationRepository;
import com.srots.repository.StudentExperienceRepository;
import com.srots.repository.StudentLanguageRepository;
import com.srots.repository.StudentProfileRepository;
import com.srots.repository.StudentProjectRepository;
import com.srots.repository.StudentPublicationRepository;
import com.srots.repository.StudentResumeRepository;
import com.srots.repository.StudentSkillRepository;
import com.srots.repository.StudentSocialLinkRepository;
import com.srots.repository.UserRepository;

@Service
public class UserAccountServiceImpl implements UserAccountService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private CollegeRepository collegeRepository;

	@Autowired
	private StudentRepository studentRepository;

	@Autowired
	private StudentProfileRepository studentProfileRepository;

	@Autowired
	private EducationRecordRepository educationRepository;

	@Autowired
	private StudentSkillRepository skillRepo;

	@Autowired
	private StudentLanguageRepository langRepo;

	@Autowired
	private StudentExperienceRepository expRepo;

	@Autowired
	private StudentProjectRepository projectRepo;

	@Autowired
	private StudentPublicationRepository pubRepo;

	@Autowired
	private StudentCertificationRepository certRepo;

	@Autowired
	private StudentSocialLinkRepository socialRepo;

	@Autowired
	private StudentResumeRepository resumeRepo;

	@Autowired
	private ApplicationRepository appRepo;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private EmailService emailService;

	private static final String AADHAAR_REGEX = "^[0-9]{12}$";

	@Override
	@Transactional
	public Object create(UserCreateRequest dto, String roleStr) {
		// 1. Strict Validation
		if (dto.getAadhaar() == null || !dto.getAadhaar().matches(AADHAAR_REGEX)) {
			throw new RuntimeException("Aadhaar must be exactly 12 digits and contain only numbers.");
		}
		if (userRepository.existsByEmail(dto.getEmail())) {
			throw new RuntimeException("Email " + dto.getEmail() + " is already registered.");
		}
		if (userRepository.existsByAadhaarNumber(dto.getAadhaar())) {
			throw new RuntimeException("Aadhaar Number " + dto.getAadhaar() + " already exists.");
		}

		User.Role role = User.Role.valueOf(roleStr.toUpperCase());
		User user = new User();

		College college = null;
		String cId = dto.getCollegeId();
		if (cId != null) {
			college = collegeRepository.findById(cId)
					.orElseThrow(() -> new RuntimeException("College not found for ID: " + cId));
		}

		// NEW: Roll Number Validation for Students
		if (role == User.Role.STUDENT) {
			if (dto.getStudentProfile() == null || dto.getStudentProfile().getRollNumber() == null) {
				throw new RuntimeException("Roll Number is required for students.");
			}

			String roll = dto.getStudentProfile().getRollNumber();
			if (userRepository.existsByCollegeIdAndRollNumber(dto.getCollegeId(), roll)) {
				throw new RuntimeException(
						"Roll Number " + roll + " is already assigned to another student in this college.");
			}
		}

		String finalUsername = generateUsername(dto, role, college);
		String rawPassword = generatePassword(finalUsername, dto.getAadhaar(), role);

		String userId;
		if (role == User.Role.STUDENT && dto.getStudentProfile() != null) {
			if (college == null || college.getCode() == null) {
				throw new RuntimeException("College code is required for student ID generation.");
			}
			userId = college.getCode() + "_" + dto.getStudentProfile().getRollNumber();
		} else {
			userId = UUID.randomUUID().toString();
		}

		user.setId(userId);
		user.setUsername(finalUsername);
		user.setPasswordHash(passwordEncoder.encode(rawPassword));
		user.setFullName(dto.getName());
		user.setEmail(dto.getEmail());
		user.setRole(role);
		user.setCollege(college);
		user.setAadhaarNumber(dto.getAadhaar());

		// Logic: Use top-level phone first; if null, try to get it from the profile
		String phoneToSet = dto.getPhone();

		user.setPhone(phoneToSet);

		user.setPhone(dto.getPhone());
		user.setDepartment(dto.getDepartment());
		user.setIsCollegeHead(dto.getIsCollegeHead() != null && dto.getIsCollegeHead());

		if (dto.getAddress() != null) {
			try {
				user.setAddressJson(objectMapper.writeValueAsString(dto.getAddress()));
			} catch (Exception e) {
				user.setAddressJson("{}");
			}
		}

		// 2. Map Student Profile using the UNIFIED helper
		if (role == User.Role.STUDENT && dto.getStudentProfile() != null) {
			StudentProfile profile = new StudentProfile();
			profile.setUserId(user.getId());
			profile.setUser(user);
			// Calling the shared mapping logic
			mapStudentProfile(profile, dto.getStudentProfile());
			user.setStudentProfile(profile);
		}

		User savedUser = userRepository.save(user);

		// 🔥 CREATE STUDENT PROFILE
		if (role == User.Role.STUDENT) {
			Student sEntity = new Student();
			sEntity.setId(savedUser.getId());
			sEntity.setUser(savedUser);
			sEntity.setName(savedUser.getFullName());
			sEntity.setEmail(savedUser.getEmail());
			sEntity.setAccountStatus("ACTIVE");
			sEntity.setPremiumActive(false);
			sEntity.setCreatedAt(java.time.LocalDateTime.now());
			if (savedUser.getCollege() != null) {
				sEntity.setCollegeId(savedUser.getCollege().getId());
			}
			studentRepository.save(sEntity);
		}

		if (role == User.Role.STUDENT && dto.getStudentProfile() != null) {
			saveEducationHistory(savedUser, dto.getStudentProfile());
		}

		sendWelcomeEmail(savedUser, rawPassword);
		return (role == User.Role.STUDENT) ? getFullUserProfile(savedUser.getId()) : savedUser;
	}

	@Override
	@Transactional
	public Object update(String id, UserCreateRequest dto) {
		// 1. Fetch User - This is where your error is likely triggered if the repo is
		// wrong
		User user = userRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("User with ID " + id + " not found"));

		// 2. Strict Aadhaar & Email Validation
		if (dto.getAadhaar() != null && !dto.getAadhaar().isBlank()) {
			if (!dto.getAadhaar().matches(AADHAAR_REGEX))
				throw new RuntimeException("Aadhaar must be 12 digits.");

			// ONLY check if it's taken if the Aadhaar is DIFFERENT from the current one
			if (!dto.getAadhaar().equals(user.getAadhaarNumber())) {
				userRepository.findByAadhaarNumber(dto.getAadhaar()).ifPresent(ex -> {
					if (!ex.getId().equals(id))
						throw new RuntimeException("Aadhaar already taken by another user.");
				});
				user.setAadhaarNumber(dto.getAadhaar());
			}
		}

		if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
			userRepository.findByEmail(dto.getEmail()).ifPresent(ex -> {
				if (!ex.getId().equals(id))
					throw new RuntimeException("Email already taken.");
			});
			user.setEmail(dto.getEmail());
		}

		// NEW: Roll Number Validation for Students
		if (user.getRole() == User.Role.STUDENT && dto.getStudentProfile() != null) {
			String newRoll = dto.getStudentProfile().getRollNumber();

			// Only check if the roll number is actually changing
			if (newRoll != null && !newRoll.equals(user.getStudentProfile().getRollNumber())) {
				if (userRepository.existsByCollegeIdAndRollNumberAndIdNot(user.getCollege().getId(), newRoll, id)) {
					throw new RuntimeException(
							"Cannot update: Roll Number " + newRoll + " is already taken by another student.");
				}
			}
		}

		// --- FIX 2: UPDATE USERNAME IF PROVIDED ---
		if (dto.getUsername() != null && !dto.getUsername().isBlank()) {
			// Only update if it's a "clean" username, or re-run generator if needed
			// For CP Staff, we usually want to keep the college prefix
			user.setUsername(dto.getUsername());
		}

		// 3. Update Basic Fields
		user.setFullName(dto.getName());
		user.setPhone(dto.getPhone());
		user.setDepartment(dto.getDepartment());
		user.setAlternativeEmail(dto.getAlternativeEmail());
		user.setAlternativePhone(dto.getAlternativePhone());
		user.setBio(dto.getBio());

		if (dto.getAvatarUrl() != null) {
			user.setAvatarUrl(dto.getAvatarUrl());
		}

		// --- FIX 3: UPDATE ADDRESS FOR CP STAFF ---
		if (dto.getAddress() != null) {
			try {
				user.setAddressJson(objectMapper.writeValueAsString(dto.getAddress()));
			} catch (Exception e) {
				user.setAddressJson("{}");
			}
		}

		// 4. Student Specific Mapping (Semester Updates)
		if (user.getRole() == User.Role.STUDENT && dto.getStudentProfile() != null) {
			StudentProfile profile = user.getStudentProfile();
			if (profile == null) {
				profile = new StudentProfile();
				profile.setUserId(user.getId());
				profile.setUser(user);
			}

			mapStudentProfile(profile, dto.getStudentProfile());
			user.setStudentProfile(profile);

			// This allows the CP Admin to update Semester data/CGPA
			if (dto.getStudentProfile().getEducationHistory() != null) {
				educationRepository.deleteByStudentId(id);
				saveEducationHistory(user, dto.getStudentProfile());
			}
		}

		User savedUser = userRepository.save(user);

		return (savedUser.getRole() == User.Role.STUDENT) ? getFullUserProfile(savedUser.getId()) : savedUser;
	}

	/**
	 * UNIFIED MAPPING HELPER This is the only place you need to change code if
	 * student fields change.
	 */
	private void mapStudentProfile(StudentProfile profile, StudentProfileRequest spDto) {
		// Academic Identity
		profile.setRollNumber(spDto.getRollNumber());
		profile.setBranch(spDto.getBranch());
		profile.setBatch(spDto.getBatch());
		profile.setCourse(spDto.getCourse() != null ? spDto.getCourse() : "B.Tech");
		profile.setPlacementCycle(spDto.getPlacementCycle());

		// --- NEW: Premium Dates Logic (18 Months) ---
		// Only set these if they aren't already set (prevents overwriting on update)
		if (profile.getPremiumStartDate() == null) {
			LocalDate now = LocalDate.now();
			profile.setPremiumStartDate(now);
			profile.setPremiumEndDate(now.plusMonths(18));
		}

		// Personal & Identity
		if (spDto.getGender() != null)
			profile.setGender(StudentProfile.Gender.fromString(spDto.getGender()));
		if (spDto.getDob() != null) {
			try {
				profile.setDob(LocalDate.parse(spDto.getDob()));
			} catch (Exception e) {
			}
		}
		profile.setNationality(spDto.getNationality());
		profile.setReligion(spDto.getReligion());

		// Contact & Administration
		profile.setMentor(spDto.getMentor());
		profile.setAdvisor(spDto.getAdvisor());
		profile.setCoordinator(spDto.getCoordinator());
		profile.setInstituteEmail(spDto.getInstituteEmail());
		profile.setPersonalEmail(spDto.getPersonalEmail());
		profile.setWhatsappNumber(spDto.getWhatsappNumber());

		// LinkedIn and Professional
		if (spDto.getLinkedInProfile() != null) {
			profile.setLinkedinProfile(spDto.getLinkedInProfile());
		}
		profile.setCareerPath(spDto.getCareerPath());
		profile.setDrivingLicense(spDto.getDrivingLicense());
		profile.setPreferredContactMethod(StudentProfile.ContactMethod.fromString(spDto.getPreferredContactMethod()));

		// Passport Details
		profile.setPassportNumber(spDto.getPassportNumber());
		if (spDto.getPassportIssueDate() != null) {
			try {
				profile.setPassportIssueDate(LocalDate.parse(spDto.getPassportIssueDate()));
			} catch (Exception e) {
			}
		}
		if (spDto.getPassportExpiryDate() != null) {
			try {
				profile.setPassportExpiryDate(LocalDate.parse(spDto.getPassportExpiryDate()));
			} catch (Exception e) {
			}
		}

		// Gaps & Other
		profile.setDayScholar(spDto.getDayScholar() != null ? spDto.getDayScholar() : false);
		profile.setGapInStudies(spDto.getGapInStudies() != null ? spDto.getGapInStudies() : false);
		profile.setGapDuration(spDto.getGapDuration());
		profile.setGapReason(spDto.getGapReason());

		// Family Details
		profile.setFatherName(spDto.getFatherName());
		profile.setMotherName(spDto.getMotherName());
		profile.setFatherOccupation(spDto.getFatherOccupation());
		profile.setMotherOccupation(spDto.getMotherOccupation());
		profile.setParentPhone(spDto.getParentPhone());
		profile.setParentEmail(spDto.getParentEmail());

		// --- IMPROVED: Address Handling (Avoids "null" strings) ---
		try {
			profile.setCurrentAddress(
					spDto.getCurrentAddress() != null ? objectMapper.writeValueAsString(spDto.getCurrentAddress())
							: "{}");
			profile.setPermanentAddress(
					spDto.getPermanentAddress() != null ? objectMapper.writeValueAsString(spDto.getPermanentAddress())
							: "{}");
		} catch (Exception e) {
			profile.setCurrentAddress("{}");
			profile.setPermanentAddress("{}");
		}
	}

	@Override
	public void resendCredentials(String userId) {
		// 1. Fetch User
		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

		// 2. Re-generate the "Raw" password using the existing logic
		// Note: This works because your generatePassword logic is based on
		// data we already have (Username, Aadhaar, Role).
		String rawPassword = generatePassword(user.getUsername(), user.getAadhaarNumber(), user.getRole());

		// 3. Send the Email
		sendWelcomeEmail(user, rawPassword);
	}

	/**
	 * Handles Education history and AUTOMATICALLY calculates CGPA from semesters.
	 * Prioritizes calculated average over user-inputted score for Undergraduate
	 * records.
	 */
	private void saveEducationHistory(User user, StudentProfileRequest spDto) {
		if (spDto.getEducationHistory() == null)
			return;

		// 1. Identify if this student is a Diploma/Lateral Entry student
		boolean isLateralEntry = spDto.getEducationHistory().stream()
				.anyMatch(edu -> "Diploma".equalsIgnoreCase(edu.getLevel()));

		for (EducationHistoryDTO edu : spDto.getEducationHistory()) {

			// Validation: If level is missing, skip or throw a clearer error
			if (edu.getLevel() == null || edu.getLevel().isBlank()) {
				System.err.println("Skipping education record: Level is null for student " + user.getUsername());
				continue;
			}

			EducationRecord.EducationLevel parsedLevel = EducationRecord.EducationLevel.fromString(edu.getLevel());
			if (parsedLevel == null) {
				throw new RuntimeException("Unrecognized Education Level: '" + edu.getLevel()
						+ "'. Expected 'Class 10', 'Class 12', 'Diploma', or 'Undergraduate'.");
			}

			EducationRecord record = new EducationRecord();
			record.setId(java.util.UUID.randomUUID().toString());
			record.setStudent(user);
			record.setLevel(parsedLevel);

			record.setInstitution(edu.getInstitution());
			record.setBoard(edu.getBoard());
			record.setYearOfPassing(edu.getYearOfPassing());

			// --- AUTOMATIC CGPA CALCULATION LOGIC ---
			List<?> semesters = edu.getSemesters();
			String finalScore = edu.getScore(); // Default to manual input initially

			if (semesters != null && !semesters.isEmpty()) {
				// Adjust indices for Lateral Entry (Start from Sem 3)
				if (isLateralEntry && "Undergraduate".equalsIgnoreCase(edu.getLevel())) {
					semesters = adjustSemestersForLateralEntry(semesters);
				}

				double totalGpa = 0.0;
				int count = 0;

				for (Object sem : semesters) {
					if (sem instanceof java.util.Map) {
						java.util.Map<?, ?> map = (java.util.Map<?, ?>) sem;
						Object sgpaObj = map.get("sgpa");

						if (sgpaObj != null && !sgpaObj.toString().isBlank()) {
							try {
								double sgpa = Double.parseDouble(sgpaObj.toString());

								// VALIDATION: Prevent impossible SGPA values
								if (sgpa > 10.0) {
									throw new RuntimeException(
											"Invalid SGPA detected: " + sgpa + ". SGPA cannot exceed 10.0");
								}

								if (sgpa > 0) {
									totalGpa += sgpa;
									count++;
								}
							} catch (NumberFormatException e) {
								// Ignore non-numeric SGPA entries (like "N/A")
							}
						}
					}
				}

				// OVERWRITE: If we have semester data, calculate the average CGPA
				if (count > 0) {
					double calculatedCgpa = totalGpa / count;
					finalScore = String.format("%.2f", calculatedCgpa);
				}

				try {
					record.setSemestersData(objectMapper.writeValueAsString(semesters));
				} catch (Exception e) {
					record.setSemestersData("[]");
				}
			} else {
				record.setSemestersData("[]");
			}

			// Apply the calculated (or validated) score
			record.setScoreDisplay(finalScore);

			if (edu.getScoreType() != null) {
				record.setScoreType(EducationRecord.ScoreType.fromString(edu.getScoreType()));
			}

			record.setSpecialization(edu.getSpecialization());
			record.setCurrentArrears(edu.getCurrentArrears() != null ? edu.getCurrentArrears() : 0);

			educationRepository.save(record);
		}
	}

	/**
	 * Helper to ensure Diploma students start from Sem 3. If data was sent in Sem 1
	 * slot, it moves it to Sem 3.
	 */
	private List<Object> adjustSemestersForLateralEntry(List<?> originalSemesters) {
		List<Object> adjusted = new java.util.ArrayList<>();

		for (int i = 0; i < originalSemesters.size(); i++) {
			Object semData = originalSemesters.get(i);

			if (semData instanceof java.util.Map) {
				// Create a copy of the map to avoid modifying the original list
				java.util.Map<String, Object> map = new java.util.HashMap<>((java.util.Map<String, Object>) semData);

				// LOGIC: No matter what the input index is, the first entry
				// for a Diploma student in B.Tech is stored as "Sem 3"
				map.put("sem", "Sem " + (i + 3));
				adjusted.add(map);
			} else {
				adjusted.add(semData);
			}

			// Safety: B.Tech degree doesn't go beyond Sem 8
			if (i + 3 >= 8)
				break;
		}
		return adjusted;
	}

	private String generateUsername(UserCreateRequest dto, User.Role role, College college) {
		// 1. Validation: CPH and STUDENT MUST have a college for prefixing
		if ((role == User.Role.CPH || role == User.Role.STAFF || role == User.Role.STUDENT) && college == null) {
			throw new RuntimeException("A valid College is required to generate usernames for CPH or STUDENT roles.");
		}

		// 2. Fallback Logic: If username is null/blank, use first 4 digits of Aadhaar
		String userPart = dto.getUsername();
		if (userPart == null || userPart.isBlank()) {
			if (dto.getAadhaar() != null && dto.getAadhaar().length() >= 4) {
				userPart = dto.getAadhaar().substring(0, 4);
			} else {
				// Last resort: if Aadhaar is also missing/short, use a random short UUID string
				userPart = UUID.randomUUID().toString().substring(0, 4);
			}
		}

		switch (role) {
			case ADMIN:
				return "ADMIN_" + userPart;

			case SROTS_DEV:
				return "DEV_" + userPart;

			case CPH:
				// String prefix = (dto.getIsCollegeHead() != null && dto.getIsCollegeHead()) ?
				// "CPADMIN_" : "CPSTAFF_";
				String cpadmin = "CPADMIN_";
				// Example: SRM_CPSTAFF_5544
				return college.getCode() + "_" + cpadmin + userPart;
			case STAFF:
				// String prefix = (dto.getIsCollegeHead() != null && dto.getIsCollegeHead()) ?
				// "CPADMIN_" : "CPSTAFF_";
				String cpstaff = "CPSTAFF_";
				// Example: SRM_CPSTAFF_5544
				return college.getCode() + "_" + cpstaff + userPart;

			case STUDENT:
				if (dto.getStudentProfile() == null || dto.getStudentProfile().getRollNumber() == null) {
					throw new RuntimeException("Roll Number is required for Student username generation.");
				}
				// Students always use Roll Number as the unique identifier
				return college.getCode() + "_" + dto.getStudentProfile().getRollNumber();

			default:
				return userPart;
		}
	}

	private String generatePassword(String finalUsername, String aadhaar, User.Role role) {
		if (aadhaar == null || aadhaar.length() < 12) {
			throw new PasswordValidationException("Invalid Aadhaar: 12 digits required for password generation.");
		}

		String suffix;
		if (role == User.Role.ADMIN || role == User.Role.SROTS_DEV) {
			suffix = aadhaar.substring(0, 4);
		} else if (role == User.Role.CPH || role == User.Role.STAFF) {
			suffix = aadhaar.substring(4, 8);
		} else {
			suffix = aadhaar.substring(8, 12); // Last 4 digits for students
		}

		// Add a '@' and ensure the username part has a capital letter
		// to satisfy the Global Password Policy automatically.
		return finalUsername.toUpperCase() + "@" + suffix;
	}

	@Override
	@Transactional
	public void delete(String id) {
		User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

		String userEmail = user.getEmail();
		String fullName = user.getFullName();
		// 1. Delete associated student data if applicable
		if (user.getRole() == User.Role.STUDENT) {
			educationRepository.deleteByStudentId(id);
			// Add other repos (skills, projects, etc.) if they don't have
			// CascadeType.REMOVE
		}

		// 2. Remove the user (this cleans up the StudentProfile if Cascade is set)
		userRepository.delete(user);

		// 4. SEND DELETION NOTIFICATION
		sendAccountDeletedEmail(userEmail, fullName);
	}

	@Override
	public User getById(String id) {
		return userRepository.findById(id).orElse(null);
	}

	// 5. GET FULL PROFILE (The "Deep Fetch" method)
	public UserFullProfileResponse getFullUserProfile(String userId) {
		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

		// Explicitly initialize the proxy if you aren't using @JsonIgnore
		if (user.getCollege() != null) {
			user.getCollege().getId();
		}

		UserFullProfileResponse response = new UserFullProfileResponse();
		response.setUser(user);

		// If user is a student, attach their specialized data
		if (user.getRole() == User.Role.STUDENT) {
			response.setProfile(studentProfileRepository.findById(userId).orElse(null));
			response.setEducationHistory(educationRepository.findByStudentId(userId));
		}

		return response;
	}

	@Override
	@Transactional(readOnly = true)
	public Student360Response getStudent360(String userId) {
		// 1. Core User check
		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Student not found"));

		if (user.getRole() != User.Role.STUDENT) {
			throw new RuntimeException("Access Denied: Not a student account");
		}

		// Explicitly initialize the proxy if you aren't using @JsonIgnore
		if (user.getCollege() != null) {
			user.getCollege().getId();
		}

		Student360Response dto = new Student360Response();

		// 2. Fetch all related data in parallel (or sequence)
		dto.setUser(user);
		dto.setProfile(studentProfileRepository.findById(userId).orElse(null));

		// These use the 'student_id' foreign key from your SQL dump
		dto.setEducation(educationRepository.findByStudentId(userId));
		dto.setSkills(skillRepo.findByStudentId(userId));
		dto.setLanguages(langRepo.findByStudentId(userId));
		dto.setExperience(expRepo.findByStudentId(userId));
		dto.setProjects(projectRepo.findByStudentId(userId));
		dto.setPublications(pubRepo.findByStudentId(userId));
		dto.setCertifications(certRepo.findByStudentId(userId));
		dto.setSocialLinks(socialRepo.findByStudentId(userId));
		dto.setResumes(resumeRepo.findByStudentId(userId));
		dto.setApplications(appRepo.findByStudentId(userId));

		return dto;
	}

	@Override
	@Transactional
	public void updateAvatarOnly(String userId, String url) {
		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
		user.setAvatarUrl(url);
		userRepository.save(user);
	}

	// Add this to your UserService Implementation
	public List<User> getFilteredUsers(String collegeId, User.Role role, String branch, Integer batch, String gender,
			String search) {
		List<User> users;

		// 1. Initial Fetch (Global vs College)
		if (collegeId != null && role != null) {
			users = userRepository.findByCollegeIdAndRole(collegeId, role);
		} else if (collegeId != null) {
			users = userRepository.findByCollegeId(collegeId);
		} else if (role != null) {
			users = userRepository.findByRole(role);
		} else {
			users = userRepository.findAll();
		}

		// 2. Apply Dynamic Filters
		return users.stream()
				.filter(u -> (branch == null || branch.isBlank()) ||
						(u.getDepartment() != null && u.getDepartment().equalsIgnoreCase(branch.trim())))
				.filter(u -> {
					if (gender == null || gender.isBlank())
						return true;
					return u.getStudentProfile() != null && u.getStudentProfile().getGender() != null &&
							u.getStudentProfile().getGender().name().equalsIgnoreCase(gender.trim());
				})
				.filter(u -> (batch == null) ||
						(u.getStudentProfile() != null && batch.equals(u.getStudentProfile().getBatch())))

				// --- UPDATED SEARCH FILTER (Name, Username, Email, Roll Number) ---
				.filter(u -> {
					if (search == null || search.isBlank())
						return true;
					String lowerSearch = search.toLowerCase().trim();

					boolean matchesFullName = u.getFullName() != null
							&& u.getFullName().toLowerCase().contains(lowerSearch);
					boolean matchesUsername = u.getUsername() != null
							&& u.getUsername().toLowerCase().contains(lowerSearch);
					boolean matchesEmail = u.getEmail() != null && u.getEmail().toLowerCase().contains(lowerSearch);
					boolean matchesRoll = (u.getStudentProfile() != null
							&& u.getStudentProfile().getRollNumber() != null) &&
							u.getStudentProfile().getRollNumber().toLowerCase().contains(lowerSearch);

					return matchesFullName || matchesUsername || matchesEmail || matchesRoll;
				})
				.collect(Collectors.toList());
	}

	// Missing Helper Method
	public String getCollegeName(String collegeId) {
		return collegeRepository.findById(collegeId).map(College::getName).orElse("College");
	}

	@Override
	public byte[] exportUsersByRole(String collegeId, User.Role role, String branch, Integer batch, String gender,
			String format) {
		List<User> users;

		// 1. Fetch data based on scope
		if (collegeId == null) {
			users = userRepository.findByRole(role);
		} else {
			users = userRepository.findByCollegeIdAndRole(collegeId, role);
		}

		// 2. Apply Dynamic Filters (Strict Version)
		users = users.stream()
				.filter(u -> {
					if (branch == null || branch.isBlank())
						return true;
					return u.getDepartment() != null && u.getDepartment().equalsIgnoreCase(branch.trim());
				})
				.filter(u -> {
					// If the variable 'gender' is null, it means the URL key was wrong (e.g.,
					// 'Gender')
					// or not provided.
					if (gender == null || gender.isBlank())
						return true;

					if (u.getStudentProfile() == null || u.getStudentProfile().getGender() == null)
						return false;

					// This is where Arjun gets blocked if gender="FEMALE"
					return u.getStudentProfile().getGender().name().equalsIgnoreCase(gender.trim());
				})
				.filter(u -> {
					if (batch == null)
						return true;
					return u.getStudentProfile() != null && batch.equals(u.getStudentProfile().getBatch());
				})
				.collect(Collectors.toList());

		// 3. Map to Report Rows
		List<ReportRow> reportData = users.stream().map(user -> {
			String city = extractCityFromJson(user.getAddressJson());

			String rollOrUsername = (user.getRole() == User.Role.STUDENT && user.getStudentProfile() != null)
					? user.getStudentProfile().getRollNumber()
					: user.getUsername();

			// Safe Enum to String conversion for the report
			String genderVal = (user.getStudentProfile() != null && user.getStudentProfile().getGender() != null)
					? user.getStudentProfile().getGender().name()
					: "N/A";

			String batchVal = (user.getStudentProfile() != null && user.getStudentProfile().getBatch() != null)
					? String.valueOf(user.getStudentProfile().getBatch())
					: "N/A";

			String headStatus = Boolean.TRUE.equals(user.getIsCollegeHead()) ? "Yes" : "No";

			return new ReportRow(user.getCollege() != null ? user.getCollege().getName() : "SROTS", rollOrUsername,
					user.getFullName(), user.getEmail(), user.getPhone(),
					user.getDepartment() != null ? user.getDepartment() : "N/A", genderVal, batchVal, city, headStatus);
		}).collect(Collectors.toList());

		return generateExportFile(reportData, role, format);
	}

	// Helper method to extract city from JSON string
	private String extractCityFromJson(String json) {
		try {
			if (json != null && !json.isBlank()) {
				JsonNode node = objectMapper.readTree(json);
				return node.has("city") ? node.get("city").asText() : "N/A";
			}
		} catch (Exception e) {
			return "N/A";
		}
		return "N/A";
	}

	private byte[] generateExportFile(List<ReportRow> data, User.Role role, String format) {
		boolean isStudent = (role == User.Role.STUDENT);
		Map<String, Long> branchCounts = data.stream()
				.collect(Collectors.groupingBy(ReportRow::getDept, Collectors.counting()));

		try {
			if ("csv".equalsIgnoreCase(format)) {
				StringBuilder sb = new StringBuilder();
				if (isStudent) {
					sb.append("College,Roll Number,Full Name,Email,Phone,Department,Gender,Batch,City\n");
				} else {
					// Removed Gender from CP header as it's usually empty for staff,
					// but if you want it, add "Gender" to the string below:
					sb.append("College,Username,Full Name,Email,Phone,Department,City,College Head\n");
				}

				for (ReportRow row : data) {
					if (isStudent) {
						sb.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
								row.collegeName, row.id, row.fullName, row.email, row.phone, row.dept, row.gender,
								row.batch, row.city));
					} else {
						// FIXED: Removed 'row.gender' to match the 8-column CP header
						sb.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
								row.collegeName, row.id, row.fullName, row.email, row.phone, row.dept, row.city,
								row.isHead));
					}
				}
				sb.append("\nBRANCH SUMMARY\nBranch,Count\n");
				branchCounts.forEach((dept, count) -> sb.append(dept).append(",").append(count).append("\n"));
				return sb.toString().getBytes();
			} else {
				try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
					org.apache.poi.ss.usermodel.Sheet sheet = workbook.createSheet("Report");

					CellStyle headerStyle = workbook.createCellStyle();
					Font font = workbook.createFont();
					font.setBold(true);
					headerStyle.setFont(font);

					String[] headers = isStudent
							? new String[] { "College", "Roll Number", "Full Name", "Email", "Phone", "Department",
									"Gender", "Batch", "City" }
							: new String[] { "College", "Username", "Full Name", "Email", "Phone", "Department", "City",
									"College Head" };

					Row hRow = sheet.createRow(0);
					for (int i = 0; i < headers.length; i++) {
						Cell c = hRow.createCell(i);
						c.setCellValue(headers[i]);
						c.setCellStyle(headerStyle);
					}

					int idx = 1;
					for (ReportRow row : data) {
						Row r = sheet.createRow(idx++);
						r.createCell(0).setCellValue(row.collegeName);
						r.createCell(1).setCellValue(row.id);
						r.createCell(2).setCellValue(row.fullName);
						r.createCell(3).setCellValue(row.email);
						r.createCell(4).setCellValue(row.phone);
						r.createCell(5).setCellValue(row.dept);
						r.createCell(6).setCellValue(row.gender);
						if (isStudent) {
							r.createCell(7).setCellValue(row.batch);
							r.createCell(8).setCellValue(row.city);
						} else {
							r.createCell(7).setCellValue(row.city);
							r.createCell(8).setCellValue(row.isHead);
						}
					}

					idx++;
					Row sTitle = sheet.createRow(idx++);
					Cell sCell = sTitle.createCell(0);
					sCell.setCellValue("BRANCH SUMMARY");
					sCell.setCellStyle(headerStyle);
					for (Map.Entry<String, Long> entry : branchCounts.entrySet()) {
						Row r = sheet.createRow(idx++);
						r.createCell(0).setCellValue(entry.getKey());
						r.createCell(1).setCellValue(entry.getValue());
					}
					for (int i = 0; i < headers.length; i++)
						sheet.autoSizeColumn(i);
					workbook.write(out);
					return out.toByteArray();
				}
			}
		} catch (Exception e) {
			throw new RuntimeException("Export failed: " + e.getMessage());
		}
	}

	private static class ReportRow {
		String collegeName, id, fullName, email, phone, dept, gender, batch, city, isHead;

		ReportRow(String cn, String id, String fn, String em, String ph, String dp, String gn, String bt, String ct,
				String hd) {
			this.collegeName = cn;
			this.id = id;
			this.fullName = fn;
			this.email = em;
			this.phone = ph;
			this.dept = dp;
			this.gender = gn;
			this.batch = bt;
			this.city = ct;
			this.isHead = hd;
		}

		public String getDept() {
			return dept;
		}
	}

	@Override
	@Transactional
	public void renewAccount(String userId, int months) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

		if (user.getRole() != User.Role.STUDENT) {
			throw new RuntimeException("Only student accounts can be renewed");
		}

		Student student = studentRepository.findByUserId(userId)
				.orElseThrow(() -> new RuntimeException("Student profile not found for user: " + userId));

		LocalDate currentExpiry = student.getPremiumExpiryDate();
		if (currentExpiry == null || currentExpiry.isBefore(LocalDate.now())) {
			currentExpiry = LocalDate.now();
		}

		student.setPremiumExpiryDate(currentExpiry.plusMonths(months));
		student.setPremiumActive(true);
		student.setAccountStatus("ACTIVE");

		studentRepository.save(student);
		userRepository.save(user);
	}

	@Override
	@Transactional
	public void bulkRenewAccounts(List<Map<String, Object>> updates) {
		for (Map<String, Object> update : updates) {
			String id = (String) update.get("id");
			Integer months = (Integer) update.get("months");
			if (id != null && months != null) {
				renewAccount(id, months);
			}
		}
	}

	@Override
	@Transactional
	public void toggleRestriction(String userId, boolean restrict) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

		user.setIsRestricted(restrict);
		userRepository.save(user);
	}

	// --- Helper Email Methods ---

	private void sendWelcomeEmail(User user, String rawPassword) {
		String htmlContent = "<h2>Welcome to SROTS, " + user.getFullName() + "!</h2>"
				+ "<p>Your account has been created successfully. Here are your login credentials:</p>"
				+ "<div style='background-color: #f4f4f4; padding: 15px; border-radius: 5px;'>"
				+ "<strong>Username:</strong> " + user.getUsername() + "<br>" + "<strong>Temporary Password:</strong> "
				+ rawPassword + "</div>" + "<p>Please login and change your password immediately for security.</p>"
				+ "<a href='http://localhost:3000/login'>Click here to Login</a>";

		emailService.sendEmail(user.getEmail(), "Your SROTS Account Credentials", htmlContent);
	}

	private void sendAccountDeletedEmail(String email, String name) {
		String htmlContent = "<h3>Account Deletion Notice</h3>" + "<p>Hello " + name + ",</p>"
				+ "<p>This email is to confirm that your SROTS account has been deleted.</p>"
				+ "<p>If you believe this was a mistake, please contact your college administrator.</p>";

		emailService.sendEmail(email, "SROTS Account Deleted", htmlContent);
	}

}