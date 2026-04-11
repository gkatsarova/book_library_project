package com.webapp.book_library.service;

import com.webapp.book_library.model.User;
import com.webapp.book_library.model.UserProfile;
import com.webapp.book_library.repository.UserProfileRepository;
import com.webapp.book_library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;

    public UserProfile getProfileByUserId(Long userId) {
        return userProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserProfile profile = new UserProfile();
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    profile.setUser(user);
                    return userProfileRepository.save(profile);
                });
    }
}
