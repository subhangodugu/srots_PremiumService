package com.srots.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PremiumSubscribeRequestDTO {
    @NotNull
    private Integer months;

    @NotBlank
    private String studentId; // User ID of the student

    @NotBlank
    private String utr; // ⭐ IMPORTANT
}
