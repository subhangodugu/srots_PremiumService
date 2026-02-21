package com.srots.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfile {

	@Id
	@Column(name = "user_id")
	private String userId;

	@OneToOne
	@MapsId
	@JoinColumn(name = "user_id")
	@JsonBackReference
	private User user;

	private String rollNumber;
	private String branch;
	private String course = "B.Tech";
	private Integer batch;
	private String placementCycle;
	private String careerPath;

	@Enumerated(EnumType.STRING)
	private Gender gender;

	public enum Gender {
		MALE, FEMALE, OTHER;

		// Confirmation: This helper allows both API and Excel to work safely
		public static Gender fromString(String text) {
			if (text == null || text.isBlank())
				return null;
			for (Gender g : Gender.values()) {
				if (g.name().equalsIgnoreCase(text.trim())) {
					return g;
				}
			}
			return OTHER; // Default fallback
		}
	}

	private LocalDate dob;
	private String nationality;
	private String religion;
	private Boolean dayScholar = false;
	private String aadhaarNumber;
	private String drivingLicense;
	private String passportNumber;
	private LocalDate passportIssueDate;
	private LocalDate passportExpiryDate;

	private String personalEmail;
	private String instituteEmail;
	private String parentEmail;
	private String whatsappNumber;

	@Enumerated(EnumType.STRING)
	private ContactMethod preferredContactMethod;

	public enum ContactMethod {
		Phone, Email, WhatsApp;

		public static ContactMethod fromString(String text) {
			if (text == null || text.isBlank())
				return null;
			for (ContactMethod m : ContactMethod.values()) {
				if (m.name().equalsIgnoreCase(text.trim())) {
					return m;
				}
			}
			return null;
		}
	}

	@JsonProperty("linkedInProfile")
	private String linkedinProfile;
	private String fatherName;
	private String fatherOccupation;
	private String motherName;
	private String motherOccupation;
	private String parentPhone;
	private String mentor;
	private String advisor;
	private String coordinator;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "json")
	private String currentAddress;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "json")
	private String permanentAddress;

	private Boolean gapInStudies = false;
	private String gapDuration;
	@Column(columnDefinition = "TEXT")
	private String gapReason;

	private LocalDate premiumStartDate;
	private LocalDate premiumEndDate;

	@UpdateTimestamp
	private LocalDateTime updatedAt;

}