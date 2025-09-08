package com.example.quizexam_student.bean.response;

import com.example.quizexam_student.entity.Subject;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.servlet.http.HttpServletResponse;

import java.awt.*;
import java.io.IOException;
import java.util.Base64;
import java.util.List;

public class SubjectPDFExporter {
    private List<Subject> subjects;

    public SubjectPDFExporter(List<Subject> subjects) {
        this.subjects = subjects;
    }

    private void writeTableHeader(PdfPTable table){
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(Color.BLUE);
        cell.setPadding(5);

        com.lowagie.text.Font font = FontFactory.getFont(FontFactory.HELVETICA);
        font.setColor(Color.WHITE);

        cell.setPhrase(new Phrase("No.", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Subject Name", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Image", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Semeter", font));
        table.addCell(cell);

    }
    private void writeTableData(PdfPTable table){
        int count = 1;
        for (Subject subject : subjects) {
            table.addCell(String.valueOf(count));
            table.addCell(String.valueOf(subject.getName()));
            table.addCell(String.valueOf(subject.getImage()));
            table.addCell(String.valueOf(subject.getSem().getName()));
            count++;
        }
    }
    public void export(HttpServletResponse response) throws IOException {
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        font.setColor(Color.BLUE);
        Paragraph title = new Paragraph("List of all subject", font);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(title);
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setSpacingBefore(15);
        table.setWidths(new float[] {1.5f, 3.5f, 3.5f, 1.5f});
        writeTableHeader(table);
        writeTableData(table);
        document.add(table);
        document.close();
    }
}
