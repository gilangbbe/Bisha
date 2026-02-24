import { supabase } from "./supabase";
import { Process, ProcessFormData } from "@/types";
import { v4 as uuidv4 } from "uuid";

export async function getAllProcesses(): Promise<Process[]> {
    const { data, error } = await supabase
        .from("processes")
        .select("*")
        .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getProcessById(id: string): Promise<Process | null> {
    const { data, error } = await supabase
        .from("processes")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
    }
    return data;
}

export async function getProcessesByIds(ids: string[]): Promise<Process[]> {
    if (ids.length === 0) return [];
    const { data, error } = await supabase
        .from("processes")
        .select("*")
        .in("id", ids);

    if (error) throw error;
    return data || [];
}

export async function createProcess(formData: ProcessFormData): Promise<Process> {
    const now = new Date().toISOString();
    const process = {
        id: uuidv4(),
        ...formData,
        created_at: now,
        updated_at: now,
    };

    const { data, error } = await supabase
        .from("processes")
        .insert(process)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateProcess(
    id: string,
    formData: Partial<ProcessFormData>
): Promise<Process> {
    const { data, error } = await supabase
        .from("processes")
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

export async function deleteProcess(id: string): Promise<void> {
    const { error } = await supabase.from("processes").delete().eq("id", id);
    if (error) throw error;

    // Remove from any other process's confused_with
    const { data: allProcesses } = await supabase
        .from("processes")
        .select("id, confused_with")
        .contains("confused_with", [id]);

    if (allProcesses) {
        for (const p of allProcesses) {
            await supabase
                .from("processes")
                .update({
                    confused_with: (p.confused_with as string[]).filter((pid: string) => pid !== id),
                    updated_at: new Date().toISOString(),
                })
                .eq("id", p.id);
        }
    }
}
