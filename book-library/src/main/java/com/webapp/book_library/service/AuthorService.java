package com.webapp.book_library.service;

import com.webapp.book_library.dto.AuthorDto;
import com.webapp.book_library.model.Author;
import com.webapp.book_library.repository.AuthorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthorService {

    private final AuthorRepository authorRepository;

    @Transactional(readOnly = true)
    public List<AuthorDto> getAllAuthors() {
        return authorRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AuthorDto getAuthorById(Long id) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Author not found"));
        return convertToDto(author);
    }

    @Transactional
    public AuthorDto createAuthor(AuthorDto authorDto) {
        Author author = new Author();
        author.setName(authorDto.getName());
        author.setBiography(authorDto.getBiography());
        Author savedAuthor = authorRepository.save(author);
        return convertToDto(savedAuthor);
    }

    @Transactional
    public AuthorDto updateAuthor(Long id, AuthorDto authorDto) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Author not found"));
        author.setName(authorDto.getName());
        author.setBiography(authorDto.getBiography());
        Author updatedAuthor = authorRepository.save(author);
        return convertToDto(updatedAuthor);
    }

    @Transactional
    public void deleteAuthor(Long id) {
        authorRepository.deleteById(id);
    }

    private AuthorDto convertToDto(Author author) {
        return new AuthorDto(author.getId(), author.getName(), author.getBiography());
    }
}
