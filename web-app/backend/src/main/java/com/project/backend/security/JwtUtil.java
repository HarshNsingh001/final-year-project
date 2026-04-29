package com.project.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT Utility class for generating and validating JWT tokens.
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration; // in milliseconds (86400000 = 24 hours)

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generate a JWT token for a user.
     */
    public String generateToken(Long userId, String email, String role, Long institutionId) {
        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("role", role)
                .claim("institutionId", institutionId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Extract email (subject) from token.
     */
    public String getEmailFromToken(String token) {
        return getClaims(token).getSubject();
    }

    /**
     * Extract userId from token.
     */
    public Long getUserIdFromToken(String token) {
        return getClaims(token).get("userId", Long.class);
    }

    /**
     * Extract role from token.
     */
    public String getRoleFromToken(String token) {
        return getClaims(token).get("role", String.class);
    }

    /**
     * Extract institutionId from token.
     */
    public Long getInstitutionIdFromToken(String token) {
        return getClaims(token).get("institutionId", Long.class);
    }

    /**
     * Validate if a token is valid and not expired.
     */
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
