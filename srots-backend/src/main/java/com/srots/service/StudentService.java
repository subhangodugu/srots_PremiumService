package com.srots.service;

import org.springframework.web.multipart.MultipartFile;

import com.srots.dto.AddressRequest;
import com.srots.dto.StudentProfileRequest;
import com.srots.dto.studentDTOs.SectionRequest;
import com.srots.model.StudentCertification;
import com.srots.model.StudentExperience;
import com.srots.model.StudentLanguage;
import com.srots.model.StudentProfile;
import com.srots.model.StudentProject;
import com.srots.model.StudentPublication;
import com.srots.model.StudentResume;
import com.srots.model.StudentSkill;
import com.srots.model.StudentSocialLink;

import java.util.List;
import java.util.Map;

public interface StudentService {

	public StudentProfile updateGeneralProfile(String studentId, StudentProfileRequest dto);

	public StudentProfile updateAddress(String studentId, String type, AddressRequest dto);

	public Object manageSkill(String studentId, SectionRequest<StudentSkill> request);

	public void removeSkill(String studentId, String skillId);

	public StudentResume uploadResume(String studentId, MultipartFile file);

	public String deleteResume(String studentId, String resumeId);

	public void setDefaultResume(String studentId, String resumeId);

	public Object manageProject(String studentId, SectionRequest<StudentProject> request);

	public void removeProject(String studentId, String projectId);

	public Object manageCertification(String studentId, SectionRequest<StudentCertification> request);

	public void removeCertification(String studentId, String certId);

	public Object manageSocialLink(String studentId, SectionRequest<StudentSocialLink> request);

	public void removeSocialLink(String studentId, String linkId);

	public Object manageLanguage(String studentId, SectionRequest<StudentLanguage> request);

	public void removeLanguage(String studentId, String langId);

	public Object manageExperience(String studentId, SectionRequest<StudentExperience> request);

	public void removeExperience(String studentId, String expId);

	public Object managePublication(String studentId, SectionRequest<StudentPublication> request);

	public void removePublication(String studentId, String pubId);

	public List<com.srots.model.Student> getExpiringStudents(String collegeId);

	public Map<String, Long> getAccountStats(String collegeId);

}
