import { ShieldCheck, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export const AdminButton = () => {
  return (
    <Link to="/admin" className="block w-full max-w-xs">
      <button className="group relative w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25 active:scale-95">
        {/* Ícone de Escudo/Admin à esquerda para diferenciar */}
        <ShieldCheck className="w-5 h-5 text-blue-200" />
        
        <span className="text-lg">Área Administrativa</span>
        
        {/* Seta igual ao botão original */}
        <ChevronRight className="w-5 h-5 ml-auto group-hover:translate-x-1 transition-transform" />
      </button>
    </Link>
  );
};