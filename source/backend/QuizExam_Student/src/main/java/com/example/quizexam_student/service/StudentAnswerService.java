package com.example.quizexam_student.service;

import com.example.quizexam_student.bean.request.StudentAnswerRequest;
import com.example.quizexam_student.entity.StudentDetail;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public interface StudentAnswerService {
    StudentAnswerRequest saveStudentAnswers(StudentAnswerRequest studentAnswerRequest);

    Map<String, Double> getScoreByLevelOfStudentInExam(StudentDetail studentDetail, Integer examinationId);
}
