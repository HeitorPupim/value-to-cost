import ImportCalculator from "@/components/ImportCalculator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Ship } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-[var(--gradient-subtle)] relative">
      {/* Background blur effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse" />
      
      {/* Theme toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <header className="pt-16 pb-12 px-4 relative">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl backdrop-blur-xl bg-primary/10 border border-primary/20 shadow-[var(--shadow-elegant)]">
            <Ship className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Calculadora de Importação Simplificada
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Calcule o custo total de importação de produtos para o Brasil, incluindo impostos e taxas em segundos.
          </p>
        </div>
      </header>

      {/* Calculator Section */}
      <main className="px-4 pb-16 relative">
        <div className="max-w-6xl mx-auto">
          <ImportCalculator />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/30 backdrop-blur-sm relative">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>O calculo dos custos é um valor estimado.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
