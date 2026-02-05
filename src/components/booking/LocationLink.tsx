import { MapPin } from "lucide-react";

export const LocationLink = () => {
  const address = "Av. Trindade, 3126, Matinha, São José de Ribamar - MA";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className="flex flex-col gap-2">
      <a 
        href={googleMapsUrl}
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-start gap-2 text-muted-foreground hover:text-primary transition-all group p-2 rounded-lg hover:bg-primary/5"
      >
        <MapPin className="w-5 h-5 mt-0.5 text-primary group-hover:bounce transition-transform" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">Arena Cedro</span>
          <span className="text-xs leading-relaxed">
            Av. Trindade, 3126, Matinha,<br />
            SJ de Ribamar-MA
          </span>
        </div>
      </a>
    </div>
  );
};