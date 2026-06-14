export default function PageHeader({ isAuthenticated, onLogin, onRegister, onLogout }) {
  const authButtons = isAuthenticated === null
    ? null
    : isAuthenticated
      ? (
        <button className="app-button secondary" onClick={onLogout}>
          Выйти
        </button>
      )
      : (
        <>
          <button className="app-button secondary" onClick={onLogin}>
            Войти
          </button>
          <button className="app-button secondary" onClick={onRegister}>
            Зарегистрироваться
          </button>
        </>
      );

  return (
    <header className="page-header">
      <div>
        <h1>AI Task Manager</h1>
        <p>Управляйте задачами, устанавливайте приоритет и категории.</p>
      </div>
      <div className="header-actions">{authButtons}</div>
    </header>
  );
}
