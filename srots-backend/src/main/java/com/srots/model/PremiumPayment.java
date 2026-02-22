package com.srots.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class PremiumPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderId;
    private String paymentId;
    private String status; // CREATED, PAID

    @ManyToOne
    private Student student;
}
