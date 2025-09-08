package com.example.quizexam_student.repository;

import com.example.quizexam_student.entity.StudentDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<StudentDetail, Integer> {
    List<StudentDetail> findAllByUser_StatusAndUser_Role_IdAndClassesIsNullOrderByUserIdDesc(Integer status, Integer roleId);

    List<StudentDetail> findAllByUser_StatusAndUser_Role_IdAndClasses_IdOrderByUserIdDesc(Integer status, Integer roleId, Integer classId);

    Optional<StudentDetail> findByUserId(Integer userId);

    StudentDetail findByUserIdAndUser_StatusAndUser_Role_Id(Integer userId, Integer status, Integer roleId);

    List<StudentDetail> findAllByUserIdIn(List<Integer> users);

    StudentDetail findByRollNumber(String rollNumber);

    StudentDetail findByRollPortal(String rollPortal);

    StudentDetail findByRollPortalAndUserIdNot(String rollPortal, Integer id);

    StudentDetail findByRollNumberAndUserIdNot(String rollNumber, Integer id);

    Long countByUser_StatusAndUser_Role_Id(Integer status, Integer roleId);
}