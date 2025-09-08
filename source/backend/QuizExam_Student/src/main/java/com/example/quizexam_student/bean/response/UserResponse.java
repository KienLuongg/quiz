package com.example.quizexam_student.bean.response;

import com.example.quizexam_student.entity.Role;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private int id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String address;
    private LocalDate dob;
    private int gender;
    private Role role;
}
