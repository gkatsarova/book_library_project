package com.webapp.book_library.repository;

import com.webapp.book_library.model.Rental;
import com.webapp.book_library.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Long> {
    List<Rental> findByUser(User user);
    List<Rental> findByStatus(String status);
}
