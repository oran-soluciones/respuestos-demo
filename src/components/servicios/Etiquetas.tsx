import { CalendarClock, Clock3 } from "lucide-react"
import { formatearFecha, formatearFechaHora, tiempoEnGarage } from "@/lib/format"

const HOY = new Date()

export function EtiquetaTiempo({
  ingreso,
  entrega,
  compacto = false,
}: {
  ingreso: string
  entrega?: string
  compacto?: boolean
}) {
  return (
    <span className="tabular inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      {!compacto && <Clock3 className="size-3.5" aria-hidden="true" />}
      {tiempoEnGarage(ingreso, entrega)}
    </span>
  )
}

export function EtiquetaEntrega({ fecha, compacto = false }: { fecha: string; compacto?: boolean }) {
  const dias = Math.ceil((new Date(fecha).getTime() - HOY.getTime()) / 86_400_000)
  const vencido = dias < 0
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${vencido ? "font-semibold text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
      {!compacto && <CalendarClock className="size-3.5" aria-hidden="true" />}
      {compacto ? formatearFecha(fecha) : formatearFechaHora(fecha)}
    </span>
  )
}
