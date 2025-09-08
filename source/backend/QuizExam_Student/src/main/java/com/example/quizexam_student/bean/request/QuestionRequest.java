package com.example.quizexam_student.bean.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class QuestionRequest {
    @NotBlank(message = "Content Question is required")
    private String content;

    private String image;

    private int subjectId;

    private List<Integer> chapters;

    private int levelId;

    @Valid
    private List<AnswerRequest> answers;
}
