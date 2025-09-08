package com.example.quizexam_student.controller;

import com.example.quizexam_student.entity.Permission;
import com.example.quizexam_student.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permission")
@RequiredArgsConstructor
@Validated
public class PermissionController {
    private final PermissionService permissionService;

    @GetMapping("/{id}")
    public List<Permission> getPermissionByRoleId(@PathVariable int id) {
        return permissionService.findPermissionsByRole(id);
    }
}