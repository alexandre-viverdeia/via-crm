import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X, AlertTriangle, Eye, EyeOff, Mail } from "lucide-react";
import type { OnboardingStepProps } from "./types";

type TestStatus = "idle" | "testing" | "success" | "invalid_key" | "domain_not_verified" | "error";

export function EmailStep({ orgId, userEmail, setCanContinue, setStepData }: OnboardingStepProps) {
  const [apiKey, setApiKey] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<TestStatus>("idle");

  const handleTest = async () => {
    if (!apiKey.trim() || !fromEmail.trim() || !orgId) return;
    setStatus("testing");
    try {
      const { data, error } = await supabase.functions.invoke("validate-resend-key", {
        body: { api_key: apiKey.trim(), from_email: fromEmail.trim(), from_name: fromName.trim() || undefined, test_to: userEmail, org_id: orgId },
      });
      if (error) throw error;
      if (data?.valid) {
        setStatus("success");
        setCanContinue(true);
        setStepData("emailConfigured", true);
        setStepData("emailFrom", fromEmail.trim());
      } else if (data?.error === "domain_not_verified") {
        setStatus("domain_not_verified");
        setCanContinue(true); // non-blocking
        setStepData("emailConfigured", true);
        setStepData("emailFrom", fromEmail.trim());
      } else {
        setStatus("invalid_key");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold">Configure o envio de emails</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Necessário para enviar cadências e emails de automação. A sincronização da caixa de entrada (Gmail/Outlook) é configurada em Configurações.
        </p>
      </div>

      <details className="rounded-xl border border-border bg-muted/50 p-4">
        <summary className="text-sm font-medium cursor-pointer">Como obter</summary>
        <ol className="text-sm text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
          <li>Crie conta gratuita em <span className="font-mono text-foreground">resend.com</span></li>
          <li>API Keys → Create API Key (permissão: Sending access)</li>
          <li>Domains → Adicione e verifique seu domínio</li>
          <li>Copie a key e preencha abaixo</li>
        </ol>
      </details>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="resend-key">Resend API Key</Label>
          <div className="relative">
            <Input
              id="resend-key"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setStatus("idle"); }}
              placeholder="re_..."
              className="pr-10"
            />
            <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="from-email">Email de envio</Label>
          <Input id="from-email" type="email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="vendas@suaempresa.com" />
          <p className="text-xs text-muted-foreground">Emails de sequências sairão deste endereço</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="from-name">Nome de exibição</Label>
          <Input id="from-name" value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Time Comercial — Acme" />
          <p className="text-xs text-muted-foreground">Aparece no campo "De:" para o destinatário</p>
        </div>

        <Button variant="secondary" className="w-full" onClick={handleTest} disabled={!apiKey.trim() || !fromEmail.trim() || status === "testing"}>
          {status === "testing" ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando para {userEmail}...</>
          ) : (
            <><Mail className="mr-2 h-4 w-4" /> Enviar email de teste</>
          )}
        </Button>

        {status === "success" && (
          <div className="flex items-center gap-2 text-sm text-primary rounded-lg bg-primary/10 p-3" role="status" aria-live="polite">
            <Check className="h-4 w-4" /> Email enviado! Verifique sua caixa de entrada.
          </div>
        )}
        {status === "domain_not_verified" && (
          <div className="flex items-center gap-2 text-sm rounded-lg bg-warning/10 p-3 text-warning" role="alert">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Domínio não verificado no Resend. Os emails podem ir para spam. Configure em resend.com/domains.</span>
          </div>
        )}
        {status === "invalid_key" && (
          <div className="flex items-center gap-2 text-sm text-destructive rounded-lg bg-destructive/10 p-3" role="alert">
            <X className="h-4 w-4" /> Chave inválida.
          </div>
        )}
      </div>
    </div>
  );
}
