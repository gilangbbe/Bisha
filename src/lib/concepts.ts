import { supabase } from "./supabase";
import { Concept, ConceptFormData } from "@/types";
import { v4 as uuidv4 } from "uuid";

export async function getAllConcepts(): Promise<Concept[]> {
    const { data, error } = await supabase
        .from("concepts")
        .select("*")
        .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getConceptById(id: string): Promise<Concept | null> {
    const { data, error } = await supabase
        .from("concepts")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
    }
    return data;
}

export async function getConceptsByIds(ids: string[]): Promise<Concept[]> {
    if (ids.length === 0) return [];
    const { data, error } = await supabase
        .from("concepts")
        .select("*")
        .in("id", ids);

    if (error) throw error;
    return data || [];
}

export async function createConcept(formData: ConceptFormData): Promise<Concept> {
    const now = new Date().toISOString();
    const concept = {
        id: uuidv4(),
        ...formData,
        created_at: now,
        updated_at: now,
    };

    const { data, error } = await supabase
        .from("concepts")
        .insert(concept)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateConcept(
    id: string,
    formData: Partial<ConceptFormData>
): Promise<Concept> {
    const { data, error } = await supabase
        .from("concepts")
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

export async function deleteConcept(id: string): Promise<void> {
    const { error } = await supabase.from("concepts").delete().eq("id", id);
    if (error) throw error;

    // Also remove this concept from any other concept's confused_with
    const { data: allConcepts } = await supabase
        .from("concepts")
        .select("id, confused_with")
        .contains("confused_with", [id]);

    if (allConcepts) {
        for (const c of allConcepts) {
            await supabase
                .from("concepts")
                .update({
                    confused_with: (c.confused_with as string[]).filter((cid: string) => cid !== id),
                    updated_at: new Date().toISOString(),
                })
                .eq("id", c.id);
        }
    }
}

export async function searchConcepts(query: string): Promise<Concept[]> {
    const { data, error } = await supabase
        .from("concepts")
        .select("*")
        .ilike("title", `%${query}%`)
        .order("title");

    if (error) throw error;
    return data || [];
}
