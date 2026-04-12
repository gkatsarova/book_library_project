package com.webapp.book_library.controller;

import com.webapp.book_library.dto.RentalDto;
import com.webapp.book_library.service.RentalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rentals")
@RequiredArgsConstructor
public class RentalController {

    private final RentalService rentalService;

    @PostMapping("/rent")
    public ResponseEntity<RentalDto> rentBook(@RequestBody Map<String, Object> request, Principal principal) {
        Long bookId = Long.valueOf(request.get("bookId").toString());
        LocalDate returnDate = LocalDate.parse(request.get("returnDate").toString());
        return ResponseEntity.ok(rentalService.rentBook(bookId, returnDate, principal.getName()));
    }

    @PostMapping("/return/{id}")
    public ResponseEntity<RentalDto> returnBook(@PathVariable Long id) {
        return ResponseEntity.ok(rentalService.returnBook(id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<RentalDto>> getMyRentals(Principal principal) {
        return ResponseEntity.ok(rentalService.getMyRentals(principal.getName()));
    }

    @GetMapping("/all")
    public ResponseEntity<List<RentalDto>> getAllRentals() {
        return ResponseEntity.ok(rentalService.getAllRentals());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RentalDto>> getUserRentals(@PathVariable Long userId) {
        return ResponseEntity.ok(rentalService.getUserRentals(userId));
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<RentalDto>> getBookRentals(@PathVariable Long bookId) {
        return ResponseEntity.ok(rentalService.getBookRentals(bookId));
    }
}
