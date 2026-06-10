export default function AuthModal({
  activeModal,
  authFields,
  setAuthFields,
  onClose,
  onSubmit,
  isLoading,
}) {
  if (!activeModal) {
    return null;
  }

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
          {activeModal === 'register' && (
            <label className="field-group">
              Имя
              <input
                type="text"
                value={authFields.name}
                onChange={(e) => setAuthFields({ ...authFields, name: e.target.value })}
                placeholder="Ваше имя"
              />
            </label>
          )}
          <label className="field-group">
            Email
            <input
              type="email"
              value={authFields.email}
              onChange={(e) => setAuthFields({ ...authFields, email: e.target.value })}
              placeholder="example@mail.com"
            />
          </label>
          <label className="field-group">
            Пароль
            <input
              type="password"
              value={authFields.password}
              onChange={(e) => setAuthFields({ ...authFields, password: e.target.value })}
              placeholder="Пароль"
            />
          </label>
          <button className="app-button" onClick={onSubmit} disabled={isLoading}>
            {isLoading ? 'Отправка...' : activeModal === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </div>
      </div>
    </div>
  );
}
