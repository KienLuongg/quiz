package com.example.quizexam_student.bean.response;

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

public class StudentPDFExporter {
    private List<StudentResponse> studentResponses;

    public StudentPDFExporter(List<StudentResponse> studentResponses) {
        this.studentResponses = studentResponses;
    }

    private void writeTableHeader(PdfPTable table){
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(Color.BLUE);
        cell.setPadding(5);

        com.lowagie.text.Font font = FontFactory.getFont(FontFactory.HELVETICA);
        font.setColor(Color.WHITE);

        cell.setPhrase(new Phrase("Roll Portal", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Roll Number", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Class", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Full Name", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Email", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Gender", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("DOB", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Phone Number", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Address", font));
        table.addCell(cell);


    }
    private void writeTableData(PdfPTable table){
        for (StudentResponse std : studentResponses) {
            table.addCell(String.valueOf(std.getRollPortal()));
            table.addCell(String.valueOf(std.getRollNumber()));
            table.addCell(String.valueOf(std.getClasses() != null ? std.getClasses().getName() : "No Class"));
            table.addCell(String.valueOf(std.getUserResponse().getFullName()));
            table.addCell(String.valueOf(std.getUserResponse().getEmail()));
            table.addCell(String.valueOf(std.getUserResponse().getGender() == 1 ? "Male" : "Female"));
            table.addCell(String.valueOf(std.getUserResponse().getDob().format(DateTimeFormatter.ISO_LOCAL_DATE)));
            table.addCell(String.valueOf(std.getUserResponse().getPhoneNumber()));
            table.addCell(String.valueOf(std.getUserResponse().getAddress()));
        }
    }
    public void export(HttpServletResponse response) throws IOException {
        Document document = new Document(PageSize.A4.rotate());
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        font.setColor(Color.BLUE);
        Paragraph title = new Paragraph("List of all student", font);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(title);
        PdfPTable table = new PdfPTable(9);
        table.setWidthPercentage(100);
        table.setSpacingBefore(15);
        table.setWidths(new float[] {2.5f, 2.5f, 2.0f, 3.0f, 3.0f, 2.0f, 3.0f, 3.0f, 3.0f});
        writeTableHeader(table);
        writeTableData(table);
        document.add(table);
        document.close();
    }
}
