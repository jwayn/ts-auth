import { randomBytes } from "crypto";

// Validates email
export function isValidEmail(email: string) {
  const mailFormat =
    /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  return email.trim() != "" && email.match(mailFormat);
}

// Validates password
export function isValidPassword(password: string) {
  return password.trim() != "" && password.trim().length >= 8;
}

// Generates a cryptographically safe random string
export function randomString(length: number) {
  return randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}
