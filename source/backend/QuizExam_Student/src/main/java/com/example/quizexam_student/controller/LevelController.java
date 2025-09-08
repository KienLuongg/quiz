package com.example.quizexam_student.controller;

import com.example.quizexam_student.entity.Level;
import com.example.quizexam_student.service.LevelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/level")
@RequiredArgsConstructor
public class LevelController {
    private final LevelService levelService;

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'SRO')")
    @GetMapping
    public List<Level> getAllLevels() {
        return levelService.getAllLevels();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @GetMapping("/{id}")
    public Level getLevelById(@PathVariable int id) {
        return levelService.getLevelById(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @PostMapping
    public Level addLevel(@Valid @RequestBody Level level) {
        return levelService.addLevel(level);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @PutMapping("/{id}")
    public Level updateLevel(@PathVariable int id, @Valid @RequestBody Level level) {
        return levelService.editLevel(id, level);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @PutMapping("/delete/{id}")
    public Level deleteLevel(@PathVariable int id) {
        return levelService.deleteLevelById(id);
    }
}