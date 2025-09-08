package com.example.quizexam_student.controller;

import com.example.quizexam_student.entity.Sem;
import com.example.quizexam_student.service.SemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sem")
@RequiredArgsConstructor
@Validated
public class SemController {
    private final SemService semService;

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR', 'TEACHER', 'SRO', 'STUDENT')")
    @GetMapping("")
    public List<Sem> getAllSemesters() {
        return semService.getAllSem();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR', 'TEACHER', 'SRO', 'STUDENT')")
    @GetMapping("/{id}")
    public Sem getSemById(@PathVariable Integer id) {
        return semService.getSemById(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR')")
    @PostMapping("")
    public Sem createSem(@RequestBody @Valid Sem sem) {
        return semService.createSem(sem);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR')")
    @PutMapping("/{id}")
    public Sem updateSem(@PathVariable Integer id, @RequestBody @Valid Sem sem) {
        return semService.updateSem(id, sem);
    }
}