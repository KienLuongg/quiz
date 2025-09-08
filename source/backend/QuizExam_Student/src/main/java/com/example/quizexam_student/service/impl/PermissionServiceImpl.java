package com.example.quizexam_student.service.impl;

import com.example.quizexam_student.entity.Permission;
import com.example.quizexam_student.entity.Role;
import com.example.quizexam_student.exception.NotFoundException;
import com.example.quizexam_student.repository.PermissionRepository;
import com.example.quizexam_student.repository.RoleRepository;
import com.example.quizexam_student.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {
    private final RoleRepository roleRepository;

    private final PermissionRepository permissionRepository;

    @Override
    public List<Permission> findPermissionsByRole(int id) {
        Role role = roleRepository.findById(id).orElseThrow(() -> new NotFoundException("role", "Role is not exist"));
        return permissionRepository.findByRolesContains(role);
    }
}