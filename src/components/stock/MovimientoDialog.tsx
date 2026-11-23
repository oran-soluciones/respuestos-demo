import { useEffect, useState } from "react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatearNumero } from "@/lib/format"
import { useDatos } from "@/lib/store"
import type { Producto } from "@/lib/types"

const MOTIVOS = {
  entrada: ["Compra a proveedor", "Reposición de stock", "Devolución de cliente"],
  salida: ["Venta en mostrador", "Uso en servicio", "Ajuste de inventario"],
} as const

export function MovimientoDialog({
  abierto,
  alCambiar,
  producto,
  tipo,
}: {
  abierto: boolean
  alCambiar: (valor: boolean) => void
  producto: Producto | null
  tipo: "entrada" | "salida"
}) {
  const { registrarMovimiento } = useDatos()
  const [cantidad, setCantidad] = useState("1")
  const [motivo, setMotivo] = useState<string>(MOTIVOS[tipo][0])
  const [referencia, setReferencia] = useState("")

  useEffect(() => {
    if (!abierto) return
    setCantidad("1")
    setMotivo(MOTIVOS[tipo][0])
    setReferencia("")
  }, [abierto, tipo])

  if (!producto) return null

  const valor = Number(cantidad)
  const cantidadValida = Number.isFinite(valor) && valor > 0
  const stockFinal = producto.stock + (tipo === "entrada" ? (cantidadValida ? valor : 0) : -(cantidadValida ? valor : 0))
  const sinStockSuficiente = tipo === "salida" && stockFinal < 0

  function registrar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!producto || !cantidadValida || sinStockSuficiente) return

    const exito = registrarMovimiento({
      productoId: producto.id,
      tipo,
      cantidad: valor,
      motivo,
      referencia: referencia.trim() || undefined,
    })

    if (exito) {
      toast.success(`${tipo === "entrada" ? "Entrada" : "Salida"} registrada`, {
        description: `${formatearNumero(valor)} unidades de ${producto.nombre}`,
      })
      alCambiar(false)
    } else {
      toast.error("No se pudo registrar el movimiento")
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={alCambiar}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {tipo === "entrada" ? (
              <ArrowUpRight className="size-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            ) : (
              <ArrowDownRight className="size-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            )}
            Registrar {tipo}
          </DialogTitle>
          <DialogDescription>{producto.nombre} · {producto.codigo}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2.5 text-sm">
          <span className="text-muted-foreground">Stock actual</span>
          <span className="tabular font-semibold">{formatearNumero(producto.stock)} unidades</span>
        </div>

        <form onSubmit={registrar} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="mov-cantidad">Cantidad</Label>
            <Input
              id="mov-cantidad"
              name="cantidad"
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              className="tabular"
              value={cantidad}
              onChange={(evento) => setCantidad(evento.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mov-motivo">Motivo</Label>
            <Select value={motivo} onValueChange={setMotivo}>
              <SelectTrigger id="mov-motivo" name="motivo">
                <SelectValue placeholder="Seleccioná un motivo" />
              </SelectTrigger>
              <SelectContent>
                {MOTIVOS[tipo].map((opcion) => (
                  <SelectItem key={opcion} value={opcion}>
                    {opcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mov-referencia">Referencia (opcional)</Label>
            <Input
              id="mov-referencia"
              name="referencia"
              value={referencia}
              onChange={(evento) => setReferencia(evento.target.value)}
              placeholder="OC-4301, factura…"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-dashed border-border px-3 py-2.5 text-sm">
            <span className="text-muted-foreground">Stock resultante</span>
            <span className={`tabular font-semibold ${sinStockSuficiente ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {formatearNumero(stockFinal)} unidades
            </span>
          </div>
          {sinStockSuficiente && (
            <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
              No hay stock suficiente para esta salida.
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => alCambiar(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!cantidadValida || sinStockSuficiente}>
              Confirmar {tipo}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
