package com.example.quizexam_student.controller;

import com.example.quizexam_student.bean.request.QuestionRequest;
import com.example.quizexam_student.bean.response.QuestionPDFExporter;
import com.example.quizexam_student.bean.response.QuestionResponse;
import com.example.quizexam_student.entity.Question;
import com.example.quizexam_student.mapper.QuestionMapper;
import com.example.quizexam_student.service.ExportService;
import com.example.quizexam_student.service.QuestionService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

import static org.springframework.http.MediaType.*;

@RestController
@RequestMapping("/api/question")
@RequiredArgsConstructor
@Validated
public class QuestionController {
    private final QuestionService questionService;

    private final ExportService exportService;

    @Value("${uploads.question}")
    private String uploadQuestion;

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR', 'TEACHER', 'SRO')")
    @GetMapping("/{subjectId}")
    public List<QuestionResponse> getAllQuestionsBySubjectId(@PathVariable int subjectId) {
        return questionService.findAllQuestionsBySubjectId(subjectId).stream().map(QuestionMapper::convertToResponse).collect(Collectors.toList());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR', 'TEACHER')")
    @GetMapping("/detail/{id}")
    public QuestionResponse getQuestionById(@PathVariable int id) {
        return QuestionMapper.convertToResponse(questionService.findQuestionById(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @PostMapping(consumes = {MULTIPART_FORM_DATA_VALUE, APPLICATION_JSON_VALUE})
    public List<Question> addQuestions(@RequestParam("files") MultipartFile[] files, @RequestPart("questions") @Valid List<QuestionRequest> questionRequests) throws IOException {
        if (files.length != questionRequests.size()) {
            throw new IllegalArgumentException("The number of image files does not match the number of questions.");
        }
        List<Question> savedQuestions = new ArrayList<>();
        for (int i = 0; i < questionRequests.size(); i++) {
            QuestionRequest questionRequest = questionRequests.get(i);
            if (files[i] != null && !files[i].isEmpty()) {
                String extension = "";
                if (files[i].getOriginalFilename() != null && files[i].getOriginalFilename().contains(".")) {
                    extension = files[i].getOriginalFilename().substring(files[i].getOriginalFilename().lastIndexOf(".")); // Lấy phần đuôi file (extension)
                }
                String fileName = UUID.randomUUID() + "_" + System.currentTimeMillis() + "_" + System.nanoTime() + "_" + i + extension;
                Files.copy(files[i].getInputStream(), Paths.get(uploadQuestion).resolve(fileName));
                questionRequest.setImage(fileName);
            }
            savedQuestions.addAll(questionService.saveQuestions(List.of(questionRequest)));
        }
        return savedQuestions;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @PutMapping(consumes = {MULTIPART_FORM_DATA_VALUE, APPLICATION_JSON_VALUE}, path = "/{id}")
    public Question editQuestion(@RequestPart(value = "file", required = false) MultipartFile file, @RequestPart("question") @Valid QuestionRequest questionRequest, @PathVariable int id) throws IOException {
        if (file != null) {
            String fileName = "";
            if (!file.isEmpty()) {
                String extension = "";
                if (file.getOriginalFilename() != null && file.getOriginalFilename().contains(".")) {
                    extension = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf(".")); // Lấy phần đuôi file (extension)
                }
                fileName = UUID.randomUUID() + "_" + System.currentTimeMillis() + "_" + System.nanoTime() + extension;
                Files.copy(file.getInputStream(), Paths.get(uploadQuestion).resolve(fileName));
            }
            questionRequest.setImage(fileName);
        }
        return questionService.updateQuestion(id,questionRequest);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @PutMapping("/remove/{id}")
    public Question removeQuestion(@PathVariable int id) {
        return questionService.deleteQuestion(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @GetMapping("/exam/{examId}")
    public List<QuestionResponse> getAllQuestionsByExam(@PathVariable int examId) {
        return questionService.findAllQuestionsByExam(examId);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @PostMapping(value = "/export/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<String> exportToPDF(HttpServletResponse response, @RequestBody List<QuestionResponse> questionResponses) throws IOException {
        exportService.export(response,"question", "pdf");
        QuestionPDFExporter pdfExporter = new QuestionPDFExporter(questionResponses, uploadQuestion);
        pdfExporter.export(response);
        return new ResponseEntity<>("Export To PDF Successfully", HttpStatus.OK);
    }
}