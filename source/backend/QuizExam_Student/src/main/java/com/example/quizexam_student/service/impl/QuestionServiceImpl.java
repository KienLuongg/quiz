package com.example.quizexam_student.service.impl;

import com.example.quizexam_student.bean.request.QuestionRequest;
import com.example.quizexam_student.bean.response.QuestionResponse;
import com.example.quizexam_student.entity.*;
import com.example.quizexam_student.exception.*;
import com.example.quizexam_student.mapper.*;
import com.example.quizexam_student.repository.*;
import com.example.quizexam_student.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {
    private final QuestionRepository questionRepository;
    private final SubjectRepository subjectRepository;
    private final LevelRepository levelRepository;
    private final ChapterRepository chapterRepository;
    private final AnswerRepository answerRepository;
    private final ExaminationRepository examinationRepository;

    @Override
    public List<Question> findAllQuestionsBySubjectId(int subjectId) {
        return questionRepository.findAllBySubjectAndStatusOrderByIdDesc(subjectRepository.findById(subjectId).orElse(null), 1);
    }

    @Override
    public Question findQuestionById(int questionId) {
        Question question = questionRepository.findByIdAndStatus(questionId, 1);
        if (Objects.isNull(question)) {
            throw new NotFoundException("question", "Question not found.");
        }
        return question;
    }

    @Override
    public List<Question> saveQuestions(List<QuestionRequest> questionRequests) {
        List<Question> savedQuestions = new ArrayList<>();
        for (QuestionRequest questionRequest : questionRequests) {
            Question question = QuestionMapper.convertFromRequest(questionRequest);
            question.setStatus(1);
            question.setSubject(subjectRepository.findById(questionRequest.getSubjectId()).orElse(null));
            question.setLevel(levelRepository.findById(questionRequest.getLevelId()).orElse(null));
            question.setChapters(new HashSet<>(chapterRepository.findByIdIn(questionRequest.getChapters())));
            List<Answer> answers = questionRequest.getAnswers().stream().map(AnswerMapper::convertFromRequest).toList();
            question.setAnswers(new HashSet<>(answers.stream().peek(answer -> answer.setQuestion(question)).toList()));
            questionRepository.save(question);
            savedQuestions.add(question);
        }
        return savedQuestions;
    }

    @Override
    public Question updateQuestion(int id, QuestionRequest questionRequest) {
        if (questionRequest.getLevelId() == 0) {
            throw new NotFoundException("question", "Level is required.");
        }
        Question question = findQuestionById(id);
        assert question != null;
        question.setContent(questionRequest.getContent());
        if (questionRequest.getImage() != null) {
            question.setImage(questionRequest.getImage().isEmpty() ? null : questionRequest.getImage());
        }
        question.setSubject(subjectRepository.findById(questionRequest.getSubjectId()).orElse(null));
        question.setLevel(levelRepository.findById(questionRequest.getLevelId()).orElse(null));
        question.setChapters(new HashSet<>(chapterRepository.findByIdIn(questionRequest.getChapters())));
        List<Answer> answers = questionRequest.getAnswers().stream().map(AnswerMapper::convertFromRequest).collect(Collectors.toList());
        answers = answers.stream().peek(answer -> answer.setQuestion(question)).collect(Collectors.toList());

        if (answers.size() < 4) {
            throw new InvalidQuantityException("question", "Must have at least 4 answers.");
        }

        boolean hasCorrectAnswer = answers.stream().anyMatch(Answer::getIsCorrect);
        boolean hasIncorrectAnswer = answers.stream().anyMatch(answer -> !answer.getIsCorrect());
        if (!hasCorrectAnswer || !hasIncorrectAnswer) {
            throw new NotFoundException("question", "Must have at least one correct answer and one incorrect answer.");
        }

        // Kiểm tra có trùng lặp câu trả lời
        Set<String> uniqueAnswers = new HashSet<>();
        for (Answer answer : answers) {
            if (!uniqueAnswers.add(answer.getContent())) {  // Trả về false nếu đã tồn tại câu trả lời giống
                throw new AlreadyExistException("question", "Answers must be unique.");
            }
        }

        question.setAnswers(new HashSet<>());
        questionRepository.save(question);
        List<Answer> questionAnswers = answerRepository.findByQuestion(question);
        answerRepository.deleteAll(questionAnswers.stream().peek(answer -> answer.setQuestion(null)).toList());
        answerRepository.saveAll(answers);
        return question;
    }

    @Override
    public Question deleteQuestion(int id) {
        Question question = findQuestionById(id);
        question.setStatus(0);
        return questionRepository.save(question);
    }

    @Override
    public List<QuestionResponse> findAllQuestionsByExam(int examId) {
        Examination examination = examinationRepository.findByIdAndStatus(examId, 1);
        if (Objects.isNull(examination)) {
            throw new NotFoundException("exam", "Examination not found.");
        }
        if (examination.getStartTime().isBefore(LocalDateTime.now())) {
            throw new InvalidTimeException("exam", "Cannot update examination as it has already started.");
        }
        return examination.getQuestions().stream().map(QuestionMapper::convertToResponse).toList();
    }
}