import type {
  DatosApp,
  MovimientoStock,
  Producto,
  Servicio,
} from "@/lib/types"

function haceDias(dias: number, hora = 10, minuto = 0): string {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() - dias)
  fecha.setHours(hora, minuto, 0, 0)
  return fecha.toISOString()
}

type SemillaProducto = Omit<Producto, "id" | "actualizadoEn">

const productosBase: SemillaProducto[] = [
  { codigo: "REP-0001", nombre: "Filtro de aceite", codigoBarras: "7791234567890", categoria: "Filtros", stock: 34, stockMinimo: 10, precio: 4500, ubicacion: "A-01", proveedor: "Filtrar S.A." },
  { codigo: "REP-0002", nombre: "Aceite motor 5W30 · 4 L", codigoBarras: "7791234567891", categoria: "Lubricantes", stock: 18, stockMinimo: 12, precio: 12800, ubicacion: "B-04", proveedor: "Lubricentes del Sur" },
  { codigo: "REP-0003", nombre: "Pastillas de freno delanteras", codigoBarras: "7791234567892", categoria: "Frenos", stock: 6, stockMinimo: 8, precio: 34500, ubicacion: "A-07", proveedor: "Frenos Andinos" },
  { codigo: "REP-0004", nombre: "Filtro de aire", codigoBarras: "7791234567893", categoria: "Filtros", stock: 27, stockMinimo: 8, precio: 6900, ubicacion: "A-02", proveedor: "Filtrar S.A." },
  { codigo: "REP-0005", nombre: "Batería 12 V · 550 A", codigoBarras: "7791234567894", categoria: "Eléctrico", stock: 9, stockMinimo: 6, precio: 78500, ubicacion: "C-01", proveedor: "Energía Autos" },
  { codigo: "REP-0006", nombre: "Bujía de encendido", codigoBarras: "7791234567895", categoria: "Motor", stock: 42, stockMinimo: 15, precio: 3200, ubicacion: "B-09", proveedor: "Motor Parts" },
  { codigo: "REP-0007", nombre: "Correa de distribución", codigoBarras: "7791234567896", categoria: "Motor", stock: 4, stockMinimo: 5, precio: 52300, ubicacion: "B-02", proveedor: "Motor Parts" },
  { codigo: "REP-0008", nombre: "Amortiguador delantero", codigoBarras: "7791234567897", categoria: "Suspensión", stock: 11, stockMinimo: 6, precio: 41200, ubicacion: "C-05", proveedor: "Suspensiones Río" },
  { codigo: "REP-0009", nombre: "Disco de freno ventilado", codigoBarras: "7791234567898", categoria: "Frenos", stock: 14, stockMinimo: 8, precio: 38900, ubicacion: "A-08", proveedor: "Frenos Andinos" },
  { codigo: "REP-0010", nombre: "Filtro de combustible", codigoBarras: "7791234567899", categoria: "Filtros", stock: 21, stockMinimo: 10, precio: 5400, ubicacion: "A-03", proveedor: "Filtrar S.A." },
  { codigo: "REP-0011", nombre: "Líquido de frenos DOT 4", codigoBarras: "7791234567800", categoria: "Frenos", stock: 16, stockMinimo: 8, precio: 8900, ubicacion: "A-09", proveedor: "Frenos Andinos" },
  { codigo: "REP-0012", nombre: "Refrigerante concentrado 1 L", codigoBarras: "7791234567801", categoria: "Motor", stock: 25, stockMinimo: 10, precio: 4100, ubicacion: "B-06", proveedor: "Motor Parts" },
  { codigo: "REP-0013", nombre: "Limpia parabrisas 1 L", codigoBarras: "7791234567802", categoria: "Lubricantes", stock: 38, stockMinimo: 12, precio: 2300, ubicacion: "B-10", proveedor: "Lubricentes del Sur" },
  { codigo: "REP-0014", nombre: "Farola delantera derecha", codigoBarras: "7791234567803", categoria: "Carrocería", stock: 3, stockMinimo: 4, precio: 96500, ubicacion: "D-02", proveedor: "Carrocería Norte" },
  { codigo: "REP-0015", nombre: "Espejo retrovisor lateral", codigoBarras: "7791234567804", categoria: "Carrocería", stock: 12, stockMinimo: 5, precio: 27800, ubicacion: "D-04", proveedor: "Carrocería Norte" },
  { codigo: "REP-0016", nombre: "Rodado de aleación 15\"", codigoBarras: "7791234567805", categoria: "Carrocería", stock: 7, stockMinimo: 4, precio: 118000, ubicacion: "D-06", proveedor: "Carrocería Norte" },
  { codigo: "REP-0017", nombre: "Sensor de oxígeno", codigoBarras: "7791234567806", categoria: "Eléctrico", stock: 8, stockMinimo: 5, precio: 46500, ubicacion: "C-08", proveedor: "Energía Autos" },
  { codigo: "REP-0018", nombre: "Terminal de batería", codigoBarras: "7791234567807", categoria: "Eléctrico", stock: 30, stockMinimo: 10, precio: 1800, ubicacion: "C-03", proveedor: "Energía Autos" },
]

