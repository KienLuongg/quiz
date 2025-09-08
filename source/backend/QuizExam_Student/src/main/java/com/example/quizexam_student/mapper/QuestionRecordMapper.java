package com.example.quizexam_student.mapper;

import com.example.quizexam_student.bean.response.AnswerRecordResponse;
import com.example.quizexam_student.bean.response.QuestionRecordResponse;
import com.example.quizexam_student.entity.AnswerRecord;
import com.example.quizexam_student.entity.QuestionRecord;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;


public class QuestionRecordMapper {
    public static QuestionRecordResponse convertToResponse(QuestionRecord questionRecord) {
        QuestionRecordResponse questionRecordResponse = new QuestionRecordResponse();
        questionRecordResponse.setId(questionRecord.getId());
        questionRecordResponse.setImage(questionRecord.getImage());
        questionRecordResponse.setContent(questionRecord.getContent());
        questionRecordResponse.setType(questionRecord.getType());
        List<AnswerRecordResponse> answerRecords = questionRecord.getAnswerRecords().stream()
                .map(answerRecord -> {
                    AnswerRecordResponse answer = new AnswerRecordResponse();
                    answer.setId(answerRecord.getId());
                    answer.setContent(answerRecord.getContent());
                    return answer;
                })
                .collect(Collectors.toList());

        Collections.shuffle(answerRecords);
        questionRecordResponse.setAnswerRecords(answerRecords);
        return questionRecordResponse;
    }
}
