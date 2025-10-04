import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, DollarSign, RefreshCcw } from "lucide-react";

interface CalculationResult {
  subtotalUSD: number;
  fx: number;
  subtotalBRL: number;
  ii: number;
  icmsBase: number;
  icms: number;
  adminFee: number;
  total: number;
  perUnitCost?: number;
}

const ImportCalculator = () => {
  // Inputs
  const [goodsValueUSD, setGoodsValueUSD] = useState<string>("");
  const [freightValueUSD, setFreightValueUSD] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");

  // Alíquotas
  // II é fixo em 60% (não editável pelo usuário)
  const II_RATE_PCT = "60";
  const [icmsRatePct, setIcmsRatePct] = useState<string>("18"); // ICMS 18%
  const [adminRatePct, setAdminRatePct] = useState<string>("3"); // taxa adm 3%

  // Câmbio
  const [usdBrl, setUsdBrl] = useState<string>("");
  const [apiStatus, setApiStatus] = useState<string>("—");
  const [loadingFx, setLoadingFx] = useState<boolean>(false);

  // Resultado
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Helpers
  const parseNum = (s: string) => {
    if (!s) return 0;
    const normalized = s
      .replace(/\s/g, "")
      .replace(/\.(?=\d{3}(\D|$))/g, "")
      .replace(/,/g, ".");
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
  };

  const formatBRL = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const sanitizeInput = (setter: (v: string) => void, v: string) => {
    const sanitized = v.replace(/[^\d.,]/g, "");
    setter(sanitized);
  };

  const fetchFX = async () => {
    setLoadingFx(true);
    setApiStatus("Buscando câmbio…");
    try {
      const r = await fetch("https://open.er-api.com/v6/latest/USD");
      const j = await r.json();
      let rate: number | null = null;

      if (j?.result === "success" && j?.rates?.BRL) {
        rate = j.rates.BRL;
        setApiStatus("Câmbio de open.er-api.com");
      } else {
        const r2 = await fetch("https://api.exchangerate.host/latest?base=USD&symbols=BRL");
        const j2 = await r2.json();
        if (j2?.rates?.BRL) {
          rate = j2.rates.BRL;
          setApiStatus("Câmbio de exchangerate.host");
        }
      }

      if (rate && isFinite(rate) && rate > 0) {
        // Arredonda o câmbio para 2 casas decimais (ex.: 5,25)
        setUsdBrl(String(rate.toFixed(2)).replace(".", ","));
      } else {
        setApiStatus("Falha ao obter câmbio. Edite manualmente.");
      }
    } catch {
      setApiStatus("Erro na API de câmbio. Edite manualmente.");
    } finally {
      setLoadingFx(false);
    }
  };

  const calculate = () => {
    const goodsUSD = parseNum(goodsValueUSD);
    const freightUSD = parseNum(freightValueUSD);
    const qty = Math.max(0, Math.floor(parseNum(quantity)));
    const fx = parseNum(usdBrl);

    if (!fx || fx <= 0) { setResult(null); return; }

    const subtotalUSD = goodsUSD + freightUSD;
    if (subtotalUSD <= 0) { setResult(null); return; }

  const iiRate = Math.max(0, parseNum(II_RATE_PCT)) / 100;
    const icmsRate = Math.max(0, parseNum(icmsRatePct)) / 100;
    const adminRate = Math.max(0, parseNum(adminRatePct)) / 100;

    const subtotalBRL = subtotalUSD * fx;

    // II sobre subtotal convertido
    const ii = subtotalBRL * iiRate;

    // --- ICMS por GROSS-UP ---
    // Base ICMS = (subtotalBRL + II) / (1 - ICMS%)
    const denom = 1 - icmsRate;
    const icmsBase = denom > 0 ? (subtotalBRL + ii) / denom : (subtotalBRL + ii); // fallback defensivo
    const icms = icmsBase * icmsRate;

    // Taxa administrativa 3% sobre (subtotal + II + ICMS)
    const adminFee = (subtotalBRL + ii + icms) * adminRate;

    const total = subtotalBRL + ii + icms + adminFee;
    const perUnitCost = qty > 0 ? total / qty : undefined;

    setResult({
      subtotalUSD,
      fx,
      subtotalBRL,
      ii,
      icmsBase,
      icms,
      adminFee,
      total,
      perUnitCost,
    });
  };

  useEffect(() => {
    calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goodsValueUSD, freightValueUSD, quantity, usdBrl, icmsRatePct, adminRatePct]);

  useEffect(() => {
    if (!usdBrl) setUsdBrl("5,00");
    if (!icmsRatePct) setIcmsRatePct("18");
    if (!adminRatePct) setAdminRatePct("3");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              <CardTitle>Dados da Importação</CardTitle>
              <CardDescription>Entradas em USD e câmbio USD→BRL</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Câmbio */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
            <div className="space-y-2">
              <Label htmlFor="usd-brl" className="text-sm font-medium">
                Câmbio USD→BRL
              </Label>
              <div className="flex items-center gap-2">
                <div className="px-2 py-2 rounded-md bg-muted">
                  <DollarSign className="w-4 h-4 opacity-70" />
                </div>
                <Input
                  id="usd-brl"
                  placeholder="ex.: 5,25"
                  value={usdBrl}
                  onChange={(e) => sanitizeInput(setUsdBrl, e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">{apiStatus}</p>
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                onClick={fetchFX}
                variant="secondary"
                className="w-full sm:w-auto"
                disabled={loadingFx}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                {loadingFx ? "Atualizando..." : "Atualizar câmbio"}
              </Button>
            </div>
          </div>

          {/* Valores USD */}
          <div className="space-y-2">
            <Label htmlFor="goods-value" className="text-sm font-medium">Valor da mercadoria (USD) *</Label>
            <Input
              id="goods-value"
              type="text"
              placeholder="0,00"
              value={goodsValueUSD}
              onChange={(e) => sanitizeInput(setGoodsValueUSD, e.target.value)}
              className="text-lg focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="freight-value" className="text-sm font-medium">Valor do frete (USD) *</Label>
            <Input
              id="freight-value"
              type="text"
              placeholder="0,00"
              value={freightValueUSD}
              onChange={(e) => sanitizeInput(setFreightValueUSD, e.target.value)}
              className="text-lg focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Quantidade */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-medium">Quantidade (opcional)</Label>
            <Input
              id="quantity"
              type="text"
              placeholder="0"
              value={quantity}
              onChange={(e) => sanitizeInput(setQuantity, e.target.value)}
              className="text-lg focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-xs text-muted-foreground">Preencha para ver o custo unitário (BRL)</p>
          </div>

          {/* Alíquotas (II fixo, demais editáveis) */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="ii" className="text-sm font-medium">II (%)</Label>
              {/* Mostrar II como texto estático (fixo) */}
              <div className="pt-2 text-lg font-semibold">{II_RATE_PCT}%</div>
            </div>
            <div>
              <Label htmlFor="icms" className="text-sm font-medium">ICMS (%)</Label>
              <Input id="icms" type="text" placeholder="18" value={icmsRatePct}
                     onChange={(e) => sanitizeInput(setIcmsRatePct, e.target.value)} />
            </div>
            <div>
              <Label htmlFor="admin" className="text-sm font-medium">Taxa Adm (%)</Label>
              <Input id="admin" type="text" placeholder="3" value={adminRatePct}
                     onChange={(e) => sanitizeInput(setAdminRatePct, e.target.value)} />
            </div>
          </div>

          <div className="pt-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p className="font-medium mb-1">Regras (modo gross-up para ICMS):</p>
            <p>• Subtotal(BRL) = (Mercadoria + Frete) × câmbio</p>
            <p>• II = Subtotal(BRL) × II%</p>
            <p>• Base ICMS = (Subtotal + II) / (1 − ICMS%)</p>
            <p>• ICMS = Base ICMS × ICMS%</p>
            <p>• Taxa Adm = (Subtotal + II + ICMS) × 3%</p>
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
              <CardTitle>Detalhamento de Custos</CardTitle>
              <CardDescription>Conversão para BRL e impostos</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {result ? (
            <>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Subtotal (USD)</span>
                  <span className="font-semibold">
                    {result.subtotalUSD.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Câmbio usado (USD→BRL)</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(result.fx)}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Subtotal convertido (BRL)</span>
                  <span className="font-semibold">{formatBRL(result.subtotalBRL)}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Imposto de Importação — II ({II_RATE_PCT}%)</span>
                  <span className="font-semibold text-primary">{formatBRL(result.ii)}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">
                    Base do ICMS (gross-up)
                  </span>
                  <span className="font-semibold">{formatBRL(result.icmsBase)}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">ICMS ({parseNum(icmsRatePct)}%)</span>
                  <span className="font-semibold text-accent">{formatBRL(result.icms)}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Taxa administrativa ({parseNum(adminRatePct)}%)</span>
                  <span className="font-semibold">{formatBRL(result.adminFee)}</span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t-2 border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total estimado (BRL)</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {formatBRL(result.total)}
                  </span>
                </div>
              </div>

              {result.perUnitCost !== undefined && (
                <div className="mt-4 p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-accent-foreground">Custo por unidade</span>
                    <span className="text-lg font-bold text-accent">{formatBRL(result.perUnitCost)}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Preencha os campos para ver os cálculos</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportCalculator;