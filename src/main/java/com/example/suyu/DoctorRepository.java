package com.example.suyu;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    java.util.List<Doctor> findByStatus(String status);

    java.util.Optional<Doctor> findByEmail(String email);
}
