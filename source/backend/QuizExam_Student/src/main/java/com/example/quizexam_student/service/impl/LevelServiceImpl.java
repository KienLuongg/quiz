package com.example.quizexam_student.service.impl;

import com.example.quizexam_student.entity.Level;
import com.example.quizexam_student.exception.AlreadyExistException;
import com.example.quizexam_student.exception.NotFoundException;
import com.example.quizexam_student.repository.LevelRepository;
import com.example.quizexam_student.service.LevelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class LevelServiceImpl implements LevelService {
    private final LevelRepository levelRepository;

    @Override
    public List<Level> getAllLevels() {
        return levelRepository.findAllByStatus(1);
    }

    @Override
    public Level getLevelById(Integer id) {
        Level level = levelRepository.findByIdAndStatus(id, 1).orElse(null);
        if (Objects.isNull(level)) {
            throw new NotFoundException("level", "Level not found.");
        }
        return level;
    }

    @Override
    public Level addLevel(Level level) {
        if (levelRepository.existsByNameAndStatus(level.getName(), 1)) {
            throw new AlreadyExistException("name", "Level Name already exist");
        }
        level.setStatus(1);
        level.setPoint(level.getPoint());
        return levelRepository.save(level);
    }

    @Override
    public Level editLevel(Integer id, Level level) {
        Level oldLevel = getLevelById(id);
        if (levelRepository.existsByNameAndStatusAndIdNot(level.getName(), 1, id)) {
            throw new AlreadyExistException("name", "Level Name already exist");
        }
        oldLevel.setName(level.getName());
        oldLevel.setPoint(level.getPoint());
        return levelRepository.save(oldLevel);
    }

    @Override
    public Level deleteLevelById(Integer id) {
        Level level = getLevelById(id);
        level.setStatus(0);
        return levelRepository.save(level);
    }
}