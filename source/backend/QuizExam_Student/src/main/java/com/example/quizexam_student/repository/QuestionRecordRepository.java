package com.example.quizexam_student.repository;

import com.example.quizexam_student.entity.Examination;
import com.example.quizexam_student.entity.QuestionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRecordRepository extends JpaRepository<QuestionRecord, Integer> {
    List<QuestionRecord> findAllByExamination(Examination examination);

    List<QuestionRecord> findAllByExamination_Id(Integer examinationId);
}
