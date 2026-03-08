package com.example.suyu;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.mindrot.jbcrypt.BCrypt;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private EmailService emailService;

    // Helper: Generate 6-digit OTP
    private String generateOTP() {
        return String.format("%06d", new Random().nextInt(1000000));
    }

    // Helper: Hash password
    private String hashPassword(String plainTextPassword) {
        return BCrypt.hashpw(plainTextPassword, BCrypt.gensalt());
    }

    // Helper: Check password
    private boolean checkPassword(String plainTextPassword, String hashedPassword) {
        return BCrypt.checkpw(plainTextPassword, hashedPassword);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody Customer customer) {
        Map<String, String> response = new HashMap<>();

        // Check if email or phone already exists
        Customer existingByEmail = customerRepository.findByEmail(customer.getEmail());
        if (existingByEmail != null && existingByEmail.isActive()) {
            response.put("error", "Email already registered and active.");
            return ResponseEntity.badRequest().body(response);
        }

        Customer existingByPhone = customerRepository.findByPhoneNumber(customer.getPhoneNumber()); // Assuming method
                                                                                                    // exists
        if (existingByPhone != null && existingByPhone.isActive()) {
            response.put("error", "Phone number already registered and active.");
            return ResponseEntity.badRequest().body(response);
        }

        // If exists but not active, we can overwrite or just update it
        Customer c = existingByEmail != null ? existingByEmail
                : (existingByPhone != null ? existingByPhone : new Customer());
        c.setName(customer.getName());
        c.setEmail(customer.getEmail());
        c.setPhoneNumber(customer.getPhoneNumber());
        c.setPassword(hashPassword(customer.getPassword()));
        c.setActive(false);

        String otp = generateOTP();
        c.setOtp(otp);
        c.setOtpExpiryTime(System.currentTimeMillis() + (5 * 60 * 1000)); // 5 minutes

        customerRepository.save(c);

        emailService.sendEmail(c.getEmail(), "GlowCare Registration OTP",
                "To log in to your GLOWCARE account use One Time Password : " + otp + "(valid for 10 mins). Make sure you do not share it with anyone for security reasons.");

        response.put("message", "Registration initiated. OTP sent to " + c.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");
        Map<String, String> response = new HashMap<>();

        if (email == null || otp == null) {
            response.put("error", "Email and OTP are required");
            return ResponseEntity.badRequest().body(response);
        }

        Customer c = customerRepository.findByEmail(email);
        if (c == null) {
            response.put("error", "Customer not found");
            return ResponseEntity.badRequest().body(response);
        }

        if (c.getOtp() == null || !c.getOtp().equals(otp)) {
            response.put("error", "Invalid OTP, please try again.");
            return ResponseEntity.badRequest().body(response);
        }

        if (System.currentTimeMillis() > c.getOtpExpiryTime()) {
            response.put("error", "OTP has expired. Please request a new one.");
            return ResponseEntity.badRequest().body(response);
        }

        // Success
        c.setActive(true);
        c.setOtp(null);
        c.setOtpExpiryTime(null);
        customerRepository.save(c);

        response.put("message", "OTP verified correctly. Registration completed.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<Map<String, String>> resendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        Map<String, String> response = new HashMap<>();

        if (email == null) {
            response.put("error", "Email is required");
            return ResponseEntity.badRequest().body(response);
        }
        Customer c = customerRepository.findByEmail(email);
        if (c == null) {
            response.put("error", "Customer not found");
            return ResponseEntity.badRequest().body(response);
        }

        String otp = generateOTP();
        c.setOtp(otp);
        c.setOtpExpiryTime(System.currentTimeMillis() + (5 * 60 * 1000));
        customerRepository.save(c);

        emailService.sendEmail(c.getEmail(), "GlowCare Registration OTP (Resend)",
                "Your verification OTP is: " + otp + ". It expires in 5 minutes.");
        response.put("message", "OTP resent successfully.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> body) {
        // ... handled below
        String email = body.get("email");
        String password = body.get("password");
        Map<String, String> response = new HashMap<>();

        Customer c = customerRepository.findByEmail(email);
        if (c == null || !checkPassword(password, c.getPassword())) {
            response.put("error", "Invalid email or password");
            return ResponseEntity.badRequest().body(response);
        }

        if (!c.isActive()) {
            response.put("error", "Account not verified. Please verify OTP.");
            // Generate OTP and send it so they can verify
            String otp = generateOTP();
            c.setOtp(otp);
            c.setOtpExpiryTime(System.currentTimeMillis() + (5 * 60 * 1000));
            customerRepository.save(c);
            emailService.sendEmail(c.getEmail(), "GlowCare Account Verification",
                    "Your verification OTP is: " + otp + ". It expires in 5 minutes.");
            response.put("needsVerification", "true");
            response.put("email", c.getEmail());
            return ResponseEntity.badRequest().body(response);
        }

        response.put("message", "Login successful");
        response.put("email", c.getEmail());
        response.put("name", c.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> body) {
        String emailOrPhone = body.get("emailOrPhone");
        Map<String, String> response = new HashMap<>();

        if (emailOrPhone == null) {
            response.put("error", "Email or Phone is required");
            return ResponseEntity.badRequest().body(response);
        }

        Customer c = customerRepository.findByEmail(emailOrPhone);
        if (c == null) {
            // Check by phone
            c = customerRepository.findByPhoneNumber(emailOrPhone); // assume findByPhoneNumber exists
        }

        if (c == null) {
            response.put("error", "Customer not found with the provided email or phone.");
            return ResponseEntity.badRequest().body(response);
        }

        String otp = generateOTP();
        c.setOtp(otp);
        c.setOtpExpiryTime(System.currentTimeMillis() + (5 * 60 * 1000));
        customerRepository.save(c);

        emailService.sendEmail(c.getEmail(), "GlowCare Password Recovery",
                "Your password recovery OTP is: " + otp + ". It expires in 5 minutes.");
        response.put("message", "OTP sent successfully.");
        response.put("email", c.getEmail()); // For the frontend to map state
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-forgot-password-otp")
    public ResponseEntity<Map<String, String>> verifyForgotPasswordOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");
        Map<String, String> response = new HashMap<>();

        Customer c = customerRepository.findByEmail(email);
        if (c == null) {
            response.put("error", "Customer not found");
            return ResponseEntity.badRequest().body(response);
        }

        if (c.getOtp() == null || !c.getOtp().equals(otp)) {
            response.put("error", "Invalid OTP, please try again.");
            return ResponseEntity.badRequest().body(response);
        }

        if (System.currentTimeMillis() > c.getOtpExpiryTime()) {
            response.put("error", "OTP has expired. Please request a new one.");
            return ResponseEntity.badRequest().body(response);
        }

        response.put("message", "OTP verified.");
        // Do not clear OTP here yet, we will use it as a security token for
        // reset-password
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");
        String newPassword = body.get("newPassword");
        Map<String, String> response = new HashMap<>();

        Customer c = customerRepository.findByEmail(email);
        if (c == null) {
            response.put("error", "Customer not found");
            return ResponseEntity.badRequest().body(response);
        }

        if (c.getOtp() == null || !c.getOtp().equals(otp) || System.currentTimeMillis() > c.getOtpExpiryTime()) {
            response.put("error", "Invalid or expired OTP.");
            return ResponseEntity.badRequest().body(response);
        }

        c.setPassword(hashPassword(newPassword));
        c.setOtp(null);
        c.setOtpExpiryTime(null);
        customerRepository.save(c);

        response.put("message", "Password reset successfully. You can now log in.");
        return ResponseEntity.ok(response);
    }
}
