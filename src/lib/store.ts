import { create } from "zustand";
import { createClient } from "@/utils/supabase/client";

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  emoji: string;
  /** Tailwind color name: amber | pink | blue | purple | green | orange | teal | red | indigo | cyan */
  color: string;
}

/**
 * COLOR_MAP — literal Tailwind class strings so the compiler never purges them.
 * Kept here so all consumers share the same source of truth.
 */
export const COLOR_MAP: Record<string, { bg: string; text: string; dot: string }> = {
  amber:  { bg: "bg-amber-100",  text: "text-amber-700",  dot: "bg-amber-400"  },
  pink:   { bg: "bg-pink-100",   text: "text-pink-700",   dot: "bg-pink-400"   },
  blue:   { bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-400"   },
  purple: { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-400" },
  green:  { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-400"  },
  orange: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-400" },
  teal:   { bg: "bg-teal-100",   text: "text-teal-700",   dot: "bg-teal-400"   },
  red:    { bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-400"    },
  indigo: { bg: "bg-indigo-100", text: "text-indigo-700", dot: "bg-indigo-400" },
  cyan:   { bg: "bg-cyan-100",   text: "text-cyan-700",   dot: "bg-cyan-400"   },
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "home",     name: "Home",     emoji: "🏠", color: "amber"  },
  { id: "kids",     name: "Kids",     emoji: "👧", color: "pink"   },
  { id: "work",     name: "Work",     emoji: "💼", color: "blue"   },
  { id: "personal", name: "Personal", emoji: "✨", color: "purple" },
  { id: "health",   name: "Health",   emoji: "💚", color: "green"  },
  { id: "errands",  name: "Errands",  emoji: "🛒", color: "orange" },
];

// ─── Task ─────────────────────────────────────────────────────────────────────

/** category is a category.id (string) */
export type TaskCategory = string;
export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory; // category id
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string; // ISO date string
  assignee?: string;
  createdAt: string;
  completedAt?: string;
}

// ─── DB row types ─────────────────────────────────────────────────────────────

interface DbTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assignee: string | null;
  created_at: string;
  completed_at: string | null;
}

interface DbCategory {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  color: string;
  sort_order: number;
  created_at: string;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

export function dbTaskToFrontend(t: DbTask): Task {
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? undefined,
    category: t.category_id ?? "",
    status: t.status,
    priority: t.priority,
    dueDate: t.due_date ?? undefined,
    assignee: t.assignee ?? undefined,
    createdAt: t.created_at,
    completedAt: t.completed_at ?? undefined,
  };
}

export function dbCategoryToFrontend(c: DbCategory): Category {
  return {
    id: c.id,
    name: c.name,
    emoji: c.emoji,
    color: c.color,
  };
}

// ─── Mock tasks (kept for reference, not loaded by default) ───────────────────

const today = new Date();
const fmt = (offsetDays: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
};

export const MOCK_TASKS: Task[] = [
  {
    id: "t1",
    title: "School pickup — Emma & Jake",
    description: "Pick up from Lincoln Elementary at 3:15pm",
    category: "kids",
    status: "todo",
    priority: "high",
    dueDate: fmt(0),
    assignee: "Karla",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t2",
    title: "Grocery run",
    description: "Trader Joe's — check the shared list",
    category: "errands",
    status: "todo",
    priority: "medium",
    dueDate: fmt(0),
    assignee: "Karla",
    createdAt: new Date().toISOString(),
  },
];

// ─── Store ────────────────────────────────────────────────────────────────────

interface TaskStore {
  tasks: Task[];
  categories: Category[];
  userId: string | null;
  initialized: boolean;

  // Bulk setters (called on auth init)
  setTasks: (tasks: Task[]) => void;
  setCategories: (categories: Category[]) => void;
  setUserId: (id: string) => void;
  setInitialized: (v: boolean) => void;
  clearStore: () => void;

  // Task actions
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;

  // Category actions
  addCategory: (category: Omit<Category, "id">) => void;
  updateCategory: (id: string, updates: Partial<Omit<Category, "id">>) => void;
  deleteCategory: (id: string) => void;
}

export const useTasks = create<TaskStore>()((set, get) => ({
  tasks: [],
  categories: [],
  userId: null,
  initialized: false,

  // ── Bulk setters ────────────────────────────────────────────────────────
  setTasks: (tasks) => set({ tasks }),
  setCategories: (categories) => set({ categories }),
  setUserId: (userId) => set({ userId }),
  setInitialized: (initialized) => set({ initialized }),
  clearStore: () => set({ tasks: [], categories: [], userId: null, initialized: false }),

  // ── Task actions ──────────────────────────────────────────────────────
  addTask: (task) => {
    const userId = get().userId;
    const newId = crypto.randomUUID();
    const now = new Date().toISOString();
    const newTask: Task = { ...task, id: newId, createdAt: now };

    // Optimistic update
    set((state) => ({ tasks: [...state.tasks, newTask] }));

    // Persist to Supabase
    if (userId) {
      const supabase = createClient();
      supabase.from("tasks").insert({
        id: newId,
        user_id: userId,
        title: task.title,
        description: task.description ?? null,
        category_id: task.category || null,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate ?? null,
        assignee: task.assignee ?? null,
        created_at: now,
        completed_at: task.completedAt ?? null,
      }).then(({ error }) => {
        if (error) console.error("[store] addTask error:", error.message);
      });
    }
  },

  updateTask: (id, updates) => {
    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));

    // Persist to Supabase
    const userId = get().userId;
    if (userId) {
      const supabase = createClient();
      const dbUpdates: Record<string, unknown> = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description ?? null;
      if (updates.category !== undefined) dbUpdates.category_id = updates.category || null;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate ?? null;
      if (updates.assignee !== undefined) dbUpdates.assignee = updates.assignee ?? null;
      if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt ?? null;

      supabase.from("tasks").update(dbUpdates).eq("id", id).then(({ error }) => {
        if (error) console.error("[store] updateTask error:", error.message);
      });
    }
  },

  deleteTask: (id) => {
    // Optimistic update
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));

    // Persist to Supabase
    const userId = get().userId;
    if (userId) {
      const supabase = createClient();
      supabase.from("tasks").delete().eq("id", id).then(({ error }) => {
        if (error) console.error("[store] deleteTask error:", error.message);
      });
    }
  },

  toggleTaskStatus: (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    const next: TaskStatus =
      task.status === "todo"
        ? "in-progress"
        : task.status === "in-progress"
        ? "done"
        : "todo";

    const completedAt = next === "done" ? new Date().toISOString() : undefined;

    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status: next, completedAt } : t
      ),
    }));

    // Persist to Supabase
    const userId = get().userId;
    if (userId) {
      const supabase = createClient();
      supabase.from("tasks").update({
        status: next,
        completed_at: completedAt ?? null,
      }).eq("id", id).then(({ error }) => {
        if (error) console.error("[store] toggleTaskStatus error:", error.message);
      });
    }
  },

  // ── Category actions ──────────────────────────────────────────────────
  addCategory: (category) => {
    const userId = get().userId;
    const newId = crypto.randomUUID();
    const sortOrder = get().categories.length;

    // Optimistic update
    set((state) => ({
      categories: [...state.categories, { ...category, id: newId }],
    }));

    // Persist to Supabase
    if (userId) {
      const supabase = createClient();
      supabase.from("categories").insert({
        id: newId,
        user_id: userId,
        name: category.name,
        emoji: category.emoji,
        color: category.color,
        sort_order: sortOrder,
      }).then(({ error }) => {
        if (error) console.error("[store] addCategory error:", error.message);
      });
    }
  },

  updateCategory: (id, updates) => {
    // Optimistic update
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));

    // Persist to Supabase
    const userId = get().userId;
    if (userId) {
      const supabase = createClient();
      supabase.from("categories").update(updates).eq("id", id).then(({ error }) => {
        if (error) console.error("[store] updateCategory error:", error.message);
      });
    }
  },

  deleteCategory: (id) => {
    // Optimistic update
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));

    // Persist to Supabase
    const userId = get().userId;
    if (userId) {
      const supabase = createClient();
      supabase.from("categories").delete().eq("id", id).then(({ error }) => {
        if (error) console.error("[store] deleteCategory error:", error.message);
      });
    }
  },
}));
