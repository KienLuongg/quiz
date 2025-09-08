package com.example.quizexam_student.service;

import com.example.quizexam_student.bean.request.ExaminationRequest;
import com.example.quizexam_student.bean.response.ExaminationResponse;
import com.example.quizexam_student.bean.response.StudentResponse;
import com.example.quizexam_student.entity.Examination;
import com.example.quizexam_student.entity.Mark;
import com.example.quizexam_student.entity.Question;
import com.example.quizexam_student.entity.StudentDetail;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public interface ExaminationService {
    Examination autoGenerateExam(ExaminationRequest examinationRequest);

    ExaminationResponse getDetailExamination(int examinationId);

    Examination updateExamination(int examinationId, ExaminationRequest examinationRequest);

    List<ExaminationResponse> getAllExaminationsForStudent(List<Mark> mark);

    List<ExaminationResponse> getAllExamBySemId(int semId);

    List<ExaminationResponse> getAllExaminationBySubjectId(int subjectId);

    List<ExaminationResponse> getAllExaminationFinishedBySemId(int subjectId);

    Examination createExamBySelectingQuestions(ExaminationRequest examinationRequest, List<Integer> questionIds);

    Examination updateQuestionsInExam(int examinationId, List<Integer> questionIds);

    Long countAllExams();
}