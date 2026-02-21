package com.srots.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "students")
public class Student {
    @Id
    private String id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String name;
    private String email;

    @Column(nullable = false)
    private boolean premiumActive = false;

    private java.time.LocalDate premiumExpiryDate;

    @Column(nullable = false)
    private String accountStatus = "HOLD"; // 🔒 default

    @Column(name = "college_id")
    private String collegeId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
