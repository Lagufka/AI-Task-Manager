export default function TaskCard({ task, onToggleComplete, onDelete }) {
  return (
    <article key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
      <label className="task-checkbox">
        <input
          type="checkbox"
          checked={task.completed || false}
          onChange={() => onToggleComplete(task)}
        />
        <span className="checkbox-mark"></span>
      </label>
      <div className="task-content">
        <h3>{task.title}</h3>
        <p className="task-meta">
          Приоритет: <strong>{task.priority}</strong>
        </p>
        <p className="task-meta">
          Категория: <strong>{task.category || 'Нет'}</strong>
        </p>
      </div>
      <button className="app-button danger" onClick={() => onDelete(task.id)}>
        Удалить
      </button>
    </article>
  );
}
