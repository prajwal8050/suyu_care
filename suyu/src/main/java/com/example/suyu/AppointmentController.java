package com.example.suyu;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createAppointment(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long doctorId = Long.parseLong(payload.get("doctorId").toString());
            Doctor doctor = doctorRepository.findById(doctorId).orElse(null);

            if (doctor == null) {
                response.put("success", false);
                response.put("message", "Doctor not found.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Appointment appointment = new Appointment();
            appointment.setDoctor(doctor);
            appointment.setPatientName(payload.get("patientName").toString());
            appointment.setContact(payload.get("contact").toString());
            appointment.setDate(payload.get("date").toString());
            appointment.setTime(payload.get("time").toString());
            appointment.setStatus("Pending");
            appointment.setType(payload.getOrDefault("type", "In-Clinic Consult").toString());
            appointment.setPatientEmail(payload.getOrDefault("patientEmail", "").toString());

            appointmentRepository.save(appointment);

            response.put("success", true);
            response.put("message", "Appointment booked successfully.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error booking appointment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(@PathVariable Long doctorId) {
        return ResponseEntity.ok(appointmentRepository.findByDoctorId(doctorId));
    }

    @GetMapping("/patient/{email}")
    public ResponseEntity<List<Appointment>> getPatientAppointments(@PathVariable String email) {
        return ResponseEntity.ok(appointmentRepository.findByPatientEmail(email));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(@PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        Map<String, Object> response = new HashMap<>();
        String newStatus = payload.get("status");

        return appointmentRepository.findById(id).map(appointment -> {
            appointment.setStatus(newStatus);
            appointmentRepository.save(appointment);
            response.put("success", true);
            response.put("message", "Status updated successfully.");
            return ResponseEntity.ok(response);
        }).orElseGet(() -> {
            response.put("success", false);
            response.put("message", "Appointment not found.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        });
    }
}
