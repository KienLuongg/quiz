package com.example.quizexam_student.bean.request;

import com.example.quizexam_student.entity.StudentDetail;
import jakarta.validation.Valid;
import lombok.Data;

@Data
public class UserAndStudentRequest {
    @Valid
    private UserRequest user;

    @Valid
    private StudentDetail studentDetail;
}