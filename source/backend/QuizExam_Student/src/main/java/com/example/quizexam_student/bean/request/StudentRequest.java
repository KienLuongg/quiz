package com.example.quizexam_student.bean.request;

import com.example.quizexam_student.entity.Mark;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class StudentRequest {
    @Valid
    private UserRequest userRequest;

    @NotBlank(message = "Roll Portal is required")
    @Size(max = 20, message = "Roll Portal must be less than or equal to 20 characters")
    private String rollPortal;

    @NotBlank(message = "Roll Number is required")
    @Size(max = 20, message = "Roll Number must be less than or equal to 20 characters")
    private String rollNumber;

    private int classId;

    private List<Mark> marks;
}