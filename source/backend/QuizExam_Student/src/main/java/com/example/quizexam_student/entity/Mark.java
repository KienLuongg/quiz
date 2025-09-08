package com.example.quizexam_student.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "t_mark")
@Data
@NoArgsConstructor
@Getter
@Setter
public class Mark {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mark_id")
    private Integer id;

    @Column(name = "score")
    private Double score;

    @Column(name = "begin_time")
    private LocalDateTime beginTime;

    @Column(name = "submitted_time")
    private LocalDateTime submittedTime;

    @Column(name = "warning")
    private Integer warning;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "examination_id")
    private Examination examination;

    @OneToMany(mappedBy = "mark")
    private Set<StudentAnswer> studentAnswers;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id")
    private StudentDetail studentDetail;
}