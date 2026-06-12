import { PRIORITIES } from '../hooks/useTaskManager';

export default function TaskCreationForm({ taskForm, setTaskForm, onCreate, isLoading }) {
  return (
    <div className="task-form-card">
      <h2>Создать новую задачу</h2>
      <input
        className="task-input task-title-input"
        placeholder="Заголовок задачи"
        value={taskForm.title}
        onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
      />
      <textarea
        className="task-input task-description-input"
        placeholder="Описание задачи"
        value={taskForm.description}
        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
      />
      <div className="task-row">
        <label className="field-group">
          Приоритет
          <select
            value={taskForm.priority}
            onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
          >
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>
        <label className="field-group">
          Категория
          <input
            type="text"
            placeholder="Дом, Работа, Хобби"
            value={taskForm.category}
            onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
          />
        </label>
      </div>
      <button className="app-button" onClick={onCreate} disabled={isLoading}>
        {isLoading ? 'Сохраняем...' : 'Создать задачу'}
      </button>
    </div>
  );
}
