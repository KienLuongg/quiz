package com.example.quizexam_student.bean.response;

import lombok.Data;

import java.util.List;

@Data
public class QuestionRecordResponse {
    private int id;

    private String content;

    private String image;

    private Integer type;

    private List<AnswerRecordResponse> answerRecords;
}