package com.example.quizexam_student.repository;

import com.example.quizexam_student.entity.Level;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LevelRepository extends JpaRepository<Level, Integer> {
    List<Level> findAllByStatus(int status);

    Optional<Level> findByIdAndStatus(int id, int status);

    boolean existsByNameAndStatus(String name, int status);

    boolean existsByNameAndStatusAndIdNot(String name, int status, int id);

    Level findByNameAndStatus(String name , int status);
}