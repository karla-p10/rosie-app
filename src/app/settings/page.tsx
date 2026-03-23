"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SettingsSection, SettingsRow } from "@/components/SettingsSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera, Calendar, RefreshCw,
  CheckCircle2, ExternalLink, Plus, Trash2, Pencil, X, Check, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasks, COLOR_MAP, type Category } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/utils/supabase/client";

// Available color options for the category color picker
const COLOR_OPTIONS = Object.keys(COLOR_MAP) as string[];

function CategoryCard({ cat }: { cat: Category }) {
  const { tasks, updateCategory, deleteCategory } = useTasks();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(cat.name);
  const [editEmoji, setEditEmoji] = useState(cat.emoji);
  const [editColor, setEditColor] = useState(cat.color);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const usageCount = tasks.filter((t) => t.category === cat.id).length;
  const style = COLOR_MAP[cat.color] ?? COLOR_MAP.teal;

  const handleSave = () => {
    updateCategory(cat.id, { name: editName.trim() || cat.name, emoji: editEmoji, color: editColor });
    setEditing(false);
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteCategory(cat.id);
  };

  if (editing) {
    return (
      <div className="rounded-xl border-2 border-primary bg-primary/5 p-4 space-y-3">
        {/* Row 1: Emoji + Name */}
        <div className="flex items-center gap-3">
          <div className="space-y-1 shrink-0">
            <Label className="text-xs font-medium text-muted-foreground">Emoji</Label>
            <Input
              value={editEmoji}
              onChange={(e) => setEditEmoji(e.target.value)}
              className="w-14 h-10 rounded-xl text-center text-lg"
              maxLength={2}
            />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <Label className="text-xs font-medium text-muted-foreground">Name</Label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="rounded-xl h-10"
              placeholder="Category name"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
            />
          </div>
        </div>

        {/* Row 2: Color picker */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Color</Label>
          <div className="flex gap-2 flex-wrap">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                title={c}
                onClick={() => setEditColor(c)}
                className={cn(
                  "w-7 h-7 rounded-full transition-all border-2",
                  COLOR_MAP[c].dot,
                  editColor === c ? "border-foreground scale-110 ring-2 ring-primary/20" : "border-transparent"
                )}
              />
            ))}
          </div>
        </div>

        {/* Row 3: Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            className="rounded-xl bg-primary text-white flex-1"
            onClick={handleSave}
          >
            <Check className="w-4 h-4 mr-1" /> Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl flex-1"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card active:bg-muted/50 transition-colors">
      {/* Badge preview */}
      <span className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        style.bg, style.text
      )}>
        <span>{cat.emoji}</span>
        <span>{cat.name}</span>
      </span>

      {/* Color dot */}
      <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", style.dot)} />

      {/* Usage count */}
      <span className="text-xs text-muted-foreground flex-1">{usageCount} task{usageCount !== 1 ? "s" : ""}</span>

      {/* Actions — always visible on mobile */}
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
          onClick={() => { setEditing(true); setEditName(cat.name); setEditEmoji(cat.emoji); setEditColor(cat.color); setConfirmDelete(false); }}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-destructive font-medium whitespace-nowrap">
              {usageCount > 0 ? `${usageCount} tasks!` : "Delete?"}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 rounded-lg text-destructive hover:bg-destructive/10 text-xs"
              onClick={handleDelete}
            >
              Yes
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 rounded-lg text-muted-foreground text-xs"
              onClick={() => setConfirmDelete(false)}
            >
              No
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function AddCategoryRow() {
  const { addCategory } = useTasks();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📌");
  const [color, setColor] = useState("teal");

  const handleAdd = () => {
    if (!name.trim()) return;
    addCategory({ name: name.trim(), emoji, color });
    setName("");
    setEmoji("📌");
    setColor("teal");
    setOpen(false);
  };

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl gap-1.5 text-muted-foreground w-full border-dashed h-11"
        onClick={() => setOpen(true)}
      >
        <Plus className="w-4 h-4" />
        Add Category
      </Button>
    );
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-primary bg-primary/5 p-4 space-y-3">
      {/* Row 1: Emoji + Name */}
      <div className="flex items-center gap-3">
        <div className="space-y-1 shrink-0">
          <Label className="text-xs font-medium text-muted-foreground">Emoji</Label>
          <Input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            className="w-14 h-10 rounded-xl text-center text-lg"
            maxLength={2}
            placeholder="📌"
          />
        </div>
        <div className="space-y-1 flex-1 min-w-0">
          <Label className="text-xs font-medium text-muted-foreground">Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl h-10"
            placeholder="e.g. Appointments, School, Fitness..."
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setOpen(false); }}
          />
        </div>
      </div>

      {/* Row 2: Color picker */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Color</Label>
        <div className="flex gap-2 flex-wrap">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              title={c}
              onClick={() => setColor(c)}
              className={cn(
                "w-7 h-7 rounded-full transition-all border-2",
                COLOR_MAP[c].dot,
                color === c ? "border-foreground scale-110 ring-2 ring-primary/20" : "border-transparent"
              )}
            />
          ))}
        </div>
      </div>

      {/* Row 3: Preview + Actions */}
      <div className="flex items-center gap-3 pt-1">
        {name.trim() && (
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
            (COLOR_MAP[color] ?? COLOR_MAP.teal).bg,
            (COLOR_MAP[color] ?? COLOR_MAP.teal).text,
          )}>
            <span>{emoji}</span>
            <span>{name.trim()}</span>
          </span>
        )}
        <div className="flex gap-2 ml-auto">
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl"
            onClick={() => { setOpen(false); setName(""); setEmoji("📌"); setColor("teal"); }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="rounded-xl bg-primary text-white"
            onClick={handleAdd}
            disabled={!name.trim()}
          >
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { categories } = useTasks();
  const { user, profile, signOut, refreshProfile } = useAuth();

  const [name, setName] = useState(
    profile?.display_name ||
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.email ? user.email.split("@")[0] : "") ||
    ""
  );
  const [email] = useState(profile?.email || user?.email || "");
  const [notifications, setNotifications] = useState({
    taskReminders: true,
    dailyDigest: true,
    weeklyReview: false,
    calendarSync: false,
  });
  const [theme, setTheme] = useState("system");
  const [calendarConnected] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (user) {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({ display_name: name.trim(), updated_at: new Date().toISOString() })
        .eq("id", user.id);
      await refreshProfile();
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell>
      <div className="p-6 max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your profile and preferences</p>
        </div>

        {/* Profile */}
        <SettingsSection
          title="Profile"
          description="Your personal information"
        >
          <div className="px-6 py-5 space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-16 h-16 overflow-hidden">
                  {(profile?.avatar_url || (user?.user_metadata?.avatar_url as string | undefined)) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile?.avatar_url || (user?.user_metadata?.avatar_url as string)}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-primary text-white text-xl font-bold">
                      {name.charAt(0) || "?"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <button className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-background shadow-sm hover:bg-primary/90 transition-colors">
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{name || "Your Name"}</p>
                <p className="text-xs text-muted-foreground">{email}</p>
                <button className="text-xs text-primary hover:underline mt-0.5">Change photo</button>
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Display Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl"
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Email</Label>
                <Input
                  value={email}
                  readOnly
                  className="rounded-xl bg-muted/50 text-muted-foreground cursor-not-allowed"
                  type="email"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <Button
              onClick={handleSave}
              className={cn(
                "rounded-xl gap-2 transition-all",
                saved
                  ? "bg-emerald-600 hover:bg-emerald-600"
                  : "bg-primary hover:bg-primary/90"
              )}
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </SettingsSection>

        {/* Categories */}
        <SettingsSection
          title="Categories"
          description="Organize tasks with custom categories"
        >
          <div className="px-6 py-5 space-y-2">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} cat={cat} />
            ))}
            <div className="pt-1">
              <AddCategoryRow />
            </div>
          </div>
        </SettingsSection>

        {/* Google Calendar */}
        <SettingsSection
          title="Integrations"
          description="Connect your external services"
        >
          <div className="px-6 py-5">
            <div className={cn(
              "rounded-2xl border p-4",
              calendarConnected ? "border-emerald-200 bg-emerald-50" : "border-blue-200 bg-blue-50"
            )}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm border border-border flex-shrink-0 mt-0.5">
                    <Calendar className="w-4.5 h-4.5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">Google Calendar</p>
                      {calendarConnected && (
                        <span className="text-[10px] bg-emerald-200 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">
                          Connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {calendarConnected
                        ? "Your Google Calendar is synced. Events appear automatically."
                        : "Sync your Google Calendar to see all events alongside your tasks."}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={calendarConnected ? "outline" : "default"}
                  className={cn(
                    "rounded-xl gap-1.5 text-xs flex-shrink-0",
                    !calendarConnected && "bg-blue-600 hover:bg-blue-700 text-white"
                  )}
                >
                  {calendarConnected ? (
                    <>
                      <RefreshCw className="w-3 h-3" /> Sync now
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-3 h-3" /> Connect
                    </>
                  )}
                </Button>
              </div>

              {!calendarConnected && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-[11px] text-blue-600">
                    🔒 Secure OAuth 2.0 connection. Rosie only reads your calendar — it never modifies events without your permission.
                  </p>
                </div>
              )}
            </div>
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection
          title="Notifications"
          description="Choose what you hear about"
        >
          <SettingsRow
            label="Task Reminders"
            description="Get notified before tasks are due"
          >
            <Switch
              checked={notifications.taskReminders}
              onCheckedChange={(v) => setNotifications({ ...notifications, taskReminders: v })}
            />
          </SettingsRow>
          <SettingsRow
            label="Daily Digest"
            description="Morning summary of the day ahead"
          >
            <Switch
              checked={notifications.dailyDigest}
              onCheckedChange={(v) => setNotifications({ ...notifications, dailyDigest: v })}
            />
          </SettingsRow>
          <SettingsRow
            label="Weekly Review"
            description="Sunday recap of what you accomplished"
          >
            <Switch
              checked={notifications.weeklyReview}
              onCheckedChange={(v) => setNotifications({ ...notifications, weeklyReview: v })}
            />
          </SettingsRow>
          <SettingsRow
            label="Calendar Sync Alerts"
            description="Know when calendar sync completes or fails"
          >
            <Switch
              checked={notifications.calendarSync}
              onCheckedChange={(v) => setNotifications({ ...notifications, calendarSync: v })}
            />
          </SettingsRow>
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection
          title="Appearance"
          description="Make Rosie look how you like it"
        >
          <SettingsRow
            label="Theme"
            description="Light, dark, or follow your system"
          >
            <Select value={theme} onValueChange={(v) => setTheme(v ?? "system")}>
              <SelectTrigger className="w-32 rounded-xl h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="light">☀️ Light</SelectItem>
                <SelectItem value="dark">🌙 Dark</SelectItem>
                <SelectItem value="system">💻 System</SelectItem>
              </SelectContent>
            </Select>
          </SettingsRow>
          <SettingsRow
            label="Accent Color"
            description="Your Rosie brand color"
          >
            <div className="flex gap-2">
              {[
                { color: "#5BB5A2", name: "Teal" },
                { color: "#6366f1", name: "Indigo" },
                { color: "#ec4899", name: "Pink" },
                { color: "#f59e0b", name: "Amber" },
              ].map(({ color, name }) => (
                <button
                  key={name}
                  title={name}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                    color === "#5BB5A2" ? "border-foreground scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </SettingsRow>
        </SettingsSection>

        {/* Account */}
        <SettingsSection title="Account">
          <SettingsRow label="Sign Out" description="Sign out of your Rosie account">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={() => signOut()}
            >
              <LogOut className="w-3 h-3" /> Sign Out
            </Button>
          </SettingsRow>
          <SettingsRow label="Privacy Policy" description="How we handle your data">
            <Button variant="ghost" size="sm" className="rounded-xl text-xs gap-1 text-muted-foreground">
              View <ExternalLink className="w-3 h-3" />
            </Button>
          </SettingsRow>
          <SettingsRow label="Export Data" description="Download all your tasks">
            <Button variant="outline" size="sm" className="rounded-xl text-xs">
              Export CSV
            </Button>
          </SettingsRow>
          <SettingsRow label="Delete Account" description="Permanently remove your account">
            <Button variant="outline" size="sm" className="rounded-xl text-xs text-destructive border-destructive/30 hover:bg-destructive/5">
              Delete
            </Button>
          </SettingsRow>
        </SettingsSection>

        {/* Version footer */}
        <p className="text-center text-xs text-muted-foreground py-2">
          Rosie v1.0.0 · Made with ❤️ for busy moms
        </p>
      </div>
    </AppShell>
  );
}
