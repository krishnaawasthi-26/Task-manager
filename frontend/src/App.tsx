import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  LoaderCircle,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Shield,
  Trash2,
  UserPlus,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

type Role = "user" | "admin";
type TaskStatus = "todo" | "in_progress" | "done";

type User = {
  id: number;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  created_at: string;
};

type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  owner_id: number;
  created_at: string;
  updated_at: string;
};

type AuthResponse = {
  access_token: string;
  token_type: "bearer";
  user: User;
};

type ApiErrorBody = {
  message?: string;
  detail?: string;
};

const statusLabels: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In progress",
  done: "Done",
};

async function request<T>(
  path: string,
  token: string | null,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  const text = await response.text();
  const body = text ? (JSON.parse(text) as ApiErrorBody) : null;

  if (!response.ok) {
    throw new Error(body?.message ?? body?.detail ?? `Request failed with ${response.status}`);
  }
  return body as T;
}

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("access_token"));
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({
    email: "admin@example.com",
    full_name: "",
    password: "AdminPass123!",
  });
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "todo" as TaskStatus,
  });
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const messageTimer = useRef<number | undefined>(undefined);

  const headersReady = useMemo(() => Boolean(token), [token]);

  const showMessage = useCallback((value: string) => {
    setMessage(value);
    if (messageTimer.current) {
      window.clearTimeout(messageTimer.current);
    }
    messageTimer.current = window.setTimeout(() => {
      setMessage("");
    }, 3200);
  }, []);

  const loadTasks = useCallback(async () => {
    if (!token) return;
    const params = new URLSearchParams();
    params.set("scope", scope);
    if (statusFilter !== "all") params.set("status", statusFilter);
    const data = await request<Task[]>(`/tasks/?${params.toString()}`, token);
    setTasks(data);
  }, [scope, statusFilter, token]);

  const loadUsers = useCallback(async () => {
    if (!token || user?.role !== "admin") return;
    const data = await request<User[]>("/users/", token);
    setUsers(data);
  }, [token, user?.role]);

  useEffect(() => {
    if (!token) return;
    request<User>("/users/me", token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("access_token");
        setToken(null);
        setUser(null);
      });
  }, [token]);

  useEffect(() => {
    if (!headersReady) return;
    loadTasks().catch((error: Error) => showMessage(error.message));
  }, [headersReady, loadTasks, showMessage]);

  useEffect(() => {
    loadUsers().catch((error: Error) => showMessage(error.message));
  }, [loadUsers, showMessage]);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const path = authMode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        authMode === "login"
          ? { email: authForm.email, password: authForm.password }
          : authForm;
      const data = await request<AuthResponse>(path, null, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      localStorage.setItem("access_token", data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      showMessage(authMode === "login" ? "Logged in" : "Account created");
    } catch (error) {
      showMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setBusy(true);
    try {
      await request<Task>("/tasks/", token, {
        method: "POST",
        body: JSON.stringify(taskForm),
      });
      setTaskForm({ title: "", description: "", status: "todo" });
      await loadTasks();
      showMessage("Task created");
    } catch (error) {
      showMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function updateTask(task: Task, changes: Partial<Task>) {
    if (!token) return;
    try {
      const updated = await request<Task>(`/tasks/${task.id}`, token, {
        method: "PATCH",
        body: JSON.stringify(changes),
      });
      setTasks((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      showMessage("Task updated");
    } catch (error) {
      showMessage((error as Error).message);
    }
  }

  async function deleteTask(taskId: number) {
    if (!token) return;
    try {
      await request<null>(`/tasks/${taskId}`, token, { method: "DELETE" });
      setTasks((current) => current.filter((task) => task.id !== taskId));
      showMessage("Task deleted");
    } catch (error) {
      showMessage((error as Error).message);
    }
  }

  function logout() {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
    setTasks([]);
    setUsers([]);
    setScope("mine");
  }

  if (!user) {
    return (
      <main className="app-shell auth-shell">
        <section className="auth-panel">
          <div className="brand-block">
            <div className="logo-mark">
              <Shield size={22} />
            </div>
            <div>
              <p className="eyebrow">Backend Developer Assignment</p>
              <h1>Secure REST API Console</h1>
            </div>
          </div>

          <div className="tabs" aria-label="Authentication mode">
            <button
              className={authMode === "login" ? "active" : ""}
              onClick={() => setAuthMode("login")}
              type="button"
            >
              Login
            </button>
            <button
              className={authMode === "register" ? "active" : ""}
              onClick={() => {
                setAuthMode("register");
                setAuthForm((current) => ({
                  ...current,
                  email: "",
                  password: "",
                }));
              }}
              type="button"
            >
              Register
            </button>
          </div>

          <form className="form-grid" onSubmit={handleAuth}>
            {authMode === "register" && (
              <label>
                Full name
                <input
                  value={authForm.full_name}
                  maxLength={120}
                  onChange={(event) =>
                    setAuthForm((current) => ({ ...current, full_name: event.target.value }))
                  }
                  required
                />
              </label>
            )}
            <label>
              Email
              <input
                value={authForm.email}
                type="email"
                onChange={(event) =>
                  setAuthForm((current) => ({ ...current, email: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Password
              <input
                value={authForm.password}
                type="password"
                minLength={8}
                onChange={(event) =>
                  setAuthForm((current) => ({ ...current, password: event.target.value }))
                }
                required
              />
            </label>
            <button className="primary-action" disabled={busy} type="submit">
              {busy ? <LoaderCircle className="spin" size={18} /> : <Check size={18} />}
              {authMode === "login" ? "Login" : "Create account"}
            </button>
          </form>
        </section>
        {message && <div className="toast">{message}</div>}
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">PrimeTrade Assignment</p>
          <h1>Task API Dashboard</h1>
        </div>
        <div className="identity">
          <span className={`role-pill ${user.role}`}>{user.role}</span>
          <span>{user.full_name}</span>
          <button className="icon-button" onClick={logout} title="Logout" type="button">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <section className="toolbar">
        <div className="control-group">
          <label>
            Scope
            <select
              value={scope}
              onChange={(event) => setScope(event.target.value as "mine" | "all")}
            >
              <option value="mine">Mine</option>
              {user.role === "admin" && <option value="all">All</option>}
            </select>
          </label>
          <label>
            Status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | TaskStatus)}
            >
              <option value="all">All</option>
              <option value="todo">Todo</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </label>
        </div>
        <button className="icon-button" onClick={() => loadTasks()} title="Refresh tasks" type="button">
          <RefreshCw size={18} />
        </button>
      </section>

      <section className="content-grid">
        <form className="task-composer" onSubmit={handleCreateTask}>
          <h2>New task</h2>
          <label>
            Title
            <input
              value={taskForm.title}
              maxLength={160}
              onChange={(event) =>
                setTaskForm((current) => ({ ...current, title: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Description
            <textarea
              value={taskForm.description}
              maxLength={2000}
              onChange={(event) =>
                setTaskForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </label>
          <label>
            Status
            <select
              value={taskForm.status}
              onChange={(event) =>
                setTaskForm((current) => ({ ...current, status: event.target.value as TaskStatus }))
              }
            >
              <option value="todo">Todo</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </label>
          <button className="primary-action" disabled={busy} type="submit">
            <Plus size={18} />
            Create
          </button>
        </form>

        <section className="task-list">
          <div className="section-heading">
            <h2>Tasks</h2>
            <span>{tasks.length}</span>
          </div>
          {tasks.length === 0 ? (
            <div className="empty-state">No tasks match the current view.</div>
          ) : (
            tasks.map((task) => (
              <article className="task-card" key={task.id}>
                <div>
                  <input
                    className="task-title"
                    value={task.title}
                    onChange={(event) =>
                      setTasks((current) =>
                        current.map((item) =>
                          item.id === task.id ? { ...item, title: event.target.value } : item,
                        ),
                      )
                    }
                  />
                  <textarea
                    className="task-description"
                    value={task.description ?? ""}
                    onChange={(event) =>
                      setTasks((current) =>
                        current.map((item) =>
                          item.id === task.id
                            ? { ...item, description: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </div>
                <div className="task-actions">
                  <select
                    value={task.status}
                    onChange={(event) =>
                      updateTask(task, { status: event.target.value as TaskStatus })
                    }
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button
                    className="icon-button"
                    onClick={() =>
                      updateTask(task, { title: task.title, description: task.description })
                    }
                    title="Save task"
                    type="button"
                  >
                    <Save size={18} />
                  </button>
                  <button
                    className="icon-button danger"
                    onClick={() => deleteTask(task.id)}
                    title="Delete task"
                    type="button"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

        {user.role === "admin" && (
          <section className="admin-panel">
            <div className="section-heading">
              <h2>Users</h2>
              <button
                className="icon-button"
                onClick={() => loadUsers()}
                title="Refresh users"
                type="button"
              >
                <UserPlus size={18} />
              </button>
            </div>
            <div className="user-list">
              {users.map((item) => (
                <article className="user-row" key={item.id}>
                  <span>{item.full_name}</span>
                  <span>{item.email}</span>
                  <span className={`role-pill ${item.role}`}>{item.role}</span>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>

      {message && <div className="toast">{message}</div>}
    </main>
  );
}

export default App;
