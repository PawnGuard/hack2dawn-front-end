export default function CallToAction() {
    return (
        <div className="flex gap-4 mt-2">
        <button className="px-8 py-3 bg-sw-cyan text-sw-void font-heading
                           tracking-widest uppercase shadow-neon-cyan
                           hover:bg-sw-green transition-all duration-300">
          Registrarse
        </button>
        <button className="px-8 py-3 border border-sw-magenta text-sw-magenta
                           font-heading tracking-widest uppercase
                           hover:bg-sw-magenta hover:text-sw-void transition-all duration-300">
          Ver Reglas
        </button>
      </div>
    )
}