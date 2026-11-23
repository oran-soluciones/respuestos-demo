import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { EstadoServicio } from "@/lib/types"

export function TarjetaMetrica({
  titulo,
  valor,
  detalle,
  icono,
  tono = "primario",
}: {
  titulo: string
  valor: string
  detalle: string
  icono: ReactNode
  tono?: "primario" | "alerta" | "info" | "neutro"
}) {
  const tonos = {
    primario: "bg-primary/12 text-primary ring-primary/20",
    alerta: "bg-amber-500/12 text-amber-500 ring-amber-500/20",
    info: "bg-sky-500/12 text-sky-400 ring-sky-500/20",
    neutro: "bg-muted text-muted-foreground ring-border",
  }

  return (
    <Card className="gap-0 rounded-xl border-border/70 bg-card p-4 shadow-none transition-colors duration-150 hover:border-border">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{titulo}</p>
          <p className="tabular mt-2 text-2xl font-semibold tracking-tight">{valor}</p>
        </div>
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ${tonos[tono]}`}
          aria-hidden="true"
        >
          {icono}
        </div>
      </div>
      <p className="mt-2 truncate text-[11px] text-muted-foreground">{detalle}</p>
    </Card>
  )
}

const estilosEstado: Record<EstadoServicio, string> = {
  Pendiente: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  "En curso": "border-sky-500/30 bg-sky-500/10 text-sky-400",
  "Esperando repuestos": "border-amber-500/30 bg-amber-500/10 text-amber-400",
  Completado: "border-violet-500/30 bg-violet-500/10 text-violet-400",
  Entregado: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
}

export function EstadoServicioBadge({ estado }: { estado: EstadoServicio }) {
  return (
    <Badge variant="outline" className={`whitespace-nowrap font-medium ${estilosEstado[estado]}`}>
      {estado}
    </Badge>
  )
}

export function EstadoStockBadge({ stock, minimo }: { stock: number; minimo: number }) {
  if (stock === 0) {
    return (
      <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-400">
        Sin stock
      </Badge>
    )
  }
  if (stock <= minimo) {
    return (
      <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400">
        Stock bajo
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
      Disponible
    </Badge>
  )
}
