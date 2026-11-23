import { useEffect, useState, type ReactNode } from "react"
import { NavLink, Outlet, useLocation } from "react-router-dom"
import {
  Database,
  LayoutDashboard,
  Menu,
  Moon,
  Package,
  RotateCcw,
  Sun,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useDatos } from "@/lib/store"

const CLAVE_TEMA = "repuestos-demo:tema"

const navegacion = [
  { a: "/", etiqueta: "Resumen", icono: LayoutDashboard, descripcion: "Dashboard general" },
  { a: "/stock", etiqueta: "Stock", icono: Package, descripcion: "Repuestos e inventario" },
  { a: "/servicios", etiqueta: "Servicios", icono: Wrench, descripcion: "Vehículos en taller" },
]

function tituloDeRuta(ruta: string): string {
  if (ruta.startsWith("/stock")) return "Stock"
  if (ruta.startsWith("/servicios")) return "Servicios"
  return "Resumen"
}

function ContenidoSidebar({ alNavegar }: { alNavegar?: () => void }) {
  const { reiniciarDemo } = useDatos()

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Wrench className="size-[18px]" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">AutoRepuestos</p>
          <p className="text-xs text-muted-foreground">Panel de gestión</p>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <nav aria-label="Navegación principal" className="space-y-1 p-3">
          <p className="px-3 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Gestión
          </p>
          {navegacion.map(({ a, etiqueta, icono: Icono }) => (
            <NavLink
              key={a}
              to={a}
              end={a === "/"}
              onClick={alNavegar}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <Icono className="size-[18px] shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">{etiqueta}</span>
                  {isActive && <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      <div className="shrink-0 border-t border-sidebar-border p-3">
        <div className="mb-3 flex items-start gap-2 rounded-md bg-sidebar-accent/50 p-3">
          <Database className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs font-medium">Modo demostración</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
              Los datos se guardan en este navegador.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => {
            reiniciarDemo()
            toast.success("Datos de ejemplo restaurados")
            alNavegar?.()
          }}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Restaurar datos de ejemplo
        </Button>
      </div>
    </div>
  )
}

export function Layout() {
  const ubicacion = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [modoOscuro, setModoOscuro] = useState(() => {
    try {
      return localStorage.getItem(CLAVE_TEMA) !== "claro"
    } catch {
      return true
    }
  })

  useEffect(() => {
    document.documentElement.classList.toggle("dark", modoOscuro)
    try {
      localStorage.setItem(CLAVE_TEMA, modoOscuro ? "oscuro" : "claro")
    } catch {
      // Sin persistencia, se mantiene el tema en memoria.
    }
  }, [modoOscuro])

  return (
    <div className="min-h-svh bg-background">
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Saltar al contenido principal
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border lg:block">
        <ContenidoSidebar />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-6">
          <Sheet open={menuAbierto} onOpenChange={setMenuAbierto}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menú">
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-sidebar-border p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navegación principal</SheetTitle>
              </SheetHeader>
              <ContenidoSidebar alNavegar={() => setMenuAbierto(false)} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              AutoRepuestos
            </p>
            <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">
              {tituloDeRuta(ubicacion.pathname)}
            </h1>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={modoOscuro ? "Usar tema claro" : "Usar tema oscuro"}
                onClick={() => setModoOscuro((valor) => !valor)}
              >
                {modoOscuro ? (
                  <Sun className="size-[18px]" aria-hidden="true" />
                ) : (
                  <Moon className="size-[18px]" aria-hidden="true" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{modoOscuro ? "Tema claro" : "Tema oscuro"}</TooltipContent>
          </Tooltip>

          <div className="flex items-center gap-2.5 border-l border-border pl-3 sm:pl-4">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium">Taller Demo</p>
              <p className="text-[11px] text-muted-foreground">Administrador</p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary ring-1 ring-primary/25">
              TD
            </div>
          </div>
        </header>

        <main id="contenido-principal" className="mx-auto w-full max-w-[1600px] p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function EncabezadoPagina({
  titulo,
  descripcion,
  acciones,
}: {
  titulo: string
  descripcion: string
  acciones?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{titulo}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{descripcion}</p>
      </div>
      {acciones && <div className="flex shrink-0 items-center gap-2">{acciones}</div>}
    </div>
  )
}
