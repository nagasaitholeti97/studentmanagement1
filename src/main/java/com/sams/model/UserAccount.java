package com.sams.model;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="users")
public class UserAccount {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @Column(nullable=false, unique=true) private String email;
 @Column(name="login_id", nullable=false, unique=true) private String loginId;
 @Column(nullable=false) private String passwordHash;
 @Enumerated(EnumType.STRING) @Column(nullable=false) private Role role;
 @Column(nullable=false) private boolean enabled=true;
 @Column(nullable=false) private Instant createdAt=Instant.now();
 public UUID getId(){return id;}
    public void setId(UUID id) { this.id = id; } public String getEmail(){return email;} public void setEmail(String v){email=v;}
 public String getLoginId(){return loginId;} public void setLoginId(String v){loginId=v;}
 public String getPasswordHash(){return passwordHash;} public void setPasswordHash(String v){passwordHash=v;}
 public Role getRole(){return role;} public void setRole(Role v){role=v;}
 public boolean isEnabled(){return enabled;} public void setEnabled(boolean v){enabled=v;}
}