import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskCard from '../components/TaskCard.jsx';
import TaskErrorState from '../components/TaskErrorState.jsx';
import TaskForm from '../components/TaskForm.jsx';
import TaskLoadingState from '../components/TaskLoadingState.jsx';
import useAuth from '../hooks/useAuth.js';
import useTasks from '../hooks/useTasks.js';

const SORT_OPTIONS = {
  newest: { sortBy: 'createdAt', sortOrder: 'desc' },
  oldest: { sortBy: 'createdAt', sortOrder: 'asc' },
  due: { sortBy: 'dueDate', sortOrder: 'asc' },
  priority: { sortBy: 'priority', sortOrder: 'desc' },
  title: { sortBy: 'title', sortOrder: 'asc' },
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sort, setSort] = useState('newest');
  const [formTask, setFormTask] = useState(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const params = useMemo(() => ({
    page,
    limit: 6,
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...SORT_OPTIONS[sort],
  }), [page, priority, search, sort, status]);
  const {
    tasks,
    pagination,
    isLoading,
    error,
    refreshTasks,
    addTask,
    editTask,
    removeTask,
  } = useTasks(params, logout);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const openCreateForm = () => {
    setFormTask(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (task) => {
    setFormTask(task);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormTask(undefined);
  };

  const submitTask = async (payload) => {
    if (formTask) await editTask(formTask.id, payload);
    else {
      await addTask(payload, page === 1);
      if (page !== 1) setPage(1);
    }
    closeForm();
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete “${task.title}”? This action cannot be undone.`)) return;
    setDeletingId(task.id);
    try {
      const usePreviousPage = await removeTask(task.id);
      if (usePreviousPage) setPage((current) => current - 1);
    } catch {
      // The task hook exposes the safe request error through its error state.
    } finally {
      setDeletingId(null);
    }
  };

  const updateFilter = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || status || priority);

  return (
    <section className="task-dashboard" aria-labelledby="dashboard-title">
      <div className="dashboard-heading dashboard-header">
        <div>
          <p className="eyebrow">Authenticated workspace</p>
          <h1 id="dashboard-title">My Tasks</h1>
          <p className="user-summary">{user.name} · {user.role}</p>
        </div>
        <button className="button button-secondary" type="button" onClick={handleLogout}>Log out</button>
      </div>
      <div className="dashboard-toolbar">
        <form className="search-form" role="search" onSubmit={submitSearch}>
          <label className="sr-only" htmlFor="task-search">Search tasks</label>
          <input id="task-search" type="search" placeholder="Search title or description" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
          <button className="button button-secondary" type="submit">Search</button>
        </form>
        <button className="button button-primary" type="button" onClick={openCreateForm}>Create task</button>
      </div>
      <div className="task-filters" aria-label="Task filters and sorting">
        <label>Status<select value={status} onChange={updateFilter(setStatus)}><option value="">All statuses</option><option value="TODO">To do</option><option value="IN_PROGRESS">In progress</option><option value="DONE">Done</option></select></label>
        <label>Priority<select value={priority} onChange={updateFilter(setPriority)}><option value="">All priorities</option><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></label>
        <label>Sort by<select value={sort} onChange={updateFilter(setSort)}><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="due">Due date</option><option value="priority">Priority</option><option value="title">Title</option></select></label>
      </div>
      {isFormOpen && <TaskForm key={formTask?.id ?? 'create'} task={formTask} onSubmit={submitTask} onCancel={closeForm} />}
      {isLoading ? <TaskLoadingState /> : error ? <TaskErrorState message={error} onRetry={refreshTasks} /> : tasks.length === 0 ? (
        <div className="task-state empty-state"><h2>{hasActiveFilters ? 'No tasks match your current filters.' : 'No tasks yet.'}</h2><p>{hasActiveFilters ? 'Try changing your search or filters.' : 'Create your first task to begin.'}</p></div>
      ) : (
        <div className="task-grid">{tasks.map((task) => <TaskCard key={task.id} task={task} onEdit={openEditForm} onDelete={handleDelete} isDeleting={deletingId === task.id} />)}</div>
      )}
      {!isLoading && !error && pagination.totalItems > 0 && (
        <nav className="pagination" aria-label="Task pages">
          <button className="button button-secondary" type="button" disabled={pagination.page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button>
          <p aria-live="polite">Page {pagination.page} of {pagination.totalPages || 1} · {pagination.totalItems} tasks</p>
          <button className="button button-secondary" type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => setPage((current) => current + 1)}>Next</button>
        </nav>
      )}
    </section>
  );
}
