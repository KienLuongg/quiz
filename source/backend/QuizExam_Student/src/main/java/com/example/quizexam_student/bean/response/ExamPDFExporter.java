package com.example.quizexam_student.bean.response;

import com.example.quizexam_student.entity.Answer;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;

import java.awt.*;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
@RequiredArgsConstructor
@AllArgsConstructor
public class ExamPDFExporter {
    private ExaminationResponse examinationResponses;
    private String imagePath;

    private PdfPCell createCell(String content, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(content, font));
        cell.setBorder(PdfPCell.NO_BORDER); //
        return cell;
    }

    private void writeTable(PdfPTable table){
        Font fontHeader = new Font(Font.HELVETICA, 12, Font.BOLD, Color.BLACK);
        Font fontContent = FontFactory.getFont(FontFactory.HELVETICA, 12);

        table.addCell(createCell("Name:", fontHeader));
        table.addCell(createCell(examinationResponses.getName(), fontContent));
        table.addCell(createCell("Code:", fontHeader));
        table.addCell(createCell(examinationResponses.getCode(), fontContent));

        table.addCell(createCell("Subject:", fontHeader));
        table.addCell(createCell(examinationResponses.getSubject().getName(), fontContent));
        table.addCell(createCell("Duration:", fontHeader));
        table.addCell(createCell(String.valueOf(examinationResponses.getDuration()), fontContent));

    }


    public void export(HttpServletResponse response) throws IOException {
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA, 16, Font.BOLD);
        Paragraph title = new Paragraph(examinationResponses.getName().toUpperCase(), titleFont);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(title);
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(80);
        table.setSpacingBefore(15);
        writeTable(table);
        table.setWidths(new float[] {2.0f, 3.0f, 2.0f, 3.0f});
        document.add(table);
        document.add(new Paragraph(" "));


        Font questionFont = FontFactory.getFont(FontFactory.HELVETICA, 13, Font.BOLD);
        Font answerFont = FontFactory.getFont(FontFactory.HELVETICA, 13);

        int i = 0;
        for (QuestionRecordResponse question : examinationResponses.getQuestionRecordResponses()) {
            int j =0;
            document.add(new Paragraph("Question " + (i + 1) + ": "
                    + question.getContent()
                    + (question.getType() == 1 ? " [SINGLE]" : " [MULTIPLE]")
                    , questionFont));
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
            for (AnswerRecordResponse answer : question.getAnswerRecords()) {
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
