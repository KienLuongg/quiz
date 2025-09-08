package com.example.quizexam_student.service;

import com.example.quizexam_student.bean.request.SubjectRequest;
import com.example.quizexam_student.entity.Subject;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface SubjectService {
    Boolean existSubjectByName(String subjectName);
    List<Subject> findAll();
    Subject findById(int id);
    Subject save(SubjectRequest subjectRequest);
    Subject deleteById(int id);
    Subject update(int id, SubjectRequest subjectRequest);

    List<Subject> getAllSubjectBySem(int id);
}
