function checkValidRegistation(fullName: string, userName: string, password: string) {
    // Kiểm tra fullName phải có ít nhất 10 ký tự và chỉ chứa chữ cái (cả có dấu tiếng Việt và khoảng trắng)
    const fullNameRegex = /^[A-Za-zÀ-ỹ\s]{10,}$/;
    if (!fullNameRegex.test(fullName)) {
        return 'Họ và tên phải có ít nhất 10 ký tự và chỉ chứa chữ cái.';
    }
    // Kiểm tra userName phải có ít nhất 5 ký tự và chỉ chứa chữ thường hoặc số
    const userNameRegex = /^[a-z0-9]{5,}$/;
    if (!userNameRegex.test(userName)) {
        return 'Tên đăng nhập phải có ít nhất 5 ký tự, chỉ chứa chữ thường hoặc số.';
    }
    // Kiểm tra mật khẩu có độ dài ít nhất là 8 và chứa cả chữ và số
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
        return 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm cả chữ và số.';
    }
}

export { checkValidRegistation };