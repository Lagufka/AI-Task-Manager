import { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';

export const PRIORITIES = ['high', 'medium', 'low'];
export const STATUS_OPTIONS = [
  { value: 'new', label: 'Новая' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'done', label: 'Выполнена' },
];

function normalizeTasks(response) {
  const data = response?.data;

  const tasksArray = Array.isArray(data)
    ? data
    : Object.values(data);

  return tasksArray.map((task) => ({
    status: task.status || 'new',
    createdAt: task.created_at || new Date().toISOString(),
    ...task,
  }));
}

export function useTaskManager() {
  const [tasks, setTasks] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', category: '', priority: 'medium', status: 'new' });
  const [authFields, setAuthFields] = useState({ email: '', password: '' });
  const [toast, setToast] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  const getErrorMessage = (error) => {
    return error?.response?.data?.error || error?.message || 'Произошла ошибка';
  };

  const loadTasks = async () => {
    try {
      const response = await apiClient.get('/tasks');

      setTasks(normalizeTasks(response));
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      setTasks([]);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreate = async () => {
    if (!taskForm.title.trim()) {
      showToast('Пожалуйста, введите заголовок задачи.', 'error');
      return;
    }

    try {
      setIsCreating(true);
      await apiClient.post('/tasks', {
        ...taskForm,
        status: 'new',
        createdAt: new Date().toISOString(),
      });
      await loadTasks();
      setTaskForm({ title: '', description: '', category: '', priority: 'medium', status: 'new' });
      showToast('Задача создана.', 'success');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/tasks/${ id }`);
      setTasks((current) => current.filter((task) => task.id !== id));
      showToast('Задача удалена.', 'success');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  const handleSaveTask = async (task, updatedTask) => {
    try {
      await apiClient.put(`/tasks/${ task.id }`, updatedTask);
      setTasks((current) => current.map((t) => (t.id === task.id ? updatedTask : t)));
      showToast('Задача обновлена.', 'success');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
      throw error;
    }
  };

  const handleRegister = async () => {
    try {
      setIsLoadingAuth(true);
      const payload = {
        email: authFields.email,
        password: authFields.password,
      };

      await apiClient.post('/auth/register', payload);
      setActiveModal(null);
      setAuthFields({ email: '', password: '' });
      await loadTasks();
      showToast('Регистрация прошла успешно.', 'success');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoadingAuth(true);
      const payload = {
        email: authFields.email,
        password: authFields.password,
      };

      await apiClient.post('/auth/login', payload);
      setActiveModal(null);
      setAuthFields({ email: '', password: '' });
      await loadTasks();
      showToast('Вы вошли в систему.', 'success');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
    } finally {
      setIsAuthenticated(false);
      setTasks([]);
      showToast('Вы вышли.', 'info');
      setActiveModal(null);
    }
  };

  return {
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
    showToast,
    closeToast,
  };
}
