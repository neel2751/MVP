import bcrypt from "bcryptjs";

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const isPasswordStrong = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number, one special character
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

export const validatePasswordChange = (
  currentPassword,
  newPassword,
  confirmPassword
) => {
  const errors = {};
  if (!currentPassword) {
    errors.currentPassword = "Current password is required";
  }
  if (!newPassword) {
    errors.newPassword = "New password is required";
  } else if (!isPasswordStrong(newPassword)) {
    errors.newPassword =
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character";
  }
  if (newPassword !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }
  return errors;
};

export const validatePasswordReset = (newPassword, confirmPassword) => {
  const errors = {};
  if (!newPassword) {
    errors.newPassword = "New password is required";
  } else if (!isPasswordStrong(newPassword)) {
    errors.newPassword =
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character";
  }
  if (newPassword !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }
  return errors;
};
export const generateRandomPassword = (length = 12) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return hashPassword(password);
};
