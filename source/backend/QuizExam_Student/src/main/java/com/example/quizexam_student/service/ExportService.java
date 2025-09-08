package com.example.quizexam_student.service;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;

@Service
public interface ExportService {
    void export(HttpServletResponse response, String entity, String type);
}
