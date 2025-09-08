package com.example.quizexam_student.controller;

import com.example.quizexam_student.bean.request.ExaminationRequest;
import com.example.quizexam_student.bean.response.*;
import com.example.quizexam_student.entity.*;
import com.example.quizexam_student.mapper.ExaminationMapper;
import com.example.quizexam_student.repository.MarkRepository;
import com.example.quizexam_student.repository.UserRepository;
import com.example.quizexam_student.service.ExaminationService;
import com.example.quizexam_student.service.ExportService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/exam")
@RequiredArgsConstructor
@Validated
public class ExaminationController {
    private final ExaminationService examinationService;
    private final ExportService exportService;
    private final MarkRepository markRepository;
    private final UserRepository userRepository;
    @Value("${uploads.question}")
    private String uploadDir;

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO', 'STUDENT')")
    @GetMapping("/{examinationId}")
    public ExaminationResponse getDetailExamination(@PathVariable int examinationId) {
        return examinationService.getDetailExamination(examinationId);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR', 'TEACHER', 'SRO')")
    @GetMapping("/finish/sem/{semId}")
    public List<ExaminationResponse> getAllExaminationFinishedBySemId(@PathVariable int semId){
        return examinationService.getAllExaminationFinishedBySemId(semId);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR', 'TEACHER', 'SRO')")
    @GetMapping("/subject/{subjectId}")
    public List<ExaminationResponse> getAllExaminationBySubject(@PathVariable int subjectId){
        return examinationService.getAllExaminationBySubjectId(subjectId);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @GetMapping("/sem/{semId}")
    public List<ExaminationResponse> getExaminationBySemId(@PathVariable int semId) {
        return examinationService.getAllExamBySemId(semId);
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("")
    public List<ExaminationResponse> getAllExaminationsForStudent() {
        String email = ((org.springframework.security.core.userdetails.User)
                SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        User user = userRepository.findByEmailAndStatus(email, 1).orElse(null);
        assert user != null;
        StudentDetail studentDetail = user.getStudentDetail();
        List<Mark> marks = markRepository.findAllByStudentDetailAndScoreIsNull(studentDetail);
        return examinationService.getAllExaminationsForStudent(marks);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @PostMapping("")
    public ExaminationResponse autoGenerateExam(@RequestBody @Valid ExaminationRequest examinationRequest) {
        return ExaminationMapper.convertToResponse(examinationService.autoGenerateExam(examinationRequest));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @PostMapping("/select-questions")
    public ExaminationResponse selectQuestionsExam(@RequestPart(name = "exam") @Valid ExaminationRequest examinationRequest, @RequestPart(name = "question") List<Integer> questionIds) {
        return ExaminationMapper.convertToResponse(examinationService.createExamBySelectingQuestions(examinationRequest, questionIds));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @PutMapping("/{examinationId}")
    public ExaminationResponse update(@PathVariable int examinationId, @RequestBody ExaminationRequest examinationRequest) {
        return ExaminationMapper.convertToResponse(examinationService.updateExamination(examinationId, examinationRequest));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @PutMapping("/update-question/{examinationId}")
    public ExaminationResponse updateQuestionsInExam(@PathVariable int examinationId, @RequestBody List<Integer> questionIds) {
        return ExaminationMapper.convertToResponse(examinationService.updateQuestionsInExam(examinationId, questionIds));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR', 'TEACHER', 'SRO')")
    @GetMapping("/count")
    public Long countAllExams(){
        return examinationService.countAllExams();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @PostMapping(value = "/export/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<String> exportToPDF(
            HttpServletResponse response,
            @RequestBody ExaminationResponse examinationResponse)
            throws IOException {
        exportService.export(response, examinationResponse.getName() + "_exam", "pdf");
        ExamPDFExporter pdfExporter = new ExamPDFExporter(examinationResponse, uploadDir);
        pdfExporter.export(response);
        return new ResponseEntity<>("Export To PDF Successfully", HttpStatus.OK);
    }
}