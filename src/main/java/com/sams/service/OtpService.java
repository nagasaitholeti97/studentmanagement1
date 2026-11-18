package com.sams.service;

import com.sams.exception.BadRequestException;
import com.sams.model.Faculty;
import com.sams.model.PasswordResetOtp;
import com.sams.model.Role;
import com.sams.model.Student;
import com.sams.model.UserAccount;
import com.sams.repository.FacultyRepository;
import com.sams.repository.PasswordResetOtpRepository;
import com.sams.repository.StudentRepository;
import com.sams.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    private final PasswordResetOtpRepository passwordResetOtpRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final String otpSecret;
    private final int expirationMinutes;
    private final int maxAttempts;
    private final int cooldownSeconds;
    private final int rateLimitWindowMinutes;
    private final int maxRequestsPerWindow;
    private final SecureRandom secureRandom = new SecureRandom();

    public OtpService(PasswordResetOtpRepository passwordResetOtpRepository,
                      UserRepository userRepository,
                      StudentRepository studentRepository,
                      FacultyRepository facultyRepository,
                      EmailService emailService,
                      PasswordEncoder passwordEncoder,
                      @Value("${app.otp.secret}") String otpSecret,
                      @Value("${app.otp.expiration-minutes:5}") int expirationMinutes,
                      @Value("${app.otp.max-attempts:5}") int maxAttempts,
                      @Value("${app.otp.resend-cooldown-seconds:30}") int cooldownSeconds,
                      @Value("${app.otp.rate-limit-window-minutes:15}") int rateLimitWindowMinutes,
                      @Value("${app.otp.max-requests-per-window:5}") int maxRequestsPerWindow) {
        if (otpSecret == null || otpSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("OTP_HASH_SECRET must be at least 32 bytes long");
        }
        this.passwordResetOtpRepository = passwordResetOtpRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.otpSecret = otpSecret;
        this.expirationMinutes = expirationMinutes;
        this.maxAttempts = maxAttempts;
        this.cooldownSeconds = cooldownSeconds;
        this.rateLimitWindowMinutes = rateLimitWindowMinutes;
        this.maxRequestsPerWindow = maxRequestsPerWindow;
    }

    public String generateSixDigitOtp() {
        int code = secureRandom.nextInt(1_000_000);
        return String.format("%06d", code);
    }

    public String hashOtp(UUID userId, String normalizedEmail, String otp) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec = new SecretKeySpec(otpSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(keySpec);
            String payload = userId.toString() + ":" + normalizedEmail + ":" + otp.trim();
            byte[] raw = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(raw);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to compute OTP HMAC hash", e);
        }
    }

    public boolean verifyOtpHash(UUID userId, String normalizedEmail, String otp, String storedHash) {
        if (storedHash == null || otp == null) {
            return false;
        }
        String computed = hashOtp(userId, normalizedEmail, otp);
        return MessageDigest.isEqual(
            computed.getBytes(StandardCharsets.UTF_8),
            storedHash.getBytes(StandardCharsets.UTF_8)
        );
    }

    @Transactional
    public void sendOtp(String rawEmail) {
        if (rawEmail == null || rawEmail.isBlank()) {
            throw new BadRequestException("Email is required.");
        }
        String normalizedEmail = rawEmail.toLowerCase(Locale.ROOT).trim();

        Optional<UserAccount> userOpt = userRepository.findByEmailIgnoreCase(normalizedEmail)
            .or(() -> userRepository.findByLoginIdIgnoreCase(normalizedEmail));

        if (userOpt.isEmpty()) {
            log.info("Password reset requested for non-existent account: {}", normalizedEmail);
            return;
        }

        UserAccount user = userOpt.get();
        if (!user.isEnabled()) {
            log.warn("Password reset requested for disabled account: {}", user.getId());
            return;
        }

        // 1. Resend cooldown check
        Optional<PasswordResetOtp> lastOtp = passwordResetOtpRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId());
        if (lastOtp.isPresent()) {
            Instant cooldownThreshold = lastOtp.get().getCreatedAt().plusSeconds(cooldownSeconds);
            if (Instant.now().isBefore(cooldownThreshold)) {
                long waitRemaining = ChronoUnit.SECONDS.between(Instant.now(), cooldownThreshold);
                throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Please wait " + Math.max(1, waitRemaining) + " seconds before requesting another code."
                );
            }
        }

        // 2. Rate limit window check
        Instant windowStart = Instant.now().minus(rateLimitWindowMinutes, ChronoUnit.MINUTES);
        long recentCount = passwordResetOtpRepository.countByUserIdAndCreatedAtAfter(user.getId(), windowStart);
        if (recentCount >= maxRequestsPerWindow) {
            throw new ResponseStatusException(
                HttpStatus.TOO_MANY_REQUESTS,
                "Too many password reset requests. Please wait a few minutes before trying again."
            );
        }

        // 3. Resolve destination email
        String destinationEmail = resolveDestinationEmail(user);
        if (destinationEmail == null || destinationEmail.isBlank()) {
            log.warn("User {} has no valid email address configured for password reset", user.getId());
            return;
        }

        // 4. Invalidate previous active OTPs for this user
        List<PasswordResetOtp> previousOtps = passwordResetOtpRepository.findAllByUserIdAndUsedAtIsNull(user.getId());
        for (PasswordResetOtp old : previousOtps) {
            old.setUsedAt(Instant.now());
            old.setUpdatedAt(Instant.now());
        }
        if (!previousOtps.isEmpty()) {
            passwordResetOtpRepository.saveAll(previousOtps);
        }

        // 5. Generate secure 6-digit OTP and HMAC hash
        String rawOtp = generateSixDigitOtp();
        String otpHash = hashOtp(user.getId(), normalizedEmail, rawOtp);

        // 6. Create pending OTP record in PostgreSQL
        PasswordResetOtp otpRecord = new PasswordResetOtp();
        otpRecord.setUser(user);
        otpRecord.setOtpHash(otpHash);
        otpRecord.setExpiresAt(Instant.now().plus(expirationMinutes, ChronoUnit.MINUTES));
        otpRecord.setAttempts(0);
        otpRecord.setCreatedAt(Instant.now());
        otpRecord.setUpdatedAt(Instant.now());
        otpRecord = passwordResetOtpRepository.saveAndFlush(otpRecord);

        // 7. Deliver OTP via SendGrid
        try {
            emailService.sendOtpEmail(destinationEmail, rawOtp);
        } catch (Exception e) {
            // Safe delivery sequence: Invalidate the OTP record immediately if delivery failed
            otpRecord.setUsedAt(Instant.now());
            otpRecord.setUpdatedAt(Instant.now());
            passwordResetOtpRepository.saveAndFlush(otpRecord);
            log.error("Failed to deliver OTP to user {} via SendGrid: {}", user.getId(), e.getMessage());
            throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Unable to deliver verification code. Please check email service configuration."
            );
        }
    }

    @Transactional
    public void verifyOtp(String rawEmail, String otp) {
        if (rawEmail == null || rawEmail.isBlank()) {
            throw new BadRequestException("Email is required.");
        }
        if (otp == null || !otp.matches("^\\d{6}$")) {
            throw new BadRequestException("Enter the 6-digit OTP.");
        }

        String normalizedEmail = rawEmail.toLowerCase(Locale.ROOT).trim();
        UserAccount user = userRepository.findByEmailIgnoreCase(normalizedEmail)
            .or(() -> userRepository.findByLoginIdIgnoreCase(normalizedEmail))
            .orElseThrow(() -> new BadRequestException("Invalid or expired verification code."));

        PasswordResetOtp otpRecord = passwordResetOtpRepository
            .findTopByUserIdAndUsedAtIsNullOrderByCreatedAtDesc(user.getId())
            .orElseThrow(() -> new BadRequestException("No active verification code found. Please request a new code."));

        if (otpRecord.isExpired()) {
            otpRecord.setUsedAt(Instant.now());
            otpRecord.setUpdatedAt(Instant.now());
            passwordResetOtpRepository.save(otpRecord);
            throw new BadRequestException("Verification code has expired. Please request a new code.");
        }

        if (otpRecord.getAttempts() >= maxAttempts) {
            otpRecord.setUsedAt(Instant.now());
            otpRecord.setUpdatedAt(Instant.now());
            passwordResetOtpRepository.save(otpRecord);
            throw new BadRequestException("Maximum verification attempts exceeded. Please request a new code.");
        }

        boolean matches = verifyOtpHash(user.getId(), normalizedEmail, otp, otpRecord.getOtpHash());
        if (!matches) {
            int attempts = otpRecord.getAttempts() + 1;
            otpRecord.setAttempts(attempts);
            otpRecord.setUpdatedAt(Instant.now());
            if (attempts >= maxAttempts) {
                otpRecord.setUsedAt(Instant.now());
            }
            passwordResetOtpRepository.save(otpRecord);

            int remaining = maxAttempts - attempts;
            if (remaining <= 0) {
                throw new BadRequestException("Maximum verification attempts exceeded. This code has been invalidated.");
            }
            throw new BadRequestException("Invalid verification code. " + remaining + " attempts remaining.");
        }

        otpRecord.setVerifiedAt(Instant.now());
        otpRecord.setUpdatedAt(Instant.now());
        passwordResetOtpRepository.save(otpRecord);
    }

    @Transactional
    public void resetPassword(String rawEmail, String otp, String newPassword) {
        if (rawEmail == null || rawEmail.isBlank()) {
            throw new BadRequestException("Email is required.");
        }
        if (otp == null || !otp.matches("^\\d{6}$")) {
            throw new BadRequestException("Enter the 6-digit OTP.");
        }
        if (newPassword == null || newPassword.length() < 8) {
            throw new BadRequestException("New password must be at least 8 characters.");
        }

        String normalizedEmail = rawEmail.toLowerCase(Locale.ROOT).trim();
        UserAccount user = userRepository.findByEmailIgnoreCase(normalizedEmail)
            .or(() -> userRepository.findByLoginIdIgnoreCase(normalizedEmail))
            .orElseThrow(() -> new BadRequestException("Invalid request."));

        PasswordResetOtp otpRecord = passwordResetOtpRepository
            .findTopByUserIdAndUsedAtIsNullOrderByCreatedAtDesc(user.getId())
            .orElseThrow(() -> new BadRequestException("No active verification session. Please request a new code."));

        if (otpRecord.isExpired()) {
            otpRecord.setUsedAt(Instant.now());
            otpRecord.setUpdatedAt(Instant.now());
            passwordResetOtpRepository.save(otpRecord);
            throw new BadRequestException("Verification code has expired. Please request a new code.");
        }

        if (otpRecord.getVerifiedAt() == null) {
            throw new BadRequestException("Verification code has not been verified.");
        }

        // Short-lived verification window (10 minutes after verification)
        if (otpRecord.getVerifiedAt().isBefore(Instant.now().minus(10, ChronoUnit.MINUTES))) {
            otpRecord.setUsedAt(Instant.now());
            otpRecord.setUpdatedAt(Instant.now());
            passwordResetOtpRepository.save(otpRecord);
            throw new BadRequestException("Verification session has expired. Please request a new code.");
        }

        if (otpRecord.getAttempts() >= maxAttempts) {
            otpRecord.setUsedAt(Instant.now());
            otpRecord.setUpdatedAt(Instant.now());
            passwordResetOtpRepository.save(otpRecord);
            throw new BadRequestException("Maximum verification attempts exceeded.");
        }

        if (!verifyOtpHash(user.getId(), normalizedEmail, otp, otpRecord.getOtpHash())) {
            throw new BadRequestException("Invalid verification code.");
        }

        // Update password securely using existing PasswordEncoder
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark OTP as used (single-use)
        otpRecord.setUsedAt(Instant.now());
        otpRecord.setUpdatedAt(Instant.now());
        passwordResetOtpRepository.save(otpRecord);
    }

    private String resolveDestinationEmail(UserAccount user) {
        if (user.getRole() == Role.STUDENT) {
            return studentRepository.findByUserId(user.getId())
                .map(Student::getPersonalEmail)
                .filter(e -> e != null && !e.isBlank())
                .orElse(user.getEmail());
        } else if (user.getRole() == Role.FACULTY) {
            return facultyRepository.findByUserId(user.getId())
                .map(Faculty::getPersonalEmail)
                .filter(e -> e != null && !e.isBlank())
                .orElse(user.getEmail());
        }
        return user.getEmail();
    }
}
