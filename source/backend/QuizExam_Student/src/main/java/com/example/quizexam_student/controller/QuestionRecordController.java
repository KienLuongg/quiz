package com.example.quizexam_student.controller;

import com.example.quizexam_student.service.QuestionRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/question-record")
@RequiredArgsConstructor
public class QuestionRecordController {
    private final QuestionRecordService questionRecordService;

    @GetMapping("/max-score-level/{examinationId}")
    public Map<String, Double> getMaxScoreByLevelForExam(@PathVariable Integer examinationId) {
        return questionRecordService.getMaxScoreByLevelForExam(examinationId);
    }
}