package com.example.quizexam_student.service;

import com.example.quizexam_student.bean.request.SubjectRequest;
import com.example.quizexam_student.entity.Sem;
import com.example.quizexam_student.entity.Subject;
import com.example.quizexam_student.exception.AlreadyExistException;
import com.example.quizexam_student.exception.NotFoundException;
import com.example.quizexam_student.repository.SemRepository;
import com.example.quizexam_student.repository.SubjectRepository;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@SpringBootTest
public class SubjectServiceTest {
    @Autowired
    private SubjectService subjectService;

    @MockBean
    private SubjectRepository subjectRepository;
    @MockBean
    private SemRepository semRepository;

    private SemService semService;
    private SubjectRequest subjectRequest;
    private Subject subject;
    private Sem sem;
    private List<Subject> subjectList;

    @BeforeEach
    void initData(){
        subjectRequest = SubjectRequest.builder()
                .name("Java I")
                .image("java1.png")
                .semId(2)
                .build();
        sem = new Sem(2,"2",null);

        subject = Subject.builder()
                .id(1)
                .name("Java I")
                .image("java1.png")
                .sem(sem)
                .status(1)
                .build();

        subjectList = new ArrayList<>();
        subjectList.add(Subject.builder()
                .id(1)
                .name("Java I")
                .image("java1.png")
                .sem(sem)
                .status(1)
                .build());
        subjectList.add(Subject.builder()
                .id(2)
                .name("Java II")
                .image("java2.png")
                .sem(sem)
                .status(1)
                .build());
    }

//    @Test
//    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
//    void existSubjectByName_existingSubject_returnsTrue() {
//        // GIVEN
//        Mockito.when(subjectRepository.findByName("Java I")).thenReturn(subject);
//
//        // WHEN
//        Boolean exists = subjectService.existSubjectByName("Java I");
//
//        // THEN
//        assertThat(exists).isTrue();
//    }
//
//    @Test
//    void existSubjectByName_nonExistingSubject_returnsFalse() {
//        // GIVEN
//        Mockito.when(subjectRepository.findByName("Non-existing Subject")).thenReturn(null);
//
//        // WHEN
//        Boolean exists = subjectService.existSubjectByName("Non-existing Subject");
//
//        // THEN
//        assertThat(exists).isFalse();
//    }
//
//
//    @Test
//    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
//    void createSubject_validRequest_success(){
//        // GIVEN
//        Mockito.when(subjectRepository.findByName(subjectRequest.getName())).thenReturn(null);
//        Mockito.when(subjectRepository.save(ArgumentMatchers.any())).thenReturn(subject);
//
//        // WHEN
//        var response = subjectService.save(subjectRequest);
//
//        // THEN
//        Assertions.assertThat(response.getId()).isEqualTo(1);
//        Assertions.assertThat(response.getName()).isEqualTo("Java I");
//        Assertions.assertThat(response.getImage()).isEqualTo("java1.png");
//        Assertions.assertThat(response.getSem().getId()).isEqualTo(2);
//        Assertions.assertThat(response.getSem().getName()).isEqualTo("2");
//
//    }
//
//    @Test
//    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
//    void createSubject_alreadyExistName_fail(){
//        // GIVEN
//        Mockito.when(subjectRepository.findByName(subjectRequest.getName())).thenReturn(subject);
//
//        // WHEN
//        var exception = org.junit.jupiter.api.Assertions.assertThrows(
//                AlreadyExistException.class,
//                () -> subjectService.save(subjectRequest));
//
//        // THEN
//        Assertions.assertThat(exception.getKey()).isEqualTo("AlreadyExistSubject");
//        Assertions.assertThat(exception.getMessage()).isEqualTo("Subject already exist");
//
//    }
//
//    @Test
//    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
//    void getAll_success(){
//        // GIVEN
//        Mockito.when(subjectRepository.findByStatus(1)).thenReturn(subjectList);
//
//        // WHEN
//        var response = subjectService.findAll();
//
//        // THEN
//        Assertions.assertThat(response).isNotNull();
//        Assertions.assertThat(response.size()).isEqualTo(subjectList.size());
//        Assertions.assertThat(response.get(0).getId()).isEqualTo(1);
//        Assertions.assertThat(response.get(0).getName()).isEqualTo("Java I");
//        Assertions.assertThat(response.get(0).getImage()).isEqualTo("java1.png");
//        Assertions.assertThat(response.get(0).getSem().getId()).isEqualTo(2);
//        Assertions.assertThat(response.get(0).getSem().getName()).isEqualTo("2");
//        Assertions.assertThat(response.get(0).getStatus()).isEqualTo(1);
//        Assertions.assertThat(response.get(1).getId()).isEqualTo(2);
//        Assertions.assertThat(response.get(1).getName()).isEqualTo("Java II");
//        Assertions.assertThat(response.get(1).getImage()).isEqualTo("java2.png");
//        Assertions.assertThat(response.get(1).getSem().getId()).isEqualTo(2);
//        Assertions.assertThat(response.get(1).getSem().getName()).isEqualTo("2");
//        Assertions.assertThat(response.get(1).getStatus()).isEqualTo(1);
//    }
//
//    @Test
//    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
//    void getSubjectById_success(){
//        // GIVEN
//        Mockito.when(subjectRepository.findById(1)).thenReturn(Optional.ofNullable(subject));
//
//        // WHEN
//        var response = subjectService.findById(1);
//
//        // THEN
//        Assertions.assertThat(response).isNotNull();
//        Assertions.assertThat(response.getId()).isEqualTo(1);
//        Assertions.assertThat(response.getName()).isEqualTo("Java I");
//        Assertions.assertThat(response.getImage()).isEqualTo("java1.png");
//        Assertions.assertThat(response.getSem().getId()).isEqualTo(2);
//        Assertions.assertThat(response.getSem().getName()).isEqualTo("2");
//        Assertions.assertThat(response.getStatus()).isEqualTo(1);
//
//    }
//
//    @Test
//    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
//    void getSubjectById_fail(){
//        // GIVEN
//        Mockito.when(subjectRepository.findById(1))
//                .thenThrow(new NotFoundException("NotFoundSubject","Subject not found"));
//
//        // WHEN
//        var exception = org.junit.jupiter.api.Assertions.assertThrows(
//                NotFoundException.class,
//                () -> subjectService.findById(1));
//
//        // THEN
//        Assertions.assertThat(exception.getKey()).isEqualTo("NotFoundSubject");
//        Assertions.assertThat(exception.getMessage()).isEqualTo("Subject not found");
//
//    }
//
//    @Test
//    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
//    void deleteSubject_success(){
//        // GIVEN
//        Mockito.when(subjectRepository.findById(1)).thenReturn(Optional.ofNullable(subject));
//
//        // WHEN
//        subjectService.deleteById(1);
//
//        // THEN
//        Assertions.assertThat(subject.getStatus()).isEqualTo(0);
//        Mockito.verify(subjectRepository, Mockito.times(1)).save(subject);
//    }
//
//    @Test
//    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
//    void deleteSubject_fail(){
//        // GIVEN
//        Mockito.doThrow(new NotFoundException("NotFoundSubject","Subject not found")).when(subjectRepository).deleteById(2);
//        // WHEN
//        var exception = org.junit.jupiter.api.Assertions.assertThrows(
//                NotFoundException.class, () -> subjectService.deleteById(2)
//        );
//        // THEN
//        Assertions.assertThat(exception.getKey()).isEqualTo("NotFoundSubject");
//        Assertions.assertThat(exception.getMessage()).isEqualTo("Subject not found");
//    }
//
//    @Test
//    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
//    void updateSubject_success(){
//        // GIVEN
//        Mockito.when(subjectRepository.findSubjectByIdAndStatus(1, 1)).thenReturn(Optional.ofNullable(subject));
//            Mockito.when(subjectRepository.save(ArgumentMatchers.any())).thenReturn(subject);
//        // WHEN
//        var response = subjectService.update(1, subjectRequest);
//        // THEN
//        Assertions.assertThat(response.getId()).isEqualTo(1);
//        Assertions.assertThat(response.getName()).isEqualTo("Java I");
//        Assertions.assertThat(response.getImage()).isEqualTo("java1.png");
//        Assertions.assertThat(response.getSem().getId()).isEqualTo(2);
//        Assertions.assertThat(response.getSem().getName()).isEqualTo("2");
//        Assertions.assertThat(response.getStatus()).isEqualTo(1);
//    }
//
//    @Test
//    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
//    void updateSubject_nonExist_fail(){
//        // GIVEN
//        Mockito.doThrow(new NotFoundException("NotFoundSubject","Subject not found")).when(subjectRepository).findById(2);
//        // WHEN
//        var exception = org.junit.jupiter.api.Assertions.assertThrows(
//                NotFoundException.class, () -> subjectService.update(2, subjectRequest)
//        );
//        // THEN
//        Assertions.assertThat(exception.getKey()).isEqualTo("NotFoundSubject");
//        Assertions.assertThat(exception.getMessage()).isEqualTo("Subject not found");
//    }
//
//    @Test
//    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
//    void updateSubject_alreadyExist_fail(){
//        // GIVEN
//        Mockito.when(subjectRepository.findSubjectByIdAndStatus(1, 1)).thenReturn(Optional.ofNullable(subject));
//        subjectRequest.setName("Java I");
//        Mockito.when(subjectRepository.findByName("Java I")).thenReturn(new Subject());
//        // WHEN
//        var exception = org.junit.jupiter.api.Assertions.assertThrows(
//                AlreadyExistException.class,
//                () -> subjectService.update(1, subjectRequest)
//        );
//        // THEN
//        Assertions.assertThat(exception.getKey()).isEqualTo("AlreadyExistSubject");
//        Assertions.assertThat(exception.getMessage()).isEqualTo("Subject already exist");
//    }
//
//    @Test
//    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
//    void getAllSubjectBySem_existingSem_returnsSubjects() {
//        // GIVEN
//        Mockito.when(semRepository.findById(2)).thenReturn(Optional.of(sem));
//        Mockito.when(subjectRepository.findBySemAndStatus(sem, 1)).thenReturn(subjectList);
//
//        // WHEN
//        var response = subjectService.getAllSubjectBySem(2);
//
//        // THEN
//        Assertions.assertThat(response).isNotNull();
//        Assertions.assertThat(response.get(0).getSem().getId()).isEqualTo(2);
//        Assertions.assertThat(response.get(0).getSem().getName()).isEqualTo("2");
//        Assertions.assertThat(response.get(0).getStatus()).isEqualTo(1);
//        Assertions.assertThat(response.get(0).getId()).isEqualTo(1);
//        Assertions.assertThat(response.get(0).getName()).isEqualTo("Java I");
//        Assertions.assertThat(response.get(0).getImage()).isEqualTo("java1.png");
//        Assertions.assertThat(response.get(1).getSem().getId()).isEqualTo(2);
//        Assertions.assertThat(response.get(1).getSem().getName()).isEqualTo("2");
//        Assertions.assertThat(response.get(1).getStatus()).isEqualTo(1);
//        Assertions.assertThat(response.get(1).getId()).isEqualTo(2);
//        Assertions.assertThat(response.get(1).getName()).isEqualTo("Java II");
//        Assertions.assertThat(response.get(1).getImage()).isEqualTo("java2.png");
//
//    }


}
