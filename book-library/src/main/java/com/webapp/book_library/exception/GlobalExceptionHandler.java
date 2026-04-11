package com.webapp.book_library.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;
import java.io.StringWriter;
import java.io.PrintWriter;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception e) {
        System.err.println("GLOBAL EXCEPTION CAUGHT: " + e.getMessage());
        e.printStackTrace();
        
        Map<String, Object> body = new HashMap<>();
        body.put("status", 500);
        body.put("error", "Internal Server Error");
        body.put("message", e.getMessage());
        body.put("type", e.getClass().getName());
        
        StringWriter sw = new StringWriter();
        e.printStackTrace(new PrintWriter(sw));
        body.put("stackTrace", sw.toString());
        
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
