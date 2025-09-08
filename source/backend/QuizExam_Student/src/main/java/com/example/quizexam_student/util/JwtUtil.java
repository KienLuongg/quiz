package com.example.quizexam_student.util;

import io.jsonwebtoken.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
@RequiredArgsConstructor
public class JwtUtil {
    @Value("${jwt.secret}")
    private String secret;
    @Value("${jwt.expiration}")
    private Long expiration;

    public String generateJwtToken(Authentication authentication) {
        String email = authentication.getName();
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(SignatureAlgorithm.HS256, secret)
                .compact();
    }

    public String getEmailFromJwtToken(String token) {
        Claims claims  = Jwts.parser()
                .setSigningKey(secret)
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    public Boolean validateToken(String token) {
        String msg;
        try {
            Jwts.parser().setSigningKey(secret).parseClaimsJws(token);
            return true;
        } catch (SignatureException e) {
            msg = "Invalid JWT signature";
        } catch (MalformedJwtException e) {
            msg = "Invalid JWT token";
        } catch (ExpiredJwtException e) {
            msg = "Expired JWT token";
        } catch (UnsupportedJwtException e) {
            msg = "Unsupported JWT token";
        } catch (IllegalArgumentException e) {
            msg = "JWT claims string is empty";
        }
        throw new AccessDeniedException(msg);
    }
}
