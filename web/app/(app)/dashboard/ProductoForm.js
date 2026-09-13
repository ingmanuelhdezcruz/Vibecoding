import config from "@/config"

export default function ProductoForm({
  action,
  producto,
  submitLabel,
  className = "",
}) {
  const fields = config.dashboard.fields
  const isEdit = Boolean(producto)

  return (
    <form action={action} className={className}>
      {isEdit ? <input type="hidden" name="id" value={producto.id} /> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="form-control w-full">
          <span className="label-text mb-1 text-sm font-medium">
            {fields.tipo.label}
          </span>
          <select
            name="tipo"
            required
            defaultValue={producto?.categoria ?? "producto"}
            aria-label={fields.tipo.label}
            className="select select-bordered w-full"
          >
            {config.dashboard.tipos.map((opcion) => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-control w-full">
          <span className="label-text mb-1 text-sm font-medium">
            {fields.sku.label}
          </span>
          <input
            name="sku"
            type="number"
            required
            min="0"
            step="1"
            defaultValue={producto?.sku ?? ""}
            placeholder={fields.sku.placeholder}
            aria-label={fields.sku.label}
            className="input input-bordered w-full"
          />
        </label>

        <label className="form-control w-full sm:col-span-2">
          <span className="label-text mb-1 text-sm font-medium">
            {fields.descripcion.label}
          </span>
          <textarea
            name="descripcion"
            required
            rows={3}
            maxLength={500}
            defaultValue={producto?.description ?? ""}
            placeholder={fields.descripcion.placeholder}
            aria-label={fields.descripcion.label}
            className="textarea textarea-bordered w-full"
          />
        </label>

        <label className="form-control w-full">
          <span className="label-text mb-1 text-sm font-medium">
            {fields.precio.label}
          </span>
          <input
            name="precio"
            type="number"
            required
            min="0"
            step="0.01"
            defaultValue={producto?.precio ?? ""}
            placeholder={fields.precio.placeholder}
            aria-label={fields.precio.label}
            className="input input-bordered w-full"
          />
        </label>

        <label className="form-control w-full">
          <span className="label-text mb-1 text-sm font-medium">
            {fields.disponibilidad.label}
          </span>
          <select
            name="disponibilidad"
            required
            defaultValue={producto?.status ?? "entrega_inmediata"}
            aria-label={fields.disponibilidad.label}
            className="select select-bordered w-full"
          >
            {config.dashboard.disponibilidades.map((opcion) => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end sm:col-span-2">
          <button type="submit" className="btn btn-primary">
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  )
}
