package com.example.quizexam_student.controller;

import com.example.quizexam_student.bean.response.MarkResponse;
import com.example.quizexam_student.entity.Mark;
import com.example.quizexam_student.entity.StudentDetail;
import com.example.quizexam_student.entity.User;
import com.example.quizexam_student.mapper.MarkMapper;
import com.example.quizexam_student.service.MarkService;
import com.example.quizexam_student.service.StudentService;
import com.example.quizexam_student.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mark")
@RequiredArgsConstructor
public class MarkController {
    private final MarkService markService;

    private final UserService userService;

    private final StudentService studentService;

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR', 'SRO', 'TEACHER')")
    @GetMapping("/pass-percentage")
    public List<Map<String, Object>> getPassPercentageForSubject() {
        return markService.getPassPercentageForSubject();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @GetMapping("/find-all/{examId}")
    public List<MarkResponse> getAllMarkByExam(@PathVariable int examId) {
        return markService.findAllMarkByExam(examId);
    }

    @PreAuthorize("hasAnyRole('STUDENT')")
    @GetMapping("/sem/{semId}")
    public List<MarkResponse> getAllMarksByStudentDetailAndScoreNotNull(@PathVariable int semId){
        String email = ((org.springframework.security.core.userdetails.User)
                SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        User user = userService.findUserByEmail(email);
        return markService.getListScoredPerSubject(user.getStudentDetail(), semId);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO', 'STUDENT')")
    @GetMapping("/sem-and-student/{semId}/{studentId}")
    public List<MarkResponse> getAllMarksBySemAndStudentDetail(@PathVariable int semId, @PathVariable int studentId) {
        StudentDetail studentDetail = studentService.findStudentById(studentId);
        return markService.getListScoredPerSubject(studentDetail, semId);
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/{examId}")
    public MarkResponse getOneScoreByExam(@PathVariable int examId){
        String email = ((org.springframework.security.core.userdetails.User)
                SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        User user = userService.findUserByEmail(email);
        return markService.getOneScoredByExam(user.getStudentDetail(), examId);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO')")
    @PutMapping("/{examId}")
    public List<MarkResponse> updateMark(@PathVariable int examId, @RequestBody List<Integer> studentIds) {
        return markService.updateMark(examId, studentIds);
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PutMapping("/begin-time/{id}")
    public MarkResponse updateBeginTime(@PathVariable int id) {
        return MarkMapper.convertToResponse(markService.updateBeginTime(id));
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PutMapping("/warning/{id}")
    public MarkResponse updateWarning(@PathVariable int id, @RequestBody @Valid Mark mark) {
        return MarkMapper.convertToResponse(markService.updateWarning(id, mark));
    }
}
