package com.example.quizexam_student.repository;

import com.example.quizexam_student.entity.Classes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassesRepository extends JpaRepository<Classes, Integer> {
    List<Classes> findAllByStatusOrderByIdDesc(int status);

    Optional<Classes> findByIdAndStatus(int id, int status);

    boolean existsByNameAndStatus(String name, int status);

    boolean existsByNameAndStatusAndIdNot(String name, int status, int id);
}