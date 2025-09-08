package com.example.quizexam_student.service;

import com.example.quizexam_student.bean.request.ChapterRequest;
import com.example.quizexam_student.entity.Chapter;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ChapterService {
    List<Chapter> getAllChaptersBySubjectId(int subjectId);
    Chapter findChapterById(int id);
    Chapter addChapter(ChapterRequest chapterRequest);
    Chapter updateChapter(int id, ChapterRequest chapterRequest);
    Chapter deleteChapter(int id);
    Boolean ExistChapterName(String name);
    Boolean ExistSubjectId(int subjectId);
}
