package com.example.suyu;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorRepository doctorRepository;

    @PostMapping(value = "/register")
    public ResponseEntity<Map<String, Object>> registerDoctor(@RequestBody Map<String, Object> doctorData) {
        String name = (String) doctorData.get("name");
        String specialization = (String) doctorData.get("specialization");
        String email = (String) doctorData.get("email");
        String phone = (String) doctorData.get("phone");
        String password = (String) doctorData.get("password");
        int experience = Integer.parseInt(doctorData.get("experience").toString());
        String clinicName = (String) doctorData.get("clinicName");
        double fee = Double.parseDouble(doctorData.get("fee").toString());
        String address = (String) doctorData.get("address");
        String city = (String) doctorData.get("city");
        String timings = (String) doctorData.get("timings");
        String mapsLink = (String) doctorData.get("mapsLink");

        Map<String, Object> response = new HashMap<>();

        if (doctorRepository.existsByEmail(email)) {
            response.put("success", false);
            response.put("message", "Email is already registered.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (doctorRepository.existsByPhone(phone)) {
            response.put("success", false);
            response.put("message", "Phone number is already registered.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        String imagePath = "images/default-doc.png";

        Doctor doctor = new Doctor();
        doctor.setName(name);
        doctor.setSpecialization(specialization);
        doctor.setEmail(email);
        doctor.setPhone(phone);
        doctor.setPassword(password);
        doctor.setExperience(experience);
        doctor.setClinicName(clinicName);
        doctor.setFee(fee);
        doctor.setAddress(address);
        doctor.setCity(city);
        doctor.setTimings(timings);
        doctor.setMapsLink(mapsLink != null ? mapsLink : "");
        doctor.setDocumentPath("");
        doctor.setImagePath(imagePath);
        doctor.setStatus("Pending Approval");
        doctor.setJoinedDate(LocalDate.now().toString());

        doctorRepository.save(doctor);

        response.put("success", true);
        response.put("message",
                "Doctor registration successful. Data sent for Admin Verification.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pending")
    public ResponseEntity<java.util.List<Doctor>> getPendingDoctors() {
        java.util.List<Doctor> pendingDoctors = doctorRepository.findByStatus("Pending Approval");
        return ResponseEntity.ok(pendingDoctors);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(@PathVariable Long id,
            @RequestBody Map<String, String> statusData) {
        Map<String, Object> response = new HashMap<>();
        String newStatus = statusData.get("status");

        return doctorRepository.findById(id).map(doctor -> {
            doctor.setStatus(newStatus);
            doctorRepository.save(doctor);
            response.put("success", true);
            response.put("message", "Status updated to " + newStatus);
            return ResponseEntity.ok(response);
        }).orElseGet(() -> {
            response.put("success", false);
            response.put("message", "Doctor not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        });
    }

    @GetMapping("/active")
    public ResponseEntity<java.util.List<Doctor>> getActiveDoctors() {
        return ResponseEntity.ok(doctorRepository.findByStatus("Active"));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginDoctor(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");
        Map<String, Object> response = new HashMap<>();

        return doctorRepository.findByEmail(email).map(doctor -> {
            if (doctor.getPassword().equals(password)) {
                if ("Active".equals(doctor.getStatus())) {
                    response.put("success", true);
                    response.put("doctor", doctor);
                    return ResponseEntity.ok(response);
                } else {
                    response.put("success", false);
                    response.put("message", "Profile is " + doctor.getStatus() + ". Please wait for Admin approval.");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
                }
            } else {
                response.put("success", false);
                response.put("message", "Invalid password.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        }).orElseGet(() -> {
            response.put("success", false);
            response.put("message", "Email not registered.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        });
    }
}
