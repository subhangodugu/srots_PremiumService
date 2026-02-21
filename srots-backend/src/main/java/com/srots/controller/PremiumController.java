package com.srots.controller;

import com.srots.service.PremiumService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/premium")
@RequiredArgsConstructor
public class PremiumController {

    private final PremiumService premiumService;

    @PostMapping("/subscribe")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> subscribe(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails user,
            @jakarta.validation.Valid @RequestBody com.srots.dto.PremiumRequest request) {

        String msg = premiumService.activatePremium(user.getUsername(), request.getUtrNumber());

        return ResponseEntity.ok(java.util.Map.of("message", msg));
    }
}
