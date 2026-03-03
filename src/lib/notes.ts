import { supabase } from "./supabase";
import { Note, NoteFormData } from "@/types";
import { v4 as uuidv4 } from "uuid";

export async function getAllNotes(): Promise<Note[]> {
    const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getNoteById(id: string): Promise<Note | null> {
    const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
    }
    return data;
}

export async function createNote(formData: NoteFormData): Promise<Note> {
    const now = new Date().toISOString();
    const note = {
        id: uuidv4(),
        ...formData,
        created_at: now,
        updated_at: now,
    };

    const { data, error } = await supabase
        .from("notes")
        .insert(note)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateNote(
    id: string,
    formData: Partial<NoteFormData>
): Promise<Note> {
    const { data, error } = await supabase
        .from("notes")
        .update({
            ...formData,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteNote(id: string): Promise<void> {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) throw error;
}
