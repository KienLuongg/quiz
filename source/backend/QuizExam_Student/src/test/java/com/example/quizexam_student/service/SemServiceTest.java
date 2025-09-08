package com.example.quizexam_student.service;

import com.example.quizexam_student.entity.Sem;
import com.example.quizexam_student.exception.NotFoundException;
import com.example.quizexam_student.repository.SemRepository;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@SpringBootTest
public class SemServiceTest {
    @Autowired
    private SemService semService;

    @MockBean
    private SemRepository semRepository;

    private Sem sem;

    private List<Sem> semList;

    @BeforeEach
    void initData(){
        semList = new ArrayList<>();
        semList.add(Sem.builder()
                .id(1)
                .name("1")
                .build());
        semList.add(Sem.builder()
                .id(2)
                .name("2")
                .build());

        sem = Sem.builder()
                .id(1)
                .name("1")
                .build();
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void getAll_success(){
        // GIVEN
        Mockito.when(semRepository.findAll()).thenReturn(semList);
        //  WHEN
        var response = semService.getAllSem();
        // THEN
        Assertions.assertThat(response).isNotNull();
        Assertions.assertThat(response.size()).isEqualTo(semList.size());
        Assertions.assertThat(response.get(0).getId()).isEqualTo(1);
        Assertions.assertThat(response.get(0).getName()).isEqualTo("1");
        Assertions.assertThat(response.get(1).getId()).isEqualTo(2);
        Assertions.assertThat(response.get(1).getName()).isEqualTo("2");
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void getById_success(){
        // GIVEN
        Mockito.when(semRepository.findById(1)).thenReturn(Optional.of(sem));
        //  WHEN
        var response = semService.getSemById(1);
        // THEN
        Assertions.assertThat(response).isNotNull();
        Assertions.assertThat(response.getId()).isEqualTo(1);
        Assertions.assertThat(response.getName()).isEqualTo("1");
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void getById_notFound_fail(){
        // GIVEN
        Mockito.when(semRepository.findById(2)).thenThrow(new NotFoundException("EmptySem","Semeter not found"));
        // WHEN
        var exception = org.junit.jupiter.api.Assertions
                .assertThrows(NotFoundException.class,() -> semService.getSemById(2));
        // THEN
        Assertions.assertThat(exception.getMessage()).isEqualTo("Semeter not found");
        Assertions.assertThat(exception.getKey()).isEqualTo("EmptySem");
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void getByName_success(){
        // GIVEN
        Mockito.when(semRepository.findByName("1")).thenReturn(sem);
        //  WHEN
        var response = semService.getSemByName("1");
        // THEN
        Assertions.assertThat(response).isNotNull();
        Assertions.assertThat(response.getId()).isEqualTo(1);
        Assertions.assertThat(response.getName()).isEqualTo("1");
    }

}
