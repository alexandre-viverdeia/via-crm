import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Brain, Loader2, Check, X, AlertTriangle, Eye, EyeOff } from "lucide-react";
import type { OnboardingStepProps } from "./types";

type TestStatus = "idle" | "testing" | "success" | "invalid_key" | "no_credits" | "error";

export function AICopilotStep({ orgId, setCanContinue, setStepData }: OnboardingStepProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<TestStatus>("idle");

  const handleTest = async () => {
    if (!apiKey.trim() || !orgId) return;
    setStatus("testing");
    try {
      const { data, error } = await supabase.functions.invoke("validate-anthropic-key", {
        body: { api_key: apiKey.trim(), org_id: orgId },
      });
      if (error) throw error;
      if (data?.valid) {
        setStatus("success");
        setCanContinue(true);
        setStepData("aiConfigured", true);
      } else {
        setStatus(data?.error === "no_credits" ? "no_credits" : "invalid_key");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold">Ative o AI Copilot</h3>
        <p className="text-sm text-muted-foreground mt-1">
          O FlowCRM usa Claude da Anthropic para gerar emails, analisar negócios e sugerir próximos passos.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-3">
        <p className="text-sm font-medium">Como obter sua chave:</p>
        <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
          <li>Acesse <span className="font-mono text-foreground">console.anthropic.com</span> e crie uma conta</li>
          <li>Clique em "API Keys" → "Create Key"</li>
          <li>Copie e cole a chave abaixo</li>
        </ol>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="anthropic-key">Anthropic API Key</Label>
          <div className="relative">
            <Input
              id="anthropic-key"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setStatus("idle"); setCanContinue(false); }}
              placeholder="sk-ant-api03-..."
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          variant="secondary"
          className="w-full"
          onClick={handleTest}
          disabled={!apiKey.trim() || status === "testing" || status === "success"}
        >
          {status === "testing" ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando chave...</>
          ) : status === "success" ? (
            <><Check className="mr-2 h-4 w-4" /> Conectado — Claude claude-sonnet-4-20250514 ativo</>
          ) : (
            <><Brain className="mr-2 h-4 w-4" /> Testar conexão</>
          )}
        </Button>

        {status === "success" && (
          <div className="flex items-center gap-2 text-sm text-primary rounded-lg bg-primary/10 p-3" role="status" aria-live="polite">
            <Check className="h-4 w-4" /> Conectado — Claude claude-sonnet-4-20250514 ativo
          </div>
        )}
        {status === "invalid_key" && (
          <div className="flex items-center gap-2 text-sm text-destructive rounded-lg bg-destructive/10 p-3" role="alert">
            <X className="h-4 w-4" /> Chave inválida. Verifique e tente novamente.
          </div>
        )}
        {status === "no_credits" && (
          <div className="flex items-center gap-2 text-sm text-warning rounded-lg bg-warning/10 p-3" role="alert">
            <AlertTriangle className="h-4 w-4" /> Chave válida mas sem créditos na conta Anthropic.
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center gap-2 text-sm text-destructive rounded-lg bg-destructive/10 p-3" role="alert">
            <X className="h-4 w-4" /> Erro ao verificar. Tente novamente.
          </div>
        )}
      </div>
    </div>
  );
}
