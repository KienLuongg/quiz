package com.example.quizexam_student.bean.request;

import lombok.Data;

import java.util.List;

@Data
public class StudentAnswerRequest {
    private Integer markId;

    private List<StudentQuestionAnswer> studentQuestionAnswers;
}