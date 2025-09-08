package com.example.quizexam_student.handle;

import com.example.quizexam_student.bean.response.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException, ServletException {
        ErrorResponse errorResponse = new ErrorResponse(HttpStatus.UNAUTHORIZED, "token", accessDeniedException.getMessage());
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType("text/json");
        response.setCharacterEncoding("UTF-8");
        ResponseEntity responseEntity = ResponseEntity.ofNullable(errorResponse);
        ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(response.getWriter(), responseEntity);
        response.getWriter().write(mapper.writeValueAsString(errorResponse));
    }
}
