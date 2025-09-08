package com.example.quizexam_student.service;

import com.example.quizexam_student.entity.Classes;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ClassesService {
    List<Classes> findAllClasses();

    Classes findOneById(int id);

    Classes addClass(Classes _class);

    Classes updateClass(int id, Classes _class);

    Classes deleteClass(int id);
}