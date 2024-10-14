# Tóm tắt các endpoint của API:

* '/auth': Các chức năng liên quan đến việc xác thực người dùng
    - GET '/': Kiểm tra token để xác thực người dùng
        + 200: {“message”: “Authentication”}
        + 401: {“message”: “Unauthenticated”}
        + 500: {“error”: “Internal server error”}
    - POST ‘/login’: Kiểm tra và lưu thông tin đăng nhập
        + 500: {“error”: “Internal server error”}
        + 200: {“message”: “Login successful”}
        + 401: {“message”: “Invalid username or password”}
    - POST ‘/register’: Kiểm tra và lưu thông tin đăng ký
        + 400: { message: 'This username already exists. Please choose a different username!' }
        + 500: { error: 'Internal server error' }
        + 201: { message: 'Register successful' }
    - GET ‘/logout’: Đăng xuất tài khoản
        + 200: { message: 'Đăng xuất thành công' }

* '/profile: Các chức năng liên quan đến quản lý thông tin cá nhân
    - POST ‘/getProfile’: Lấy thông tin cá nhân
        + 200: { message: 'Profile retrieved successfully', user: user_Obj }
        + 404: { message: 'User not found' }
        + 500: { error: 'Internal server error' }
    - PUT ‘/changePassword: Cập nhật mật khẩu
        + 200: { message: 'Password updated successfully', user: updatedUser}	
        + 500: { message: 'Failed to update password' }
        + 404: { message: 'User not found' }

