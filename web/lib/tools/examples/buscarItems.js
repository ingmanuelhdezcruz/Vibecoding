import { createClient } from "@/lib/supabase/server"

// Busca artículos del catálogo del usuario por SKU o descripción.
export const buscarItems = {
  name: "buscar_items",
  description:
    "Busca artículos del catálogo (Producto, Ofertas o Lo más vendido) por coincidencia en SKU o descripción.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Texto a buscar en el SKU o la descripción.",
      },
    },
    required: ["query"],
    additionalProperties: false,
  },
  async execute({ query }) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("No autenticado")

    const { data, error } = await supabase
      .from("core_items")
      .select("id, sku, title, description, status, precio, categoria")
      .eq("user_id", user.id)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    if (error) throw new Error(error.message)
    return { ok: true, productos: data }
  },
}
