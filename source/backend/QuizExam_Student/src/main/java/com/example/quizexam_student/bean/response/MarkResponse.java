package com.example.quizexam_student.bean.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MarkResponse {
    private Integer id;

    private LocalDateTime beginTime;

    private LocalDateTime submittedTime;

    private Double score;

    private Double maxScore;

    private Integer warning;

    private String subjectName;

    private StudentResponse studentResponse;
}