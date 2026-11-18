package com.sams.service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final String apiKey;
    private final String from;

    public EmailService(@Value("${app.mail.api-key:}") String apiKey,
                        @Value("${app.mail.from:no-reply@example.com}") String from) {
        this.apiKey = apiKey;
        this.from = from;
    }

    public void send(String to, String subject, String body) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("SENDGRID_API_KEY is not configured");
        }
        try {
            Mail m = new Mail(new Email(from), subject, new Email(to), new Content("text/plain", body));
            SendGrid sg = new SendGrid(apiKey);
            Request r = new Request();
            r.setMethod(Method.POST);
            r.setEndpoint("mail/send");
            r.setBody(m.build());
            Response response = sg.api(r);
            if (response.getStatusCode() < 200 || response.getStatusCode() >= 300) {
                log.error("SendGrid failed with status code {}", response.getStatusCode());
                throw new IllegalStateException("SendGrid status " + response.getStatusCode());
            }
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            log.error("SendGrid email dispatch failed: {}", e.getMessage());
            throw new IllegalStateException("Email send failed", e);
        }
    }

    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "SAMS Password Reset Verification Code";
        String body = "Hello,\n\n"
            + "We received a request to reset your SAMS account password.\n"
            + "Your verification code is:\n"
            + otp + "\n\n"
            + "This code expires in 5 minutes.\n"
            + "Do not share this code with anyone.\n\n"
            + "If you did not request this password reset, ignore this email.\n\n"
            + "Regards,\n"
            + "Student Attendance Management System";

        send(toEmail, subject, body);
    }
}
