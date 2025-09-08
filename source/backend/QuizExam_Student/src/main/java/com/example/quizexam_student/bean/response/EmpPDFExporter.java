package com.example.quizexam_student.bean.response;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import jakarta.servlet.http.HttpServletResponse;

import java.awt.*;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class EmpPDFExporter {
    private List<UserResponse> users;
    public EmpPDFExporter(List<UserResponse> users) {
        this.users = users;
    }

    private void writeTableHeader(PdfPTable table){
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(Color.BLUE);
        cell.setPadding(5);

        Font font = FontFactory.getFont(FontFactory.HELVETICA);
        font.setColor(Color.WHITE);

        cell.setPhrase(new Phrase("No.", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Full Name", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Email", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Phone Number", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Role", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Gender", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("DOB", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Address", font));
        table.addCell(cell);


    }
    private void writeTableData(PdfPTable table){
        int count = 1;
        for (UserResponse user : users) {
            table.addCell(String.valueOf(count));
            table.addCell(String.valueOf(user.getFullName()));
            table.addCell(String.valueOf(user.getEmail()));
            table.addCell(String.valueOf(user.getPhoneNumber()));
            table.addCell(String.valueOf(user.getRole().getName()));
            table.addCell(String.valueOf(user.getGender() == 1 ? "Male" : "Female"));
            table.addCell(String.valueOf(user.getDob().format(DateTimeFormatter.ISO_LOCAL_DATE)));
            table.addCell(String.valueOf(user.getAddress()));
            count++;
        }
    }
    public void export(HttpServletResponse response) throws IOException {
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        font.setColor(Color.BLUE);
        Paragraph title = new Paragraph("List of all users", font);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(title);
        PdfPTable table = new PdfPTable(8);
        table.setWidthPercentage(100);
        table.setSpacingBefore(15);
        table.setWidths(new float[] {1.5f, 3.5f, 3.5f, 3.0f, 3.0f, 2.0f, 3.0f, 3.0f});
        writeTableHeader(table);
        writeTableData(table);
        document.add(table);
        document.close();
    }
}
