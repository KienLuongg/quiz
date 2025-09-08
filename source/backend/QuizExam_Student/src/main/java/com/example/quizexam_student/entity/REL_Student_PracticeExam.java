package com.example.quizexam_student.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "rel_student_practice_exam")
@Data
@NoArgsConstructor
@Getter
@Setter
public class REL_Student_PracticeExam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rel_student_practice_exam_id")
    private int id;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "practice_exam_id")
    private PracticeExam practiceExam;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id")
    private StudentDetail studentDetail;
}
