// Add null checks for string operations
const sanitizeInput = (input) => {
  return input?.trim() || '' // Using optional chaining
}