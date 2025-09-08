package com.example.quizexam_student.bean.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class PasswordRequest {
    @NotBlank(message = "Current password is required")
    private String currentPassword;
    @NotBlank(message = "New password is required")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=.]).{8,}$",
            message = "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    private String newPassword;
    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;
}
