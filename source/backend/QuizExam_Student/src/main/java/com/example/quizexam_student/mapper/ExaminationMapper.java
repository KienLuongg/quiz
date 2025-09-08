package com.example.quizexam_student.mapper;

import com.example.quizexam_student.bean.request.ExaminationRequest;
import com.example.quizexam_student.bean.response.ExaminationResponse;
import com.example.quizexam_student.entity.Examination;
import com.example.quizexam_student.exception.InvalidTimeException;

public class ExaminationMapper {
    public static Examination convertFromRequest(ExaminationRequest examinationRequest) {
        Examination examination = new Examination();
        examination.setName(examinationRequest.getName());
        examination.setStartTime(examinationRequest.getStartTime());
        examination.setEndTime(examinationRequest.getEndTime());
        examination.setDuration(examinationRequest.getDuration());
        examination.setType(examinationRequest.getType());
        return examination;
    }

    public static ExaminationResponse convertToResponse(Examination examination) {
        ExaminationResponse examinationResponse = new ExaminationResponse();
        assert examination != null;
        examinationResponse.setId(examination.getId());
        examinationResponse.setName(examination.getName());
        examinationResponse.setCode(examination.getCode());
        examinationResponse.setStartTime(examination.getStartTime());
        examinationResponse.setEndTime(examination.getEndTime());
        examinationResponse.setDuration(examination.getDuration());
        examinationResponse.setType(examination.getType());
        examinationResponse.setSubject(examination.getSubject());
        examinationResponse.setTotalQuestion(examination.getTotalQuestion());
        examinationResponse.setMaxScore(examination.getMaxScore());
        return examinationResponse;
    }
}