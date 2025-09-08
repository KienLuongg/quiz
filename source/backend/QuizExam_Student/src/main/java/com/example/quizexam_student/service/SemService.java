package com.example.quizexam_student.service;

import com.example.quizexam_student.entity.Sem;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface SemService {
    List<Sem> getAllSem();
    Sem getSemById(int id);
    Sem getSemByName(String name);

    Sem createSem(Sem sem);

    Sem updateSem(int id, Sem sem);
}
