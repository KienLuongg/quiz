package com.example.quizexam_student.controller;

import com.example.quizexam_student.bean.request.*;
import com.example.quizexam_student.bean.response.*;
import com.example.quizexam_student.entity.*;
import com.example.quizexam_student.mapper.StudentMapper;
import com.example.quizexam_student.mapper.UserMapper;
import com.example.quizexam_student.service.*;
import com.example.quizexam_student.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {
    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final StudentService studentService;
    private final HttpServletRequest httpServletRequest;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtUtil.generateJwtToken(authentication);
        return ResponseEntity.ok(new LoginResponse(token, loginRequest.getEmail()));
    }

    @GetMapping("/role")
    public Role getCurrentRole() {
        String email = httpServletRequest.getHeader("Email");
        return userService.findUserByEmail(email).getRole();
    }

    @GetMapping("/profile")
    public ResponseEntity<Object> getDetail() {
        String email = ((org.springframework.security.core.userdetails.User) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        UserResponse userResponse = UserMapper.convertToResponse(userService.findUserByEmail(email));
        if (userResponse.getRole().getName().equals("STUDENT")) {
            StudentResponse studentResponse = StudentMapper.convertToResponse(studentService.findStudentByUserId(userResponse.getId()));
            return ResponseEntity.ok(studentResponse);
        }
        return ResponseEntity.ok(userResponse);
    }

    @PutMapping("/change-password")
    public ResponseEntity<UserResponse> updateProfile(@RequestBody @Valid PasswordRequest passwordRequest) {
        UserResponse userResponse = UserMapper.convertToResponse(userService.changePassword(passwordRequest));
        return ResponseEntity.ok(userResponse);
    }
}