package com.example.quizexam_student.bean.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class UserRequest {
    @NotBlank(message = "Full Name is required")
    @Pattern(regexp="^[a-z A-Z]+$", message = "Full name cannot have number or special character")
    @Size(max = 100, message = "Full name must be less than or equal to 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Size(min = 5, max = 255, message = "Email must be between 5 and 255 characters")
    private String email;

    @NotNull(message = "Date of Birth is required")
    @JsonFormat(pattern = "[yyyy-MM-dd][yyyy/MM/dd][dd-MM-yyyy][dd/MM/yyyy]")
    private LocalDate dob;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be exactly 10 digits long")
    private String phoneNumber;

    @NotBlank(message = "Address is required")
    @Size(max = 255, message = "Address must be less than or equal to 255 characters")
    private String address;

    @NotNull(message = "Gender is required")
    private int gender;

    @NotNull(message = "Role is required")
    private int roleId;
}