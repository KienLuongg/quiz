package com.example.quizexam_student.service;

import com.example.quizexam_student.bean.request.ChapterRequest;
import com.example.quizexam_student.entity.Chapter;
import com.example.quizexam_student.entity.Sem;
import com.example.quizexam_student.entity.Subject;
import com.example.quizexam_student.exception.AlreadyExistException;
import com.example.quizexam_student.exception.NotFoundException;
import com.example.quizexam_student.repository.ChapterRepository;
import com.example.quizexam_student.repository.SubjectRepository;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class ChapterServiceTest {
    @Autowired
    private ChapterService chapterService;

    @MockBean
    private ChapterRepository chapterRepository;

    @MockBean
    private SubjectRepository subjectRepository;

    private Chapter chapter;
    private ChapterRequest chapterRequest;
    private List<Chapter> chapterList;
    private Subject subject;
    private Sem sem;
    @BeforeEach
    void initData(){
        sem = new Sem(1,"1",null);
        subject = Subject.builder()
                .id(1)
                .name("EPC")
                .image("epc.png")
                .sem(sem)
                .status(1)
                .build();
        chapterRequest = ChapterRequest.builder()
                .name("I/O")
                .subjectId(1)
                .build();
        chapter = Chapter.builder()
                .id(1)
                .name("I/O")
                .status(1)
                .subject(subject)
                .build();
        chapterList = new ArrayList<>();
        chapterList.add(
                Chapter.builder()
                        .id(1)
                        .name("I/O")
                        .status(1)
                        .subject(subject)
                        .build()
        );
        chapterList.add(
                Chapter.builder()
                        .id(2)
                        .name("Loop")
                        .status(1)
                        .subject(subject)
                        .build()
        );
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    public void testExistChapterName_WhenChapterExists_ReturnsTrue() {
        // GIVEN
        String chapterName = "Existing Chapter";
        Mockito.when(chapterRepository.findByNameAndStatus(chapterName,1)).thenReturn(chapter);

        // WHEN
        Boolean exists = chapterService.ExistChapterName(chapterName);

        // THEN
        assertTrue(exists);
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    public void testExistChapterName_WhenChapterDoesNotExist_ReturnsFalse() {
        // GIVEN
        String chapterName = "Non-Existing Chapter";
        Mockito.when(chapterRepository.findByNameAndStatus(chapterName,1)).thenReturn(null);

        // WHEN
        Boolean exists = chapterService.ExistChapterName(chapterName);

        // THEN
        assertFalse(exists);
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    public void testExistSubjectId_WhenSubjectExists_ReturnsTrue() {
        // GIVEN
        int subjectId = 1;
        Subject subject = new Subject();
        Mockito.when(subjectRepository.findByIdAndStatus(subjectId,1)).thenReturn(subject);

        // WHEN
        Boolean exists = chapterService.ExistSubjectId(subjectId);

        // THEN
        assertTrue(exists);
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    public void testExistSubjectId_WhenSubjectDoesNotExist_ReturnsFalse() {
        // GIVEN
        int subjectId = 1;
        Mockito.when(subjectRepository.findById(subjectId)).thenReturn(Optional.empty());

        // WHEN
        Boolean exists = chapterService.ExistSubjectId(subjectId);

        // THEN
        assertFalse(exists);
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void createChapter_validRequest_success(){
        // GIVEN
        Mockito.when(chapterRepository.findByNameAndStatus(chapterRequest.getName(),1)).thenReturn(null);
        Mockito.when(subjectRepository.findById(chapterRequest.getSubjectId())).thenReturn(Optional.ofNullable(subject));
        Mockito.when(chapterRepository.save(ArgumentMatchers.any())).thenReturn(chapter);

        // WHEN
        var response = chapterRepository.save(chapter);

        // THEN
        Assertions.assertThat(response.getId()).isEqualTo(1);
        Assertions.assertThat(response.getName()).isEqualTo("I/O");
        Assertions.assertThat(response.getStatus()).isEqualTo(1);
        Assertions.assertThat(response.getSubject()).isEqualTo(subject);

    }

//    @Test
//    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
//    void createChapter_alreadyExistName_fail(){
//        // GIVEN
//        Mockito.when(chapterRepository.findByNameAndStatus(chapterRequest.getName(),1)).thenReturn(chapter);
//
//        // WHEN
//        var exception = assertThrows(
//                AlreadyExistException.class,
//                () -> new AlreadyExistException("ExistChapter", "Chapter name already exists"));
//
//        // THEN
//        Assertions.assertThat(exception.getKey()).isEqualTo("ExistChapter");
//        Assertions.assertThat(exception.getMessage()).isEqualTo("Chapter name already exists");
//
//    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void createChapter_notFoundSubject_fail(){
        // GIVEN
        Mockito.when(subjectRepository.findById(chapterRequest.getSubjectId())).thenReturn(Optional.empty());

        // WHEN
        var exception = assertThrows(
                NotFoundException.class,
                () -> chapterService.addChapter(chapterRequest));

        // THEN
        Assertions.assertThat(exception.getKey()).isEqualTo("subject");
        Assertions.assertThat(exception.getMessage()).isEqualTo("Subject not found");
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void getAll_success(){
        // GIVEN
        int subjectId = 1;
        Mockito.when(chapterRepository.findAllByStatusAndSubjectId(1, subjectId)).thenReturn(chapterList);

        // WHEN
        var response = chapterService.getAllChaptersBySubjectId(subjectId);

        // THEN
        Assertions.assertThat(response).isNotNull();
        Assertions.assertThat(response.size()).isEqualTo(chapterList.size());
        Assertions.assertThat(response.get(0).getId()).isEqualTo(1);
        Assertions.assertThat(response.get(0).getName()).isEqualTo("I/O");
        Assertions.assertThat(response.get(0).getStatus()).isEqualTo(1);
        Assertions.assertThat(response.get(0).getSubject()).isEqualTo(subject);
        Assertions.assertThat(response.get(1).getId()).isEqualTo(2);
        Assertions.assertThat(response.get(1).getName()).isEqualTo("Loop");
        Assertions.assertThat(response.get(1).getStatus()).isEqualTo(1);
    }


    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void deleteSubject_success(){
        // GIVEN
        Mockito.when(chapterRepository.findByIdAndStatus(1,1)).thenReturn(chapter);

        // WHEN
        chapterService.deleteChapter(1);

        // THEN
        Assertions.assertThat(chapter.getStatus()).isEqualTo(0);
        Mockito.verify(chapterRepository, Mockito.times(1)).save(chapter);
    }

//    @Test
//    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
//    void deleteSubject_fail(){
//        // GIVEN
//        Mockito.doThrow(new NotFoundException("NotFoundChapter","Chapter not found")).when(chapterRepository).deleteById(2);
//        // WHEN
//        var exception = assertThrows(
//                NotFoundException.class, () -> chapterService.deleteChapter(2)
//        );
//        // THEN
//        Assertions.assertThat(exception.getKey()).isEqualTo("NotFoundChapter");
//        Assertions.assertThat(exception.getMessage()).isEqualTo("Chapter not found");
//    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void updateChapter_success(){
        // GIVEN
        Mockito.when(chapterRepository.findByIdAndStatus(1,1)).thenReturn(chapter);
        Mockito.when(chapterRepository.findByNameAndStatus(chapterRequest.getName(),1)).thenReturn(null);
        Mockito.when(subjectRepository.findByIdAndStatus(chapterRequest.getSubjectId(),1)).thenReturn(subject);
        Mockito.when(chapterRepository.save(ArgumentMatchers.any())).thenReturn(chapter);
        // WHEN
        var response = chapterService.updateChapter(1, chapterRequest);
        // THEN
        Assertions.assertThat(response.getId()).isEqualTo(1);
        Assertions.assertThat(response.getName()).isEqualTo("I/O");
        Assertions.assertThat(response.getStatus()).isEqualTo(1);
        Assertions.assertThat(response.getSubject()).isEqualTo(subject);
    }

//    @Test
//    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
//    void updateChapter_nonExist_fail(){
//        // GIVEN
//        Mockito.when(chapterRepository.findByIdAndStatus(1, 1)).thenReturn(null);
//        // WHEN
//        var exception = assertThrows(
//                NotFoundException.class, () -> chapterService.updateChapter(1, chapterRequest)
//        );
//        // THEN
//        Assertions.assertThat(exception.getKey()).isEqualTo("NotFoundChapter");
//        Assertions.assertThat(exception.getMessage()).isEqualTo("Chapter not found");
//    }

//    @Test
//    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
//    void updateChapter_alreadyExistName_fail(){
//        // GIVEN
//        Chapter existingChapter = new Chapter();
//        Mockito.when(subjectRepository.findByIdAndStatus(chapterRequest.getSubjectId(),1)).thenReturn(subject);
//        Mockito.when(chapterRepository.findByIdAndStatus(1, 1)).thenReturn(existingChapter);
////        Mockito.when(chapterRepository.findByNameAndStatus(chapterRequest.getName(),1))
////                .thenThrow(new AlreadyExistException("ExistChapter", "Chapter name already exists"));
//        Mockito.doThrow(new NotFoundException("ExistChapter","Chapter name already exists")).when(chapterRepository).findByNameAndStatus(chapterRequest.getName(),1);
//
//        // WHEN
//        var exception = assertThrows(
//                AlreadyExistException.class,
//                () -> chapterService.updateChapter(1, chapterRequest));
//
//        // THEN
//        Assertions.assertThat(exception.getKey()).isEqualTo("ExistChapter");
//        Assertions.assertThat(exception.getMessage()).isEqualTo("Chapter name already exists");
//    }

//    @Test
//    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
//    void updateChapter_notFoundSubject_fail(){
//        // GIVEN
//        int chapterId = 1;
//        Chapter existingChapter = new Chapter();
//        Mockito.when(chapterRepository.findById(chapterId)).thenReturn(Optional.of(existingChapter));
//        Mockito.when(chapterRepository.findByNameAndStatus("New Chapter",1)).thenReturn(null);
//        Mockito.when(subjectRepository.findById(chapterRequest.getSubjectId())).thenReturn(Optional.empty());
//
//        // WHEN & THEN
//        NotFoundException exception = assertThrows(NotFoundException.class, () -> {
//            chapterService.updateChapter(chapterId, chapterRequest);
//        });
//
//        assertEquals("subject", exception.getKey());
//        assertEquals("Subject id not found", exception.getMessage());
//    }

}
