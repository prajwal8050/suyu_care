package com.example.suyu;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("glowcare.dummy@gmail.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            System.out.println("Email successfully sent to " + to + ": " + text);
        } catch (Exception e) {
            System.err.println("Fallback - Failed to send real email to " + to + ". Error: " + e.getMessage());
            System.out.println("====== SYSTEM OTP (Fallback) ======");
            System.out.println("To: " + to);
            System.out.println("Subject: " + subject);
            System.out.println("Content: " + text);
            System.out.println("================================");
        }
    }
}
