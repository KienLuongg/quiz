package com.example.quizexam_student.bean.response;

import com.example.quizexam_student.entity.Classes;
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
import java.util.List;

@NoArgsConstructor
public class ClassesExcelExporter {
    private XSSFWorkbook workbook;
    private XSSFSheet sheet;
    private List<Classes> classes;


    public ClassesExcelExporter(List<Classes> classes) {
        this.classes = classes;
        workbook = new XSSFWorkbook();
        sheet = workbook.createSheet("Classes");
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
        cell.setCellValue("Name");
        cell.setCellStyle(style);

        cell = row.createCell(2);
        cell.setCellValue("Class Day");
        cell.setCellStyle(style);

        cell = row.createCell(3);
        cell.setCellValue("Class Time");
        cell.setCellStyle(style);

        cell = row.createCell(4);
        cell.setCellValue("Admission Date");
        cell.setCellStyle(style);

    }
    private void writeDataRow(){
        int rowCount = 1;
        for (Classes cls : classes) {
            Row row = sheet.createRow(rowCount);

            Cell cell = row.createCell(0);
            cell.setCellValue(rowCount);
            sheet.autoSizeColumn(0);

            cell = row.createCell(1);
            cell.setCellValue(cls.getName());
            sheet.autoSizeColumn(1);

            cell = row.createCell(2);
            cell.setCellValue(cls.getClassDay());
            sheet.autoSizeColumn(2);

            cell = row.createCell(3);
            cell.setCellValue(cls.getClassTime());
            sheet.autoSizeColumn(3);

            cell = row.createCell(4);
            cell.setCellValue(cls.getAdmissionDate());
            sheet.autoSizeColumn(4);

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
