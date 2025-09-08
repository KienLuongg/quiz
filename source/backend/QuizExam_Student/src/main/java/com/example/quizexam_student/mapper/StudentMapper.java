package com.example.quizexam_student.mapper;

import com.example.quizexam_student.bean.request.StudentRequest;
import com.example.quizexam_student.bean.response.*;
import com.example.quizexam_student.entity.StudentDetail;

public class StudentMapper {
    public static StudentDetail convertFromRequest(StudentRequest studentRequest, StudentDetail studentDetail) {
        studentDetail.setRollPortal(studentRequest.getRollPortal());
        studentDetail.setRollNumber(studentRequest.getRollNumber());
        return studentDetail;
    }

    public static StudentResponse convertToResponse(StudentDetail studentDetail) {
        StudentResponse studentResponse = new StudentResponse();
        UserResponse userResponse = UserMapper.convertToResponse(studentDetail.getUser());
        studentResponse.setUserResponse(userResponse);
        studentResponse.setRollPortal(studentDetail.getRollPortal());
        studentResponse.setRollNumber(studentDetail.getRollNumber());
        studentResponse.setClasses(studentDetail.getClasses());
        studentResponse.setMarks(studentDetail.getMarks().stream().toList());
        return studentResponse;
    }
}
