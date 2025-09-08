package com.example.quizexam_student.controller;

import com.example.quizexam_student.entity.Sem;
import com.example.quizexam_student.service.SemService;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.ArrayList;
import java.util.List;

@SpringBootTest
@AutoConfigureMockMvc
@Slf4j
public class SemControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private SemService semService;

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
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void getAll_success() throws Exception {
        // GIVEN
        Mockito.when(semService.getAllSem()).thenReturn(semList);
        // WHEN
         mockMvc.perform(MockMvcRequestBuilders
                        .get("/api/sem"))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].id").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].name").value("1"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].id").value(2))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].name").value("2"));
        // THEN
    }
}
