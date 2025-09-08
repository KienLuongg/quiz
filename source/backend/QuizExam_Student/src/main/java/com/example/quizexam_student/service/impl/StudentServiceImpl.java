package com.example.quizexam_student.service.impl;

import com.example.quizexam_student.bean.request.*;
import com.example.quizexam_student.bean.response.MarkResponse;
import com.example.quizexam_student.entity.*;
import com.example.quizexam_student.exception.*;
import com.example.quizexam_student.mapper.*;
import com.example.quizexam_student.repository.*;
import com.example.quizexam_student.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {
    private final UserRepository userRepository;

    private final StudentRepository studentRepository;

    private final ClassesRepository classesRepository;

    private final UserService userService;

    private final PasswordEncoder passwordEncoder;

    private final MarkRepository markRepository;

    @Override
    public List<StudentDetail> findAllStudentsNoneClass(Integer status) {
        return studentRepository.findAllByUser_StatusAndUser_Role_IdAndClassesIsNullOrderByUserIdDesc(status, 5);
    }

    @Override
    public List<StudentDetail> findAllStudentsByClass(Integer status, Integer classId) {
        return studentRepository.findAllByUser_StatusAndUser_Role_IdAndClasses_IdOrderByUserIdDesc(status, 5, classId);
    }

    @Override
    public StudentDetail findStudentById(Integer id) {
        StudentDetail student = studentRepository.findByUserIdAndUser_StatusAndUser_Role_Id(id, 1, 5);
        if (Objects.isNull(student)) {
            throw new NotFoundException("student", "Student not found.");
        }
        return student;
    }

    @Override
    public StudentDetail findStudentByUserId(Integer id) {
        return studentRepository.findByUserId(id).orElse(null);
    }

    private void handleStudentExist(StudentDetail student, String key, String message) {
        if (student.getUser().getStatus() == 0) {
            throw new AlreadyExistException("restore", message + " already exists, but the user is hidden. Would you like to view this user to restore?");
        }
        throw new AlreadyExistException(key, message + " already exists.");
    }

    public StudentDetail prepareStudent(StudentRequest studentRequest, Integer userId, boolean isCreate) {
        User user = userService.prepareUser(studentRequest.getUserRequest(), userId, isCreate);

        StudentDetail findByRollPortal = isCreate
                ? studentRepository.findByRollPortal(studentRequest.getRollPortal())
                : studentRepository.findByRollPortalAndUserIdNot(studentRequest.getRollPortal(), userId);
        if (!Objects.isNull(findByRollPortal)) {
            handleStudentExist(findByRollPortal, "rollPortal", "Roll Portal");
        }

        StudentDetail findByRollNumber = isCreate
                ? studentRepository.findByRollNumber(studentRequest.getRollNumber())
                : studentRepository.findByRollNumberAndUserIdNot(studentRequest.getRollNumber(), userId);
        if (!Objects.isNull(findByRollNumber)) {
            handleStudentExist(findByRollNumber, "rollNumber", "Roll Number");
        }

        userRepository.saveAndFlush(user);

        StudentDetail studentDetail;
        if (isCreate) {
            studentDetail = StudentMapper.convertFromRequest(studentRequest, new StudentDetail());
        }
        else {
            studentDetail = StudentMapper.convertFromRequest(studentRequest, findStudentById(userId));
        }
        Classes classes = classesRepository.findById(studentRequest.getClassId()).orElse(null);
        studentDetail.setClasses(classes);
        studentDetail.setUser(user);
        return studentDetail;
    }

    @Override
    public StudentDetail addStudent(StudentRequest studentRequest) {
        StudentDetail student = prepareStudent(studentRequest, null, true);
        return studentRepository.save(student);
    }

    @Override
    public StudentDetail updateStudent(StudentRequest studentRequest, Integer id) {
        StudentDetail student = prepareStudent(studentRequest, id, false);
        return studentRepository.save(student);
    }

    @Override
    public List<StudentDetail> findStudentsMovingToClass(List<Integer> userIds) {
        return studentRepository.findAllByUserIdIn(userIds);
    }

    @Override
    public List<StudentDetail> updateClassForStudents(List<Integer> userIds, Integer classId) {
        Classes _class = classesRepository.findByIdAndStatus(classId, 1).orElse(null);
        List<StudentDetail> students = findStudentsMovingToClass(userIds);
        for (StudentDetail student : students) {
            student.setClasses(_class);
        }
        return studentRepository.saveAll(students);
    }

    @Override
    public StudentDetail resetPassword(Integer id) {
        StudentDetail studentDetail = findStudentById(id);
        studentDetail.getUser().setPassword(passwordEncoder.encode("@1234567"));
        return studentRepository.save(studentDetail);
    }

    @Override
    public StudentDetail deleteStudent(Integer id) {
        StudentDetail studentDetail = findStudentById(id);
        studentDetail.getUser().setStatus(0);
        return studentRepository.save(studentDetail);
    }

    public StudentDetail findStudentInactiveById(Integer id) {
        StudentDetail student = studentRepository.findByUserIdAndUser_StatusAndUser_Role_Id(id, 0, 5);
        if (Objects.isNull(student)) {
            throw new NotFoundException("student", "Student not found.");
        }
        return student;
    }

    @Override
    public StudentDetail restoreStudent(Integer id) {
        StudentDetail studentDetail = findStudentInactiveById(id);
        studentDetail.getUser().setStatus(1);
        return studentRepository.save(studentDetail);
    }

    @Override
    public List<StudentDetail> findAllStudentsForExam(Integer status, Integer classId, Integer examId) {
        Classes _class = classesRepository.findByIdAndStatus(classId, 1).orElse(null);
        List<StudentDetail> students;
        if (Objects.isNull(_class)) {
            students = findAllStudentsNoneClass(status);
        }
        else {
            students = findAllStudentsByClass(status, classId);
        }
        List<Integer> studentsParticipatingInExam = findAllStudentIdsByExam(examId);
        return students.stream()
                .filter(student -> !studentsParticipatingInExam.contains(student.getUserId()))
                .collect(Collectors.toList());
    }

    @Override
    public Long countAllStudents() {
        return studentRepository.countByUser_StatusAndUser_Role_Id(1, 5);
    }

    public List<Integer> findAllStudentIdsByExam(Integer examId) {
        List<Mark> marks = markRepository.findAllByExamination_IdAndBeginTimeIsNotNull(examId);
        return marks.stream()
                .map(mark -> mark.getStudentDetail().getUserId()) // Lấy ID của StudentDetail
                .collect(Collectors.toList());
    }
}