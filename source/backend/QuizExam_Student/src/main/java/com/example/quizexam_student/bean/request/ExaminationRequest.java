package com.example.quizexam_student.bean.request;

import com.example.quizexam_student.entity.Level;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
public class ExaminationRequest {
    @NotBlank(message = "Exam name is required")
    private String name;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    @Future(message = "End time must be in the future")
    private LocalDateTime endTime;

    @NotNull(message = "Duration is required")
    private Integer duration;

    @NotNull(message = "Subject is required")
    private Integer subjectId;

    private Map<Integer, Integer> levels;

    @NotNull(message = "Type is required")
    private Integer type;
}