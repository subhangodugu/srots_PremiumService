package com.srots.service;

import com.srots.model.Student;
import com.srots.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class PremiumService {

    private final StudentRepository studentRepository;
    private final EmailService emailService;

    @Transactional
    public String activatePremium(String username, String utr) {

        Student student = studentRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // ✅ Validate UTR
        if (utr == null || utr.trim().length() < 6) {
            throw new RuntimeException("Invalid UTR. Must be at least 6 characters.");
        }

        // 🔓 ACTIVATE
        student.setPremiumActive(true);
        student.setAccountStatus("ACTIVE");
        student.setPremiumExpiryDate(LocalDate.now().plusMonths(12));

        studentRepository.save(student);

        // 📧 send mail
        try {
            emailService.sendPremiumActivatedMail(student.getEmail(), student.getPremiumExpiryDate());
        } catch (Exception e) {
            System.err.println("Email failed but premium activated: " + e.getMessage());
        }

        return "Premium activated successfully";
    }
}
