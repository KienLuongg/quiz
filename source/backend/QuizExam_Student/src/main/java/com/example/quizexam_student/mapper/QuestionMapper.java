package com.example.quizexam_student.mapper;

import com.example.quizexam_student.bean.request.QuestionRequest;
import com.example.quizexam_student.bean.response.QuestionResponse;
import com.example.quizexam_student.entity.Question;

public class QuestionMapper {
    public static Question convertFromRequest(QuestionRequest questionRequest) {
        Question question = new Question();
        question.setContent(questionRequest.getContent());
        question.setImage(questionRequest.getImage().isEmpty() ? null : questionRequest.getImage());
        return question;
    }

    public static QuestionResponse convertToResponse(Question question) {
        QuestionResponse questionResponse = new QuestionResponse();
        questionResponse.setId(question.getId());
        questionResponse.setContent(question.getContent());
        questionResponse.setImage(question.getImage());
        questionResponse.setSubject(question.getSubject());
        questionResponse.setLevel(question.getLevel());
        questionResponse.setAnswers(question.getAnswers().stream().toList());
        questionResponse.setChapters(question.getChapters().stream().toList());
        return questionResponse;
    }
}
