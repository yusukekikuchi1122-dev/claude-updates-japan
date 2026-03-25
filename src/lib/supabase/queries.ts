import { createSupabaseClient } from "./client";
import type { Entry, EntryWithCategories } from "./types";

function getSupabase() {
  return createSupabaseClient();
}

export async function getEntries(options: {
  page?: number;
  perPage?: number;
  categoryId?: string;
}): Promise<{ entries: readonly EntryWithCategories[]; total: number }> {
  const { page = 1, perPage = 20, categoryId } = options;
  const offset = (page - 1) * perPage;

  const supabase = getSupabase();
  let query = supabase
    .from("entries")
    .select("*, entry_categories(category_id), sources(name)", {
      count: "exact",
    })
    .order("published_at", { ascending: false })
    .range(offset, offset + perPage - 1);

  if (categoryId) {
    query = query.eq("entry_categories.category_id", categoryId);
  }

  const { data, count, error } = await query;
  if (error) throw error;

  const entries = (data ?? []).map(mapEntryWithCategories);
  return { entries, total: count ?? 0 };
}

export async function getEntryById(
  id: string
): Promise<EntryWithCategories | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("entries")
    .select("*, entry_categories(category_id), sources(name)")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return mapEntryWithCategories(data);
}

export async function searchEntries(
  query: string,
  page = 1,
  perPage = 20
): Promise<{ entries: readonly EntryWithCategories[]; total: number }> {
  const offset = (page - 1) * perPage;
  const pattern = `%${query}%`;

  const supabase = getSupabase();
  const { data, count, error } = await supabase
    .from("entries")
    .select("*, entry_categories(category_id), sources(name)", {
      count: "exact",
    })
    .or(`title_ja.ilike.${pattern},summary_ja.ilike.${pattern}`)
    .order("published_at", { ascending: false })
    .range(offset, offset + perPage - 1);

  if (error) throw error;

  const entries = (data ?? []).map(mapEntryWithCategories);
  return { entries, total: count ?? 0 };
}

export async function insertEntry(entry: {
  source_id: string;
  source_url: string;
  title: string;
  title_ja: string | null;
  summary_ja: string | null;
  content_raw: string | null;
  author: string | null;
  published_at: string;
  categories: readonly string[];
}): Promise<Entry | null> {
  const supabase = getSupabase();
  // Check for duplicate
  const { data: existing } = await supabase
    .from("entries")
    .select("id")
    .eq("source_url", entry.source_url)
    .single();

  if (existing) return null;

  const { categories, ...entryData } = entry;

  const { data, error } = await supabase
    .from("entries")
    .insert(entryData)
    .select()
    .single();

  if (error) throw error;

  if (categories.length > 0) {
    const categoryRows = categories.map((categoryId) => ({
      entry_id: data.id,
      category_id: categoryId,
    }));
    await supabase.from("entry_categories").insert(categoryRows);
  }

  return data;
}

function mapEntryWithCategories(row: Record<string, unknown>): EntryWithCategories {
  const entryCategories = row.entry_categories as
    | { category_id: string }[]
    | null;
  const source = row.sources as { name: string } | null;

  const { entry_categories: _, sources: __, ...entry } = row;

  return {
    ...(entry as unknown as Entry),
    categories: entryCategories?.map((ec) => ec.category_id) ?? [],
    source_name: source?.name ?? undefined,
  };
}
