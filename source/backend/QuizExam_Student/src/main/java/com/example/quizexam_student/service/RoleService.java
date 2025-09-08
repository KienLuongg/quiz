package com.example.quizexam_student.service;

import com.example.quizexam_student.entity.Role;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface RoleService {
    Role findById(int id);

    List<Role> findAllToAuthorize(Role role);

    List<Role> findAllToEmployee(int id);
}