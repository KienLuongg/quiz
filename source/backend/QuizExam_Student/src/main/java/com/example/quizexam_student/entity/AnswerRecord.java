package com.example.quizexam_student.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "t_answer_record")
@Data
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(exclude = {"questionRecord"})
public class AnswerRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "answer_record_id")
    private int id;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_correct", nullable = false, columnDefinition = "TINYINT")
    private Boolean isCorrect;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "question_record_id")
    @JsonIgnore
    private QuestionRecord questionRecord;
}