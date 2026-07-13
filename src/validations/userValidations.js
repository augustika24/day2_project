export const validateUser = ({ name, email }) => {
  if (!name || !email) {
    return "Name and Email are required.";
  }

  if (name.trim().length < 2) {
    return "Name must be at least 2 characters long.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return "Invalid email format.";
  }

  return null;
};
