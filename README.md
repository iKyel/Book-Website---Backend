# Step to create an Express project
- Tạo file package.json
    + type: "module"

- Tạo file tsconfig.json
    + targer: ES2022
    + module & moduleResolution: NodeNext
    + outDir: "dist"

- Tải các package cần thiết:
    + express, mongoose, morgan (HTTP request logger), cors (cho phép truyền tài nguyên giữa các domain khác nhau)
    + nodemon, concurrently (--save-dev)
    + dotenv (dùng để tải các environment variables từ file .env vào process.env)
    + cookie-parser (dùng để phân tích cú pháp cookie) (lưu ý dùng credentials cả bên back và front end)
    + jsonwebtoken (dùng để authentication khi login)
    + bcrypt (dùng để hash password và lưu vào DB)

- Xây dựng codebase cho project
    + src
        + models: Lưu các schema và model trong csdl
        + controllers: Chứa các hàm xử lý logic cho các yêu cầu HTTP
        + routes: Chứa các định nghĩa router, xác định các endpoint của API và ánh xạ chúng đến các controller tương ứng.
        + middlewares: Chứa tất cả phần mềm trung gian, ví dụ: xác thực, ...
        + utils: Chứa các chức năng phổ biến mà sẽ yêu cầu nhiều lần trong suốt mã của mình, ví dụ: check missing params trước khi xử lý data, format Date, ...
        + configs: chứa các file cấu hình cho các API/dịch vụ của bên 3 (paypal, ...) hoặc các keyAPI, private key JWT, ...
    + .env
    + .gitignore
    + package.json
    + package-lock.json
    + README.md
    + tsconfig.json