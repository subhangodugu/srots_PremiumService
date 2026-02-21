package com.srots.controller;

import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.srots.dto.LoginRequest;
import com.srots.dto.LoginResponse;
import com.srots.dto.ResetPasswordRequest;
import com.srots.model.User;
import com.srots.repository.UserRepository;
import com.srots.service.AuthenticateService;
import com.srots.service.EmailService;
import com.srots.service.JwtService;
import com.srots.repository.StudentRepository;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

	@Autowired
	private AuthenticationManager authenticationManager;

	@Autowired
	private JwtService jwtService;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	AuthenticateService authService;

	@Autowired
	EmailService emailService;

	@Autowired
	private StudentRepository studentRepository;

	@Autowired
	private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

	@PostMapping("/login")
	public ResponseEntity<?> authenticate(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
		System.out.println("--- START AUTH DEBUG ---");
		try {
			// 1. Fetch User FIRST (to support Multi-Identifier and Restriction Check)
			User user = userRepository.findByEmailOrUsername(request.getUsername(), request.getUsername())
					.orElseThrow(() -> new RuntimeException("User not found"));

			// 🚫 HARD BLOCK — ADMIN RESTRICTION on User
			if (Boolean.TRUE.equals(user.getIsRestricted())) {
				System.out.println("Blocked: User is RESTRICTED: " + user.getUsername());
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body(java.util.Map.of(
						"accountStatus", "RESTRICTED",
						"message", "Your account has been restricted by admin"));
			}

			// 2. DEBUG LOGS FOR PASSWORD MATCHING
			System.out.println("RAW PASSWORD RECEIVED: " + request.getPassword());
			System.out.println("HASH IN DB: " + user.getPasswordHash());
			boolean isMatch = passwordEncoder != null
					&& passwordEncoder.matches(request.getPassword(), user.getPasswordHash());
			System.out.println("PASSWORD MATCH RESULT: " + isMatch);

			// 3. Authenticate via AuthenticationManager
			authenticationManager.authenticate(
					new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

			// ✅ NON-STUDENT → Direct access if authenticated
			if (user.getRole() != User.Role.STUDENT) {
				String token = jwtService.generateToken(user);
				updateDeviceInfo(user, request, httpRequest);

				return ResponseEntity.ok(LoginResponse.builder()
						.token(token)
						.userId(user.getId())
						.fullName(user.getFullName())
						.username(user.getUsername())
						.role(user.getRole().name())
						.collegeId(user.getCollege() != null ? user.getCollege().getId() : null)
						.accountStatus("ACTIVE")
						.message("Login successful")
						.build());
			}

			// ✅ STUDENT PREMIUM CHECK
			com.srots.model.Student student = studentRepository.findByUserId(user.getId())
					.orElseThrow(() -> new RuntimeException("Student profile not found"));

			// 🚫 Step 4: Restricted Check on Student Entity
			if ("RESTRICTED".equalsIgnoreCase(student.getAccountStatus())) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body(java.util.Map.of(
						"accountStatus", "RESTRICTED",
						"message", "Your account is restricted. Contact admin."));
			}

			// 🚀 Step 6: Compute Premium Validity
			boolean premiumActive = false;
			if (student.isPremiumActive() && student.getPremiumExpiryDate() != null &&
					student.getPremiumExpiryDate().isAfter(LocalDate.now())) {
				premiumActive = true;
			}

			// ✅ Step 7: Build Login Response for Student
			String token = jwtService.generateToken(user);
			updateDeviceInfo(user, request, httpRequest);

			return ResponseEntity.ok(LoginResponse.builder()
					.token(token)
					.userId(user.getId())
					.fullName(user.getFullName())
					.username(user.getUsername())
					.role("STUDENT")
					.collegeId(user.getCollege() != null ? user.getCollege().getId() : null)
					.accountStatus(premiumActive ? "ACTIVE" : "HOLD")
					.premiumActive(premiumActive)
					.message(premiumActive ? "Login successful" : "Premium required to access job features")
					.build());

		} catch (AuthenticationException e) {
			System.out.println("Auth Failed for: " + request.getUsername() + " | Error: " + e.getMessage());
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
		} catch (Exception e) {
			System.err.println("Internal Error during login: " + e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
		} finally {
			System.out.println("--- END AUTH DEBUG ---");
		}
	}

	private void updateDeviceInfo(User user, LoginRequest request, HttpServletRequest httpRequest) {
		try {
			String rawUserAgent = httpRequest.getHeader("User-Agent");
			String currentDevice = parseUserAgent(rawUserAgent);
			String clientIp = getClientIp(httpRequest);

			if (user.getLastDeviceInfo() == null || !currentDevice.equals(user.getLastDeviceInfo())) {
				sendLoginAlertEmail(user, currentDevice, clientIp);
				user.setLastDeviceInfo(currentDevice);
				userRepository.save(user);
			}
		} catch (Exception e) {
			System.err.println("Silent error updating device info: " + e.getMessage());
		}
	}

	/**
	 * Helper to clean up the technical User-Agent string.
	 * Example: Transforms a long string into "Chrome on Windows"
	 */
	/**
	 * Helper to extract the real IP Address, even if behind a proxy/load balancer.
	 */
	private String getClientIp(HttpServletRequest request) {
		String remoteAddr = "";
		if (request != null) {
			remoteAddr = request.getHeader("X-Forwarded-For");
			if (remoteAddr == null || "".equals(remoteAddr)) {
				remoteAddr = request.getRemoteAddr();
			}
		}
		// If there are multiple IPs in X-Forwarded-For, take the first one
		return remoteAddr.contains(",") ? remoteAddr.split(",")[0] : remoteAddr;
	}

	/**
	 * Helper to clean up technical User-Agent string.
	 */
	private String parseUserAgent(String userAgent) {
		if (userAgent == null || userAgent.isEmpty())
			return "Unknown Device";
		String browser = "Unknown Browser";
		String os = "Unknown OS";

		// Detect OS
		if (userAgent.toLowerCase().contains("windows"))
			os = "Windows";
		else if (userAgent.toLowerCase().contains("mac"))
			os = "Macintosh";
		else if (userAgent.toLowerCase().contains("x11"))
			os = "Linux";
		else if (userAgent.toLowerCase().contains("android"))
			os = "Android";
		else if (userAgent.toLowerCase().contains("iphone"))
			os = "iPhone";

		// Detect Browser
		if (userAgent.toLowerCase().contains("edg"))
			browser = "Edge";
		else if (userAgent.toLowerCase().contains("chrome"))
			browser = "Chrome";
		else if (userAgent.toLowerCase().contains("safari") && !userAgent.toLowerCase().contains("chrome"))
			browser = "Safari";
		else if (userAgent.toLowerCase().contains("firefox"))
			browser = "Firefox";
		else if (userAgent.toLowerCase().contains("postman"))
			browser = "Postman";

		return browser + " on " + os;
	}

	private void sendLoginAlertEmail(User user, String deviceName, String ipAddress) {
		String currentTime = java.time.LocalDateTime.now()
				.format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

		String htmlContent = "<div style='font-family: Arial, sans-serif; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px;'>"
				+
				"<h2 style='color: #d9534f;'>Security Alert: New Login</h2>" +
				"<p>Hello <b>" + user.getFullName() + "</b>,</p>" +
				"<p>Your SROTS account was just accessed from a new device/browser. Details are provided below:</p>" +
				"<table style='width: 100%; background: #f9f9f9; padding: 15px; border-radius: 8px;'>" +
				"<tr><td><b>Device:</b></td><td>" + deviceName + "</td></tr>" +
				"<tr><td><b>IP Address:</b></td><td>" + ipAddress + "</td></tr>" +
				"<tr><td><b>Time:</b></td><td>" + currentTime + "</td></tr>" +
				"</table>" +
				"<p style='margin-top: 20px;'>If this was you, you can safely ignore this email.</p>" +
				"<p style='color: #d9534f;'><b>If you did not perform this login, please reset your password immediately to secure your account.</b></p>"
				+
				"<br><p>Stay Secure,<br><b>SROTS Security Team</b></p>" +
				"</div>";

		emailService.sendEmail(user.getEmail(), "Security Alert: New Login Detected", htmlContent);
	}

	@PostMapping("/forgot-password")
	public ResponseEntity<?> forgotPassword(@RequestParam String email) {
		// No try-catch needed; RuntimeException handled by GlobalExceptionHandler
		authService.initiateForgotPassword(email);
		return ResponseEntity.ok(java.util.Map.of("message", "Reset link sent successfully"));
	}

	@PostMapping("/reset-password")
	public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
		// If validation fails, GlobalExceptionHandler returns 400 Bad Request
		// automatically
		authService.resetPassword(request.getToken(), request.getNewPassword());
		return ResponseEntity.ok(java.util.Map.of("message", "Password has been reset successfully"));
	}

	@GetMapping("/send-email")
	public ResponseEntity<String> testAsyncEmail(@RequestParam String to) {
		System.out.println("1. Controller Thread: " + Thread.currentThread().getName());

		// Trigger the async method
		emailService.sendEmail(to, "Test Async Email", "<h1>It Works!</h1><p>This was sent asynchronously.</p>");

		System.out.println("2. Controller is returning response now...");

		return ResponseEntity.ok("Check your console! If this appeared instantly, @Async is working.");
	}

}