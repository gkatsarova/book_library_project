package com.webapp.book_library.config;

import com.webapp.book_library.model.Role;
import com.webapp.book_library.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        seedRole(Role.RoleName.ROLE_USER);
        seedRole(Role.RoleName.ROLE_ADMIN);
    }

    private void seedRole(Role.RoleName roleName) {
        if (!roleRepository.existsByName(roleName)) {
            Role role = new Role();
            role.setName(roleName);
            roleRepository.save(role);
        }
    }
}
