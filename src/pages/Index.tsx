import ImportCalculator from "@/components/ImportCalculator";
import { Ship } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-[var(--gradient-subtle)]">
      {/* Hero Section */}
      <header className="pt-16 pb-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-primary/10 shadow-[var(--shadow-elegant)]">
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
      <main className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <ImportCalculator />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>O calculo dos custos é um valor estimado.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
