package com.example.quizexam_student.mapper;

import com.example.quizexam_student.bean.request.AnswerRequest;
import com.example.quizexam_student.entity.Answer;

public class AnswerMapper {
    public static Answer convertFromRequest(AnswerRequest answerRequest) {
        Answer answer = new Answer();
        answer.setContent(answerRequest.getContent());
        answer.setIsCorrect(answerRequest.getIsCorrect());
        return answer;
    }
}
