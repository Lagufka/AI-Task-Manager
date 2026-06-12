import { useEffect, useState } from 'react';
import { PRIORITIES, STATUS_OPTIONS } from '../hooks/useTaskManager';

export default function TaskCard({ task, onSaveTask, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title || '');
  const [draftDescription, setDraftDescription] = useState(task.description || '');
  const [draftPriority, setDraftPriority] = useState(task.priority || 'medium');
  const [draftCategory, setDraftCategory] = useState(task.category || '');
  const [draftStatus, setDraftStatus] = useState(task.status || 'new');

  useEffect(() => {
    if (!isEditing) {
      setDraftTitle(task.title || '');
      setDraftDescription(task.description || '');
      setDraftPriority(task.priority || 'medium');
      setDraftCategory(task.category || '');
      setDraftStatus(task.status || 'new');
    }
  }, [task, isEditing]);

  const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value || '—';
    }
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    const updatedTask = {
      ...task,
      title: draftTitle,
      description: draftDescription,
      priority: draftPriority,
      category: draftCategory,
      status: draftStatus,
    };

    setIsSaving(true);
    try {
      await onSaveTask(task, updatedTask);
    } catch (error) {
      setDraftTitle(task.title || '');
      setDraftDescription(task.description || '');
      setDraftPriority(task.priority || 'medium');
      setDraftCategory(task.category || '');
      setDraftStatus(task.status || 'new');
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  return (
    <article className={`task-card status-${task.status}`}>
      <div className="task-content">
        {isEditing ? (
          <input
            className="task-card-title-input"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="Заголовок задачи"
          />
        ) : (
          <h3>{task.title}</h3>
        )}
        
        {isEditing ? (
          <textarea
            className="task-card-description-input"
            value={draftDescription}
            onChange={(e) => setDraftDescription(e.target.value)}
            placeholder="Описание задачи"
          />
        ) : (
          task.description && <p className="task-description">{task.description}</p>
        )}
        <p className="task-meta">
          Приоритет:{' '}
          {isEditing ? (
            <select value={draftPriority} onChange={(e) => setDraftPriority(e.target.value)}>
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          ) : (
            <strong>{task.priority}</strong>
          )}
        </p>
        <p className="task-meta">
          Категория:{' '}
          {isEditing ? (
            <input
              type="text"
              value={draftCategory}
              onChange={(e) => setDraftCategory(e.target.value)}
              placeholder="Нет"
            />
          ) : (
            <strong>{task.category || 'Нет'}</strong>
          )}
        </p>
        <p className="task-meta">
          Статус:{' '}
          {isEditing ? (
            <select value={draftStatus} onChange={(e) => setDraftStatus(e.target.value)}>
              {STATUS_OPTIONS.map((statusOption) => (
                <option key={statusOption.value} value={statusOption.value}>
                  {statusOption.label}
                </option>
              ))}
            </select>
          ) : (
            <strong>{STATUS_OPTIONS.find((option) => option.value === task.status)?.label || task.status}</strong>
          )}
        </p>
        <p className="task-meta">
          Дата создания: <strong>{formatDate(task.createdAt)}</strong>
        </p>
      </div>
      <div className="task-actions">
        <button className="app-button" onClick={isEditing ? handleSave : handleEdit} disabled={isEditing && isSaving}>
          {isEditing ? (isSaving ? 'Сохраняем...' : 'Сохранить') : 'Редактировать'}
        </button>
        <button className="app-button danger" onClick={() => onDelete(task.id)}>
          Удалить
        </button>
      </div>
    </article>
  );
}
