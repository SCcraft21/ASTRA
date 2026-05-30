import { createClient } from "@supabase/supabase-js";

// Retrieve configuration dynamically with VITE_ prefixes
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Clean types representing our synced system records
export interface ContextLayer {
  id: string;
  title: string;
  description: string;
  updated: string;
  active: boolean;
}

export interface LearnedInsight {
  id: string;
  title: string;
  content: string;
  match: number;
  type: string;
  date: string;
}

export interface DeveloperKey {
  id: string;
  name: string;
  scope: string;
  token: string;
  created: string;
}

/**
 * DB helper class that falls back gracefully to localStorage if Supabase details are missing,
 * providing the user with a fluid offline playground while informing them how to connect their DB.
 */
export const supabaseDb = {
  async getContexts(userId: string): Promise<ContextLayer[]> {
    if (!isSupabaseConfigured || !supabase) {
      const local = localStorage.getItem(`supa_${userId}_contexts`);
      return local ? JSON.parse(local) : [];
    }

    try {
      const { data, error } = await supabase
        .from("contexts")
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      return (data || []) as ContextLayer[];
    } catch (err) {
      console.warn("Supabase fetch failed, falling back to local storage:", err);
      const local = localStorage.getItem(`supa_${userId}_contexts`);
      return local ? JSON.parse(local) : [];
    }
  },

  async saveContext(userId: string, context: ContextLayer): Promise<void> {
    // Sync localStorage as backup/main
    const contexts = await this.getContexts(userId);
    const updated = contexts.filter((c) => c.id !== context.id);
    updated.push(context);
    localStorage.setItem(`supa_${userId}_contexts`, JSON.stringify(updated));

    if (!isSupabaseConfigured || !supabase) return;

    try {
      await supabase.from("contexts").upsert({
        id: context.id,
        user_id: userId,
        title: context.title,
        description: context.description,
        updated: context.updated,
        active: context.active,
      });
    } catch (err) {
      console.error("Supabase upsert contexts error:", err);
    }
  },

  async getInsights(userId: string): Promise<LearnedInsight[]> {
    if (!isSupabaseConfigured || !supabase) {
      const local = localStorage.getItem(`supa_${userId}_insights`);
      return local ? JSON.parse(local) : [];
    }

    try {
      const { data, error } = await supabase
        .from("insights")
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      return (data || []) as LearnedInsight[];
    } catch (err) {
      console.warn("Supabase fetch insights failed, falling back to local:", err);
      const local = localStorage.getItem(`supa_${userId}_insights`);
      return local ? JSON.parse(local) : [];
    }
  },

  async saveInsight(userId: string, insight: LearnedInsight): Promise<void> {
    const insights = await this.getInsights(userId);
    const updated = insights.filter((i) => i.id !== insight.id);
    updated.unshift(insight);
    localStorage.setItem(`supa_${userId}_insights`, JSON.stringify(updated));

    if (!isSupabaseConfigured || !supabase) return;

    try {
      await supabase.from("insights").upsert({
        id: insight.id,
        user_id: userId,
        title: insight.title,
        content: insight.content,
        match: insight.match,
        type: insight.type,
        date: insight.date,
      });
    } catch (err) {
      console.error("Supabase upsert insights error:", err);
    }
  },

  async getDeveloperKeys(userId: string): Promise<DeveloperKey[]> {
    if (!isSupabaseConfigured || !supabase) {
      const local = localStorage.getItem(`supa_${userId}_developer_keys`);
      return local ? JSON.parse(local) : [];
    }

    try {
      const { data, error } = await supabase
        .from("developer_keys")
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      return (data || []) as DeveloperKey[];
    } catch (err) {
      console.warn("Supabase fetch developer keys failed, falling back:", err);
      const local = localStorage.getItem(`supa_${userId}_developer_keys`);
      return local ? JSON.parse(local) : [];
    }
  },

  async saveDeveloperKey(userId: string, key: DeveloperKey): Promise<void> {
    const keys = await this.getDeveloperKeys(userId);
    const updated = keys.filter((k) => k.id !== key.id);
    updated.unshift(key);
    localStorage.setItem(`supa_${userId}_developer_keys`, JSON.stringify(updated));

    if (!isSupabaseConfigured || !supabase) return;

    try {
      await supabase.from("developer_keys").upsert({
        id: key.id,
        user_id: userId,
        name: key.name,
        scope: key.scope,
        token: key.token,
        created: key.created,
      });
    } catch (err) {
      console.error("Supabase upsert developer_keys error:", err);
    }
  },

  async deleteDeveloperKey(userId: string, id: string): Promise<void> {
    const keys = await this.getDeveloperKeys(userId);
    const updated = keys.filter((k) => k.id !== id);
    localStorage.setItem(`supa_${userId}_developer_keys`, JSON.stringify(updated));

    if (!isSupabaseConfigured || !supabase) return;

    try {
      await supabase
        .from("developer_keys")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
    } catch (err) {
      console.error("Supabase delete developer_key error:", err);
    }
  },
};
