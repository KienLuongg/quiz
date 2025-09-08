package com.example.quizexam_student.service;

import com.example.quizexam_student.bean.request.StudentRequest;
import com.example.quizexam_student.entity.StudentDetail;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface StudentService {
    List<StudentDetail> findAllStudentsNoneClass(Integer status);

    List<StudentDetail> findAllStudentsByClass(Integer status, Integer classId);

    StudentDetail findStudentById(Integer id);

    StudentDetail findStudentByUserId(Integer userId);

    StudentDetail addStudent(StudentRequest studentRequest);

    StudentDetail updateStudent(StudentRequest studentRequest, Integer id);

    List<StudentDetail> findStudentsMovingToClass(List<Integer> userIds);

    List<StudentDetail> updateClassForStudents(List<Integer> userIds, Integer classId);

    StudentDetail resetPassword(Integer id);

    StudentDetail deleteStudent(Integer id);

    StudentDetail restoreStudent(Integer id);

    List<StudentDetail> findAllStudentsForExam(Integer status, Integer classId, Integer examId);

    Long countAllStudents();
}