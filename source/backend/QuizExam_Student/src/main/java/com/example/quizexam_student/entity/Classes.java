package com.example.quizexam_student.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.Set;

@Entity
@Data
@Table(name = "t_class")
@NoArgsConstructor
@Getter
@Setter
@Builder
@AllArgsConstructor
@EqualsAndHashCode
public class Classes {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "class_id")
    private int id;

    @Column(name = "name", length = 6, nullable = false)
    @NotBlank(message = "Class Name is required")
    @Size(max = 6, message = "Class Name must be less than or equal to 6 characters")
    private String name;

    @Column(name = "class_day", length = 30, nullable = false)
    @NotBlank(message = "Class Day is required")
    @Size(max = 30, message = "Class Day must be less than or equal to 30 characters")
    private String classDay;

    @Column(name = "class_time", length = 30, nullable = false)
    @NotBlank(message = "Class Time is required")
    @Size(max = 30, message = "Class Time must be less than or equal to 30 characters")
    private String classTime;

    @Column(name = "admission_date", nullable = false)
    @NotNull(message = "Admission Date is required")
    private LocalDate admissionDate;

    @Column(name = "status", nullable = false)
    private int status;

    @OneToMany(mappedBy = "classes")
    @JsonIgnore
    private Set<StudentDetail> studentDetails;
}