package com.example.quizexam_student.handle;

import com.example.quizexam_student.bean.response.ErrorResponse;
import com.example.quizexam_student.exception.*;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.ArrayList;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandle {
    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFoundException(NotFoundException e) {
        return new ErrorResponse(HttpStatus.NOT_FOUND, e.getKey(), e.getMessage());
    }

    @ExceptionHandler(IncorrectEmailOrPassword.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleIncorrectEmailOrPassword(IncorrectEmailOrPassword e) {
        return new ErrorResponse(HttpStatus.BAD_REQUEST, e.getKey(), e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public List<ErrorResponse> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        List<ErrorResponse> errors = new ArrayList<>();
        e.getBindingResult().getAllErrors().forEach((error) -> errors.add(new ErrorResponse(HttpStatus.BAD_REQUEST, ((FieldError) error).getField(), error.getDefaultMessage())));
        return errors;
    }


    @ExceptionHandler(EmptyException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handEmptyException(EmptyException e) {
        return new ErrorResponse(HttpStatus.BAD_REQUEST, e.getKey(), e.getMessage());
    }


    @ExceptionHandler(AlreadyExistException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleAlreadyExistException(AlreadyExistException e) {
        return new ErrorResponse(HttpStatus.BAD_REQUEST, e.getKey(), e.getMessage());
    }

    @ExceptionHandler(AuthenticatedException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ErrorResponse handleAuthenticationCredentialsNotFoundException(AuthenticatedException e) {
        return new ErrorResponse(HttpStatus.BAD_REQUEST, e.getKey(), e.getMessage());
    }

    @ExceptionHandler(InvalidQuantityException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleInvalidQuantityException(InvalidQuantityException e) {
        return new ErrorResponse(HttpStatus.BAD_REQUEST, e.getKey(), e.getMessage());
    }

    @ExceptionHandler(InvalidTimeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleInvalidTimeException(InvalidTimeException e) {
        return new ErrorResponse(HttpStatus.BAD_REQUEST, e.getKey(), e.getMessage());
    }
}