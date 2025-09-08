package com.example.quizexam_student.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                .exceptionHandling()
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .and()
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeRequests()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/role/**").hasAnyRole("ADMIN", "DIRECTOR", "TEACHER", "SRO")
                .requestMatchers("/api/user/**").hasAnyRole("ADMIN", "DIRECTOR", "TEACHER", "SRO")
                .requestMatchers("/api/permission").hasAnyRole("ADMIN", "DIRECTOR", "TEACHER", "SRO")
                .requestMatchers("/api/class/**").hasAnyRole("ADMIN", "DIRECTOR", "TEACHER", "SRO")
                .requestMatchers("/api/student/**").hasAnyRole("ADMIN", "DIRECTOR", "TEACHER", "SRO")
                .requestMatchers("/api/sem/**").hasAnyRole("ADMIN", "DIRECTOR", "TEACHER", "SRO", "STUDENT")
                .requestMatchers("/api/subject/**").hasAnyRole("ADMIN", "DIRECTOR", "TEACHER", "SRO")
                .requestMatchers("/api/chapter/**").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers("/api/level/**").hasAnyRole("ADMIN", "TEACHER", "SRO")
                .requestMatchers("/api/question/**").hasAnyRole("ADMIN", "DIRECTOR", "TEACHER", "SRO")
                .requestMatchers("/api/exam/**").hasAnyRole("ADMIN", "DIRECTOR", "TEACHER", "SRO", "STUDENT")
                .requestMatchers("/api/question-record/**").hasRole("STUDENT")
                .requestMatchers("/api/student-answers/**").hasRole("STUDENT")
                .requestMatchers("/api/mark/**").hasAnyRole("ADMIN", "DIRECTOR", "TEACHER", "SRO", "STUDENT")
                .requestMatchers("/uploads/**").permitAll()
                .anyRequest().authenticated()
                
                .and()
                .httpBasic();
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    private void configureSubjectApi(HttpSecurity http) throws Exception {
        http.authorizeRequests()
                .requestMatchers(HttpMethod.GET, "/api/subject/**").hasAnyRole("ADMIN", "DIRECTOR", "TEACHER", "SRO")
                .requestMatchers(HttpMethod.POST, "/api/subject/**").hasAnyRole("ADMIN", "DIRECTOR")
                .requestMatchers(HttpMethod.PUT, "/api/subject/**").hasAnyRole("ADMIN", "DIRECTOR");
    }
}