const motivosEntrada = ["Compra a proveedor", "Reposición de stock", "Devolución de cliente"]
const motivosSalida = ["Venta en mostrador", "Uso en servicio", "Ajuste de inventario"]

function crearMovimientos(productos: Producto[]): MovimientoStock[] {
  const movimientos: MovimientoStock[] = []
  const cantidadPorDia = 4

  for (let i = 0; i < 56; i++) {
    const producto = productos[i % productos.length]
    const dia = 13 - Math.floor(i / cantidadPorDia)
    const tipo = i % 3 === 0 ? "entrada" : "salida"
    const cantidad = tipo === "entrada" ? 4 + (i % 9) : 1 + (i % 4)
    const motivo =
      tipo === "entrada"
        ? motivosEntrada[i % motivosEntrada.length]
        : motivosSalida[i % motivosSalida.length]

    movimientos.push({
      id: `mov-${i + 1}`,
      productoId: producto.id,
      productoNombre: producto.nombre,
      tipo,
      cantidad,
      motivo,
      referencia: tipo === "entrada" ? `OC-${4200 + i}` : undefined,
      fecha: haceDias(dia, 9 + (i % 4) * 2, (i * 7) % 60),
    })
  }

  return movimientos.sort((a, b) => b.fecha.localeCompare(a.fecha))
}

