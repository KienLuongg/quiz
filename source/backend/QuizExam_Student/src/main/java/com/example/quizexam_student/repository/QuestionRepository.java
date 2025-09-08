package com.example.quizexam_student.repository;

import com.example.quizexam_student.entity.Question;
import com.example.quizexam_student.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Integer> {
    List<Question> findAllBySubjectAndStatusOrderByIdDesc(Subject subject, int status);

    List<Question> findAllByIdInAndStatus(List<Integer> id, int status);

    Question findByIdAndStatus(int id, int status);
}
