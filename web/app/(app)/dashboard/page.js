import { Pencil, Trash2 } from "lucide-react"
import config from "@/config"
import { createClient } from "@/lib/supabase/server"
import { createItem, updateItem, deleteItem } from "./actions"
import ProductoForm from "./ProductoForm"

export const metadata = { title: "Productos para el hogar" }

function etiqueta(opciones, valor) {
  return opciones.find((o) => o.value === valor)?.label ?? valor
}

function formatearPrecio(precio) {
  if (precio == null || precio === "") return "—"
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(precio))
}

function badgeDisponibilidad(status) {
  if (status === "entrega_inmediata") return "badge-success"
  if (status === "no_disponible") return "badge-error"
  if (status === "bajo_pedido") return "badge-warning"
  return "badge-ghost"
}

export default async function DashboardPage() {
  const copy = config.dashboard
  const supabase = await createClient()
  const { data: productos, error } = await supabase
    .from("core_items")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{copy.title}</h1>
        <p className="mt-1 text-sm text-base-content/70">{copy.subtitle}</p>
      </div>

      <section className="rounded-box border border-base-200 bg-base-100 p-4">
        <h2 className="mb-3 text-sm font-semibold">{copy.createTitle}</h2>
        <ProductoForm action={createItem} submitLabel={copy.submitCreate} />
      </section>

      {error && (
        <div className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          {copy.loadError}: {error.message}
        </div>
      )}

      {!productos?.length ? (
        <div className="rounded-box border border-dashed border-base-300 bg-base-100 px-4 py-12 text-center text-base-content/60">
          {copy.empty}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-box border border-base-200 bg-base-100">
          <table className="table">
            <thead>
              <tr>
                <th>{copy.fields.tipo.label}</th>
                <th>{copy.fields.sku.label}</th>
                <th>{copy.fields.descripcion.label}</th>
                <th>{copy.fields.precio.label}</th>
                <th>{copy.fields.disponibilidad.label}</th>
                <th className="w-12" />
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id} className="align-top">
                  <td className="whitespace-nowrap">
                    <span className="badge badge-sm badge-ghost">
                      {etiqueta(copy.tipos, producto.categoria)}
                    </span>
                  </td>
                  <td className="font-medium">
                    {producto.sku ?? producto.title}
                  </td>
                  <td className="max-w-sm text-sm text-base-content/70">
                    {producto.description || "—"}
                  </td>
                  <td className="whitespace-nowrap font-semibold">
                    {formatearPrecio(producto.precio)}
                  </td>
                  <td>
                    <span
                      className={`badge badge-sm ${badgeDisponibilidad(producto.status)}`}
                    >
                      {etiqueta(copy.disponibilidades, producto.status)}
                    </span>
                  </td>
                  <td>
                    <form action={deleteItem}>
                      <input type="hidden" name="id" value={producto.id} />
                      <button
                        type="submit"
                        className="btn btn-ghost btn-sm btn-square text-error"
                        title={copy.deleteLabel}
                        aria-label={`${copy.deleteLabel}: ${producto.sku ?? producto.title}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="space-y-2 border-t border-base-200 p-4">
            {productos.map((producto) => (
              <details
                key={`${producto.id}-edit`}
                className="rounded-box border border-base-200 px-3 py-2"
              >
                <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-base-content/70">
                  <Pencil className="size-3.5" />
                  {copy.editLabel} · {etiqueta(copy.tipos, producto.categoria)} ·
                  SKU {producto.sku ?? producto.title}
                </summary>
                <div className="mt-3 border-t border-base-200 pt-3">
                  <ProductoForm
                    action={updateItem}
                    producto={producto}
                    submitLabel={copy.submitUpdate}
                  />
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
