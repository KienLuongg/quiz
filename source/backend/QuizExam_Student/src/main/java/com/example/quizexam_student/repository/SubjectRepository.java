package com.example.quizexam_student.repository;

import com.example.quizexam_student.entity.Sem;
import com.example.quizexam_student.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Integer> {
    Subject findByName(String name);

    List<Subject> findByStatus(int status);

    List<Subject> findBySemAndStatus(Sem sem, int status);

    List<Subject> findAllBySemAndStatus(Sem sem, int status);

    Subject findByIdAndStatus(int id, int status);

    Optional<Subject> findSubjectByIdAndStatus(int id, int status);

    boolean existsByNameAndStatus(String name, int status);

    boolean existsByNameAndStatusAndIdNot(String name, int status, int id);
}