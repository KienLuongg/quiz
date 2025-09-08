package com.example.quizexam_student.service.impl;

import com.example.quizexam_student.bean.request.ExaminationRequest;
import com.example.quizexam_student.bean.response.*;
import com.example.quizexam_student.entity.*;
import com.example.quizexam_student.exception.InvalidQuantityException;
import com.example.quizexam_student.exception.InvalidTimeException;
import com.example.quizexam_student.exception.NotFoundException;
import com.example.quizexam_student.mapper.*;
import com.example.quizexam_student.repository.*;
import com.example.quizexam_student.service.ExaminationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExaminationServiceImpl implements ExaminationService {
    private final ExaminationRepository examinationRepository;
    private final QuestionRepository questionRepository;
    private final QuestionRecordRepository questionRecordRepository;
    private final AnswerRecordRepository answerRecordRepository;
    private final SubjectRepository subjectRepository;
    private final MarkRepository markRepository;
    private final Random random = new Random();

    @Override
    public List<ExaminationResponse> getAllExamBySemId(int semId) {
        return examinationRepository.findAllBySubject_Sem_IdAndStatusOrderByIdDesc(semId, 1).stream()
                .map(ExaminationMapper::convertToResponse).collect(Collectors.toList());
    }

    @Override
    public List<ExaminationResponse> getAllExaminationsForStudent(List<Mark> marks) {
        List<Examination> examinations = new ArrayList<>();
        marks.forEach(mark -> {
            Examination examination = examinationRepository.findByMarksContainingAndStatus(mark,1);
            if (examination != null) {
                examinations.add(examination);
            }
        });
        return examinations.stream().map(ExaminationMapper::convertToResponse).collect(Collectors.toList());
    }

    @Override
    public List<ExaminationResponse> getAllExaminationFinishedBySemId(int semId) {
        List<Mark> marks = markRepository.findAllBySubject_Sem_IdAndScoreIsNotNull(semId);
        return convertToExamResponseFromMarks(marks);
    }

    @Override
    public List<ExaminationResponse> getAllExaminationBySubjectId(int subjectId) {
        List<Mark> marks = markRepository.findAllBySubject_IdAndScoreIsNotNullOrderByExamination_IdDesc(subjectId);
        return convertToExamResponseFromMarks(marks);
    }

    @Override
    public ExaminationResponse getDetailExamination(int examinationId) {
        Examination examination = examinationRepository.findByIdAndStatus(examinationId,1);
        if (Objects.isNull(examination)) {
            throw new NotFoundException("exam", "Examination not found.");
        }
        ExaminationResponse examinationResponse = ExaminationMapper.convertToResponse(examination);
        return setQuestionRecord(examinationResponse);
    }

    @Override
    public Examination autoGenerateExam(ExaminationRequest examinationRequest) {
        if (examinationRequest.getEndTime().isBefore(examinationRequest.getStartTime())) {
            throw new InvalidTimeException("endTime", "End time must be after start time");
        }
        Subject subject = subjectRepository.findById(examinationRequest.getSubjectId()).orElse(null);
        Map<Integer, Integer> levelsRequest = examinationRequest.getLevels();
        int totalQuestions = 0;
        for (Map.Entry<Integer, Integer> entry : levelsRequest.entrySet()) {
            totalQuestions += entry.getValue();
        }
        Map<Integer, List<Question>> questionsByLevels = new HashMap<>();
        List<Question> allQuestions = questionRepository.findAllBySubjectAndStatusOrderByIdDesc(subject,1);

        levelsRequest.forEach((key, value) -> {
            List<Question> questionsByLevel = allQuestions.stream().filter(question -> question.getLevel().getId() == key).toList();
            if ((long) questionsByLevel.size() < value){
                throw new InvalidQuantityException("exam", "Not enough questions");
            }
            questionsByLevels.put(key,questionsByLevel);
        });

        List<Examination> examinations = examinationRepository.findTop3BySubjectOrderByIdDesc(subject);
        Map<Integer, List<Question>> questionsByExams = new HashMap<>();
        examinations.forEach(examination -> {
            questionsByExams.put(examination.getId(), examination.getQuestions().stream().toList());
        });
        List<Question> finalQuestions = new ArrayList<>();
        int generatedCount = 0;
        do {
            generatedCount++;
            List<Question> selectedQuestion = generateQuestion(allQuestions, levelsRequest);
            if (!questionsByExams.isEmpty()){
                for (Map.Entry<Integer, List<Question>> entry : questionsByExams.entrySet()) {
                    allQuestions.removeAll(selectedQuestion);
                    selectedQuestion = checkDuplicatedQuestionInExamination(allQuestions, entry.getValue(), selectedQuestion);
                }
                finalQuestions.addAll(selectedQuestion);
            } else {
                allQuestions.removeAll(selectedQuestion);
                finalQuestions.addAll(selectedQuestion);
            }
            levelsRequest.entrySet().forEach(entry -> {
                int count = (int) finalQuestions.stream()
                        .filter(question -> question.getLevel().getId() == entry.getKey())
                        .count();
                entry.setValue(entry.getValue() - count);
            });
            if (finalQuestions.size()==totalQuestions){
                break;
            }
            if (generatedCount == 3){
                throw new InvalidQuantityException("exam", "Not enough questions");
            }
        } while (true);

        double maxScore = 0;
        for (Question question : finalQuestions) {
            generateAnswerForQuestion(question);
            maxScore += question.getLevel().getPoint();
        }

        Examination exam = ExaminationMapper.convertFromRequest(examinationRequest);
        exam.setStatus(1);
        exam.setMaxScore(maxScore);
        exam.setTotalQuestion(totalQuestions);
        exam.setQuestions(new HashSet<>(finalQuestions));
        exam.setSubject(subject);

        do {
            int randomNumber = random.nextInt(1000);
            String randomNumberStr = String.format("%03d",randomNumber);
            String currentDate = new SimpleDateFormat("yyMMdd").format(new Date());
            assert subject != null;
            exam.setCode(subject.getName() + "_" + randomNumberStr + "_" + currentDate);
        } while (examinationRepository.existsByCodeAndStatus(exam.getCode(), 1));

        for (Question question : finalQuestions) {
            setAnswerForQuestion(exam, question);
        }
        return examinationRepository.save(exam);
    }

    @Override
    public Examination updateExamination(int examinationId, ExaminationRequest examinationRequest) {
        Examination examination = examinationRepository.findByIdAndStatus(examinationId,1);
        if (Objects.isNull(examination)) {
            throw new NotFoundException("exam", "Examination not found.");
        }
        examination.setName(examinationRequest.getName());
        examination.setStartTime(examinationRequest.getStartTime());
        examination.setEndTime(examinationRequest.getEndTime());
        examination.setDuration(examinationRequest.getDuration());
        return examinationRepository.save(examination);
    }

    private List<ExaminationResponse> convertToExamResponseFromMarks(List<Mark> marks) {
        List<Examination> examinations = new ArrayList<>();
        marks.forEach(mark -> {
            if (examinations.isEmpty() || !examinations.contains(mark.getExamination())) {
                examinations.add(mark.getExamination());
            }
        });
        return examinations.stream()
                .map(examination -> {
                    List<MarkResponse> markList = marks.stream().filter(mark -> mark.getExamination() == examination)
                            .map(MarkMapper::convertToResponse).collect(Collectors.toList());
                    ExaminationResponse examinationResponse = ExaminationMapper.convertToResponse(examination);
                    examinationResponse.setMarkResponses(markList);
                    return examinationResponse;
                })
                .collect(Collectors.toList());
    }

    @Override
    public Examination createExamBySelectingQuestions(ExaminationRequest examinationRequest, List<Integer> questionIds) {
        if (examinationRequest.getEndTime().isBefore(examinationRequest.getStartTime())) {
            throw new InvalidTimeException("endTime", "End time must be after start time");
        }
        Subject subject = subjectRepository.findById(examinationRequest.getSubjectId()).orElse(null);
        double maxScore = 0;
        List<Question> questions = questionRepository.findAllByIdInAndStatus(questionIds, 1);
        for (Question question : questions) {
            generateAnswerForQuestion(question);
            maxScore += question.getLevel().getPoint();
        }
        Examination exam = ExaminationMapper.convertFromRequest(examinationRequest);
        exam.setStatus(1);
        exam.setMaxScore(maxScore);
        exam.setTotalQuestion(questions.size());
        exam.setQuestions(new HashSet<>(questions));
        exam.setSubject(subject);
        do {
            int randomNumber = random.nextInt(1000);
            String randomNumberStr = String.format("%03d",randomNumber);
            String currentDate = new SimpleDateFormat("yyMMdd").format(new Date());
            assert subject != null;
            exam.setCode(subject.getName() + "_" + randomNumberStr + "_" + currentDate);
        } while (examinationRepository.existsByCodeAndStatus(exam.getCode(), 1));

        for (Question question : questions) {
            setAnswerForQuestion(exam, question);
        }
        return examinationRepository.save(exam);
    }

    @Override
    @Transactional
    public Examination updateQuestionsInExam(int examinationId, List<Integer> questionIds) {
        Examination examination = examinationRepository.findByIdAndStatus(examinationId, 1);
        if (Objects.isNull(examination)) {
            throw new NotFoundException("exam", "Examination not found.");
        }
        if (examination.getStartTime().isBefore(LocalDateTime.now())) {
            throw new InvalidTimeException("exam", "Cannot update examination as it has already started.");
        }

        deleteQuestionRecordsAndClearQuestions(examination);

        double maxScore = 0;
        List<Question> questions = questionRepository.findAllByIdInAndStatus(questionIds, 1);
        for (Question question : questions) {
            generateAnswerForQuestion(question);
            maxScore += question.getLevel().getPoint();
        }

        examination.setMaxScore(maxScore);
        examination.setTotalQuestion(questions.size());
        examination.setQuestions(new HashSet<>(questions));

        for (Question question : questions) {
            setAnswerForQuestion(examination, question);
        }
        return examinationRepository.save(examination);
    }

    @Override
    public Long countAllExams() {
        return examinationRepository.count();
    }

    @Scheduled(fixedRate = 1000)
    public void updateStatusForExamination() {
        List<Examination> examinations = examinationRepository.findAllByStatus(1);
        examinations.stream()
                .filter(examination -> LocalDateTime.now().isAfter(examination.getEndTime()))
                .forEach(this::updateExaminationStatus);
    }

    private void updateExaminationStatus(Examination examination) {
        examination.setStatus(0);
        updateMarksForExamination(examination);
        examinationRepository.save(examination);
    }

    private void updateMarksForExamination(Examination examination) {
        markRepository.findAllByExamination(examination)
        .forEach(mark -> {
            if (mark.getBeginTime() == null && mark.getScore() == null) {
                mark.setScore(0.0);
                mark.setBeginTime(LocalDateTime.now());
                mark.setSubmittedTime(LocalDateTime.now());
                markRepository.save(mark);
            }
        });
    }

    @Transactional
    public void deleteQuestionRecordsAndClearQuestions(Examination examination) {
        // Lấy tất cả QuestionRecord liên quan đến examination
        Set<QuestionRecord> questionRecords = examination.getQuestionRecords();
        for (QuestionRecord questionRecord : questionRecords) {
            // Xóa tất cả AnswerRecord liên quan đến QuestionRecord
            Set<AnswerRecord> answerRecords = questionRecord.getAnswerRecords();
            for (AnswerRecord answerRecord : answerRecords) {
                answerRecordRepository.delete(answerRecord); // Xóa AnswerRecord
            }
            // Xóa QuestionRecord
            questionRecordRepository.delete(questionRecord);
        }

        // Xóa tất cả các câu hỏi đã liên kết trong bài thi
        examination.getQuestions().clear();
    }

    private ExaminationResponse setQuestionRecord(ExaminationResponse examinationResponse){
        List<QuestionRecord> questionRecords = questionRecordRepository.findAllByExamination(examinationRepository.findById(examinationResponse.getId()).orElse(null));
        List<QuestionRecordResponse> questionRecordResponses = questionRecords.stream()
                .map(QuestionRecordMapper::convertToResponse)
                .collect(Collectors.toList());
        Collections.shuffle(questionRecordResponses);
        examinationResponse.setQuestionRecordResponses(questionRecordResponses);
        return examinationResponse;
    }

    private List<Question> generateQuestion(List<Question> questions, Map<Integer, Integer> levelsRequest) {
        Collections.shuffle(questions);
        int totalQuestions = 0;
        for (Map.Entry<Integer, Integer> entry : levelsRequest.entrySet()) {
            totalQuestions += entry.getValue();
        }
        Map<Integer, Integer> questionsCountByLevels = new HashMap<>();
        for (Map.Entry<Integer, Integer> levelEntry : levelsRequest.entrySet()) {
            questionsCountByLevels.put(levelEntry.getKey(), 0);
        }
        return questions.stream()
                .filter(question -> {
                    for (Map.Entry<Integer, Integer> entry : questionsCountByLevels.entrySet()) {
                        int levelValue = 0;
                        for (Map.Entry<Integer, Integer> levelEntry : levelsRequest.entrySet()) {
                            if(entry.getKey() == levelEntry.getKey()){
                                levelValue = levelEntry.getValue();
                                break;
                            }
                        }
                        if (question.getLevel().getId() == entry.getKey()){
                            return entry.getValue() < levelValue;
                        }
                    }
                    return true;
                })
                .peek(question -> {
                    for (Map.Entry<Integer, Integer> entry : questionsCountByLevels.entrySet()) {
                        if (question.getLevel().getId() == entry.getKey()){
                            entry.setValue(entry.getValue() + 1);
                        }
                    }
                }).limit(totalQuestions).collect(Collectors.toList());
    }

    public void generateAnswerForQuestion(Question question){
        AtomicInteger isCorrectCount = new AtomicInteger(0);
        AtomicInteger isIncorrectCount = new AtomicInteger(0);
        List<Answer> answers = new ArrayList<>(question.getAnswers());
        Collections.shuffle(answers);
        List<Answer> selectedAnswers = answers.stream()
                .filter(answer -> {
                    if (answer.getIsCorrect()) {
                        return isCorrectCount.get() < 3;
                    }
                    return isIncorrectCount.get() < 3;
                }).limit(4)
                .peek(answer -> {
                    if (answer.getIsCorrect()) {
                        isCorrectCount.getAndIncrement();
                    }
                    if (!answer.getIsCorrect()) {
                        isIncorrectCount.getAndIncrement();
                    }
                }).toList();
        question.setAnswers(new HashSet<>(selectedAnswers));
    }

    private List<Question> checkDuplicatedQuestionInExamination(List<Question> allQuestions, List<Question> questionsExisted, List<Question> questions){
        AtomicInteger duplicatedQuestions = new AtomicInteger(0);
        List<Integer> questionIds = questionsExisted.stream().map(Question::getId).toList();
        List<Question> questionsDuplicated = new ArrayList<>();
        List<Question> selectedQuestions = new ArrayList<>(questions.stream()
                .filter(question -> {
                    if (questionIds.contains(question.getId())) {
                        return duplicatedQuestions.get() < (int) questionsExisted.size()*0.3;
                    }
                    return true;
                }).peek(question -> {
                    if (questionIds.contains(question.getId())) {
                        questionsDuplicated.add(question);
                        duplicatedQuestions.getAndIncrement();
                    }
                }).toList());
        if(duplicatedQuestions.get() >= (int) (questionsExisted.size()*0.3)){
            allQuestions.removeAll(questions);
            questions.removeAll(questionsDuplicated);
        }
        return questions;
    }

    private void setAnswerForQuestion(Examination examination, Question question){
        int countCorrectAnswer = 0;
        QuestionRecord questionRecord = new QuestionRecord();
        questionRecord.setExamination(examination);
        questionRecord.setContent(question.getContent());
        questionRecord.setImage(question.getImage());
        questionRecord.setLevel(question.getLevel().getName());
        questionRecord.setPoint(question.getLevel().getPoint());

        List<Answer> answers = question.getAnswers().stream().toList();
        for (Answer answer : answers) {
            AnswerRecord answerRecord = new AnswerRecord();
            answerRecord.setContent(answer.getContent());
            answerRecord.setIsCorrect(answer.getIsCorrect());
            answerRecord.setQuestionRecord(questionRecord);
            if (answer.getIsCorrect()) {
                countCorrectAnswer++;
            }
            questionRecord.setType(countCorrectAnswer == 1 ? 1 : 2);
            answerRecordRepository.save(answerRecord);
        }
        questionRecordRepository.save(questionRecord);
    }
}