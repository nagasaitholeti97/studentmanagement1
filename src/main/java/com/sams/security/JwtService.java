package com.sams.security;
import io.jsonwebtoken.Jwts; import io.jsonwebtoken.security.Keys; import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value; import org.springframework.stereotype.Service; import java.nio.charset.StandardCharsets; import java.util.Date; import java.util.UUID;
@Service public class JwtService {
 private final SecretKey key; private final long expiration;
 public JwtService(@Value("${app.jwt.secret}") String secret,@Value("${app.jwt.expiration-ms}") long expiration){if(secret.getBytes(StandardCharsets.UTF_8).length<32)throw new IllegalArgumentException("JWT secret must be at least 32 bytes");key=Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));this.expiration=expiration;}
 public String generate(UUID id,String role){Date n=new Date();return Jwts.builder().subject(id.toString()).claim("role",role).issuedAt(n).expiration(new Date(n.getTime()+expiration)).signWith(key).compact();}
 public UUID userId(String t){return UUID.fromString(Jwts.parser().verifyWith(key).build().parseSignedClaims(t).getPayload().getSubject());}
 public String role(String t){return Jwts.parser().verifyWith(key).build().parseSignedClaims(t).getPayload().get("role",String.class);}
 public boolean valid(String t){try{Jwts.parser().verifyWith(key).build().parseSignedClaims(t);return true;}catch(Exception e){return false;}}
}