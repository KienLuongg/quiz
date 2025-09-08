package com.example.quizexam_student.bean.request;

import lombok.Data;

import java.util.List;

@Data
public class UpdateStudentClassRequest {
    private List<Integer> userIds;

    private int classId;
}