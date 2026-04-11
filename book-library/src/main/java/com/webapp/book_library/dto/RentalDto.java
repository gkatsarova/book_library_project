package com.webapp.book_library.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class RentalDto {
    private Long id;
    private Long userId;
    private String userName;
    private Long bookId;
    private String bookTitle;
    private LocalDate rentalDate;
    private LocalDate returnDate;
    private String status;
    private Double fine;
    private LocalDate actualReturnDate;
}
