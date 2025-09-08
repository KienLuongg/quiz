package com.example.quizexam_student.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Entity
@Table(name = "t_subject")
@Data
@NoArgsConstructor
@Getter
@Setter
@Builder
@AllArgsConstructor
@EqualsAndHashCode
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subject_id")
    private int id;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "status", nullable = false)
    private int status;

    @Column(name = "image")
    private String image;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "sem_id")
    private Sem sem;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "subject")
    @JsonIgnore
    private Set<Chapter> chapters;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "subject")
    @JsonIgnore
    private Set<Examination> examinations;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "subject")
    @JsonIgnore
    private Set<Mark> marks;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "subject")
    @JsonIgnore
    private Set<Question> questions;
}