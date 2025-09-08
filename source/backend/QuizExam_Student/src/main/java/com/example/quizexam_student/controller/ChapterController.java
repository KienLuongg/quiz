package com.example.quizexam_student.controller;

import com.example.quizexam_student.bean.request.ChapterRequest;
import com.example.quizexam_student.entity.Chapter;
import com.example.quizexam_student.service.ChapterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chapter")
@RequiredArgsConstructor
@Validated
public class ChapterController {
    private final ChapterService chapterService;

    @GetMapping("/{subjectId}")
    public List<Chapter> getAllChapters(@PathVariable int subjectId) {
        return chapterService.getAllChaptersBySubjectId(subjectId);
    }

    @GetMapping("/find/{id}")
    public Chapter getChapterById(@PathVariable int id) {
        return chapterService.findChapterById(id);
    }

    @PostMapping("")
    public ResponseEntity<Chapter> saveChapter(@Valid @RequestBody ChapterRequest chapterRequest) {
        return ResponseEntity.ok(chapterService.addChapter(chapterRequest));
    }

    @PutMapping("/{id}")
    public Chapter updateChapter(@PathVariable int id, @Valid @RequestBody ChapterRequest chapterRequest) {
        return chapterService.updateChapter(id, chapterRequest);
    }

    @PutMapping("/delete/{id}")
    public ResponseEntity<Chapter> removeChapter(@PathVariable int id) {
        return ResponseEntity.ok(chapterService.deleteChapter(id));
    }
}