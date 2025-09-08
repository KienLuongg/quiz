package com.example.quizexam_student.repository;

import com.example.quizexam_student.entity.Examination;
import com.example.quizexam_student.entity.Mark;
import com.example.quizexam_student.entity.StudentDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MarkRepository extends JpaRepository<Mark, Integer> {
    List<Mark> findAllByExamination_Id(Integer examinationId);
    List<Mark> findAllByExamination_IdAndBeginTimeIsNull(Integer examinationId);
    List<Mark> findAllByExamination_IdAndBeginTimeIsNotNull(Integer examinationId);
    Mark findByStudentDetailAndExamination_IdOrderByIdDesc(StudentDetail studentDetail, Integer examinationId);
    List<Mark> findAllByStudentDetailAndScoreIsNull(StudentDetail studentDetail);
    List<Mark> findAllByScoreIsNotNull();
    List<Mark> findAllByExamination(Examination examination);

    List<Mark> findAllByStudentDetailAndSubject_Sem_IdAndScoreIsNotNull(StudentDetail studentDetail, Integer semId);

    boolean existsByExamination_IdAndStudentDetail_UserIdAndBeginTimeIsNotNull(Integer examinationId, Integer userId);

    //Tìm danh sách Mark theo subjectId và score not null (order by examId)
    List<Mark> findAllBySubject_IdAndScoreIsNotNullOrderByExamination_IdDesc(Integer subjectId);

    //Tìm danh sách Mark theo semId và score not null
    List<Mark> findAllBySubject_Sem_IdAndScoreIsNotNull(Integer subjectId);
}
