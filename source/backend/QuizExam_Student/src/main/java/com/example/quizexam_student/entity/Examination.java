package com.example.quizexam_student.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "t_examination")
@Data
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode
public class Examination {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "examination_id")
    private int id;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "start_time", nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime endTime;

    @Column(name = "duration", nullable = false)
    private Integer duration;

    @Column(name = "code", length = 30, nullable = false)
    private String code;

    @Column(name = "max_score", nullable = false)
    private Double maxScore;

    @Column(name = "total_question", nullable = false)
    private Integer totalQuestion;

    @Column(name = "type", nullable = false)
    private Integer type;

    @Column(name = "status", nullable = false)
    private Integer status;

    @OneToMany(mappedBy = "examination")
    private Set<Mark> marks;

    @OneToMany(mappedBy = "examination")
    private Set<QuestionRecord> questionRecords;

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(name = "rel_examination_question",
            joinColumns = @JoinColumn(name = "examination_id"),
            inverseJoinColumns = @JoinColumn(name = "question_id"))
    private Set<Question> questions;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "subject_id")
    private Subject subject;
}