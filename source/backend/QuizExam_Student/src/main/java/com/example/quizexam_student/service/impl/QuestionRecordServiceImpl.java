package com.example.quizexam_student.service.impl;

import com.example.quizexam_student.entity.Examination;
import com.example.quizexam_student.entity.QuestionRecord;
import com.example.quizexam_student.exception.NotFoundException;
import com.example.quizexam_student.repository.ExaminationRepository;
import com.example.quizexam_student.repository.QuestionRecordRepository;
import com.example.quizexam_student.service.QuestionRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionRecordServiceImpl implements QuestionRecordService {
    private final ExaminationRepository examinationRepository;

    private final QuestionRecordRepository questionRecordRepository;

    @Override
    public Map<String, Double> getMaxScoreByLevelForExam(Integer examinationId) {
        Examination examination = examinationRepository.findById(examinationId).orElse(null);
        if (Objects.isNull(examination)) {
            throw new NotFoundException("examination", "Not found examination");
        }
        List<QuestionRecord> questionRecords = questionRecordRepository.findAllByExamination_Id(examination.getId());

        // Tính tổng điểm cho từng level
        return questionRecords.stream().collect(Collectors.groupingBy(
                QuestionRecord::getLevel,
                Collectors.summingDouble(QuestionRecord::getPoint)
        ));
    }
}