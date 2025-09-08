package com.example.quizexam_student.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "t_student_detail")
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(exclude = {"user", "classes"})
public class StudentDetail {
    @Id
    @Column(name = "user_id")
    private int userId;

    @MapsId
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "roll_portal", length = 20, nullable = false)
    private String rollPortal;

    @Column(name = "roll_number", length = 20, nullable = false)
    private String rollNumber;

    @JsonIgnore
    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "class_id")
    private Classes classes;

    @OneToMany(mappedBy = "studentDetail")
    private Set<Mark> marks = new HashSet<>();

    @OneToMany(mappedBy = "studentDetail")
    private Set<REL_Student_PracticeExam> rel_Student_PracticeExam;
}