package com.example.quizexam_student.bean.response;

import com.example.quizexam_student.entity.Classes;
import com.example.quizexam_student.entity.Mark;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentResponse {
    private UserResponse userResponse;
    private String rollPortal;
    private String rollNumber;
    private Classes classes;
    private List<Mark> marks;
}

