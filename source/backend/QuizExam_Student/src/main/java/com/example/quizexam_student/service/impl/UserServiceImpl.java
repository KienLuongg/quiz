package com.example.quizexam_student.service.impl;

import com.example.quizexam_student.bean.request.*;
import com.example.quizexam_student.bean.response.UserResponse;
import com.example.quizexam_student.entity.*;
import com.example.quizexam_student.mapper.*;
import com.example.quizexam_student.exception.*;
import com.example.quizexam_student.repository.*;
import com.example.quizexam_student.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User findUserByEmail(String email) {
        return userRepository.findByEmailAndStatus(email, 1).orElseThrow(() -> new IncorrectEmailOrPassword("email", "Your Email Not Found"));
    }

    @Override
    public User findById(int id) {
        User user = userRepository.findByIdAndStatus(id,1);
        if (Objects.isNull(user)) {
            throw new NotFoundException("user", "User not found.");
        }
        return user;
    }

    private void handleUserExist(User user, String key, String message) {
        if (user.getStatus() == 0) {
            throw new AlreadyExistException("restore", message + " already exists, but the user is hidden. Would you like to view this user to restore? (" + user.getRole().getName() + ")");
        }
        throw new AlreadyExistException(key, message + " already exists. (" + user.getRole().getName() + ")");
    }

    @Override
    public User prepareUser(UserRequest userRequest, Integer userId, boolean isCreate) {
        User findByEmail = isCreate
                ? userRepository.findByEmail(userRequest.getEmail())
                : userRepository.findByEmailAndIdNot(userRequest.getEmail(), userId);
        if (!Objects.isNull(findByEmail)) {
            handleUserExist(findByEmail, "email", "Email");
        }

        User findByPhoneNumber = isCreate
                ? userRepository.findByPhoneNumber(userRequest.getPhoneNumber())
                : userRepository.findByPhoneNumberAndIdNot(userRequest.getPhoneNumber(), userId);
        if (!Objects.isNull(findByPhoneNumber)) {
            handleUserExist(findByPhoneNumber, "phoneNumber", "Phone Number");
        }

        Role role = roleRepository.findById(userRequest.getRoleId()).orElse(null);
        User user;
        if (isCreate) {
            user = UserMapper.convertFromRequest(userRequest, new User());
            user.setPassword(passwordEncoder.encode("@1234567"));
        }
        else {
            user = UserMapper.convertFromRequest(userRequest, findById(userId));
            user.setPassword(user.getPassword());
        }
        user.setRole(role);
        user.setStatus(1);
        return user;
    }

    @Override
    public User saveUser(UserRequest userRequest) {
        User user = prepareUser(userRequest, null, true);
        return userRepository.saveAndFlush(user);
    }

    @Override
    public User updateUser(int id, UserRequest userRequest) {
        User user = prepareUser(userRequest, id, false);
        return userRepository.save(user);
    }

    @Override
    public List<UserResponse> getUserByRolePermission(Role role, Integer status) {
        return userRepository.findByRoleAndStatus(role, status).stream().map(UserMapper::convertToResponse).collect(Collectors.toList());
    }

    @Override
    public User changePassword(PasswordRequest passwordRequest) {
        String email = ((org.springframework.security.core.userdetails.User)
                SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        User user = findUserByEmail(email);
        assert user != null;
        if (!passwordEncoder.matches(passwordRequest.getCurrentPassword(), user.getPassword())){
            throw new IncorrectEmailOrPassword("currentPassword", "Your current password does not match");
        }
        if (passwordEncoder.matches(passwordRequest.getNewPassword(), user.getPassword())){
            throw new IncorrectEmailOrPassword("newPassword", "Your new password must different current password");
        }
        if (!passwordRequest.getNewPassword().equals(passwordRequest.getConfirmPassword())){
            throw new IncorrectEmailOrPassword("confirmPassword", "Your confirm password does not match");
        }
        user.setPassword(passwordEncoder.encode(passwordRequest.getNewPassword()));
        return userRepository.save(user);
    }

    @Override
    public User deleteUserById(int id) {
        User user = findById(id);
        user.setStatus(0);
        return userRepository.save(user);
    }

    @Override
    public User resetPassword(int id){
        User user = findById(id);
        user.setPassword(passwordEncoder.encode("@1234567"));
        return userRepository.save(user);
    }

    public User findUserInactiveById(int id) {
        User user = userRepository.findByIdAndStatus(id,0);
        if (Objects.isNull(user)) {
            throw new NotFoundException("user", "User not found.");
        }
        return user;
    }

    @Override
    public User restoreUser(int id) {
        User user = findUserInactiveById(id);
        user.setStatus(1);
        return userRepository.save(user);
    }

    @Override
    public Long countAllEmployees() {
        return userRepository.countByRole_IdNotAndStatus(5, 1);
    }
}