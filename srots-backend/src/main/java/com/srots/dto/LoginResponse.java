package com.srots.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
	private String token;
	private String userId;
	private String fullName;
	private String role;
	private String collegeId;
	private String username;
	private String accountStatus; // ADDED
	private String message; // ADDED
	private boolean premiumActive; // ADDED
}
