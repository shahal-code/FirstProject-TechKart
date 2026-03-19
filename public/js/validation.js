const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Invalid email format";
    return null;
};

const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters long";
    return null;
};

const validateFullname = (fullname) => {
    if (!fullname) return "Full name is required";
    if (fullname.trim().length < 3) return "Name must be at least 3 characters long";
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(fullname)) return "Name can only contain letters and spaces";
    return null;
};

const validateOtp = (otp) => {
    if (!otp) return "OTP is required";
    if (!/^\d{6}$/.test(otp)) return "OTP must be 6 digits";
    return null;
};
