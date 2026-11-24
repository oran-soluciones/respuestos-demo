import { Link } from "react-router-dom"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatearMoneda, formatearNumero } from "@/lib/format"
import type { Producto } from "@/lib/types"

export type FilaRepuesto = {
  id: string
  productoId: string
  nombre: string
  cantidad: string
  precioUnitario: number
}

export function RepuestosServicio({
  filas,
  productos,
  editable = false,
  alCambiarFilas,
  manoDeObra = "0",
  alCambiarManoDeObra,
}: {
  filas: FilaRepuesto[]
  productos: Producto[]
  editable?: boolean
  alCambiarFilas?: (filas: FilaRepuesto[]) => void
  manoDeObra?: string
  alCambiarManoDeObra?: (valor: string) => void
}) {
  const costoRepuestos = filas.reduce(
    (total, fila) => total + (Number(fila.cantidad) || 0) * fila.precioUnitario,
    0,
  )
  const total = costoRepuestos + (Number(manoDeObra) || 0)

  function cambiar(indice: number, parcial: Partial<FilaRepuesto>) {
    alCambiarFilas?.(filas.map((fila, i) => (i === indice ? { ...fila, ...parcial } : fila)))
  }

  function agregar() {
    alCambiarFilas?.([
      ...filas,
      { id: `fila-${Date.now()}-${filas.length}`, productoId: "", nombre: "", cantidad: "1", precioUnitario: 0 },
    ])
  }

  return (
    <div className="space-y-3">
      {filas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
          Sin repuestos asignados
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">Repuesto</th>
                <th scope="col" className="w-24 px-4 py-2.5 text-right font-medium">Cant.</th>
                <th scope="col" className="w-32 px-4 py-2.5 text-right font-medium">P. unitario</th>
                <th scope="col" className="w-32 px-4 py-2.5 text-right font-medium">Subtotal</th>
                {editable && <th scope="col" className="w-12 px-2 py-2.5"><span className="sr-only">Acciones</span></th>}
              </tr>
            </thead>
            <tbody>
              {filas.map((fila, indice) => (
                <tr key={fila.id} className="border-t border-border">
                  <td className="max-w-[260px] px-4 py-2.5">
                    {editable ? (
                      <Select
                        value={fila.productoId}
                        onValueChange={(valor) => {
                          const producto = productos.find((item) => item.id === valor)
                          cambiar(indice, {
                            productoId: valor,
                            nombre: producto?.nombre ?? "",
                            precioUnitario: producto?.precio ?? 0,
                          })
                        }}
                      >
                        <SelectTrigger aria-label={`Repuesto ${indice + 1}`}>
                          <SelectValue placeholder="Elegir repuesto" />
                        </SelectTrigger>
                        <SelectContent>
                          {productos.map((producto) => (
                            <SelectItem key={producto.id} value={producto.id}>
                              {producto.nombre} · {formatearMoneda(producto.precio)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : fila.productoId ? (
                      <Link className="truncate hover:underline" to={`/productos/${fila.productoId}`}>
                        {fila.nombre}
                      </Link>
                    ) : (
                      <span className="truncate">{fila.nombre || "—"}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {editable ? (
                      <Input
                        aria-label={`Cantidad del repuesto ${indice + 1}`}
                        type="number" min={1} inputMode="numeric" className="tabular h-11 w-full"
                        value={fila.cantidad}
                        onChange={(evento) => cambiar(indice, { cantidad: evento.target.value })}
                      />
                    ) : (
                      <span className="tabular">{formatearNumero(Number(fila.cantidad) || 0)}</span>
                    )}
                  </td>
                  <td className="tabular px-4 py-2.5 text-right text-muted-foreground">
                    {fila.precioUnitario ? formatearMoneda(fila.precioUnitario) : "—"}
                  </td>
                  <td className="tabular px-4 py-2.5 text-right font-medium">
                    {formatearMoneda((Number(fila.cantidad) || 0) * fila.precioUnitario)}
                  </td>
                  {editable && (
                    <td className="px-2 py-2.5 text-right">
                      <Button
                        type="button" variant="ghost" size="icon"
                        aria-label={`Quitar repuesto ${indice + 1}`}
                        onClick={() => alCambiarFilas?.(filas.filter((_, i) => i !== indice))}
                      >
                        <Trash2 className="size-4 text-muted-foreground" aria-hidden="true" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editable && (
        <Button type="button" variant="outline" size="sm" onClick={agregar}>
          <Plus className="size-4" aria-hidden="true" />
          Agregar repuesto
        </Button>
      )}

      <div className="space-y-2 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Repuestos</span>
          <span className="tabular font-medium">{formatearMoneda(costoRepuestos)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <Label htmlFor="srv-mano-obra" className="text-muted-foreground">Mano de obra</Label>
          {editable ? (
            <Input
              id="srv-mano-obra" name="manoDeObra" type="number" min={0} step={100} inputMode="numeric"
              className="tabular h-11 w-40" value={manoDeObra}
              onChange={(evento) => alCambiarManoDeObra?.(evento.target.value)}
            />
          ) : (
            <span className="tabular font-medium">{formatearMoneda(Number(manoDeObra) || 0)}</span>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border pt-2 text-sm">
          <span className="font-medium">Total del servicio</span>
          <span className="tabular text-base font-semibold">{formatearMoneda(total)}</span>
        </div>
      </div>
    </div>
  )
}
