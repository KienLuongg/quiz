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

import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
@NoArgsConstructor
public class EmpExcelExporter {
    private XSSFWorkbook workbook;
    private XSSFSheet sheet;
    private List<UserResponse> users;


    public EmpExcelExporter(List<UserResponse> users) {
        this.users = users;
        workbook = new XSSFWorkbook();
        sheet = workbook.createSheet("Users");
    }

    private void writeHeaderRow(){
        Row row = sheet.createRow(0);

        CellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setBold(true);
        font.setFontHeight(16);
        style.setFont(font);

        Cell cell = row.createCell(0);
        cell.setCellValue("No.");
        cell.setCellStyle(style);

        cell = row.createCell(1);
        cell.setCellValue("Full Name");
        cell.setCellStyle(style);

        cell = row.createCell(2);
        cell.setCellValue("Email");
        cell.setCellStyle(style);

        cell = row.createCell(3);
        cell.setCellValue("Phone Number");
        cell.setCellStyle(style);

        cell = row.createCell(4);
        cell.setCellValue("Role");
        cell.setCellStyle(style);

        cell = row.createCell(5);
        cell.setCellValue("Gender");
        cell.setCellStyle(style);

        cell = row.createCell(6);
        cell.setCellValue("DOB");
        cell.setCellStyle(style);

        cell = row.createCell(7);
        cell.setCellValue("Address");
        cell.setCellStyle(style);
    }
    private void writeDataRow(){
        int rowCount = 1;
        for (UserResponse user : users) {
            Row row = sheet.createRow(rowCount);

            Cell cell = row.createCell(0);
            cell.setCellValue(rowCount);
            sheet.autoSizeColumn(0);

            cell = row.createCell(1);
            cell.setCellValue(user.getFullName());
            sheet.autoSizeColumn(1);

            cell = row.createCell(2);
            cell.setCellValue(user.getEmail());
            sheet.autoSizeColumn(2);

            cell = row.createCell(3);
            cell.setCellValue(user.getPhoneNumber());
            sheet.autoSizeColumn(3);

            cell = row.createCell(4);
            cell.setCellValue(user.getRole().getName());
            sheet.autoSizeColumn(4);

            cell = row.createCell(5);
            cell.setCellValue(user.getGender() == 1 ? "Male" : "Female");
            sheet.autoSizeColumn(5);

            cell = row.createCell(6);
            cell.setCellValue(user.getDob().format(DateTimeFormatter.ISO_LOCAL_DATE));
            sheet.autoSizeColumn(6);

            cell = row.createCell(7);
            cell.setCellValue(user.getAddress());
            sheet.autoSizeColumn(7);

            rowCount++;
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
