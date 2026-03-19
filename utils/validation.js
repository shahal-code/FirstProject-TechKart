export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Invalid email format";
    return null;
};

export const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters long";
    // Optional: Add more complexity checks if desired
    const complexRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
     if (!complexRegex.test(password)) return "Password must contain uppercase, lowercase, number and special character";
    return null;
};

export const validateFullname = (fullname) => {
    if (!fullname) return "Full name is required";
    if (fullname.trim().length < 3) return "Name must be at least 3 characters long";
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(fullname)) return "Name can only contain letters and spaces";
    return null;
};

export const validateOtp = (otp) => {
    if (!otp) return "OTP is required";
    if (!/^\d{6}$/.test(otp)) return "OTP must be 6 digits";
    return null;
};

export const validateSignup = (data) => {
    const { fullname, email, password, confirmPassword } = data;
    
    const fullnameError = validateFullname(fullname);
    if (fullnameError) return fullnameError;
    
    const emailError = validateEmail(email);
    if (emailError) return emailError;
    
    const passwordError = validatePassword(password);
    if (passwordError) return passwordError;
    
    if (password !== confirmPassword) return "Passwords do not match";
    
    return null;
};

export const validateLogin = (data) => {
    const { email, password } = data;
    
    const emailError = validateEmail(email);
    if (emailError) return emailError;
    
    if (!password) return "Password is required";
    
    return null;
};
