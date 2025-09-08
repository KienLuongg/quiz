package com.example.quizexam_student.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "t_question")
@Data
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(exclude = {"subject", "chapters", "examinations"})
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    private int id;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "status", nullable = false)
    private int status;

    @Column(name = "image")
    private String image;

    @ManyToMany(cascade = CascadeType.ALL, mappedBy = "questions")
    @JsonIgnore
    private Set<Examination> examinations;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(name = "rel_chapter_question", joinColumns = @JoinColumn( name = "question_id"), inverseJoinColumns = @JoinColumn(name = "chapter_id"))
    private Set<Chapter> chapters;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "level_id")
    private Level level;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "question", orphanRemoval = false)
    private Set<Answer> answers = new HashSet<>();
}