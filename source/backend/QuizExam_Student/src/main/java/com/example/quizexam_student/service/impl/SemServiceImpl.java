package com.example.quizexam_student.service.impl;

import com.example.quizexam_student.entity.Sem;
import com.example.quizexam_student.exception.AlreadyExistException;
import com.example.quizexam_student.exception.NotFoundException;
import com.example.quizexam_student.repository.SemRepository;
import com.example.quizexam_student.service.SemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SemServiceImpl implements SemService {

    private final SemRepository semRepository;

    @Override
    public List<Sem> getAllSem() {
        return semRepository.findAll();
    }

    @Override
    public Sem getSemById(int id) {
        return semRepository.findById(id).orElseThrow(() -> new NotFoundException("sem","Semester not found"));
    }

    @Override
    public Sem getSemByName(String name) {
        return semRepository.findByName(name);
    }

    @Override
    public Sem createSem(Sem sem) {
        if (semRepository.existsByName(sem.getName())) {
            throw new AlreadyExistException("name", "Sem already exists.");
        }
        return semRepository.save(sem);
    }

    @Override
    public Sem updateSem(int id, Sem sem) {
        Sem semUpdate = getSemById(id);
        if (semRepository.existsByNameAndIdNot(sem.getName(), id)) {
            throw new AlreadyExistException("name", "Sem already exists.");
        }
        semUpdate.setName(sem.getName());
        return semRepository.save(semUpdate);
    }
}