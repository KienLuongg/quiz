package com.example.quizexam_student.controller;

import com.example.quizexam_student.bean.request.StudentRequest;
import com.example.quizexam_student.bean.request.UserRequest;
import com.example.quizexam_student.bean.response.RegisterResponse;
import com.example.quizexam_student.bean.response.StudentResponse;
import com.example.quizexam_student.service.StudentService;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

@SpringBootTest
@Slf4j
@AutoConfigureMockMvc
public class StudentControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StudentService studentService;

    private StudentRequest studentRequest;
    private List<StudentResponse> studentResponseList;
    private RegisterResponse registerResponse;
    private UserRequest userRequest;

    @BeforeEach
    void initData(){
//        userRequest = UserRequest.builder()
//                .fullName("Dang Dinh Thuan")
//                .email("thuan@aptech.com")
//                .
//                .build();
//        studentRequest = StudentRequest.builder()
//                .
//                .build();
    }



}
