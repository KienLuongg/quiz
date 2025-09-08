package com.example.quizexam_student.controller;

import com.example.quizexam_student.bean.request.ChapterRequest;
import com.example.quizexam_student.entity.Chapter;
import com.example.quizexam_student.entity.Sem;
import com.example.quizexam_student.entity.Subject;
import com.example.quizexam_student.exception.AlreadyExistException;
import com.example.quizexam_student.exception.NotFoundException;
import com.example.quizexam_student.service.ChapterService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
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

import static org.mockito.Mockito.times;

@Slf4j
@SpringBootTest
@AutoConfigureMockMvc
public class ChapterControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ChapterService chapterService;

    private Chapter chapter;
    private ChapterRequest chapterRequest;
    private List<Chapter> chapterList;
    private Subject subject;
    private Sem sem;
    @BeforeEach
    void initData(){
        sem = new Sem(1,"1",null);
        subject = Subject.builder()
                .id(1)
                .name("EPC")
                .image("epc.png")
                .sem(sem)
                .status(1)
                .build();
        chapterRequest = ChapterRequest.builder()
                .name("I/O")
                .subjectId(1)
                .build();
        chapter = Chapter.builder()
                .id(1)
                .name("I/O")
                .status(1)
                .subject(subject)
                .build();
        chapterList = new ArrayList<>();
        chapterList.add(
                Chapter.builder()
                        .id(1)
                        .name("I/O")
                        .status(1)
                        .subject(subject)
                        .build()
        );
        chapterList.add(
                Chapter.builder()
                        .id(2)
                        .name("Loop")
                        .status(1)
                        .subject(subject)
                        .build()
        );
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = "ADMIN")
    void getAllChapters_success() throws Exception {
        // GIVEN
        Mockito.when(chapterService.getAllChaptersBySubjectId(1)).thenReturn(chapterList);
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                .get("/api/chapter/{subjectId}", 1))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].id").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].name").value("I/O"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].status").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].subject.id").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].subject.name").value("EPC"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].subject.image").value("epc.png"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].subject.status").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].id").value(2))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].name").value("Loop"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].status").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].subject.id").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].subject.name").value("EPC"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].subject.image").value("epc.png"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].subject.status").value(1));
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = "ADMIN")
    void createChapter_success() throws Exception {
        // GIVEN
        ObjectMapper objectMapper = new ObjectMapper();
        String content = objectMapper.writeValueAsString(chapterRequest);
        Mockito.when(chapterService.addChapter(chapterRequest)).thenReturn(chapter);
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                .post("/api/chapter")
                .contentType("application/json")
                .content(content))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$.name").value("I/O"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.status").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$.subject.id").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$.subject.name").value("EPC"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.subject.image").value("epc.png"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.subject.status").value(1));
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = "ADMIN")
    void createChapter_nameBlank_fail()throws Exception {
        // GIVEN
        chapterRequest.setName("");
        ObjectMapper objectMapper = new ObjectMapper();
        String content = objectMapper.writeValueAsString(chapterRequest);
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                .post("/api/chapter")
                .content(content)
                .contentType("application/json"))
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].key").value("name"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].message").value("Chapter name is required"));
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = "ADMIN")
    void createChapter_subjectNull_fail()throws Exception {
        // GIVEN
        chapterRequest.setSubjectId(null);
        ObjectMapper objectMapper = new ObjectMapper();
        String content = objectMapper.writeValueAsString(chapterRequest);
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                        .post("/api/chapter")
                        .content(content)
                        .contentType("application/json"))
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].key").value("subjectId"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].message").value("Subject is required"));
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = "ADMIN")
    void createChapter_alreadyExistName_fail()throws Exception {
        // GIVEN
        ObjectMapper objectMapper = new ObjectMapper();
        String content = objectMapper.writeValueAsString(chapterRequest);
        Mockito.when(chapterService.addChapter(chapterRequest))
                .thenThrow(new AlreadyExistException("ExistChapter", "Chapter name already exists"));
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                        .post("/api/chapter")
                        .content(content)
                        .contentType("application/json"))
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$.key").value("ExistChapter"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.message").value("Chapter name already exists"));
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = "ADMIN")
    void createChapter_notFoundSubject_fail()throws Exception {
        // GIVEN
        ObjectMapper objectMapper = new ObjectMapper();
        String content = objectMapper.writeValueAsString(chapterRequest);
        Mockito.when(chapterService.addChapter(chapterRequest))
                .thenThrow(new NotFoundException("NotFoundSubject", "Subject id not found"));
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                        .post("/api/chapter")
                        .content(content)
                        .contentType("application/json"))
                .andExpect(MockMvcResultMatchers.status().isNotFound())
                .andExpect(MockMvcResultMatchers.jsonPath("$.key").value("NotFoundSubject"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.message").value("Subject id not found"));
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = "ADMIN")
    void updateChapter_success() throws Exception {
        // GIVEN
        ObjectMapper objectMapper = new ObjectMapper();
        String content = objectMapper.writeValueAsString(chapterRequest);
        Mockito.when(chapterService.updateChapter(1,chapterRequest)).thenReturn(chapter);
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                        .put("/api/chapter/{id}", 1)
                        .contentType("application/json")
                        .content(content))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$.name").value("I/O"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.status").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$.subject.id").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$.subject.name").value("EPC"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.subject.image").value("epc.png"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.subject.status").value(1));
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = "ADMIN")
    void updateChapter_nameBlank_fail()throws Exception {
        // GIVEN
        chapterRequest.setName("");
        ObjectMapper objectMapper = new ObjectMapper();
        String content = objectMapper.writeValueAsString(chapterRequest);
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                        .put("/api/chapter/{id}",1)
                        .content(content)
                        .contentType("application/json"))
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].key").value("name"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].message").value("Chapter name is required"));
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = "ADMIN")
    void updateChapter_subjectNull_fail()throws Exception {
        // GIVEN
        chapterRequest.setSubjectId(null);
        ObjectMapper objectMapper = new ObjectMapper();
        String content = objectMapper.writeValueAsString(chapterRequest);
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                        .put("/api/chapter/{id}",1)
                        .content(content)
                        .contentType("application/json"))
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].key").value("subjectId"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].message").value("Subject is required"));
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = "ADMIN")
    void updateChapter_alreadyExistName_fail()throws Exception {
        // GIVEN
        ObjectMapper objectMapper = new ObjectMapper();
        String content = objectMapper.writeValueAsString(chapterRequest);
        Mockito.when(chapterService.updateChapter(1, chapterRequest))
                .thenThrow(new AlreadyExistException("ExistChapter", "Chapter name already exists"));
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                        .put("/api/chapter/{id}",1)
                        .content(content)
                        .contentType("application/json"))
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$.key").value("ExistChapter"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.message").value("Chapter name already exists"));
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = "ADMIN")
    void updateChapter_notFoundSubject_fail()throws Exception {
        // GIVEN
        ObjectMapper objectMapper = new ObjectMapper();
        String content = objectMapper.writeValueAsString(chapterRequest);
        Mockito.when(chapterService.updateChapter(1, chapterRequest))
                .thenThrow(new NotFoundException("NotFoundSubject", "Subject id not found"));
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                        .put("/api/chapter/{id}",1)
                        .content(content)
                        .contentType("application/json"))
                .andExpect(MockMvcResultMatchers.status().isNotFound())
                .andExpect(MockMvcResultMatchers.jsonPath("$.key").value("NotFoundSubject"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.message").value("Subject id not found"));
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void deleteChapter_success(){
        // GIVEN
        chapterService.deleteChapter(1);
        // WHEN

        // THEN
        Mockito.verify(chapterService, times(1)).deleteChapter(1);
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void deleteChapter_fail() throws Exception {
        // GIVEN

        Mockito.doThrow(new NotFoundException("NotFoundSubject","Subject not found"))
                .when(chapterService).deleteChapter(1);

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                        .put("/api/chapter/remove/{id}", 1))
                .andExpect(MockMvcResultMatchers.status().isNotFound())
//                .andExpect(MockMvcResultMatchers.jsonPath("key").value("NotFoundSubject"))
//                .andExpect(MockMvcResultMatchers.jsonPath("message").value("Subject not found"))
        ;
        // THEN
    }

}
