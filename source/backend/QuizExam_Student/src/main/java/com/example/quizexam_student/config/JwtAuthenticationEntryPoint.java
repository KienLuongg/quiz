package com.example.quizexam_student.config;

import com.example.quizexam_student.bean.response.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    //private final ObjectMapper mapper;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
        ErrorResponse errorResponse = new ErrorResponse(HttpStatus.FORBIDDEN, "token", authException.getMessage());
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType("text/json");
        response.setCharacterEncoding("UTF-8");
        ResponseEntity responseEntity = ResponseEntity.ofNullable(errorResponse);
        ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(response.getWriter(), responseEntity);
        response.getWriter().write(mapper.writeValueAsString(errorResponse));
    }
}
