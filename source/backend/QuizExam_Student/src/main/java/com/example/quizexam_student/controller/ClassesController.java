package com.example.quizexam_student.controller;

import com.example.quizexam_student.bean.response.*;
import com.example.quizexam_student.entity.Classes;
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

@RestController
@RequestMapping("/api/class")
@RequiredArgsConstructor
@Validated
public class ClassesController {
    private final ClassesService classesService;

    private final ExportService exportService;

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR', 'TEACHER', 'SRO')")
    @GetMapping
    public List<Classes> getAllClasses(){
        return classesService.findAllClasses();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @GetMapping("/{id}")
    public Classes getOneById(@PathVariable Integer id){
        return classesService.findOneById(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @PostMapping
    public Classes addClass(@RequestBody @Valid Classes _class){
        return classesService.addClass(_class);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @PutMapping("/{id}")
    public Classes updateClass(@PathVariable Integer id, @RequestBody @Valid Classes _class){
        return classesService.updateClass(id, _class);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @PutMapping("/remove/{id}")
    public Classes deleteClass(@PathVariable Integer id) {
        return classesService.deleteClass(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @PostMapping("/export/excel")
    public ResponseEntity<String> exportToExcel(HttpServletResponse response,@RequestBody List<Classes> classes) throws IOException {
        exportService.export(response, "classes", "xlsx");
        ClassesExcelExporter excelExporter = new ClassesExcelExporter(classes);
        excelExporter.export(response);
        return new ResponseEntity<>("Export To Excel Successfully", HttpStatus.OK);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @PostMapping(value = "/export/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<String> exportToPDF(HttpServletResponse response, @RequestBody List<Classes> classes) throws IOException {
        exportService.export(response, "classes", "pdf");
        ClassesPDFExporter pdfExporter = new ClassesPDFExporter(classes);
        pdfExporter.export(response);
        return new ResponseEntity<>("Export To PDF Successfully", HttpStatus.OK);
    }
}