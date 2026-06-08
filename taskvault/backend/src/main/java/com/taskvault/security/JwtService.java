package com.taskvault.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {
    @Value("${app.jwt.access-secret}")
    private String accessSecret;

    @Value("${app.jwt.refresh-secret}")
    private String refreshSecret;

    @Value("${app.jwt.access-expiry-ms}")
    private long accessExpiryMs;

    @Value("${app.jwt.refresh-expiry-ms}")
    private long refreshExpiryMs;

    public String generateAccessToken(UserPrincipal principal) {
        return generate(principal, accessKey(), accessExpiryMs, Map.of(
                "id", principal.getId().toString(),
                "email", principal.getUsername(),
                "role", principal.getRole()
        ));
    }

    public String generateRefreshToken(UserPrincipal principal) {
        return generate(principal, refreshKey(), refreshExpiryMs, Map.of(
                "id", principal.getId().toString(),
                "email", principal.getUsername(),
                "role", principal.getRole(),
                "type", "refresh"
        ));
    }

    public String extractUsername(String token) {
        return extractClaims(token, accessKey()).getSubject();
    }

    public String extractRefreshUsername(String token) {
        return extractClaims(token, refreshKey()).getSubject();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        Claims claims = extractClaims(token, accessKey());
        return claims.getSubject().equals(userDetails.getUsername()) && claims.getExpiration().after(new Date());
    }

    public boolean isRefreshTokenValid(String token, UserDetails userDetails) {
        Claims claims = extractClaims(token, refreshKey());
        return claims.getSubject().equals(userDetails.getUsername()) && claims.getExpiration().after(new Date());
    }

    public long getRefreshExpiryMs() {
        return refreshExpiryMs;
    }

    private String generate(UserPrincipal principal, SecretKey key, long expiryMs, Map<String, Object> claims) {
        Date now = new Date();
        return Jwts.builder()
                .claims(claims)
                .subject(principal.getUsername())
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expiryMs))
                .signWith(key)
                .compact();
    }

    private Claims extractClaims(String token, SecretKey key) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey accessKey() {
        return keyFrom(accessSecret);
    }

    private SecretKey refreshKey() {
        return keyFrom(refreshSecret);
    }

    private SecretKey keyFrom(String secret) {
        byte[] raw = secret.length() > 64 ? Decoders.BASE64.decode(secret) : secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(raw);
    }
}
