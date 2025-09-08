package com.example.quizexam_student.repository;

import com.example.quizexam_student.entity.Answer;
import com.example.quizexam_student.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Integer> {
    List<Answer> findByQuestion(Question question);
}
