package com.example.quizexam_student.bean.request;

//import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
//import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class LoginRequest {
//    @Email(message = "Email should be valid")
//    @Pattern(regexp = "^[\\w_.]{5,33}[@][\\w]{2,9}([.][a-zA-Z]{2,9})+$", message = "Email should be valid")
    @NotBlank(message = "Email is required")
    private String email;
    @NotBlank(message = "Password is required")
    private String password;
}
