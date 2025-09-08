package com.example.quizexam_student.bean.response;

import com.example.quizexam_student.entity.Mark;
import com.example.quizexam_student.entity.Subject;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
@Data
public class ExaminationResponse {
    private int id;
    private String name;
    private String code;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer duration;
    private Integer totalQuestion;
    private Double maxScore;
    private Integer type;
    private Subject subject;
    private List<QuestionRecordResponse> questionRecordResponses;
    private List<StudentResponse> studentResponses;
    private List<MarkResponse> markResponses;
}
