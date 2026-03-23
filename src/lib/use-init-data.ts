"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "./auth-context";
import { useTasks, DEFAULT_CATEGORIES, dbTaskToFrontend, dbCategoryToFrontend } from "./store";
import { createClient } from "@/utils/supabase/client";

export function useInitData() {
  const { user } = useAuth();
  const { setTasks, setCategories, setUserId, setInitialized, clearStore } = useTasks();
  // Track the last userId we initialized for, to avoid double-init
  const lastInitUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      clearStore();
      lastInitUserId.current = null;
      return;
    }

    // Don't re-init for the same user
    if (lastInitUserId.current === user.id) return;
    lastInitUserId.current = user.id;

    const init = async () => {
      const supabase = createClient();

      try {
        // ── 1. Fetch categories ──────────────────────────────────────────
        const { data: cats, error: catError } = await supabase
          .from("categories")
          .select("*")
          .eq("user_id", user.id)
          .order("sort_order", { ascending: true });

        if (catError) {
          console.error("[init] fetch categories error:", catError.message);
        }

        let dbCategories = cats ?? [];

        // ── 2. Seed default categories if none ───────────────────────────
        if (dbCategories.length === 0) {
          const toInsert = DEFAULT_CATEGORIES.map((c, i) => ({
            user_id: user.id,
            name: c.name,
            emoji: c.emoji,
            color: c.color,
            sort_order: i,
          }));

          const { data: inserted, error: insertError } = await supabase
            .from("categories")
            .insert(toInsert)
            .select();

          if (insertError) {
            console.error("[init] seed categories error:", insertError.message);
          }

          dbCategories = inserted ?? [];
        }

        const frontendCats = dbCategories.map(dbCategoryToFrontend);

        // ── 3. Fetch tasks ───────────────────────────────────────────────
        const { data: dbTasks, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (tasksError) {
          console.error("[init] fetch tasks error:", tasksError.message);
        }

        const frontendTasks = (dbTasks ?? []).map(dbTaskToFrontend);

        // ── 4. Hydrate store ─────────────────────────────────────────────
        setUserId(user.id);
        setCategories(frontendCats);
        setTasks(frontendTasks);
        setInitialized(true);
      } catch (err) {
        console.error("[init] unexpected error:", err);
        setInitialized(true); // still mark initialized to avoid infinite spinner
      }
    };

    init();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
}
