package com.library.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.admin.email}")
    private String adminEmail;

    public void sendContactMessage(String subject, String body, String userEmail, String userName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(adminEmail);
        message.setFrom(fromEmail);
        message.setReplyTo(userEmail);
        message.setSubject("[BookZone] " + subject);
        message.setText("Message from: " + userName + " <" + userEmail + ">\n\n" + body);
        mailSender.send(message);
    }
}
