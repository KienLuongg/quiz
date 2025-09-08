package com.example.quizexam_student.controller;

import com.example.quizexam_student.bean.request.SubjectRequest;
import com.example.quizexam_student.bean.response.SubjectExcelExporter;
import com.example.quizexam_student.bean.response.SubjectPDFExporter;
import com.example.quizexam_student.entity.Sem;
import com.example.quizexam_student.entity.Subject;
import com.example.quizexam_student.exception.AlreadyExistException;
import com.example.quizexam_student.exception.NotFoundException;
import com.example.quizexam_student.service.ExportService;
import com.example.quizexam_student.service.SubjectService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cache.support.NullValue;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.mock.web.MockPart;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.times;

@Slf4j
@SpringBootTest
@AutoConfigureMockMvc
public class SubjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SubjectService subjectService;

    @Mock
    private ExportService exportService;

    @Mock
    private HttpServletResponse response;

    @Mock
    private ServletOutputStream outputStream;

    @InjectMocks
    private SubjectController subjectController;

    private SubjectRequest subjectRequest;
    private Subject subject;
    private List<Subject> subjectList;

    @BeforeEach
    void initData(){
        subjectRequest = SubjectRequest.builder()
                .name("Java I")
                .image("java1.png")
                .semId(1)
                .build();
        Sem sem = new Sem(2,"2",null);

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

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void createSubject_validRequest_success() throws Exception {
        // GIVEN
        ObjectMapper objectMapper = new ObjectMapper();
        String content = objectMapper.writeValueAsString(subjectRequest);

        // Tạo một file giả (file rỗng trong trường hợp này)
        MockMultipartFile file = new MockMultipartFile("file", "test-image.jpg", "image/jpeg", new byte[0]);

        // Giả lập hành vi của service (mock)
        Mockito.when(subjectService.save(ArgumentMatchers.any())).thenReturn(subject);

        // Gửi POST request với multipart (file và JSON)
        mockMvc.perform(MockMvcRequestBuilders
                        .multipart("/api/subject")  // Gửi request POST với đường dẫn
                        .file(file)  // Gửi file
                        .part(new MockPart("subject", "subject", content.getBytes(), MediaType.APPLICATION_JSON))  // Gửi JSON qua tham số "subject"
                        .contentType(MediaType.MULTIPART_FORM_DATA)  // Chỉ định rằng đây là multipart request
                        .accept(MediaType.APPLICATION_JSON))  // Chấp nhận response dưới dạng JSON
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("id").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("name").value("Java I"))
                .andExpect(MockMvcResultMatchers.jsonPath("image").value("java1.png"))
                .andExpect(MockMvcResultMatchers.jsonPath("sem.id").value(2))
                .andExpect(MockMvcResultMatchers.jsonPath("sem.name").value("2"))
                .andExpect(MockMvcResultMatchers.jsonPath("status").value(1))
        ;
        // THEN

    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void createSubject_nameBlank_fail() throws Exception {
        // GIVEN
        subjectRequest.setName("");
        // GIVEN
        ObjectMapper objectMapper = new ObjectMapper();
        String content = objectMapper.writeValueAsString(subjectRequest);

        // Tạo một file giả (file rỗng trong trường hợp này)
        MockMultipartFile file = new MockMultipartFile("file", "test-image.jpg", "image/jpeg", new byte[0]);

        // Giả lập hành vi của service (mock)
        Mockito.when(subjectService.save(ArgumentMatchers.any())).thenReturn(subject);

        // Gửi POST request với multipart (file và JSON)
        mockMvc.perform(MockMvcRequestBuilders
                        .multipart("/api/subject")  // Gửi request POST với đường dẫn
                        .file(file)  // Gửi file
                        .part(new MockPart("subject", "subject", content.getBytes(), MediaType.APPLICATION_JSON))  // Gửi JSON qua tham số "subject"
                        .contentType(MediaType.MULTIPART_FORM_DATA)  // Chỉ định rằng đây là multipart request
                        .accept(MediaType.APPLICATION_JSON))  // Chấp nhận response dưới dạng JSON
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].status").value("BAD_REQUEST"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].key").value("name"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].message").value("Subject name is required"))
        ;
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void createSubject_semNull_fail() throws Exception {
        // GIVEN
        subjectRequest.setSemId(null);
        ObjectMapper objectMapper = new ObjectMapper();
        String content = objectMapper.writeValueAsString(subjectRequest);

        // Tạo một file giả (file rỗng trong trường hợp này)
        MockMultipartFile file = new MockMultipartFile("file", "test-image.jpg", "image/jpeg", new byte[0]);

        // Giả lập hành vi của service (mock)
        Mockito.when(subjectService.save(ArgumentMatchers.any())).thenReturn(subject);

        // Gửi POST request với multipart (file và JSON)
        mockMvc.perform(MockMvcRequestBuilders
                        .multipart("/api/subject")  // Gửi request POST với đường dẫn
                        .file(file)  // Gửi file
                        .part(new MockPart("subject", "subject", content.getBytes(), MediaType.APPLICATION_JSON))  // Gửi JSON qua tham số "subject"
                        .contentType(MediaType.MULTIPART_FORM_DATA)  // Chỉ định rằng đây là multipart request
                        .accept(MediaType.APPLICATION_JSON))  // Chấp nhận response dưới dạng JSON
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].status").value("BAD_REQUEST"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].key").value("semId"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].message").value("Semester is required"))
        ;
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void getAllSubject_success() throws Exception {
        // GIVEN

        Mockito.when(subjectService.findAll()).thenReturn(subjectList);

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                        .get("/api/subject"))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].id").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].name").value("Java I"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].image").value("java1.png"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].status").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].sem.id").value(2))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].sem.name").value("2"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].id").value(2))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].name").value("Java II"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].image").value("java2.png"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].status").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].sem.id").value(2))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].sem.name").value("2"))
        ;
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void getSubjectBySem_success() throws Exception {
        // GIVEN
        Mockito.when(subjectService.getAllSubjectBySem(2)).thenReturn(subjectList);

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                        .get("/api/subject/sem/{id}",2))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].id").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].name").value("Java I"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].image").value("java1.png"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].status").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].sem.id").value(2))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].sem.name").value("2"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].id").value(2))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].name").value("Java II"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].image").value("java2.png"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].status").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].sem.id").value(2))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].sem.name").value("2"))
        ;
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void getSubjectById_success() throws Exception {
        // GIVEN
        Mockito.when(subjectService.findById(1)).thenReturn(subject);

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                        .get("/api/subject/{id}", 1))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("id").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("name").value("Java I"))
                .andExpect(MockMvcResultMatchers.jsonPath("image").value("java1.png"))
                .andExpect(MockMvcResultMatchers.jsonPath("status").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("sem.id").value(2))
                .andExpect(MockMvcResultMatchers.jsonPath("sem.name").value("2"))

        ;
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void getSubjectById_fail() throws Exception {
        // GIVEN

        Mockito.when(subjectService.findById(2)).thenThrow(new NotFoundException("NotFoundSubject","Subject not found"));

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                        .get("/api/subject/{id}", 2))
                .andExpect(MockMvcResultMatchers.status().isNotFound())
                .andExpect(MockMvcResultMatchers.jsonPath("key").value("NotFoundSubject"))
                .andExpect(MockMvcResultMatchers.jsonPath("message").value("Subject not found"))
        ;
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void updateSubject_validRequest_success() throws Exception {
        // GIVEN
        ObjectMapper objectMapper = new ObjectMapper();
        String content = objectMapper.writeValueAsString(subjectRequest);

        // Tạo một file giả (file rỗng trong trường hợp này)
        MockMultipartFile file = new MockMultipartFile("file", "test-image.jpg", "image/jpeg", new byte[0]);

        // Giả lập hành vi của service (mock)
        Mockito.when(subjectService.update(ArgumentMatchers.anyInt(), ArgumentMatchers.any())).thenReturn(subject);

        // Gửi POST request với multipart (file và JSON)
        mockMvc.perform(MockMvcRequestBuilders
                        .multipart(HttpMethod.PUT, "/api/subject/{id}", 1)  // Gửi request POST với đường dẫn
                        .file(file)  // Gửi file
                        .part(new MockPart("subject", "subject", content.getBytes(), MediaType.APPLICATION_JSON))  // Gửi JSON qua tham số "subject"
                        .contentType(MediaType.MULTIPART_FORM_DATA)  // Chỉ định rằng đây là multipart request
                        .accept(MediaType.APPLICATION_JSON))  // Chấp nhận response dưới dạng JSON
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("id").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("name").value("Java I"))
                .andExpect(MockMvcResultMatchers.jsonPath("image").value("java1.png"))
                .andExpect(MockMvcResultMatchers.jsonPath("sem.id").value(2))
                .andExpect(MockMvcResultMatchers.jsonPath("sem.name").value("2"))
                .andExpect(MockMvcResultMatchers.jsonPath("status").value(1))
        ;
        // THEN

    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void updateSubject_nameBlank_fail() throws Exception {
        // GIVEN
        subjectRequest.setName("");
        ObjectMapper objectMapper = new ObjectMapper();
        String content = objectMapper.writeValueAsString(subjectRequest);

        // Tạo một file giả (file rỗng trong trường hợp này)
        MockMultipartFile file = new MockMultipartFile("file", "test-image.jpg", "image/jpeg", new byte[0]);

        // Giả lập hành vi của service (mock)
        Mockito.when(subjectService.update(ArgumentMatchers.anyInt(), ArgumentMatchers.any())).thenReturn(subject);

        // Gửi POST request với multipart (file và JSON)
        mockMvc.perform(MockMvcRequestBuilders
                        .multipart(HttpMethod.PUT, "/api/subject/{id}", 1)    // Gửi request POST với đường dẫn
                        .file(file)  // Gửi file
                        .part(new MockPart("subject", "subject", content.getBytes(), MediaType.APPLICATION_JSON))  // Gửi JSON qua tham số "subject"
                        .contentType(MediaType.MULTIPART_FORM_DATA)  // Chỉ định rằng đây là multipart request
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].status").value("BAD_REQUEST"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].key").value("name"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].message").value("Subject name is required"))
        ;
        // THEN

    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void updateSubject_semNull_fail() throws Exception {
        // GIVEN
        subjectRequest.setSemId(null);
        ObjectMapper objectMapper = new ObjectMapper();
        String content = objectMapper.writeValueAsString(subjectRequest);

        // Tạo một file giả (file rỗng trong trường hợp này)
        MockMultipartFile file = new MockMultipartFile("file", "test-image.jpg", "image/jpeg", new byte[0]);

        // Giả lập hành vi của service (mock)
        Mockito.when(subjectService.update(ArgumentMatchers.anyInt(), ArgumentMatchers.any())).thenReturn(subject);

        // Gửi POST request với multipart (file và JSON)
        mockMvc.perform(MockMvcRequestBuilders
                        .multipart(HttpMethod.PUT, "/api/subject/{id}", 1)  // Gửi request POST với đường dẫn
                        .file(file)  // Gửi file
                        .part(new MockPart("subject", "subject", content.getBytes(), MediaType.APPLICATION_JSON))  // Gửi JSON qua tham số "subject"
                        .contentType(MediaType.MULTIPART_FORM_DATA)  // Chỉ định rằng đây là multipart request
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].status").value("BAD_REQUEST"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].key").value("semId"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].message").value("Semester is required"))
        ;
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void updateSubject_nameDuplicate_fail() throws Exception {
        // GIVEN
        subjectRequest.setId(1);
        ObjectMapper objectMapper = new ObjectMapper();
        String content = objectMapper.writeValueAsString(subjectRequest);

        // Tạo một file giả (file rỗng trong trường hợp này)
        MockMultipartFile file = new MockMultipartFile("file", "test-image.jpg", "image/jpeg", new byte[0]);

        // Giả lập hành vi của service (mock)
        Mockito.when(subjectService.update(ArgumentMatchers.anyInt(), ArgumentMatchers.any())).thenThrow(new AlreadyExistException("subjectName", "Subject Name already exists."));;

        // Gửi POST request với multipart (file và JSON)
        mockMvc.perform(MockMvcRequestBuilders
                        .multipart(HttpMethod.PUT, "/api/subject/{id}", 1)  // Gửi request POST với đường dẫn
                        .file(file)  // Gửi file
                        .part(new MockPart("subject", "subject", content.getBytes(), MediaType.APPLICATION_JSON))  // Gửi JSON qua tham số "subject"
                        .contentType(MediaType.MULTIPART_FORM_DATA)  // Chỉ định rằng đây là multipart request
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$.status").value("BAD_REQUEST"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.key").value("subjectName"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.message").value("Subject Name already exists."))
        ;
        // THEN

    }


    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void deleteSubject_success(){
        // GIVEN
        subjectService.deleteById(1);
        // WHEN

        // THEN
        Mockito.verify(subjectService, times(1)).deleteById(1);
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void deleteSubject_fail() throws Exception {
        // GIVEN

        Mockito.doThrow(new NotFoundException("NotFoundSubject","Subject not found")).when(subjectService).deleteById(1);

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders
                .put("/api/subject/remove/{id}", 1)
                .contentType("application/json"))
                .andExpect(MockMvcResultMatchers.status().isNotFound())
                .andExpect(MockMvcResultMatchers.jsonPath("key").value("NotFoundSubject"))
                .andExpect(MockMvcResultMatchers.jsonPath("message").value("Subject not found"))
        ;
        // THEN
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    public void exportToExcel_Success() throws IOException {
        // Gọi phương thức exportToExcel
        Mockito.when(response.getOutputStream()).thenReturn(outputStream);
        ResponseEntity<String> responseEntity = subjectController.exportToExcel(response, subjectList);

        // Kiểm tra phản hồi
        Assertions.assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        Assertions.assertEquals("Export To Excel Successfully", responseEntity.getBody());

        // Xác minh rằng exportService.export đã được gọi
        Mockito.verify(exportService, times(1)).export(response, "subject", "xlsx");

        // Xác minh rằng SubjectExcelExporter.export cũng được gọi
        SubjectExcelExporter excelExporter = new SubjectExcelExporter(subjectList);
        excelExporter.export(response);
        Mockito.verify(outputStream, times(2)).close();
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    public void exportToPDF_Success() throws IOException {
        // Gọi phương thức exportToPDF
        Mockito.when(response.getOutputStream()).thenReturn(outputStream);
        ResponseEntity<String> responseEntity = subjectController.exportToPDF(response, subjectList);

        // Kiểm tra phản hồi
        Assertions.assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        Assertions.assertEquals("Export To PDF Successfully", responseEntity.getBody());

        // Xác minh rằng exportService.export đã được gọi
        Mockito.verify(exportService, times(1)).export(response, "subject", "pdf");

        // Kiểm tra xem phương thức export của SubjectPDFExporter được gọi
        SubjectPDFExporter subjectPDFExporter = new SubjectPDFExporter(subjectList);
        subjectPDFExporter.export(response);
        Mockito.verify(outputStream, times(2)).close(); // Kiểm tra xem outputStream được đóng
    }

}
