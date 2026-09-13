"use server"

import { revalidatePath } from "next/cache"
import config from "@/config"
import { createClient } from "@/lib/supabase/server"

// CRUD de productos para el hogar (tabla core_items) vía Server Actions.
// La RLS de Supabase ya garantiza que cada quien solo toca
// sus filas; aun así filtramos por user_id como defensa
// en profundidad.

const TIPOS = new Set(config.dashboard.tipos.map((t) => t.value))
const DISPONIBILIDADES = new Set(
  config.dashboard.disponibilidades.map((d) => d.value),
)

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")
  return { supabase, user }
}

function parseProducto(formData) {
  const skuRaw = formData.get("sku")?.toString().trim()
  const descripcion = formData.get("descripcion")?.toString().trim()
  const tipo = formData.get("tipo")?.toString()
  const disponibilidad =
    formData.get("disponibilidad")?.toString() || "entrega_inmediata"
  const precioRaw = formData.get("precio")?.toString().trim()
  const sku = skuRaw === "" ? null : Number(skuRaw)
  const precio = precioRaw === "" ? null : Number(precioRaw)

  if (sku === null || !Number.isFinite(sku) || sku < 0) return null
  if (!descripcion) return null
  if (!TIPOS.has(tipo)) return null
  if (!DISPONIBILIDADES.has(disponibilidad)) return null
  if (precio === null || !Number.isFinite(precio) || precio < 0) return null

  return {
    title: String(sku),
    sku,
    description: descripcion,
    categoria: tipo,
    status: disponibilidad,
    precio,
  }
}

export async function createItem(formData) {
  const producto = parseProducto(formData)
  if (!producto) return

  const { supabase, user } = await requireUser()
  await supabase.from("core_items").insert({
    user_id: user.id,
    ...producto,
  })
  revalidatePath("/dashboard")
}

export async function updateItem(formData) {
  const id = formData.get("id")?.toString()
  const producto = parseProducto(formData)
  if (!id || !producto) return

  const { supabase, user } = await requireUser()
  await supabase
    .from("core_items")
    .update(producto)
    .eq("id", id)
    .eq("user_id", user.id)
  revalidatePath("/dashboard")
}

export async function deleteItem(formData) {
  const id = formData.get("id")?.toString()
  if (!id) return

  const { supabase, user } = await requireUser()
  await supabase
    .from("core_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
  revalidatePath("/dashboard")
}
