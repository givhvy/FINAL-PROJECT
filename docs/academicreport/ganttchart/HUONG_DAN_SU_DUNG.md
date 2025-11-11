# HƯỚNG DẪN SỬ DỤNG GANTT CHART

## 📊 Các file đã tạo

### 1. **UniLearn_Gantt_Chart_Timeline.xlsx** ⭐ (KHUYÊN DÙNG)
**File này giống hình bạn gửi nhất!**

Đặc điểm:
- ✅ Timeline visualization với màu sắc theo tuần
- ✅ Hiển thị W1, W2, W3... W40 (40 tuần)
- ✅ Màu pastel đẹp mắt cho từng phase
- ✅ Có markers tháng ở trên cùng
- ✅ Frozen panes để scroll dễ dàng
- ✅ Tiêu đề và legend đầy đủ

**Cách xem**:
1. Mở file `UniLearn_Gantt_Chart_Timeline.xlsx`
2. Sheet "Gantt Timeline" - Xem timeline đầy màu sắc
3. Sheet "Legend" - Xem chú thích các phase
4. Scroll sang phải để xem các tuần
5. Cột A-D bị frozen nên luôn hiển thị khi scroll

**Ưu điểm**:
- Rất trực quan, dễ nhìn
- Màu sắc phân biệt rõ ràng
- Phù hợp cho presentation và báo cáo
- In ra giấy đẹp (landscape mode)

---

### 2. **UniLearn_Gantt_Chart_Beautiful.xlsx**
**File này có Bar Chart chuyên nghiệp**

Đặc điểm:
- ✅ Có Stacked Bar Chart tự động
- ✅ Dữ liệu chi tiết với Start/End dates
- ✅ Duration tính bằng ngày
- ✅ Có sheet "Legend" và "Project Info"
- ✅ Màu sắc phase trong bảng dữ liệu

**Cách xem**:
1. Mở file `UniLearn_Gantt_Chart_Beautiful.xlsx`
2. Sheet "Gantt Chart" - Xem dữ liệu và chart
3. Chart ở bên phải (cột I)
4. Sheet "Project Info" - Thông tin chi tiết project

**Ưu điểm**:
- Chart tự động cập nhật khi sửa data
- Có thông tin chi tiết đầy đủ
- Phù hợp cho phân tích và planning

---

## 🎨 Màu sắc Phase

| Phase | Màu | Hex Code | Ý nghĩa |
|-------|-----|----------|---------|
| Phase 1: Research | Cam pastel | #FFD699 | Nghiên cứu nền tảng |
| Phase 2: Design | Xanh dương pastel | #99CCFF | Thiết kế hệ thống |
| Phase 3: Backend | Tím pastel | #CC99FF | Phát triển backend |
| Phase 4: Frontend | Xanh lá pastel | #99FF99 | Phát triển frontend |
| Phase 5: Testing | Vàng pastel | #FFFF99 | Kiểm thử chất lượng |
| Phase 6: Refactoring | Đỏ pastel | #FF9999 | Tối ưu hóa code |
| Phase 7: Deployment | Xanh lơ pastel | #99FFFF | Triển khai & báo cáo |

---

## 📝 Thông tin Project

- **Tên project**: UniLearn/EduLearn - Learning Management System
- **Student ID**: GCS220124
- **Greenwich ID**: 001322934
- **Thời gian**: 40 tuần (280 ngày)
- **Bắt đầu**: 01/03/2025
- **Kết thúc**: 29/11/2025
- **Tổng số tasks**: 42
- **Tổng số phases**: 7
- **Live URL**: https://x.huy.global/
- **GitHub**: https://github.com/givhvy/FINAL-PROJECT

---

## 🔧 Cách chỉnh sửa (nếu cần)

### Thêm/Sửa task:
1. Mở file Python: `create_advanced_gantt.py`
2. Tìm phần `project_data = [`
3. Thêm/sửa task theo format:
```python
{"phase": "Phase X", "task": "Tên task", "start": "2025-03-01", "weeks": 2},
```
4. Chạy lại script:
```bash
python create_advanced_gantt.py
```

### Thay đổi màu sắc:
1. Mở file Python
2. Tìm phần `phase_colors = {`
3. Sửa hex code màu
4. Chạy lại script

### Xuất sang PDF:
1. Mở file Excel
2. File → Print
3. Chọn printer: "Microsoft Print to PDF"
4. Page Setup:
   - Orientation: Landscape
   - Scaling: Fit to 1 page wide
5. Print → Save as PDF

