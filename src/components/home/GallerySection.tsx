import { useState } from "react";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface GalleryItem {
  type: "image" | "video";
  src: string;
  thumbnail: string;
  title: string;
}

// Placeholder images - can be replaced with real photos
const galleryItems: GalleryItem[] = [
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    thumbnail: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400",
    title: "Campo Society",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800",
    thumbnail: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400",
    title: "Gramado Sintético",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800",
    thumbnail: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400",
    title: "Partida Noturna",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800",
    thumbnail: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400",
    title: "Iluminação LED",
  },
  {
    type: "video",
    src: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400",
    title: "Tour Virtual",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=800",
    thumbnail: "https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=400",
    title: "Vestiários",
  },
];

export const GallerySection = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedItem = selectedIndex !== null ? galleryItems[selectedIndex] : null;

  const handlePrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? galleryItems.length - 1 : selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === galleryItems.length - 1 ? 0 : selectedIndex + 1);
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold mb-4">
            Conheça o <span className="text-gradient">Campo Society</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Veja nossa estrutura de alta qualidade e sinta-se em casa antes mesmo de chegar.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryItems.map((item, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative aspect-video rounded-xl overflow-hidden group",
                "hover:scale-[1.02] transition-transform duration-300"
              )}
            >
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {item.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-primary-foreground ml-1" />
                  </div>
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Lightbox */}
        <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
          <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
            <div className="relative">
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 bg-background/50 hover:bg-background/80"
                onClick={() => setSelectedIndex(null)}
              >
                <X className="w-5 h-5" />
              </Button>

              {/* Navigation */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/80"
                onClick={handlePrevious}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/80"
                onClick={handleNext}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>

              {/* Content */}
              {selectedItem && (
                <div className="rounded-xl overflow-hidden">
                  {selectedItem.type === "image" ? (
                    <img
                      src={selectedItem.src}
                      alt={selectedItem.title}
                      className="w-full h-auto max-h-[80vh] object-contain bg-background"
                    />
                  ) : (
                    <div className="aspect-video">
                      <iframe
                        src={selectedItem.src}
                        title={selectedItem.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  <div className="bg-background p-4">
                    <p className="font-medium">{selectedItem.title}</p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};
