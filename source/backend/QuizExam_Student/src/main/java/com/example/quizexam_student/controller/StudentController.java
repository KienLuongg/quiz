package com.example.quizexam_student.controller;

import com.example.quizexam_student.bean.request.*;
import com.example.quizexam_student.bean.response.*;
import com.example.quizexam_student.mapper.StudentMapper;
import com.example.quizexam_student.service.*;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@Validated
public class StudentController {
    private final StudentService studentService;

    private final ExportService exportService;

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'SRO')")
    @GetMapping("/{status}")
    public List<StudentResponse> getAllStudentsNoneClass(@PathVariable Integer status) {
        return studentService.findAllStudentsNoneClass(status).stream().map(StudentMapper::convertToResponse).collect(Collectors.toList());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'SRO')")
    @GetMapping("/{status}/{classId}")
    public List<StudentResponse> getAllStudentsByClass(@PathVariable Integer status, @PathVariable Integer classId) {
        return studentService.findAllStudentsByClass(status, classId).stream().map(StudentMapper::convertToResponse).collect(Collectors.toList());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @GetMapping("/find/{id}")
    public StudentResponse getStudentById(@PathVariable Integer id) {
        return StudentMapper.convertToResponse(studentService.findStudentById(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @PostMapping("")
    public StudentResponse addStudent(@RequestBody @Valid StudentRequest studentRequest) {
        return StudentMapper.convertToResponse(studentService.addStudent(studentRequest));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @PutMapping("/{id}")
    public StudentResponse updateStudent(@PathVariable int id, @RequestBody @Valid StudentRequest studentRequest) {
        return StudentMapper.convertToResponse(studentService.updateStudent(studentRequest, id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @GetMapping("/moving-to-class")
    public List<StudentResponse> getStudentsMovingToClass(@RequestParam List<Integer> userIds) {
        return studentService.findStudentsMovingToClass(userIds).stream().map(StudentMapper::convertToResponse).collect(Collectors.toList());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @PutMapping("/update-class")
    public List<StudentResponse> updateClassForStudents(@RequestBody UpdateStudentClassRequest request) {
        return studentService.updateClassForStudents(request.getUserIds(), request.getClassId()).stream().map(StudentMapper::convertToResponse).collect(Collectors.toList());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @PutMapping("/reset-password/{id}")
    public StudentResponse resetPassword(@PathVariable int id) {
        return StudentMapper.convertToResponse(studentService.resetPassword(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @PutMapping("/remove/{id}")
    public StudentResponse deleteStudent(@PathVariable int id) {
        return StudentMapper.convertToResponse(studentService.deleteStudent(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @PutMapping("/restore/{id}")
    public StudentResponse restoreStudent(@PathVariable int id) {
        return StudentMapper.convertToResponse(studentService.restoreStudent(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @GetMapping("/{status}/{classId}/{examId}")
    public List<StudentResponse> getAllStudentsForExam(@PathVariable Integer status, @PathVariable Integer classId, @PathVariable Integer examId) {
        return studentService.findAllStudentsForExam(status, classId, examId).stream().map(StudentMapper::convertToResponse).collect(Collectors.toList());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR', 'TEACHER', 'SRO')")
    @GetMapping("/count")
    public Long countAllStudents() {
        return studentService.countAllStudents();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @PostMapping("/export/excel")
    public ResponseEntity<String> exportToExcel(HttpServletResponse response
            ,@RequestBody List<StudentResponse> studentResponses)
            throws IOException {
        exportService.export(response, "student", "xlsx");
        StudentExcelExporter excelExporter = new StudentExcelExporter(studentResponses);
        excelExporter.export(response);
        return new ResponseEntity<>("Export To Excel Successfully", HttpStatus.OK);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @PostMapping(value = "/export/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<String> exportToPDF(HttpServletResponse response
            ,@RequestBody List<StudentResponse> studentResponses) throws IOException {
        exportService.export(response, "student", "pdf");
        StudentPDFExporter pdfExporter = new StudentPDFExporter(studentResponses);
        pdfExporter.export(response);
        return new ResponseEntity<>("Export To PDF Successfully", HttpStatus.OK);
    }
}