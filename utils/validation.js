export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Invalid email format";
    return null;
};

export const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters long";
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
    const errors = [];
    const nameErr = validateFullname(fullname);
    if (nameErr) errors.push(nameErr);

    const emailErr = validateEmail(email);
    if (emailErr) errors.push(emailErr);

    const passErr = validatePassword(password);
    if (passErr) errors.push(passErr);

    if (password && confirmPassword && password !== confirmPassword) {
        errors.push("Passwords do not match");
    }

    return errors.length > 0 ? errors.join("||") : null;
};

export const validateLogin = (data) => {
    const { email, password } = data;
    const errors = [];

    const emailErr = validateEmail(email);
    if (emailErr) errors.push(emailErr);

    if (!password) errors.push("Password is required");

    return errors.length > 0 ? errors.join("||") : null;
};

export const validateCategoryForm = (name, description) => {
    const errors = {};
    if (!name || name.trim() === "") errors.name = "Category name is required";
    else if (name.length < 3) errors.name = "Category name must be at least 3 characters";
    
    if (!description || description.trim() === "") errors.description = "Description is required";
    
    return errors;
};
