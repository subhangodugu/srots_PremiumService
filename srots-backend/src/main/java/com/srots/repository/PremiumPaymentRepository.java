package com.srots.repository;

import com.srots.model.PremiumPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PremiumPaymentRepository extends JpaRepository<PremiumPayment, Long> {
    Optional<PremiumPayment> findByOrderId(String orderId);
}
