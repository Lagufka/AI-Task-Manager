import './App.css';
import { useTaskManager } from './hooks/useTaskManager';
import PageHeader from './components/PageHeader';
import EmptyState from './components/EmptyState';
import TaskCreationForm from './components/TaskCreationForm';
import TaskList from './components/TaskList';
import AuthModal from './components/AuthModal';

export default function App() {
  const {
    tasks,
    isAuthenticated,
    activeModal,
    taskForm,
    authFields,
    statusMessage,
    isCreating,
    isLoadingAuth,
    setTaskForm,
    setAuthFields,
    setActiveModal,
    handleCreate,
    handleDelete,
    handleToggleComplete,
    handleRegister,
    handleLogin,
    handleLogout,
  } = useTaskManager();

  return (
    <div className="page-shell">
      <PageHeader
        isAuthenticated={isAuthenticated}
        onLogin={() => setActiveModal('login')}
        onRegister={() => setActiveModal('register')}
        onLogout={handleLogout}
      />

      <main className="page-content">
        {isAuthenticated === false && <EmptyState />}

        {isAuthenticated === true && (
          <section className="task-panel">
            <TaskCreationForm
              taskForm={taskForm}
              setTaskForm={setTaskForm}
              onCreate={handleCreate}
              isLoading={isCreating}
              statusMessage={statusMessage}
            />
            <TaskList
              tasks={tasks}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDelete}
            />
          </section>
        )}
      </main>

      <AuthModal
        activeModal={activeModal}
        authFields={authFields}
        setAuthFields={setAuthFields}
        onClose={() => setActiveModal(null)}
        onSubmit={activeModal === 'login' ? handleLogin : handleRegister}
        isLoading={isLoadingAuth}
      />
    </div>
  );
}
