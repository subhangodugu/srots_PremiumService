package com.srots.repository;

import com.srots.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentRepository extends JpaRepository<Student, String> {
    List<Student> findByCollegeId(String collegeId);

    List<Student> findByPremiumActiveTrueAndPremiumExpiryDateIsNotNull();

    java.util.Optional<Student> findByUserId(String userId);

    java.util.Optional<Student> findByUserUsername(String username);
}
