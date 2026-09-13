import { createClient } from "@/lib/supabase/server"

// Crea un artículo del catálogo (tabla core_items) del usuario autenticado.
export const crearItem = {
  name: "crear_item",
  description:
    "Crea un artículo en el catálogo de productos para el hogar (Producto, Ofertas o Lo más vendido).",
  parameters: {
    type: "object",
    properties: {
      sku: { type: "number", description: "SKU numérico del artículo." },
      descripcion: {
        type: "string",
        description: "Descripción del artículo.",
      },
      precio: { type: "number", description: "Precio en MXN." },
      tipo: {
        type: "string",
        description: "Tipo: producto, ofertas o lo_mas_vendido.",
      },
      disponibilidad: {
        type: "string",
        description:
          "Disponibilidad: entrega_inmediata, bajo_pedido o no_disponible.",
      },
    },
    required: ["sku", "descripcion", "precio"],
    additionalProperties: false,
  },
  async execute({
    sku,
    descripcion,
    precio,
    tipo = "producto",
    disponibilidad = "entrega_inmediata",
  }) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("No autenticado")

    const { data, error } = await supabase
      .from("core_items")
      .insert({
        user_id: user.id,
        title: String(sku),
        sku,
        description: descripcion,
        precio,
        categoria: tipo,
        status: disponibilidad,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return { ok: true, producto: data }
  },
}
