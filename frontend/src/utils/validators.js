export function validateEmail(email) {
  const errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email.trim()) {
    errors.push('Email обязателен');
  } else if (!emailRegex.test(email)) {
    errors.push('Некорректный формат email');
  }

  return errors;
}

export function validatePassword(password) {
  const errors = [];

  if (password.length <= 6) {
    errors.push('Пароль должен быть больше 6 символов');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Пароль должен содержать строчную букву');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Пароль должен содержать заглавную букву');
  }

  return errors;
}
