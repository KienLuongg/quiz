package com.example.quizexam_student.bean.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SubjectRequest {
    private int id;

    @NotBlank(message = "Subject name is required")
    @Size(max = 100, message = "Subject name must be less than or equal to 100 characters")
    private String name;

    private String image;

    @NotNull(message = "Semester is required")
    private Integer semId;
}
