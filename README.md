# Flow Studio Automation 0.1.0

Bản thử nghiệm Electron dành cho Windows để quản lý nhiều phiên Chrome/Google Flow và chạy prompt theo hàng đợi.

## Build EXE bằng GitHub Actions (không cần cài Node trên máy)

1. Tạo một repository GitHub mới.
2. Upload toàn bộ file/thư mục trong project này vào repository.
3. Vào **Actions**.
4. Chọn workflow **Build Flow Studio Automation EXE**.
5. Bấm **Run workflow**.
6. Chờ job `build-windows` chạy xong.
7. Mở phần **Artifacts** của workflow và tải `Flow-Studio-Automation-Windows`.
8. Giải nén artifact, chạy file `.exe`.

Workflow nằm tại `.github/workflows/main.yml` và tự build bằng `electron-builder`.

## Cách thử tài khoản Flow

- Mở **Tài khoản Flow** trong ứng dụng.
- Thêm tài khoản.
- Cửa sổ Chrome riêng mở trang Google.
- Người dùng tự đăng nhập Google và hoàn tất 2FA/CAPTCHA nếu Google yêu cầu.
- Không nhập mật khẩu Google vào ứng dụng và ứng dụng không lưu mật khẩu.
- Sau khi đăng nhập, phiên Chrome persistent được giữ lại để dùng lại.

## Lưu ý bản 0.1

Flow DOM đã được khảo sát thực tế cho các phần prompt, Generate, model và tài khoản. Phần phát hiện chính xác trạng thái hoàn tất và tải MP4 chưa được khóa bằng selector cụ thể trong bản này; runner sẽ đánh dấu `waiting-download` sau thời gian chờ để kiểm thử thực tế trước khi triển khai tiếp.
