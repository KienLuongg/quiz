package com.example.quizexam_student.bean.response;

import lombok.Data;

@Data
public class AnswerRecordResponse {
    private int id;

    private String content;

    public String getAnswerLabel(int index) {
        return String.valueOf((char) ('A' + index));
    }
}