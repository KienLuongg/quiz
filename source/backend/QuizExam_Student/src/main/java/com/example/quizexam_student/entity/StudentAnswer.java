package com.example.quizexam_student.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "t_student_answer")
@Data
@NoArgsConstructor
@Getter
@Setter
public class StudentAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_answer_id")
    private Integer id;

    @Column(name = "selected_answer_id", nullable = false)
    private Integer selectedAnswer;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "mark_id")
    private Mark mark;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "question_record_id")
    private QuestionRecord questionRecord;
}