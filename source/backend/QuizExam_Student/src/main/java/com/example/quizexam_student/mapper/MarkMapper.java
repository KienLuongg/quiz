package com.example.quizexam_student.mapper;

import com.example.quizexam_student.bean.response.MarkResponse;
import com.example.quizexam_student.bean.response.StudentResponse;
import com.example.quizexam_student.entity.Mark;

public class MarkMapper {
    public static MarkResponse convertToResponse(Mark mark) {
        MarkResponse markResponse = new MarkResponse();
        markResponse.setId(mark.getId());
        markResponse.setBeginTime(mark.getBeginTime());
        markResponse.setSubmittedTime(mark.getSubmittedTime());
        markResponse.setScore(mark.getScore());
        markResponse.setMaxScore(mark.getExamination().getMaxScore());
        markResponse.setWarning(mark.getWarning());
        markResponse.setSubjectName(mark.getSubject().getName());
        return markResponse;
    }

    public static MarkResponse convertToFullResponse(Mark mark) {
        MarkResponse markResponse = convertToResponse(mark);
        StudentResponse studentResponse = StudentMapper.convertToResponse(mark.getStudentDetail());
        markResponse.setStudentResponse(studentResponse);
        return markResponse;
    }
}