---

## 💡 Tips sử dụng

### Để presentation:
1. Mở `UniLearn_Gantt_Chart_Timeline.xlsx`
2. Zoom to 100% hoặc 85% (tùy màn hình)
3. F5 để full screen (hoặc View → Full Screen)
4. Giải thích từng phase với màu sắc

### Để in báo cáo:
1. Chọn Page Layout
2. Orientation: Landscape
3. Paper size: A3 (nếu có) hoặc A4
4. Margins: Narrow
5. Scale: Fit to 1 page wide x 2 pages tall
6. Print Preview trước khi in

### Để gửi email:
1. Export sang PDF (xem hướng dẫn trên)
2. Hoặc gửi trực tiếp file .xlsx
3. File size nhỏ (~100KB) nên dễ gửi

---

## 📁 Các file khác trong folder

### CSV Files:
- `gantt_chart_data.csv` - Dữ liệu cơ bản
- `gantt_chart_complete.csv` - Dữ liệu đầy đủ (18 cột)

### Markdown Files:
- `gantt_chart_detailed.md` - Timeline chi tiết (50,000+ chữ)
- `gantt_chart_mermaid.md` - Mermaid diagrams (cho GitHub)
- `README.md` - Hướng dẫn tiếng Anh

### Python Scripts:
- `create_beautiful_gantt.py` - Tạo chart với bar chart
- `create_advanced_gantt.py` - Tạo timeline visualization ⭐

---

## ❓ Troubleshooting

### File Excel không mở được:
- Cần Microsoft Excel 2016 trở lên
- Hoặc LibreOffice Calc (miễn phí)
- Hoặc Google Sheets (upload lên Drive)

### Màu sắc không hiển thị:
- Check xem Excel có enable macros không
- Thử Save As → Excel Workbook (.xlsx)

### Muốn thêm task:
- Chỉnh sửa file Python và run lại
- Hoặc thêm row trực tiếp trong Excel và copy format

### Muốn chart khác:
- File `UniLearn_Gantt_Chart_Beautiful.xlsx` có bar chart
- Có thể customize chart type trong Excel

---

## 🎯 Khuyến nghị sử dụng

### Cho Academic Report:
✅ Dùng `UniLearn_Gantt_Chart_Timeline.xlsx`
- Export sang PDF
- Insert vào appendix
- Reference trong methodology chapter

### Cho Presentation:
✅ Dùng `UniLearn_Gantt_Chart_Timeline.xlsx`
- Screenshot các phase quan trọng
- Hoặc insert Excel object vào PowerPoint
- Highlight critical path

### Cho Portfolio:
✅ Dùng cả 2 files:
- Timeline cho overview
- Beautiful cho detailed planning

---

## 📧 Support

Nếu cần chỉnh sửa hoặc customize thêm:
1. Xem file Python source code
2. Đọc comments trong code để hiểu cách hoạt động
3. Modify và run lại script

---

## 🎓 Thông tin thêm

### Technology Stack sử dụng:
- Python 3.x
- pandas (data manipulation)
- openpyxl (Excel generation)

### Thời gian tạo:
- Script chạy trong ~2-3 giây
- Tạo file Excel hoàn chỉnh với formatting

### Tương thích:
- ✅ Microsoft Excel 2016/2019/365
- ✅ LibreOffice Calc
- ✅ Google Sheets (một số feature có thể khác)
- ✅ WPS Office

---

## ✅ Checklist trước khi submit

Cho academic report:
- [ ] Đã mở và kiểm tra file Excel
- [ ] Màu sắc hiển thị đúng
- [ ] Tất cả 42 tasks đều có
- [ ] Timeline từ March đến November 2025
- [ ] Export sang PDF (landscape)
- [ ] File size < 5MB

Cho presentation:
- [ ] Screenshot các phase chính
- [ ] Highlight critical milestones
- [ ] Prepare talking points cho từng phase
- [ ] Test projector/screen display

---

## 🏆 Kết quả mong đợi

Sau khi sử dụng Gantt charts này:
- ✅ Giảng viên thấy rõ timeline project
- ✅ Thể hiện khả năng planning và organization
- ✅ Visualization chuyên nghiệp, dễ hiểu
- ✅ Tăng điểm cho phần methodology và planning
- ✅ Demonstrate project management skills

---

**Chúc bạn thành công với báo cáo và presentation!** 🎉

---

*Created: November 10, 2025*
*Version: 1.0*
*Student: GCS220124 / Greenwich ID: 001322934*
