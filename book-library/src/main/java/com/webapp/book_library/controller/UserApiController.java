package com.webapp.book_library.controller;

import com.webapp.book_library.model.User;
import com.webapp.book_library.model.UserProfile;
import com.webapp.book_library.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserApiController {

    private final UserProfileService userProfileService;
    private final com.webapp.book_library.service.UserService userService;

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id, Principal principal) {
        User currentUser = userService.findByEmail(principal.getName());
        
        if (currentUser.getId().equals(id)) {
            return ResponseEntity.badRequest().build();
        }
        
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> userList = userService.findAll().stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", user.getId());
            map.put("email", user.getEmail());
            map.put("firstName", user.getFirstName());
            map.put("lastName", user.getLastName());
            map.put("roles", user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList()));
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(userList);
    }

    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        boolean exists = userService.existsByEmail(email);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userService.findByEmail(principal.getName());
        
        UserProfile profile = userProfileService.getProfileByUserId(user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("roles", user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList()));
        response.put("isAdmin", user.getRoles().stream().anyMatch(r -> r.getName().name().equals("ROLE_ADMIN")));
        response.put("profile", profile);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Long id) {
        User user = userService.findById(id);
        
        UserProfile profile = userProfileService.getProfileByUserId(user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("roles", user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList()));
        response.put("profile", profile);
        
        return ResponseEntity.ok(response);
    }
}
