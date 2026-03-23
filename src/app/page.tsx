"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Plus, ArrowRight, Rocket, CheckCircle2, Clock, Circle, CalendarDays, Zap, Brain } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DashboardCard } from "@/components/DashboardCard";
import { TaskCard } from "@/components/TaskCard";
import { TaskModal } from "@/components/TaskModal";
import { Button } from "@/components/ui/button";
import { useTasks, type Task } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mock upcoming events
const MOCK_EVENTS = [
  { id: "e1", title: "School PTA Meeting", time: "9:00 AM", color: "bg-primary/10 text-primary border-primary/20" },
  { id: "e2", title: "Jake's Soccer Practice", time: "4:30 PM", color: "bg-pink-50 text-pink-700 border-pink-200" },
  { id: "e3", title: "Team standup", time: "10:00 AM", color: "bg-blue-50 text-blue-700 border-blue-200", tomorrow: true },
  { id: "e4", title: "Dentist — Emma", time: "2:00 PM", color: "bg-amber-50 text-amber-700 border-amber-200", tomorrow: true },
];

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const { tasks } = useTasks();
  const { user, profile } = useAuth();

  const firstName =
    profile?.display_name?.split(" ")[0] ||
    (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ||
    (user?.email ? user.email.split("@")[0] : null) ||
    "there";

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const todayTasks = useMemo(
    () => tasks.filter((t) => t.dueDate === todayStr),
    [tasks, todayStr]
  );

  const stats = useMemo(() => ({
    total: tasks.length,
    done: tasks.filter((t) => t.status === "done").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    todo: tasks.filter((t) => t.status === "todo").length,
  }), [tasks]);

  const todayEvents = MOCK_EVENTS.filter((e) => !e.tomorrow);
  const tomorrowEvents = MOCK_EVENTS.filter((e) => e.tomorrow);

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setModalOpen(true);
  };

  const handleAddTask = () => {
    setEditTask(null);
    setModalOpen(true);
  };

  const hour = today.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <AppShell onAddTask={handleAddTask}>
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Welcome header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Rocket className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">
                {format(today, "EEEE, MMMM d")}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {greeting}, {firstName}! 👋
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {stats.done} of {stats.total} tasks done today. You&rsquo;ve got this.
            </p>
          </div>
          <Button
            onClick={handleAddTask}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl gap-2 hidden sm:flex shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "To Do", count: stats.todo, icon: Circle, color: "text-slate-500", bg: "bg-slate-50" },
            { label: "In Progress", count: stats.inProgress, icon: Clock, color: "text-primary", bg: "bg-primary/8" },
            { label: "Done", count: stats.done, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map(({ label, count, icon: Icon, color, bg }) => (
            <div key={label} className={cn("rounded-2xl p-4 border border-border", bg)}>
              <div className={cn("flex items-center gap-1.5 text-xs font-medium mb-2", color)}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </div>
              <div className="text-2xl font-display font-bold text-foreground">{count}</div>
            </div>
          ))}
        </div>

        {/* Brain Dump quick action */}
        <Link href="/dump" className="block">
          <div className="bg-gradient-to-r from-accent/15 via-accent/10 to-primary/10 rounded-2xl border border-accent/25 p-4 hover:border-accent/40 hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/30 transition-colors">
                <Brain className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground">Got a lot on your mind?</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Dump it all out — Rosie will sort it into tasks for you. ✨
                </p>
              </div>
              <div className="flex items-center gap-1 text-accent text-xs font-medium group-hover:gap-2 transition-all">
                Brain Dump <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </Link>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Today's tasks */}
          <div className="lg:col-span-2">
            <DashboardCard
              title="Today's Tasks"
              action={
                <Link href="/tasks">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs rounded-xl gap-1">
                    All tasks <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              }
            >
              {todayTasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-3">🎉</div>
                  <p className="font-medium text-foreground text-sm">Nothing due today!</p>
                  <p className="text-muted-foreground text-xs mt-1">Enjoy the peace, or add something new.</p>
                  <Button
                    onClick={handleAddTask}
                    size="sm"
                    className="mt-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl"
                    variant="ghost"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add task
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onEdit={handleEdit} compact />
                  ))}
                </div>
              )}
            </DashboardCard>
          </div>

          {/* Calendar events */}
          <div className="space-y-4">
            <DashboardCard
              title="Today"
              action={
                <Link href="/calendar">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs rounded-xl gap-1">
                    Calendar <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              }
            >
              {todayEvents.length === 0 ? (
                <div className="text-center py-4">
                  <CalendarDays className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No events today</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayEvents.map((event) => (
                    <div key={event.id} className={cn(
                      "flex items-center gap-3 p-2.5 rounded-xl border text-sm",
                      event.color
                    )}>
                      <div className="text-xs font-semibold whitespace-nowrap opacity-70">{event.time}</div>
                      <div className="font-medium text-xs truncate">{event.title}</div>
                    </div>
                  ))}
                </div>
              )}
            </DashboardCard>

            <DashboardCard title="Tomorrow">
              {tomorrowEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">Nothing yet</p>
              ) : (
                <div className="space-y-2">
                  {tomorrowEvents.map((event) => (
                    <div key={event.id} className={cn(
                      "flex items-center gap-3 p-2.5 rounded-xl border text-sm",
                      event.color
                    )}>
                      <div className="text-xs font-semibold whitespace-nowrap opacity-70">{event.time}</div>
                      <div className="font-medium text-xs truncate">{event.title}</div>
                    </div>
                  ))}
                </div>
              )}
            </DashboardCard>

            {/* Quick tip */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-4">
              <div className="flex gap-2.5">
                <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-primary">Rosie Tip</p>
                  <p className="text-xs text-primary/70 mt-0.5 leading-relaxed">
                    Connect Google Calendar to see all your events right here. Setup in Settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TaskModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditTask(null);
        }}
        task={editTask}
      />
    </AppShell>
  );
}
