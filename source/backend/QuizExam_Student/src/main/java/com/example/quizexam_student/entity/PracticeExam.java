package com.example.quizexam_student.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Entity
@Table(name = "t_practice_exam")
@Data
@NoArgsConstructor
@Getter
@Setter
public class PracticeExam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "practice_exam_id")
    private int id;

    @Column(name = "subject_name")
    private String subjectName;

    @Column(name = "duration")
    private int duration;

    @Column(name = "status")
    private int status;

    @OneToMany(mappedBy = "practiceExam")
    private Set<PracticeQuestion> practiceQuestions;

    @OneToMany(mappedBy = "practiceExam")
    private Set<REL_Student_PracticeExam> relStudentPracticeExams;
}
