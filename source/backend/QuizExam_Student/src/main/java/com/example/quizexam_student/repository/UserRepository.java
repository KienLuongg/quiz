package com.example.quizexam_student.repository;

import com.example.quizexam_student.entity.Role;
import com.example.quizexam_student.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmailAndStatus(String email, Integer status);

    List<User> findByRoleAndStatus(Role role, Integer status);

    User findByEmail(String email);

    User findByPhoneNumber(String phoneNumber);

    User findByEmailAndIdNot(String email, Integer id);

    User findByPhoneNumberAndIdNot(String phoneNumber, Integer id);

    User findByIdAndStatus(Integer id, Integer status);

    Long countByRole_IdNotAndStatus(Integer roleId, Integer status);
}