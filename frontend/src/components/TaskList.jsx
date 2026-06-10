import TaskCard from './TaskCard';

export default function TaskList({ tasks, onToggleComplete, onDelete }) {
  return (
    <div className="task-list">
      <div className="task-list-header">
        <h2>Ваши задачи</h2>
        {tasks.length === 0 && <p>У вас пока нет задач.</p>}
      </div>
      <div className="task-list-wrapper">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
