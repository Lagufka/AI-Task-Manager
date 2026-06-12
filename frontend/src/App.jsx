import './App.css';
import { useTaskManager } from './hooks/useTaskManager';
import PageHeader from './components/PageHeader';
import EmptyState from './components/EmptyState';
import TaskCreationForm from './components/TaskCreationForm';
import TaskList from './components/TaskList';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';

export default function App() {
  const {
    tasks,
    isAuthenticated,
    activeModal,
    taskForm,
    authFields,
    toast,
    isCreating,
    isLoadingAuth,
    setTaskForm,
    setAuthFields,
    setActiveModal,
    handleCreate,
    handleDelete,
    handleSaveTask,
    handleRegister,
    handleLogin,
    handleLogout,
    closeToast,
  } = useTaskManager();

  return (
    <div className="page-shell">
      <PageHeader
        isAuthenticated={isAuthenticated}
        onLogin={() => setActiveModal('login')}
        onRegister={() => setActiveModal('register')}
        onLogout={handleLogout}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      <main className="page-content">
        {isAuthenticated === false && <EmptyState />}

        {isAuthenticated === true && (
          <section className="task-panel">
            <TaskCreationForm
              taskForm={taskForm}
              setTaskForm={setTaskForm}
              onCreate={handleCreate}
              isLoading={isCreating}
            />
            <TaskList
              tasks={tasks}
              onSaveTask={handleSaveTask}
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
