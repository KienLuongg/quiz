package com.example.quizexam_student.service.impl;

import com.example.quizexam_student.entity.Role;
import com.example.quizexam_student.exception.NotFoundException;
import com.example.quizexam_student.repository.RoleRepository;
import com.example.quizexam_student.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {
    private final RoleRepository roleRepository;

    @Override
    public Role findById(int id) {
        return roleRepository.findById(id).orElseThrow(() -> new NotFoundException("roleNotFound", "Role is not exist"));
    }

    @Override
    public List<Role> findAllToAuthorize(Role role){
        List<Role> roles = roleRepository.findAll();
        roles.removeIf(x->x.getName().equals("STUDENT"));
        if(role.getName().equals("ADMIN")){
            return roles;
        }
        roles.removeIf(x->x.getName().equals("ADMIN"));
        if(role.getName().equals("DIRECTOR")){
            return roles;
        }
        roles.removeIf(x->x.getName().equals("DIRECTOR"));
        if(role.getName().equals("SRO")){
            roles.removeIf(x->x.getName().equals("TEACHER"));
            return roles;
        }
        if(role.getName().equals("TEACHER")){
            roles.removeIf(x->x.getName().equals("SRO"));
            return roles;
        }
        return null;
    }

    @Override
    public List<Role> findAllToEmployee(int id) {
        Role role = findById(id);
        List<Role> roles = roleRepository.findAll();
        roles.removeIf(x->x.getName().equals("ADMIN"));
        if(role.getName().equals("ADMIN")){
            roles.removeIf(x->x.getName().equals("STUDENT"));
            return roles;
        }
        roles.removeIf(x->x.getName().equals("DIRECTOR"));
        if(role.getName().equals("DIRECTOR")){
            roles.removeIf(x->x.getName().equals("STUDENT"));
            return roles;
        }   
        roles.removeIf(x->x.getName().equals("SRO"));
        roles.removeIf(x->x.getName().equals("TEACHER"));
        if(role.getName().equals("SRO")){
            return roles;
        }
        return null;
    }
}