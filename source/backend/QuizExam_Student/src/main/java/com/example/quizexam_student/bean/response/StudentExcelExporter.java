package com.example.quizexam_student.bean.response;

import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NoArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.repository.query.parser.Part;

import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;

@NoArgsConstructor
public class StudentExcelExporter {
    private XSSFWorkbook workbook;
    private XSSFSheet sheet;
    private List<StudentResponse> responses;

    public StudentExcelExporter(List<StudentResponse> responses) {
        this.responses = responses;
        workbook = new XSSFWorkbook();
        sheet = workbook.createSheet("Student");
    }

    private void writeHeaderRow(){
        Row row = sheet.createRow(0);

        CellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setBold(true);
        font.setFontHeight(16);
        style.setFont(font);

        Cell cell = row.createCell(0);
        cell.setCellValue("Roll Portal");
        cell.setCellStyle(style);

        cell = row.createCell(1);
        cell.setCellValue("Roll Number");
        cell.setCellStyle(style);

        cell = row.createCell(2);
        cell.setCellValue("Class");
        cell.setCellStyle(style);

        cell = row.createCell(3);
        cell.setCellValue("Full Name");
        cell.setCellStyle(style);

        cell = row.createCell(4);
        cell.setCellValue("Email");
        cell.setCellStyle(style);

        cell = row.createCell(5);
        cell.setCellValue("Gender");
        cell.setCellStyle(style);

        cell = row.createCell(6);
        cell.setCellValue("DOB");
        cell.setCellStyle(style);

        cell = row.createCell(7);
        cell.setCellValue("Phone Number");
        cell.setCellStyle(style);

        cell = row.createCell(8);
        cell.setCellValue("Address");
        cell.setCellStyle(style);

    }
    private void writeDataRow(){
        int rowCount = 1;
        for (StudentResponse std : responses) {
            Row row = sheet.createRow(rowCount++);

            Cell cell = row.createCell(0);
            cell.setCellValue(std.getRollPortal());
            sheet.autoSizeColumn(0);

            cell = row.createCell(1);
            cell.setCellValue(std.getRollNumber());
            sheet.autoSizeColumn(1);

            cell = row.createCell(2);
            cell.setCellValue(std.getClasses() != null ? std.getClasses().getName() : "No Class");
            sheet.autoSizeColumn(2);

            cell = row.createCell(3);
            cell.setCellValue(std.getUserResponse().getFullName());
            sheet.autoSizeColumn(3);

            cell = row.createCell(4);
            cell.setCellValue(std.getUserResponse().getEmail());
            sheet.autoSizeColumn(4);

            cell = row.createCell(5);
            cell.setCellValue(std.getUserResponse().getGender() == 1 ? "Male" : "Female");
            sheet.autoSizeColumn(5);

            cell = row.createCell(6);
            cell.setCellValue(std.getUserResponse().getDob().format(DateTimeFormatter.ISO_LOCAL_DATE));
            sheet.autoSizeColumn(6);

            cell = row.createCell(7);
            cell.setCellValue(std.getUserResponse().getPhoneNumber());
            sheet.autoSizeColumn(7);

            cell = row.createCell(8);
            cell.setCellValue(std.getUserResponse().getAddress());
            sheet.autoSizeColumn(8);
        }
    }
    public void export(HttpServletResponse response) throws IOException {
        writeHeaderRow();
        writeDataRow();
        ServletOutputStream outputStream = response.getOutputStream();
        workbook.write(outputStream);
        workbook.close();
        outputStream.close();
    }

}
