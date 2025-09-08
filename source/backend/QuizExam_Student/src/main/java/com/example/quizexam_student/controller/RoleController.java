package com.example.quizexam_student.controller;

import com.example.quizexam_student.entity.Role;
import com.example.quizexam_student.service.RoleService;
import com.example.quizexam_student.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/role")
@RequiredArgsConstructor
@Validated
public class RoleController {
    private final RoleService roleService;
    private final UserService userService;

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR', 'TEACHER', 'SRO')")
    @GetMapping
    public List<Role> getAllRoles() {
        String email = ((org.springframework.security.core.userdetails.User) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        Role role = userService.findUserByEmail(email).getRole();
        return roleService.findAllToAuthorize(role);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR')")
    @GetMapping("/employee")
    public List<Role> getRoleToEmployees() {
        String email = ((org.springframework.security.core.userdetails.User) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        Role role = userService.findUserByEmail(email).getRole();
        return roleService.findAllToEmployee(role.getId());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR', 'TEACHER', 'SRO')")
    @GetMapping("/{id}")
    public Role getRoleById(@PathVariable int id) {
        return roleService.findById(id);
    }
}