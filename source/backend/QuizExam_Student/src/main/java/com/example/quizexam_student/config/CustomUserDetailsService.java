package com.example.quizexam_student.config;

import com.example.quizexam_student.entity.Role;
import com.example.quizexam_student.entity.User;
import com.example.quizexam_student.exception.NotFoundException;
import com.example.quizexam_student.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmailAndStatus(email, 1).orElseThrow(() -> new NotFoundException("email", "Your Email Not Found!"));
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(mapRolesToAuthorities(user))
                .build();
    }

    private Collection<GrantedAuthority> mapRolesToAuthorities(User user) {
        List<Role> roles = new ArrayList<>();
        roles.add(user.getRole());
        return roles.stream().map(role -> new SimpleGrantedAuthority("ROLE_"+role.getName())).collect(Collectors.toList());
    }
}
