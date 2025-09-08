package com.example.quizexam_student.service.impl;

import com.example.quizexam_student.bean.response.MarkResponse;
import com.example.quizexam_student.entity.Examination;
import com.example.quizexam_student.entity.Mark;
import com.example.quizexam_student.entity.StudentDetail;
import com.example.quizexam_student.entity.User;
import com.example.quizexam_student.exception.AlreadyExistException;
import com.example.quizexam_student.exception.IncorrectEmailOrPassword;
import com.example.quizexam_student.exception.InvalidTimeException;
import com.example.quizexam_student.exception.NotFoundException;
import com.example.quizexam_student.mapper.MarkMapper;
import com.example.quizexam_student.repository.*;
import com.example.quizexam_student.service.MarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarkServiceImpl implements MarkService {
    private final MarkRepository markRepository;

    private final SubjectRepository subjectRepository;

    private final UserRepository userRepository;

    private final ExaminationRepository examinationRepository;

    private final StudentRepository studentRepository;

    @Override
    public List<MarkResponse> findAllMarkByExam(Integer examId) {
        List<Mark> marks = markRepository.findAllByExamination_Id(examId);
        return marks.stream().map(MarkMapper::convertToFullResponse).collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getPassPercentageForSubject() {
        // Lấy tất cả các điểm (mark) có score khác null
        List<Mark> marks = markRepository.findAllByScoreIsNotNull();

        // Nhóm các điểm theo subjectName, tính tổng điểm, tổng maxScore, và số lượng bài pass
        Map<String, Double> subjectTotalScore = new HashMap<>();
        Map<String, Double> subjectTotalMaxScore = new HashMap<>();
        Map<String, Integer> subjectPassCount = new HashMap<>();
        Map<String, Integer> subjectTotalExams = new HashMap<>();

        // Lặp qua tất cả các mark để tính tổng score, tổng maxScore và số lượng bài pass
        for (Mark mark : marks) {
            String subjectName = mark.getSubject().getName();

            // Cộng dồn tổng score theo môn học
            subjectTotalScore.put(subjectName, subjectTotalScore.getOrDefault(subjectName, 0.0) + mark.getScore());

            // Cộng dồn tổng maxScore theo môn học từ kỳ thi
            subjectTotalMaxScore.put(subjectName, subjectTotalMaxScore.getOrDefault(subjectName, 0.0) + mark.getExamination().getMaxScore());

            // Cộng dồn số bài thi đã pass theo môn học
            double passPercentage = (double) mark.getScore() / mark.getExamination().getMaxScore() * 100;
            if (passPercentage >= 40) {
                subjectPassCount.put(subjectName, subjectPassCount.getOrDefault(subjectName, 0) + 1);
            }

            // Cộng dồn tổng số bài thi của môn học
            subjectTotalExams.put(subjectName, subjectTotalExams.getOrDefault(subjectName, 0) + 1);
        }

        // Tạo danh sách kết quả cuối cùng
        List<Map<String, Object>> result = new ArrayList<>();

        // Duyệt qua các môn học và tạo đối tượng chứa thông tin cần trả về
        for (String subjectName : subjectTotalScore.keySet()) {
            Map<String, Object> subjectStats = new HashMap<>();

            // Tính tỷ lệ pass
            int totalExams = subjectTotalExams.get(subjectName);
            int passCount = subjectPassCount.getOrDefault(subjectName, 0);
            double passRate = totalExams > 0 ? (double) passCount / totalExams * 100 : 0;
            BigDecimal passRateRounded = new BigDecimal(passRate).setScale(2, RoundingMode.HALF_UP);
            subjectStats.put("subjectName", subjectName);
            subjectStats.put("passRate", passRateRounded); // Tỷ lệ pass của môn học

            result.add(subjectStats);
        }

        return result;
    }

    @Override
    public List<MarkResponse> getListScoredPerSubject(StudentDetail studentDetail, Integer semId) {
        List<Mark> marks = markRepository.findAllByStudentDetailAndSubject_Sem_IdAndScoreIsNotNull(studentDetail, semId);
        Map<String, Mark> latestMarksPerSubject = new HashMap<>();

        for (Mark mark : marks) {
            String subjectName = mark.getSubject().getName();
            if (!latestMarksPerSubject.containsKey(subjectName) || mark.getBeginTime().isAfter(latestMarksPerSubject.get(subjectName).getBeginTime())) {
                latestMarksPerSubject.put(subjectName, mark);
            }
        }

        List<Mark> latestMarks = new ArrayList<>(latestMarksPerSubject.values());
        latestMarks.sort(Comparator.comparing(mark -> mark.getSubject().getId()));
        return latestMarks.stream()
                .map(MarkMapper::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MarkResponse getOneScoredByExam(StudentDetail studentDetail, Integer examId) {
        Mark mark = markRepository.findByStudentDetailAndExamination_IdOrderByIdDesc(studentDetail, examId);
        if (Objects.isNull(mark)) {
            throw new NotFoundException("exam", "Examination not found.");
        }
        return MarkMapper.convertToResponse(mark);
    }

    @Override
    public List<MarkResponse> updateMark(Integer examId, List<Integer> studentIds) {
        Examination examination = examinationRepository.findByIdAndStatus(examId,1);
        if (Objects.isNull(examination)) {
            throw new NotFoundException("exam", "Examination not found.");
        }

        List<Mark> marks = markRepository.findAllByExamination_IdAndBeginTimeIsNull(examId);
        marks.forEach(mark -> {
            mark.setStudentDetail(null);
            mark.setExamination(null);
        });
        markRepository.deleteAll(marks);

        studentIds.removeIf(studentId ->
                markRepository.existsByExamination_IdAndStudentDetail_UserIdAndBeginTimeIsNotNull(examId, studentId));

        // Lấy danh sách StudentDetail từ studentIds
        List<StudentDetail> studentDetails = studentRepository.findAllById(studentIds);

        // Tạo các đối tượng Mark mới cho từng sinh viên
        List<Mark> newMarks = new ArrayList<>();
        for (StudentDetail studentDetail : studentDetails) {
            Mark mark = new Mark();
            mark.setExamination(examination);
            mark.setStudentDetail(studentDetail);
            mark.setSubject(examination.getSubject());
            newMarks.add(mark);
        }

        // Lưu các Mark mới vào cơ sở dữ liệu
        return markRepository.saveAll(newMarks).stream().map(MarkMapper::convertToFullResponse).collect(Collectors.toList());
    }

    @Override
    public Mark updateBeginTime(Integer id) {
        User user = getUserByEmail();
        Mark mark = markRepository.findById(id).orElse(null);
        if (Objects.isNull(mark) || mark.getStudentDetail().getUserId() != user.getId()) {
            throw new NotFoundException("mark", "Mark not found.");
        }
        if (mark.getBeginTime() != null) {
            throw new InvalidTimeException("mark", "Update begin time failed.");
        }
        mark.setBeginTime(LocalDateTime.now());
        return markRepository.save(mark);
    }

    @Override
    public Mark updateWarning(Integer id, Mark markInput) {
        User user = getUserByEmail();
        Mark mark = markRepository.findById(id).orElse(null);
        if (Objects.isNull(mark) || mark.getStudentDetail().getUserId() != user.getId()) {
            throw new NotFoundException("mark", "Mark not found.");
        }
        if (mark.getScore() != null) {
            throw new AlreadyExistException("mark", "The score is available.");
        }
        mark.setWarning(markInput.getWarning());
        return markRepository.save(mark);
    }

    public User getUserByEmail() {
        String email = ((org.springframework.security.core.userdetails.User)
                SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        User user = userRepository.findByEmailAndStatus(email, 1).orElse(null);
        if (Objects.isNull(user)) {
            throw new IncorrectEmailOrPassword("email", "Your Email Not Found");
        }
        return user;
    }
}