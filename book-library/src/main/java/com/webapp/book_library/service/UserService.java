package com.webapp.book_library.service;

import com.webapp.book_library.dto.UserRegistrationDto;
import com.webapp.book_library.model.Role;
import com.webapp.book_library.model.User;
import com.webapp.book_library.repository.RoleRepository;
import com.webapp.book_library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerNewUserAccount(UserRegistrationDto registrationDto) throws Exception {
        if (userRepository.existsByUsername(registrationDto.getUsername())) {
            throw new Exception("There is an account with that username: " + registrationDto.getUsername());
        }

        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new Exception("There is an account with that email address: " + registrationDto.getEmail());
        }

        if (!registrationDto.getPassword().equals(registrationDto.getConfirmPassword())) {
            throw new Exception("Passwords do not match!");
        }

        User user = new User();
        user.setFirstName(registrationDto.getFirstName());
        user.setLastName(registrationDto.getLastName());
        user.setUsername(registrationDto.getUsername());
        user.setEmail(registrationDto.getEmail());
        user.setPassword(passwordEncoder.encode(registrationDto.getPassword()));

        Role.RoleName roleName;
        try {
            roleName = Role.RoleName.valueOf(registrationDto.getRole());
        } catch (IllegalArgumentException | NullPointerException e) {
            roleName = Role.RoleName.ROLE_USER;
        }

        Role userRole = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        
        user.setRoles(Collections.singleton(userRole));

        return userRepository.save(user);
    }
}
