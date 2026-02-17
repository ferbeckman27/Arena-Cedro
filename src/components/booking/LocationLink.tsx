import { MapPin } from "lucide-react";

export const LocationLink = () => {
  // Endereço exato para o Google Maps encontrar sem erro
  const address = "Av. Trindade, 3126, Matinha, São José de Ribamar - MA, 65110-000";
  
  // Link oficial da API do Maps que abre tanto no navegador quanto no App do celular
  const googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=Arena+Cedro+Av.+Trindade+3126+Matinha+SJ+de+Ribamar+MA";
  return (
    <div className="flex flex-col gap-2">
      <a 
        href={googleMapsUrl}
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-start gap-3 text-muted-foreground hover:text-[#22c55e] transition-all group p-2 rounded-lg hover:bg-[#22c55e]/5"
      >
        <div className="bg-[#22c55e]/10 p-2 rounded-md group-hover:bg-[#22c55e] transition-colors">
          <MapPin className="w-5 h-5 text-[#22c55e] group-hover:text-black transition-colors" />
        </div>
        
        <div className="flex flex-col">
          <span className="text-sm font-black uppercase italic text-white tracking-tighter">
            Arena Cedro
          </span>
          <span className="text-xs leading-relaxed text-gray-400 group-hover:text-gray-200 transition-colors">
            Av. Trindade, 3126, Matinha,<br />
            SJ de Ribamar - MA
          </span>
        </div>
      </a>
    </div>
  );
};