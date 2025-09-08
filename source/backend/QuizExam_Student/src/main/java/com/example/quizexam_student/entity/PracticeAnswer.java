package com.example.quizexam_student.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "t_practice_answer")
@Data
@NoArgsConstructor
@Getter
@Setter
public class PracticeAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "practice_answer_id")
    private int id;

    @Column(name = "content")
    private String content;

    @Column(name = "is_correct")
    private int isCorrect;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "practice_question_id")
    private PracticeQuestion practiceQuestion;
}
