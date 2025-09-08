package com.example.quizexam_student.service.impl;

import com.example.quizexam_student.service.ExportService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class ExportServiceImpl implements ExportService {
    @Override
    public void export(HttpServletResponse response, String entity, String type) {
        response.setContentType("application/octet-stream");
        String headerKey = "Content-Disposition";
        DateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
        String currentDateTime = dateFormat.format(new Date());
        String fileName = entity + "_" + currentDateTime + "." + type;
        String headerValue = "attachment; filename=" + fileName;
        response.setHeader(headerKey, headerValue);
    }
}
