package com.example.quizexam_student.service;

import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public interface QuestionRecordService {
    Map<String, Double> getMaxScoreByLevelForExam(Integer examinationId);
}