package com.webapp.book_library.service;

import com.webapp.book_library.dto.BookDto;
import com.webapp.book_library.model.Author;
import com.webapp.book_library.model.Book;
import com.webapp.book_library.model.Category;
import com.webapp.book_library.repository.AuthorRepository;
import com.webapp.book_library.repository.BookRepository;
import com.webapp.book_library.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final CategoryRepository categoryRepository;

    public List<BookDto> getAllBooks() {
        return bookRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public BookDto getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        return convertToDto(book);
    }

    @Transactional
    public BookDto createBook(BookDto bookDto) {
        Book book = new Book();
        book.setTitle(bookDto.getTitle());
        book.setDescription(bookDto.getDescription());
        book.setIsbn(bookDto.getIsbn());

        Author author = authorRepository.findById(bookDto.getAuthorId())
                .orElseThrow(() -> new RuntimeException("Author not found"));
        book.setAuthor(author);

        if (bookDto.getCategoryIds() != null) {
            Set<Category> categories = new HashSet<>(categoryRepository.findAllById(bookDto.getCategoryIds()));
            book.setCategories(categories);
        }

        Book savedBook = bookRepository.save(book);
        return convertToDto(savedBook);
    }

    @Transactional
    public BookDto updateBook(Long id, BookDto bookDto) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        
        book.setTitle(bookDto.getTitle());
        book.setDescription(bookDto.getDescription());
        book.setIsbn(bookDto.getIsbn());

        Author author = authorRepository.findById(bookDto.getAuthorId())
                .orElseThrow(() -> new RuntimeException("Author not found"));
        book.setAuthor(author);

        if (bookDto.getCategoryIds() != null) {
            Set<Category> categories = new HashSet<>(categoryRepository.findAllById(bookDto.getCategoryIds()));
            book.setCategories(categories);
        }

        Book updatedBook = bookRepository.save(book);
        return convertToDto(updatedBook);
    }

    @Transactional
    public void deleteBook(Long id) {
        bookRepository.deleteById(id);
    }

    private BookDto convertToDto(Book book) {
        BookDto dto = new BookDto();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setDescription(book.getDescription());
        dto.setIsbn(book.getIsbn());
        dto.setAuthorId(book.getAuthor().getId());
        dto.setAuthorName(book.getAuthor().getName());
        dto.setCategoryIds(book.getCategories().stream().map(Category::getId).collect(Collectors.toSet()));
        dto.setCategoryNames(book.getCategories().stream().map(Category::getName).collect(Collectors.toSet()));
        return dto;
    }
}
