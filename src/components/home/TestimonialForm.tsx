import { useState } from "react";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TestimonialFormProps {
  onSubmit?: (data: { name: string; text: string; rating: number }) => void;
}

export const TestimonialForm = ({ onSubmit }: TestimonialFormProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !text.trim() || rating === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha seu nome, avaliação e comentário.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSubmit?.({ name: name.trim(), text: text.trim(), rating });
    
    toast({
      title: "Obrigado pelo seu feedback! ⭐",
      description: "Sua avaliação foi enviada com sucesso.",
    });
    
    // Reset form
    setName("");
    setText("");
    setRating(0);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
      <h4 className="font-display text-lg font-bold">Deixe sua avaliação</h4>
      
      <div className="space-y-2">
        <Label htmlFor="testimonial-name">Seu nome</Label>
        <Input
          id="testimonial-name"
          placeholder="Digite seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
        />
      </div>

      <div className="space-y-2">
        <Label>Sua avaliação</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "w-8 h-8 transition-colors",
                  (hoveredRating || rating) >= star
                    ? "text-accent fill-accent"
                    : "text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="testimonial-text">Seu comentário</Label>
        <Textarea
          id="testimonial-text"
          placeholder="Conte sua experiência na Arena Cedro..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          maxLength={300}
        />
        <p className="text-xs text-muted-foreground text-right">
          {text.length}/300 caracteres
        </p>
      </div>

      <Button 
        type="submit" 
        className="w-full gradient-primary"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          "Enviando..."
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Enviar Avaliação
          </>
        )}
      </Button>
    </form>
  );
};
