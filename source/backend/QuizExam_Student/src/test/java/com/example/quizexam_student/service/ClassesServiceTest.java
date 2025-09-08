package com.example.quizexam_student.service;

import com.example.quizexam_student.entity.Classes;
import com.example.quizexam_student.exception.AlreadyExistException;
import com.example.quizexam_student.exception.NotFoundException;
import com.example.quizexam_student.repository.ClassesRepository;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@SpringBootTest
public class ClassesServiceTest {
    @Autowired
    private ClassesService classesService;

    @MockBean
    private ClassesRepository classesRepository;

    private Classes classes;
    private List<Classes> classesList;
    private LocalDate admissionDate;

    @BeforeEach
    void initData(){
        admissionDate = LocalDate.of(2022,9,15);
        classes = Classes.builder()
                .id(1)
                .name("C2209i")
                .classDay("2, 4, 6")
                .classTime("13h30 - 16h30")
                .admissionDate(admissionDate)
                .status(1)
                .build();
        classesList = new ArrayList<>();
        classesList.add(
                Classes.builder()
                        .id(1)
                        .name("C2209i")
                        .classDay("2, 4, 6")
                        .classTime("13h30 - 16h30")
                        .admissionDate(admissionDate)
                        .status(1)
                        .build());
        classesList.add(
                Classes.builder()
                        .id(2)
                        .name("C2208G")
                        .classDay("3, 5, 7")
                        .classTime("13h30 - 16h30")
                        .admissionDate(admissionDate)
                        .status(1)
                        .build());
    }

//    @Test
//    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
//    void getAll_success(){
//        // GIVEN
//        Mockito.when(classesRepository.findAllByStatusOrderByIdDesc(1)).thenReturn(classesList);
//        // WHEN
//        var respone = classesService.findAllClasses();
//        // THEN
//        Assertions.assertThat(respone).isNotNull();
//        Assertions.assertThat(respone.get(0).getId()).isEqualTo(1);
//        Assertions.assertThat(respone.get(0).getName()).isEqualTo("C2209i");
//        Assertions.assertThat(respone.get(0).getClassDay()).isEqualTo("2, 4, 6");
//        Assertions.assertThat(respone.get(0).getClassTime()).isEqualTo("13h30 - 16h30");
//        Assertions.assertThat(respone.get(0).getAdmissionDate()).isEqualTo(admissionDate);
//        Assertions.assertThat(respone.get(0).getStatus()).isEqualTo(1);
//        Assertions.assertThat(respone.get(1).getId()).isEqualTo(2);
//        Assertions.assertThat(respone.get(1).getName()).isEqualTo("C2208G");
//        Assertions.assertThat(respone.get(1).getClassDay()).isEqualTo("3, 5, 7");
//        Assertions.assertThat(respone.get(1).getClassTime()).isEqualTo("13h30 - 16h30");
//        Assertions.assertThat(respone.get(1).getAdmissionDate()).isEqualTo(admissionDate);
//        Assertions.assertThat(respone.get(1).getStatus()).isEqualTo(1);
//    }
//
//    @Test
//    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
//    void createClass_success(){
//        // GIVEN
//        Mockito.when(classesRepository.existsByNameAndStatus("C2209i",1)).thenReturn(false);
//        Mockito.when(classesRepository.save(classes)).thenReturn(classes);
//        // WHEN
//        var response = classesService.addClass(classes);
//        // THEN
//        Assertions.assertThat(response).isNotNull();
//        Assertions.assertThat(response.getId()).isEqualTo(1);
//        Assertions.assertThat(response.getName()).isEqualTo("C2209i");
//        Assertions.assertThat(response.getClassDay()).isEqualTo("2, 4, 6");
//        Assertions.assertThat(response.getClassTime()).isEqualTo("13h30 - 16h30");
//        Assertions.assertThat(response.getAdmissionDate()).isEqualTo(admissionDate);
//        Assertions.assertThat(response.getStatus()).isEqualTo(1);
//    }
//
//    @Test
//    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
//    void createClass_alreadyExistName_fail(){
//        // GIVEN
//        Mockito.when(classesRepository.existsByNameAndStatus("C2209i",1)).thenReturn(true);
//        // WHEN
//        var exception = org.junit.jupiter.api.Assertions
//                .assertThrows(AlreadyExistException.class
//                        ,() -> classesService.addClass(classes));
//        // THEN
//        Assertions.assertThat(exception).isNotNull();
//        Assertions.assertThat(exception.getMessage()).isEqualTo("Class Name already exists.");
//        Assertions.assertThat(exception.getKey()).isEqualTo("className");
//    }
//
//    @Test
//    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
//    void updateClass_success(){
//        // GIVEN
//        Mockito.when(classesRepository.findById(1)).thenReturn(Optional.of(classes));
//        Mockito.when(classesRepository.save(classes)).thenReturn(classes);
//        // WHEN
//        var response = classesService.updateClass(1, classes);
//        // THEN
//        Assertions.assertThat(response).isNotNull();
//        Assertions.assertThat(response.getId()).isEqualTo(1);
//        Assertions.assertThat(response.getName()).isEqualTo("C2209i");
//        Assertions.assertThat(response.getClassDay()).isEqualTo("2, 4, 6");
//        Assertions.assertThat(response.getClassTime()).isEqualTo("13h30 - 16h30");
//        Assertions.assertThat(response.getAdmissionDate()).isEqualTo(admissionDate);
//        Assertions.assertThat(response.getStatus()).isEqualTo(1);
//    }
//
//    @Test
//    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
//    void updateClass_nonExist_fail(){
//        // GIVEN
//        Mockito.when(classesRepository.findById(1))
//                .thenThrow(new NotFoundException("class", "Class not found."));
//        // WHEN
//        var response = org.junit.jupiter.api.Assertions
//                .assertThrows(NotFoundException.class
//                ,() -> classesService.updateClass(1, classes));
//        // THEN
//        Assertions.assertThat(response).isNotNull();
//        Assertions.assertThat(response.getKey()).isEqualTo("class");
//        Assertions.assertThat(response.getMessage()).isEqualTo("Class not found.");
//    }
//
//    @Test
//    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
//    void updateClass_alreadyExistName_fail(){
//        // GIVEN
//        Mockito.when(classesRepository.findById(1)).thenReturn(Optional.of(classes));
//        Mockito.when(classesRepository.existsByNameAndStatusAndIdNot("C2209i",1,1)).thenReturn(true);
//        // WHEN
//        var response = org.junit.jupiter.api.Assertions
//                .assertThrows(AlreadyExistException.class
//                ,() -> classesService.updateClass(1, classes));
//        // THEN
//        Assertions.assertThat(response).isNotNull();
//        Assertions.assertThat(response.getKey()).isEqualTo("className");
//        Assertions.assertThat(response.getMessage()).isEqualTo("Class Name already exists.");
//    }
//
//    @Test
//    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
//    void deleteClass_success(){
//        // GIVEN
//        Mockito.when(classesRepository.findById(1)).thenReturn(Optional.of(classes));
//        // WHEN
//        classesService.deleteClass(1);
//        // THEN
//        Assertions.assertThat(classes.getStatus()).isEqualTo(0);
//        Mockito.verify(classesRepository, Mockito.times(1)).save(classes);
//    }
//
//    @Test
//    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
//    void deleteClass_nonExist_fail(){
//        // GIVEN
//        Mockito.when(classesRepository.findById(1))
//                .thenThrow(new NotFoundException("class", "Class not found."));
//        // WHEN
//        var response = org.junit.jupiter.api.Assertions
//                .assertThrows(NotFoundException.class
//                ,() -> classesService.deleteClass(1));
//        // THEN
//        Assertions.assertThat(response).isNotNull();
//        Assertions.assertThat(response.getKey()).isEqualTo("class");
//        Assertions.assertThat(response.getMessage()).isEqualTo("Class not found.");
//    }
}
