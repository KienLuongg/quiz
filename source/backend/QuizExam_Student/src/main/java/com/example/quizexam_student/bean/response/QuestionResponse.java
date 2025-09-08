package com.example.quizexam_student.bean.response;

import com.example.quizexam_student.entity.Answer;
import com.example.quizexam_student.entity.Chapter;
import com.example.quizexam_student.entity.Level;
import com.example.quizexam_student.entity.Subject;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Data
@RequiredArgsConstructor
@AllArgsConstructor
public class QuestionResponse {
    private int id;
    private String content;
    private String image;
    private Subject subject;
    private List<Chapter> chapters;
    private Level level;
    @Getter
    private List <Answer> answers;
}
