package com.sams.model;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="password_reset_tokens")
public class PasswordResetToken {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @ManyToOne(optional=false) private UserAccount user;
 @Column(nullable=false,unique=true) private String tokenHash;
 @Column(nullable=false) private Instant expiresAt;
 private Instant usedAt;
 public UUID getId(){return id;}
    public void setId(UUID id) { this.id = id; } public UserAccount getUser(){return user;} public void setUser(UserAccount v){user=v;}
 public String getTokenHash(){return tokenHash;} public void setTokenHash(String v){tokenHash=v;}
 public Instant getExpiresAt(){return expiresAt;} public void setExpiresAt(Instant v){expiresAt=v;}
 public Instant getUsedAt(){return usedAt;} public void setUsedAt(Instant v){usedAt=v;}
}