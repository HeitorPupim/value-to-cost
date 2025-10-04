import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, TrendingUp } from "lucide-react";

interface CalculationResult {
  cifValue: number;
  customsDuty: number;
  importVat: number;
  totalCost: number;
  perUnitCost?: number;
}

const ImportCalculator = () => {
  const [goodsValue, setGoodsValue] = useState<string>("");
  const [freightValue, setFreightValue] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Standard rates - can be customized
  const CUSTOMS_DUTY_RATE = 0.1; // 10%
  const VAT_RATE = 0.2; // 20%

  const calculateCosts = () => {
    const goods = parseFloat(goodsValue) || 0;
    const freight = parseFloat(freightValue) || 0;
    const qty = parseFloat(quantity) || 0;

    if (goods === 0 && freight === 0) {
      setResult(null);
      return;
    }

    // CIF = Cost + Insurance + Freight (we're using goods + freight as simplified CIF)
    const cifValue = goods + freight;
    
    // Customs Duty = CIF × Duty Rate
    const customsDuty = cifValue * CUSTOMS_DUTY_RATE;
    
    // Import VAT = (CIF + Customs Duty) × VAT Rate
    const importVat = (cifValue + customsDuty) * VAT_RATE;
    
    // Total Cost = CIF + Customs Duty + Import VAT
    const totalCost = cifValue + customsDuty + importVat;
    
    // Per unit cost if quantity is provided
    const perUnitCost = qty > 0 ? totalCost / qty : undefined;

    setResult({
      cifValue,
      customsDuty,
      importVat,
      totalCost,
      perUnitCost,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const handleInputChange = (
    setter: (value: string) => void,
    value: string
  ) => {
    // Only allow numbers and decimal point
    const sanitized = value.replace(/[^\d.]/g, '');
    setter(sanitized);
  };

  // Recalculate whenever inputs change
  useState(() => {
    calculateCosts();
  });

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Input Card */}
      <Card className="shadow-[var(--shadow-card)] transition-[var(--transition-smooth)] hover:shadow-[var(--shadow-elegant)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>Enter your importation information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="goods-value" className="text-sm font-medium">
              Goods Value (USD) *
            </Label>
            <Input
              id="goods-value"
              type="text"
              placeholder="0.00"
              value={goodsValue}
              onChange={(e) => {
                handleInputChange(setGoodsValue, e.target.value);
                setTimeout(calculateCosts, 0);
              }}
              className="text-lg transition-[var(--transition-smooth)] focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="freight-value" className="text-sm font-medium">
              Freight Value (USD) *
            </Label>
            <Input
              id="freight-value"
              type="text"
              placeholder="0.00"
              value={freightValue}
              onChange={(e) => {
                handleInputChange(setFreightValue, e.target.value);
                setTimeout(calculateCosts, 0);
              }}
              className="text-lg transition-[var(--transition-smooth)] focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-medium">
              Quantity (Optional)
            </Label>
            <Input
              id="quantity"
              type="text"
              placeholder="0"
              value={quantity}
              onChange={(e) => {
                handleInputChange(setQuantity, e.target.value);
                setTimeout(calculateCosts, 0);
              }}
              className="text-lg transition-[var(--transition-smooth)] focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-xs text-muted-foreground">
              Enter quantity to see per-unit cost
            </p>
          </div>

          <div className="pt-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p className="font-medium mb-1">Calculation rates:</p>
            <p>• Customs Duty: {CUSTOMS_DUTY_RATE * 100}%</p>
            <p>• Import VAT: {VAT_RATE * 100}%</p>
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      <Card className="shadow-[var(--shadow-card)] transition-[var(--transition-smooth)] hover:shadow-[var(--shadow-elegant)] bg-gradient-to-br from-card to-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/10">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <CardTitle>Cost Breakdown</CardTitle>
              <CardDescription>Your total importation costs</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {result ? (
            <>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">CIF Value</span>
                  <span className="font-semibold">{formatCurrency(result.cifValue)}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Customs Duty ({CUSTOMS_DUTY_RATE * 100}%)</span>
                  <span className="font-semibold text-primary">{formatCurrency(result.customsDuty)}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Import VAT ({VAT_RATE * 100}%)</span>
                  <span className="font-semibold text-accent">{formatCurrency(result.importVat)}</span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t-2 border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total Cost</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {formatCurrency(result.totalCost)}
                  </span>
                </div>
              </div>

              {result.perUnitCost && (
                <div className="mt-4 p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-accent-foreground">Cost per Unit</span>
                    <span className="text-lg font-bold text-accent">{formatCurrency(result.perUnitCost)}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Enter values to see calculations</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportCalculator;
