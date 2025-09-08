package com.example.quizexam_student.repository;

import com.example.quizexam_student.entity.Permission;
import com.example.quizexam_student.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Integer> {
    List<Permission> findByRolesContains(Role role);
}
