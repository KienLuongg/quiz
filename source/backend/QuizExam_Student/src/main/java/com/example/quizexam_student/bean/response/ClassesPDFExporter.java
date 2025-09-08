package com.example.quizexam_student.bean.response;

import com.example.quizexam_student.entity.Classes;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.servlet.http.HttpServletResponse;

import java.awt.*;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class ClassesPDFExporter {
    private List<Classes> classes;

    public ClassesPDFExporter(List<Classes> classes) {
        this.classes = classes;
    }

    private void writeTableHeader(PdfPTable table){
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(Color.BLUE);
        cell.setPadding(5);

        com.lowagie.text.Font font = FontFactory.getFont(FontFactory.HELVETICA);
        font.setColor(Color.WHITE);

        cell.setPhrase(new Phrase("No.", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Name", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Class Day", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Class Time", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Admission Date", font));
        table.addCell(cell);

    }
    private void writeTableData(PdfPTable table){
        int count = 1;
        for (Classes cls : classes) {
            table.addCell(String.valueOf(count));
            table.addCell(String.valueOf(cls.getName()));
            table.addCell(String.valueOf(cls.getClassDay()));
            table.addCell(String.valueOf(cls.getClassTime()));
            table.addCell(String.valueOf(cls.getAdmissionDate().format(DateTimeFormatter.ISO_LOCAL_DATE)));
            count++;
        }
    }
    public void export(HttpServletResponse response) throws IOException {
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        font.setColor(Color.BLUE);
        Paragraph title = new Paragraph("List of all classes", font);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(title);
        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setSpacingBefore(15);
        table.setWidths(new float[] {1.5f, 3.5f, 3.5f, 3.0f, 3.0f});
        writeTableHeader(table);
        writeTableData(table);
        document.add(table);
        document.close();
    }
}
