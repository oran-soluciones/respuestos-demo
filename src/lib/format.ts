const moneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

const fechaCorta = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

const fechaHora = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
})

const numero = new Intl.NumberFormat("es-AR")

export function formatearMoneda(valor: number): string {
  return moneda.format(valor)
}

export function formatearNumero(valor: number): string {
  return numero.format(valor)
}

export function formatearFecha(iso: string): string {
  return fechaCorta.format(new Date(iso))
}

export function formatearFechaHora(iso: string): string {
  return fechaHora.format(new Date(iso))
}

export function diasHasta(iso: string): number {
  const objetivo = new Date(iso)
  const hoy = new Date()
  objetivo.setHours(0, 0, 0, 0)
  hoy.setHours(0, 0, 0, 0)
  return Math.round((objetivo.getTime() - hoy.getTime()) / 86_400_000)
}

export function textoVencimiento(iso: string): string {
  const dias = diasHasta(iso)
  if (dias === 0) return "Hoy"
  if (dias === 1) return "Mañana"
  if (dias > 1) return `En ${dias} días`
  if (dias === -1) return "Ayer"
  return `Hace ${Math.abs(dias)} días`
}

export function tiempoEnGarage(ingresoEn: string, entregaRealEn?: string): string {
  const fin = entregaRealEn ? new Date(entregaRealEn) : new Date()
  const inicio = new Date(ingresoEn)
  const minutos = Math.max(0, Math.floor((fin.getTime() - inicio.getTime()) / 60_000))
  const dias = Math.floor(minutos / 1440)
  const horas = Math.floor((minutos % 1440) / 60)
  if (dias > 0) return `${dias} d ${horas} h`
  if (horas > 0) return `${horas} h ${minutos % 60} min`
  return `${minutos} min`
}

export function totalServicio(
  repuestos: { cantidad: number; precioUnitario: number }[],
  manoDeObra: number,
): number {
  return repuestos.reduce((total, item) => total + item.cantidad * item.precioUnitario, 0) + manoDeObra
}

export function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("")
}
