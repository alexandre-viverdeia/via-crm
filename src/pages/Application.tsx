import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";

const BENEFITS = [
  "Diagnóstico de onde a IA gera resultado na sua operação",
  "Acompanhamento próximo para tirar os projetos do papel",
  "Método para especificar e construir soluções com IA",
];

const ERRORS: Record<string, string> = {
  invalid_name: "Escreva o seu nome completo.",
  invalid_email: "Confira o e-mail.",
  invalid_length: "Algum campo ficou longo demais. Encurte e tente de novo.",
};

export default function Application() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", role: "", challenge: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    // submit_application is a public database function: it creates the contact, the deal and the first-contact task.
    const { error: rpcError } = await supabase.rpc("submit_application", {
      p_name: form.name,
      p_email: form.email,
      p_phone: form.phone || null,
      p_company: form.company || null,
      p_role: form.role || null,
      p_challenge: form.challenge || null,
    });
    setSending(false);
    if (rpcError) {
      const code = Object.keys(ERRORS).find((k) => rpcError.message.includes(k));
      setError(code ? ERRORS[code] : "Não foi possível enviar agora. Tente de novo em instantes.");
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-primary">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-5">
          <img src="/brand/icone-via.png" alt="Viver de IA" className="h-9 w-9 rounded-lg ring-1 ring-white/20" />
          <span className="text-sm font-medium tracking-[0.2em]">VIVER DE IA</span>
        </div>
        <div className="mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-6 lg:grid-cols-2 lg:pb-24">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.2em] text-primary-foreground/70">Mentoria em IA para empresários</p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">Aplicação para a mentoria</h1>
            <p className="text-lg text-primary-foreground/80">
              Conte sobre a sua empresa. Se fizer sentido para os dois lados, o nosso time te chama para um diagnóstico.
            </p>
            <ul className="space-y-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-3 text-primary-foreground/90">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <Card className="border-0 shadow-2xl">
            {sent ? (
              <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                <CheckCircle2 className="h-12 w-12 text-success" />
                <h2 className="text-2xl font-semibold">Recebemos a sua aplicação</h2>
                <p className="max-w-sm text-muted-foreground">O nosso time vai falar com você pelo WhatsApp ou pelo e-mail em até um dia útil.</p>
              </CardContent>
            ) : (
              <>
                <CardHeader>
                  <CardTitle>Quero aplicar</CardTitle>
                  <CardDescription>Leva menos de dois minutos.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo</Label>
                      <Input id="name" required value={form.name} onChange={update("name")} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" type="email" required value={form.email} onChange={update("email")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">WhatsApp</Label>
                        <Input id="phone" type="tel" value={form.phone} onChange={update("phone")} />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="company">Empresa</Label>
                        <Input id="company" value={form.company} onChange={update("company")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Cargo</Label>
                        <Input id="role" value={form.role} onChange={update("role")} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="challenge">Qual o maior desafio da sua empresa hoje?</Label>
                      <Textarea id="challenge" rows={3} value={form.challenge} onChange={update("challenge")} />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" className="w-full" disabled={sending}>
                      {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Enviar aplicação
                    </Button>
                  </form>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </header>
    </div>
  );
}
