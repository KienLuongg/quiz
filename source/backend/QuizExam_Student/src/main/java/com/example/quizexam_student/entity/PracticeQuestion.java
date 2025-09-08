package com.example.quizexam_student.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Entity
@Table(name = "t_practice_question")
@Data
@NoArgsConstructor
@Getter
@Setter
public class PracticeQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "practice_question_id")
    private int id;

    @Column(name = "content")
    private String content;

    @Column(name = "image")
    private String image;

    @Column(name = "point")
    private int point;

    @OneToMany(mappedBy = "practiceQuestion")
    private Set<PracticeAnswer> practiceAnswers;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "practice_exam_id")
    private PracticeExam practiceExam;
}
