package com.example.quizexam_student.service;

import com.example.quizexam_student.bean.response.MarkResponse;
import com.example.quizexam_student.entity.Mark;
import com.example.quizexam_student.entity.StudentDetail;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public interface MarkService {
    List<MarkResponse> findAllMarkByExam(Integer examId);

    List<MarkResponse> getListScoredPerSubject(StudentDetail studentDetail, Integer semId);

    MarkResponse getOneScoredByExam(StudentDetail studentDetail, Integer examId);

    List<Map<String, Object>> getPassPercentageForSubject();

    List<MarkResponse> updateMark(Integer examId, List<Integer> studentIds);

    Mark updateBeginTime(Integer id);

    Mark updateWarning(Integer id, Mark mark);
}
