package com.example.quizexam_student.controller;

import com.example.quizexam_student.bean.response.ClassesExcelExporter;
import com.example.quizexam_student.bean.response.ClassesPDFExporter;
import com.example.quizexam_student.entity.Classes;
import com.example.quizexam_student.exception.AlreadyExistException;
import com.example.quizexam_student.exception.NotFoundException;
import com.example.quizexam_student.service.ClassesService;
import com.example.quizexam_student.service.ExportService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.mockito.Mockito.times;

@Slf4j
@SpringBootTest
@AutoConfigureMockMvc
public class ClassesControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ClassesService classesService;

    @Mock
    private ExportService exportService;

    @Mock
    private HttpServletResponse response;

    @Mock
    private ServletOutputStream outputStream;

    @InjectMocks
    private ClassesController classesController;

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

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void getAll_success() throws Exception {
        // GIVEN
        Mockito.when(classesService.findAllClasses()).thenReturn(classesList);
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                .get("/api/class"))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].id").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].name").value("C2209i"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].classDay").value("2, 4, 6"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].classTime").value("13h30 - 16h30"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].admissionDate").value(admissionDate.toString()))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].status").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].id").value(2))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].name").value("C2208G"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].classDay").value("3, 5, 7"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].classTime").value("13h30 - 16h30"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].admissionDate").value(admissionDate.toString()));
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void createClass_success() throws Exception {
        // GIVEN
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        String content = objectMapper.writeValueAsString(classes);
        Mockito.when(classesService.addClass(classes)).thenReturn(classes);
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                .post("/api/class")
                .content(content)
                .contentType("application/json"))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$.name").value("C2209i"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.classDay").value("2, 4, 6"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.classTime").value("13h30 - 16h30"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.admissionDate").value(admissionDate.toString()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.status").value(1));
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void createClass_notBlankName_fail() throws Exception {
        // GIVEN
        classes.setName("");
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        String content = objectMapper.writeValueAsString(classes);
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                .post("/api/class")
                .content(content)
                .contentType("application/json"))
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].key").value("name"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].message").value("Class Name is required"));
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void createClass_notBlankClassDay_fail() throws Exception {
        // GIVEN
        classes.setClassDay("");
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        String content = objectMapper.writeValueAsString(classes);
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                        .post("/api/class")
                        .content(content)
                        .contentType("application/json"))
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].key").value("classDay"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].message").value("Class Day is required"));
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void createClass_notBlankClassTime_fail() throws Exception {
        // GIVEN
        classes.setClassTime("");
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        String content = objectMapper.writeValueAsString(classes);
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                        .post("/api/class")
                        .content(content)
                        .contentType("application/json"))
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].key").value("classTime"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].message").value("Class Time is required"));
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void createClass_notNullAdmissionDate_fail() throws Exception {
        // GIVEN
        classes.setAdmissionDate(null);
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        String content = objectMapper.writeValueAsString(classes);
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                        .post("/api/class")
                        .content(content)
                        .contentType("application/json"))
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].key").value("admissionDate"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].message").value("Admission Date is required"));
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void createClass_alreadyExistName_fail() throws Exception {
        // GIVEN
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        String content = objectMapper.writeValueAsString(classes);
        Mockito.when(classesService.addClass(classes))
                .thenThrow(new AlreadyExistException("className", "Class Name already exists."));
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                .post("/api/class")
                .content(content)
                .contentType("application/json"))
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("key").value("className"))
                .andExpect(MockMvcResultMatchers.jsonPath("message").value("Class Name already exists."));
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void update_success() throws Exception {
        // GIVEN
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        String content = objectMapper.writeValueAsString(classes);
        Mockito.when(classesService.updateClass(1, classes)).thenReturn(classes);
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                .put("/api/class/{id}", 1)
                .content(content)
                .contentType("application/json"))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("id").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("name").value("C2209i"))
                .andExpect(MockMvcResultMatchers.jsonPath("classDay").value("2, 4, 6"))
                .andExpect(MockMvcResultMatchers.jsonPath("classTime").value("13h30 - 16h30"))
                .andExpect(MockMvcResultMatchers.jsonPath("admissionDate").value(admissionDate.toString()))
                .andExpect(MockMvcResultMatchers.jsonPath("status").value(1));
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void updateClass_notBlankName_fail() throws Exception {
        // GIVEN
        classes.setName("");
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        String content = objectMapper.writeValueAsString(classes);
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                        .put("/api/class/{id}",1)
                        .content(content)
                        .contentType("application/json"))
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].key").value("name"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].message").value("Class Name is required"));
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void updateClass_notBlankClassDay_fail() throws Exception {
        // GIVEN
        classes.setClassDay("");
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        String content = objectMapper.writeValueAsString(classes);
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                        .put("/api/class/{id}",1)
                        .content(content)
                        .contentType("application/json"))
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].key").value("classDay"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].message").value("Class Day is required"));
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void updateClass_notBlankClassTime_fail() throws Exception {
        // GIVEN
        classes.setClassTime("");
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        String content = objectMapper.writeValueAsString(classes);
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                        .put("/api/class/{id}",1)
                        .content(content)
                        .contentType("application/json"))
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].key").value("classTime"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].message").value("Class Time is required"));
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void updateClass_notNullAdmissionDate_fail() throws Exception {
        // GIVEN
        classes.setAdmissionDate(null);
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        String content = objectMapper.writeValueAsString(classes);
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                        .put("/api/class/{id}",1)
                        .content(content)
                        .contentType("application/json"))
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].key").value("admissionDate"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].message").value("Admission Date is required"));
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void updateClass_alreadyExistName_fail() throws Exception {
        // GIVEN
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        String content = objectMapper.writeValueAsString(classes);
        Mockito.when(classesService.updateClass(1, classes))
                .thenThrow(new AlreadyExistException("className", "Class Name already exists."));
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                        .put("/api/class/{id}",1)
                        .content(content)
                        .contentType("application/json"))
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("key").value("className"))
                .andExpect(MockMvcResultMatchers.jsonPath("message").value("Class Name already exists."));
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void deleteClass_success() throws Exception {
        // GIVEN
        classesService.deleteClass(1);
        // WHEN

        // THEN
        Mockito.verify(classesService, Mockito.times(1)).deleteClass(1);
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void deleteClass_notFound_fail() throws Exception {
        // GIVEN
        Mockito.doThrow(new NotFoundException("class", "Class not found."))
                .when(classesService).deleteClass(1);
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                .put("/api/class/remove/{id}",1))
                .andExpect(MockMvcResultMatchers.status().isNotFound());
                //.andExpect(MockMvcResultMatchers.jsonPath("key").value("class"))
                //.andExpect(MockMvcResultMatchers.jsonPath("message").value("Class not found."));
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    public void exportToExcel_Success() throws IOException {
        // Gọi phương thức exportToExcel
        Mockito.when(response.getOutputStream()).thenReturn(outputStream);
        ResponseEntity<String> responseEntity = classesController.exportToExcel(response, classesList);

        // Kiểm tra phản hồi
        org.junit.jupiter.api.Assertions.assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        org.junit.jupiter.api.Assertions.assertEquals("Export To Excel Successfully", responseEntity.getBody());

        // Xác minh rằng exportService.export đã được gọi
        Mockito.verify(exportService, times(1)).export(response, "classes", "xlsx");

        // Xác minh rằng SubjectExcelExporter.export cũng được gọi
        ClassesExcelExporter excelExporter = new ClassesExcelExporter(classesList);
        excelExporter.export(response);
        Mockito.verify(outputStream, times(2)).close();
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    public void exportToPDF_Success() throws IOException {
        // Gọi phương thức exportToPDF
        Mockito.when(response.getOutputStream()).thenReturn(outputStream);
        ResponseEntity<String> responseEntity = classesController.exportToPDF(response, classesList);

        // Kiểm tra phản hồi
        org.junit.jupiter.api.Assertions.assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        Assertions.assertEquals("Export To PDF Successfully", responseEntity.getBody());

        // Xác minh rằng exportService.export đã được gọi
        Mockito.verify(exportService, times(1)).export(response, "classes", "pdf");

        // Kiểm tra xem phương thức export của SubjectPDFExporter được gọi
        ClassesPDFExporter pdfExporter = new ClassesPDFExporter(classesList);
        pdfExporter.export(response);
        Mockito.verify(outputStream, times(2)).close(); // Kiểm tra xem outputStream được đóng
    }

}
