package com.example.quizexam_student.controller;

import com.example.quizexam_student.bean.request.SubjectRequest;
import com.example.quizexam_student.bean.response.*;
import com.example.quizexam_student.entity.Subject;
import com.example.quizexam_student.service.*;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;
import static org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;

@RestController
@RequestMapping("/api/subject")
@RequiredArgsConstructor
@Validated
public class SubjectController {
    private final SubjectService subjectService;
    private final ExportService exportService;

    @Value("${uploads.subject}")
    private String uploadSubject;

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR', 'TEACHER', 'SRO')")
    @GetMapping("")
    public List<Subject> getAll(){
        return subjectService.findAll();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR', 'TEACHER')")
    @GetMapping("/{id}")
    public Subject getSubjectById(@PathVariable int id){
        return subjectService.findById(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR', 'TEACHER', 'SRO')")
    @GetMapping("/sem/{id}")
    public List<Subject> getAllSubjects(@PathVariable Integer id){
        return subjectService.getAllSubjectBySem(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR')")
    @PostMapping(consumes = {MULTIPART_FORM_DATA_VALUE, APPLICATION_JSON_VALUE}, path = "")
    public ResponseEntity<Subject> saveSubject(@RequestPart(value = "file", required = false) MultipartFile file, @RequestPart("subject") @Valid SubjectRequest subjectRequest) throws IOException {
        if (file != null) {
            if (!file.isEmpty()) {
                String extension = "";
                if (file.getOriginalFilename() != null && file.getOriginalFilename().contains(".")) {
                    extension = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf(".")); // Lấy phần đuôi file (extension)
                }
                String fileName = UUID.randomUUID() + "_" + System.currentTimeMillis() + "_" + System.nanoTime() + extension;
                Files.copy(file.getInputStream(), Paths.get(uploadSubject).resolve(fileName));
                subjectRequest.setImage(fileName);
            }
        }
        return ResponseEntity.ok(subjectService.save(subjectRequest));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR')")
    @PutMapping (consumes = {MULTIPART_FORM_DATA_VALUE, APPLICATION_JSON_VALUE}, path = "/{id}")
    public Subject updateSubject(@PathVariable int id, @RequestPart(value = "file", required = false) MultipartFile file, @RequestPart("subject") @Valid SubjectRequest subjectRequest) throws IOException {
        if (file != null) {
            String fileName = "";
            if (!file.isEmpty()) {
                String extension = "";
                if (file.getOriginalFilename() != null && file.getOriginalFilename().contains(".")) {
                    extension = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf(".")); // Lấy phần đuôi file (extension)
                }
                fileName = UUID.randomUUID() + "_" + System.currentTimeMillis() + "_" + System.nanoTime() + extension;
                Files.copy(file.getInputStream(), Paths.get(uploadSubject).resolve(fileName));
            }
            subjectRequest.setImage(fileName);
        }
        return subjectService.update(id,subjectRequest);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR')")
    @PutMapping("/remove/{id}")
    public ResponseEntity<Subject> deleteSubject(@PathVariable int id){
        return ResponseEntity.ok(subjectService.deleteById(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR')")
    @PostMapping("/export/excel")
    public ResponseEntity<String> exportToExcel(HttpServletResponse response, @RequestBody List<Subject> subjects) throws IOException {
        exportService.export(response, "subject", "xlsx");
        SubjectExcelExporter excelExporter = new SubjectExcelExporter(subjects);
        excelExporter.export(response);
        return new ResponseEntity<>("Export To Excel Successfully", HttpStatus.OK);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR')")
    @PostMapping(value = "/export/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<String> exportToPDF(HttpServletResponse response, @RequestBody List<Subject> subjects) throws IOException {
        exportService.export(response, "subject", "pdf");
        SubjectPDFExporter subjectPDFExporter = new SubjectPDFExporter(subjects);
        subjectPDFExporter.export(response);
        return new ResponseEntity<>("Export To PDF Successfully", HttpStatus.OK);
    }
}