package com.webapp.book_library.service;

import com.webapp.book_library.dto.RentalDto;
import com.webapp.book_library.model.Book;
import com.webapp.book_library.model.Rental;
import com.webapp.book_library.model.User;
import com.webapp.book_library.repository.BookRepository;
import com.webapp.book_library.repository.RentalRepository;
import com.webapp.book_library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalRepository rentalRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    @Transactional
    public RentalDto rentBook(Long bookId, LocalDate returnDate, String username) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        
        if (!book.isAvailable()) {
            throw new RuntimeException("Book is already rented");
        }

        if (returnDate.isBefore(LocalDate.now())) {
            throw new RuntimeException("Return date cannot be in the past");
        }

        Rental rental = new Rental();
        rental.setUser(user);
        rental.setBook(book);
        rental.setRentalDate(LocalDate.now());
        rental.setReturnDate(returnDate);
        rental.setStatus("ACTIVE");
        
        book.setAvailable(false);
        bookRepository.save(book);
        
        Rental savedRental = rentalRepository.save(rental);
        return convertToDto(savedRental);
    }

    @Transactional
    public RentalDto returnBook(Long rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Rental not found"));
        
        if ("RETURNED".equals(rental.getStatus())) {
            throw new RuntimeException("Book already returned");
        }
        
        rental.setStatus("RETURNED");
        rental.setActualReturnDate(LocalDate.now());

        // Calculate fine
        long daysLate = ChronoUnit.DAYS.between(rental.getReturnDate(), LocalDate.now());
        if (daysLate > 0) {
            rental.setFine(daysLate * 1.00);
        } else {
            rental.setFine(0.0);
        }

        Book book = rental.getBook();
        book.setAvailable(true);
        bookRepository.save(book);
        
        Rental savedRental = rentalRepository.save(rental);
        return convertToDto(savedRental);
    }

    @Transactional(readOnly = true)
    public List<RentalDto> getMyRentals(String username) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return rentalRepository.findByUser(user).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RentalDto> getUserRentals(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return rentalRepository.findByUser(user).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RentalDto> getBookRentals(Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        
        return rentalRepository.findByBook(book).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RentalDto> getAllRentals() {
        return rentalRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private RentalDto convertToDto(Rental rental) {
        RentalDto dto = new RentalDto();
        dto.setId(rental.getId());
        dto.setUserId(rental.getUser().getId());
        dto.setUserName(rental.getUser().getFirstName() + " " + rental.getUser().getLastName());
        dto.setBookId(rental.getBook().getId());
        dto.setBookTitle(rental.getBook().getTitle());
        dto.setRentalDate(rental.getRentalDate());
        dto.setReturnDate(rental.getReturnDate());
        dto.setStatus(rental.getStatus());
        dto.setFine(rental.getFine());
        dto.setActualReturnDate(rental.getActualReturnDate());
        return dto;
    }
}
