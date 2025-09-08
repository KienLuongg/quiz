package com.example.quizexam_student.service;

import com.example.quizexam_student.entity.Level;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface LevelService {
    List<Level> getAllLevels();

    Level addLevel(Level level);

    Level editLevel(Integer id, Level level);

    Level getLevelById(Integer id);

    Level deleteLevelById(Integer id);
}
