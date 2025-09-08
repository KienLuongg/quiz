package com.example.quizexam_student.service;

import com.example.quizexam_student.entity.Permission;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface PermissionService {
    List<Permission> findPermissionsByRole(int id);
}