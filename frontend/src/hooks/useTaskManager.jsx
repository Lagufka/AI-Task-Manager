import { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';

export const PRIORITIES = ['high', 'medium', 'low'];
export const STATUS_OPTIONS = [
  { value: 'new', label: 'Новая' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'done', label: 'Выполнена' },
];

function normalizeTasks(response) {
  return Array.isArray(response?.data)
    ? response.data.map((task) => ({
        status: task.status || 'new',
        createdAt: task.created_at || new Date().toISOString(),
        ...task,
      }))
    : [];
}

export function useTaskManager() {
  const [tasks, setTasks] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', category: '', priority: 'medium', status: 'new' });
  const [authFields, setAuthFields] = useState({ email: '', password: '', name: '' });
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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
      setStatusMessage('Пожалуйста, введите заголовок задачи.');
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
      setTaskForm({ title: '', category: '', priority: 'medium', status: 'new' });
      setStatusMessage('Задача создана.');
    } catch (error) {
      setStatusMessage('Ошибка при создании задачи.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/tasks/${id}`);
      setTasks((current) => current.filter((task) => task.id !== id));
    } catch (error) {
      setStatusMessage('Не удалось удалить задачу.');
    }
  };

  const handleSaveTask = async (task, updatedTask) => {
    try {
      await apiClient.put(`/tasks/${task.id}`, updatedTask);
      setTasks((current) => current.map((t) => (t.id === task.id ? updatedTask : t)));
    } catch (error) {
      setStatusMessage('Не удалось обновить задачу.');
      throw error;
    }
  };

  const handleRegister = async () => {
    try {
      setIsLoadingAuth(true);
      const payload = {
        email: authFields.email,
        password: authFields.password,
        name: authFields.name,
      };

      await apiClient.post('/auth/register', payload);
      setActiveModal(null);
      setAuthFields({ email: '', password: '', name: '' });
      await loadTasks();
      setStatusMessage('Регистрация прошла успешно.');
    } catch (error) {
      setStatusMessage('Не удалось зарегистрироваться.');
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
      setAuthFields({ email: '', password: '', name: '' });
      await loadTasks();
      setStatusMessage('Вы вошли в систему.');
    } catch (error) {
      setStatusMessage('Не удалось войти.');
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
      setStatusMessage('Вы вышли.');
      setActiveModal(null);
    }
  };

  return {
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
    handleSaveTask,
    handleRegister,
    handleLogin,
    handleLogout,
  };
}
