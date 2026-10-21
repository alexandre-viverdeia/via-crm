import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Everything the AI needs to know about the deal, in plain Portuguese. */
  context: string;
  contactName: string;
  /** Saves the chosen message in the deal history. */
  onSave: (message: string) => Promise<void>;
}

export function FollowUpAIDialog({ open, onOpenChange, context, contactName, onSave }: Props) {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const generate = async () => {
    setLoading(true);
    // ai-email runs on the Lovable AI gateway; we ask for a short WhatsApp message instead of an e-mail.
    const { data, error } = await supabase.functions.invoke("ai-email", {
      body: {
        prompt: `Escreva uma mensagem curta de WhatsApp, em até 4 frases, para retomar a conversa com ${contactName}. ` +
          "Seja humano e específico, sem parecer robô, e termine com uma pergunta simples que facilite a resposta. " +
          "Não use assunto nem assinatura.",
        tone: "casual",
        context,
      },
    });
    setLoading(false);
    if (error || !data?.body) {
      toast({ title: "A IA não respondeu agora", description: "Tente de novo em alguns segundos.", variant: "destructive" });
      return;
    }
    setMessage(data.body.trim());
  };

  const copy = async () => {
    await navigator.clipboard.writeText(message);
    toast({ title: "Mensagem copiada", description: "Cole no WhatsApp ou no e-mail." });
  };

  const save = async () => {
    setSaving(true);
    await onSave(message);
    setSaving(false);
    onOpenChange(false);
    setMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Follow-up com IA</DialogTitle>
          <DialogDescription>A IA lê o histórico do negócio e escreve a mensagem para retomar o contato com {contactName}.</DialogDescription>
        </DialogHeader>
        {message ? (
          <Textarea rows={7} value={message} onChange={(e) => setMessage(e.target.value)} />
        ) : (
          <div className="flex h-40 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Clique em Gerar mensagem."}
          </div>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={generate} disabled={loading}>
            <Sparkles className="mr-2 h-4 w-4" />{message ? "Gerar outra" : "Gerar mensagem"}
          </Button>
          {message && (
            <>
              <Button variant="outline" onClick={copy}><Copy className="mr-2 h-4 w-4" />Copiar</Button>
              <Button onClick={save} disabled={saving}>Salvar no histórico</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
