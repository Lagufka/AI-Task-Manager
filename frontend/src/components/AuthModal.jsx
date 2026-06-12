import { useState } from 'react';
import { validateEmail, validatePassword } from '../utils/validators';

export default function AuthModal({
  activeModal,
  authFields,
  setAuthFields,
  onClose,
  onSubmit,
  isLoading,
}) {
  const [emailErrors, setEmailErrors] = useState([]);
  const [passwordErrors, setPasswordErrors] = useState([]);

  if (!activeModal) {
    return null;
  }

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setAuthFields({ ...authFields, email: newEmail });
    
    if (activeModal === 'register') {
      const errors = validateEmail(newEmail);
      setEmailErrors(errors);
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setAuthFields({ ...authFields, password: newPassword });
    
    if (activeModal === 'register') {
      const errors = validatePassword(newPassword);
      setPasswordErrors(errors);
    }
  };

  const isFormValid = activeModal === 'register' 
    ? authFields.email.trim() && authFields.password && emailErrors.length === 0 && passwordErrors.length === 0
    : authFields.email.trim() && authFields.password.trim();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{activeModal === 'login' ? 'Войти' : 'Регистрация'}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <label className="field-group">
            Email
            <input
              type="email"
              value={authFields.email}
              onChange={handleEmailChange}
              placeholder="example@mail.com"
            />
            {activeModal === 'register' && emailErrors.length > 0 && (
              <div style={{ color: '#d32f2f', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                {emailErrors.map((error, index) => (
                  <div key={index}>• {error}</div>
                ))}
              </div>
            )}
          </label>
          <label className="field-group">
            Пароль
            <input
              type="password"
              value={authFields.password}
              onChange={handlePasswordChange}
              placeholder="Пароль"
            />
            {activeModal === 'register' && passwordErrors.length > 0 && (
              <div style={{ color: '#d32f2f', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                {passwordErrors.map((error, index) => (
                  <div key={index}>• {error}</div>
                ))}
              </div>
            )}
          </label>
          <button 
            className="app-button" 
            onClick={onSubmit} 
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? 'Отправка...' : activeModal === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </div>
      </div>
    </div>
  );
}
