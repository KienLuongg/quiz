package com.example.quizexam_student.bean.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChapterRequest {
    @NotBlank(message = "Chapter name is required")
    @Size(max = 100, message = "Chapter name must be less than or equal to 100 characters")
    private String name;

    @NotNull(message = "Subject is required")
    private Integer subjectId;
}