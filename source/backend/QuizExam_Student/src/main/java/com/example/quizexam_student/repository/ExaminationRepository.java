package com.example.quizexam_student.repository;

import com.example.quizexam_student.entity.Examination;
import com.example.quizexam_student.entity.Mark;
import com.example.quizexam_student.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;


@Repository
public interface ExaminationRepository extends JpaRepository<Examination, Integer> {
    List<Examination> findAllBySubject_Sem_IdAndStatusOrderByIdDesc(int semId, int status);

    List<Examination> findAllByStatus(int status);

    boolean existsByCodeAndStatus(String code, int status);

    List<Examination> findTop3BySubjectOrderByIdDesc(Subject subject);

    Examination findByMarksContainingAndStatus(Mark marks, int status);

    Examination findByIdAndStatus(int id, int status);
}