function crearServicios(): Servicio[] {
  return [
    {
      id: "srv-148", numero: "SRV-2026-0148", patente: "AB 123 CD", vehiculo: "Toyota Corolla 2020",
      cliente: "María González", telefono: "11 3456 7890", tipo: "Cambio de aceite y filtro",
      estado: "En curso", ingresoEn: haceDias(2, 9), entregaEstimadaEn: haceDias(-1, 17),
      nivelCombustible: 35, observacionesCombustible: "Nivel en reserva al ingreso", reposicionCombustible: 12,
      notas: [
        { id: "n-1", fecha: haceDias(2, 9, 30), autor: "Recepción", contenido: "Cliente solicita revisar nivel de líquidos." },
        { id: "n-2", fecha: haceDias(1, 11), autor: "Taller", contenido: "Se desmonta cárter. Se solicita filtro de aceite." },
      ],
      revision: "Presión de neumáticos correcta. Nivel de refrigerante dentro de rango.",
      conclusion: "",
      repuestos: [
        { productoId: "prod-1", nombre: "Filtro de aceite", cantidad: 1, precioUnitario: 4500 },
        { productoId: "prod-2", nombre: "Aceite motor 5W30 · 4 L", cantidad: 1, precioUnitario: 12800 },
      ],
      manoDeObra: 18000,
    },
    {
      id: "srv-147", numero: "SRV-2026-0147", patente: "XY 456 ZT", vehiculo: "Volkswagen Gol 2019",
      cliente: "Carlos Ruiz", telefono: "11 2233 4455", tipo: "Reparación de frenos",
      estado: "Esperando repuestos", ingresoEn: haceDias(4, 8, 30), entregaEstimadaEn: haceDias(-2, 16),
      nivelCombustible: 60, observacionesCombustible: "", reposicionCombustible: 0,
      notas: [
        { id: "n-3", fecha: haceDias(4, 10), autor: "Taller", contenido: "Pastillas con desgaste del 90%. Se pide presupuesto." },
        { id: "n-4", fecha: haceDias(2, 15), autor: "Repuestos", contenido: "Repuesto en tránsito, llega previsto mañana." },
      ],
      revision: "Disco delantero presenta surcos leves. Se recomienda rectificado.",
      conclusion: "",
      repuestos: [{ productoId: "prod-3", nombre: "Pastillas de freno delanteras", cantidad: 1, precioUnitario: 34500 }],
      manoDeObra: 26000,
    },
    {
      id: "srv-146", numero: "SRV-2026-0146", patente: "KL 789 MN", vehiculo: "Ford Fiesta 2018",
      cliente: "Lucía Fernández", telefono: "11 6677 8899", tipo: "Diagnóstico de motor",
      estado: "Pendiente", ingresoEn: haceDias(0, 8, 45), entregaEstimadaEn: haceDias(-3, 17),
      nivelCombustible: 72, observacionesCombustible: "", reposicionCombustible: 0,
      notas: [{ id: "n-5", fecha: haceDias(0, 8, 50), autor: "Recepción", contenido: "Testigo de motor encendido. Cliente refiere pérdida de potencia." }],
      revision: "", conclusion: "", repuestos: [], manoDeObra: 22000,
    },
    {
      id: "srv-145", numero: "SRV-2026-0145", patente: "PQ 321 RS", vehiculo: "Chevrolet Onix 2021",
      cliente: "Diego Martínez", telefono: "11 5566 1122", tipo: "Alineación y balanceo",
      estado: "En curso", ingresoEn: haceDias(1, 10), entregaEstimadaEn: haceDias(-1, 13),
      nivelCombustible: 48, observacionesCombustible: "", reposicionCombustible: 0,
      notas: [{ id: "n-6", fecha: haceDias(1, 10, 15), autor: "Recepción", contenido: "Vibración en volante a más de 80 km/h." }],
      revision: "Desgaste irregular en neumático delantero izquierdo.", conclusion: "",
      repuestos: [], manoDeObra: 19500,
    },
    {
      id: "srv-144", numero: "SRV-2026-0144", patente: "MN 654 OP", vehiculo: "Renault Sandero 2017",
      cliente: "Ana López", telefono: "11 8899 0011", tipo: "Revisión general 30.000 km",
      estado: "Completado", ingresoEn: haceDias(6, 9), entregaEstimadaEn: haceDias(-5, 16),
      entregaRealEn: haceDias(5, 15, 30), nivelCombustible: 75, observacionesCombustible: "", reposicionCombustible: 0,
      notas: [{ id: "n-7", fecha: haceDias(5, 15), autor: "Taller", contenido: "Revisión final sin novedades." }],
      revision: "Se controlan frenos, suspensión, líquidos y sistema eléctrico.",
      conclusion: "Sin hallazgos. Próxima revisión recomendada a los 35.000 km.",
      repuestos: [{ productoId: "prod-4", nombre: "Filtro de aire", cantidad: 1, precioUnitario: 6900 }],
      manoDeObra: 28000,
    },
    {
      id: "srv-143", numero: "SRV-2026-0143", patente: "RT 987 UV", vehiculo: "Peugeot 208 2020",
      cliente: "Javier Silva", telefono: "11 4433 2211", tipo: "Cambio de batería",
      estado: "Entregado", ingresoEn: haceDias(9, 11), entregaEstimadaEn: haceDias(-8, 15),
      entregaRealEn: haceDias(8, 14), nivelCombustible: 55, observacionesCombustible: "", reposicionCombustible: 0,
      notas: [], revision: "Carga del alternador verificada en 13,9 V.",
      conclusion: "Batería reemplazada. Sistema eléctrico funcionando correctamente.",
      repuestos: [{ productoId: "prod-5", nombre: "Batería 12 V · 550 A", cantidad: 1, precioUnitario: 78500 }],
      manoDeObra: 12000,
    },
    {
      id: "srv-142", numero: "SRV-2026-0142", patente: "EF 147 GH", vehiculo: "Fiat Cronos 2022",
      cliente: "Sofía Romero", telefono: "11 7788 9900", tipo: "Carga de combustible y chequeo",
      estado: "En curso", ingresoEn: haceDias(1, 14), entregaEstimadaEn: haceDias(-2, 12),
      nivelCombustible: 22, observacionesCombustible: "Se carga 20 L a solicitud del cliente", reposicionCombustible: 20,
      notas: [{ id: "n-8", fecha: haceDias(1, 14, 20), autor: "Recepción", contenido: "Solicita control de presión de neumáticos." }],
      revision: "", conclusion: "", repuestos: [], manoDeObra: 8000,
    },
    {
      id: "srv-141", numero: "SRV-2026-0141", patente: "ZX 258 IJ", vehiculo: "Toyota Etios 2019",
      cliente: "Martín Pereyra", telefono: "11 9900 3344", tipo: "Cambio de filtros",
      estado: "Pendiente", ingresoEn: haceDias(0, 9, 10), entregaEstimadaEn: haceDias(-4, 17),
      nivelCombustible: 63, observacionesCombustible: "", reposicionCombustible: 0,
      notas: [], revision: "", conclusion: "", repuestos: [], manoDeObra: 15000,
    },
    {
      id: "srv-140", numero: "SRV-2026-0140", patente: "CV 369 KL", vehiculo: "Honda Fit 2018",
      cliente: "Valentina Costa", telefono: "11 1122 6677", tipo: "Revisión de suspensión",
      estado: "Entregado", ingresoEn: haceDias(12, 10), entregaEstimadaEn: haceDias(-11, 16),
      entregaRealEn: haceDias(11, 15), nivelCombustible: 80, observacionesCombustible: "", reposicionCombustible: 0,
      notas: [], revision: "Se revisan amortiguadores, bujes y barras estabilizadoras.",
      conclusion: "Se reemplaza amortiguador delantero derecho. Alineación realizada.",
      repuestos: [{ productoId: "prod-8", nombre: "Amortiguador delantero", cantidad: 1, precioUnitario: 41200 }],
      manoDeObra: 24000,
    },
  ]
}

export function crearDatosIniciales(): DatosApp {
  const productos: Producto[] = productosBase.map((producto, indice) => ({
    ...producto,
    id: `prod-${indice + 1}`,
    actualizadoEn: haceDias((indice * 3) % 12, 12),
  }))

  return {
    productos,
    movimientos: crearMovimientos(productos),
    servicios: crearServicios(),
  }
}
