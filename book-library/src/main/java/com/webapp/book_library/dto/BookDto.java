package com.webapp.book_library.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookDto {
    private Long id;
    private String title;
    private String description;
    private String isbn;
    private Long authorId;
    private String authorName;
    private Set<Long> categoryIds;
    private Set<String> categoryNames;
    private String coverImageUrl;
    private Boolean available;
}
