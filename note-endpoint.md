# Tóm tắt các endpoint của API:

* '/profile': Các chức năng liên quan đến quản lý thông tin cá nhân
    - POST '/getProfile': Lấy thông tin cá nhân của người dùng
        + 200: { message: 'Lấy thông tin người dùng thành công!', user: user }
        + 404: { message: 'Không tìm thấy người dùng!' }
        + 500: { message: 'Lỗi hệ thống máy chủ.' }
    
    - PUT '/changePassword': Cập nhật mật khẩu người dùng
        + 200: { message: 'Cập nhật mật khẩu thành công!', user: updatedUser }
        + 404: { message: 'Không tìm thấy người dùng!' }
        + 500: { message: 'Lỗi hệ thống máy chủ.' }