package com.example.quizexam_student.bean.response;

import com.example.quizexam_student.entity.Answer;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.util.List;
@RequiredArgsConstructor
@AllArgsConstructor
public class QuestionPDFExporter {
    private List<QuestionResponse> questions;
    private String imagePath;

    public void export(HttpServletResponse response) throws IOException {
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA, 16, Font.BOLD);
        Paragraph title = new Paragraph(questions.get(0).getSubject().getName().toUpperCase(), titleFont);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph(" "));

        Font questionFont = FontFactory.getFont(FontFactory.HELVETICA, 13, Font.BOLD);
        Font answerFont = FontFactory.getFont(FontFactory.HELVETICA, 13);

        int i = 0;
        for (QuestionResponse question : questions) {
            int j =0;
            document.add(new Paragraph("Question " + (i + 1) + ": " + question.getContent(), questionFont));
            if (question.getImage() != null && !question.getImage().isEmpty()) {
                 try{
                    Image image = getImage(imagePath + "/" +question.getImage());
                    image.scalePercent(25);
                    image.setAlignment(Image.ALIGN_CENTER);
                    document.add(image);
                } catch (Exception e){
                     e.printStackTrace();
                 }
            }
            for (Answer answer : question.getAnswers()) {
                document.add(new Paragraph("   " + answer.getAnswerLabel(j) + ". " + answer.getContent(), answerFont));
                j++;
            }
            document.add(new Paragraph(" "));
            i++;
        }
        document.close();
    }
    private Image getImage(String imagePath) throws IOException, BadElementException {
        return Image.getInstance(imagePath);
    }
}
