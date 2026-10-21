import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrg } from "@/hooks/useOrg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Moon, Sun, Monitor, Palette, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import type { Database } from "@/integrations/supabase/types";

type PipelineStage = Database["public"]["Tables"]["pipeline_stages"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function Settings() {
  const { user, profile } = useAuth();
  const { orgId } = useOrg();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie seu perfil, organização e preferências</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <GeneralTab orgId={orgId} userId={user?.id} profile={profile} />
        </TabsContent>
        <TabsContent value="pipelines" className="mt-4">
          <PipelinesTab orgId={orgId} />
        </TabsContent>
        <TabsContent value="appearance" className="mt-4">
          <AppearanceTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── General Tab ──
function GeneralTab({ orgId, userId, profile }: { orgId: string | null; userId?: string; profile: Profile | null }) {
  const { toast } = useToast();
  const [profileForm, setProfileForm] = useState({ name: "", title: "", timezone: "UTC" });
  const [orgForm, setOrgForm] = useState({ name: "", slug: "", currency: "BRL", timezone: "America/Sao_Paulo" });
  const [orgSettings, setOrgSettings] = useState<Record<string, unknown>>({});
  const [industries, setIndustries] = useState<string[]>([]);
  const [newIndustry, setNewIndustry] = useState("");

  const DEFAULT_INDUSTRIES = [
    "Tecnologia", "SaaS", "Serviços", "E-commerce", "Indústria",
    "Consultoria", "Educação", "Saúde", "Financeiro", "Varejo",
    "Logística", "Agronegócio", "Imobiliário", "Jurídico", "Marketing",
  ];

  useEffect(() => {
    if (profile) setProfileForm({ name: profile.name || "", title: profile.title || "", timezone: profile.timezone || "UTC" });
  }, [profile]);

  useEffect(() => {
    if (orgId) {
      supabase.from("organizations").select("*").eq("id", orgId).single().then(({ data }) => {
        if (data) {
          const settings = (data.settings as Record<string, unknown>) || {};
          setOrgSettings(settings);
          setOrgForm({ name: data.name, slug: data.slug, currency: (settings.currency as string) || "BRL", timezone: (settings.timezone as string) || "America/Sao_Paulo" });
          const savedIndustries = settings.industries as string[] | undefined;
          setIndustries(savedIndustries && savedIndustries.length > 0 ? savedIndustries : DEFAULT_INDUSTRIES);
        }
      });
    }
  }, [orgId]);

  const saveProfile = async () => {
    if (!userId) return;
    const { error } = await supabase.from("profiles").update({
      name: profileForm.name, title: profileForm.title, timezone: profileForm.timezone,
    }).eq("id", userId);
    toast(error ? { title: "Erro", description: error.message, variant: "destructive" } : { title: "Perfil atualizado" });
  };

  const saveOrg = async () => {
    if (!orgId) return;
    const mergedSettings = { ...orgSettings, currency: orgForm.currency, timezone: orgForm.timezone };
    const { error } = await supabase.from("organizations").update({
      name: orgForm.name,
      slug: orgForm.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      settings: mergedSettings,
    }).eq("id", orgId);
    if (!error) setOrgSettings(mergedSettings);
    toast(error ? { title: "Erro", description: error.message, variant: "destructive" } : { title: "Organização atualizada" });
  };

  const saveIndustries = async (updated: string[]) => {
    if (!orgId) return;
    setIndustries(updated);
    const mergedSettings = { ...orgSettings, industries: updated };
    const { error } = await supabase.from("organizations").update({ settings: mergedSettings }).eq("id", orgId);
    if (!error) setOrgSettings(mergedSettings);
    toast(error ? { title: "Erro", description: error.message, variant: "destructive" } : { title: "Indústrias atualizadas" });
  };

  const addIndustry = () => {
    const trimmed = newIndustry.trim();
    if (!trimmed || industries.includes(trimmed)) return;
    saveIndustries([...industries, trimmed]);
    setNewIndustry("");
  };

  const removeIndustry = (ind: string) => {
    saveIndustries(industries.filter((i) => i !== ind));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Perfil Pessoal</CardTitle>
          <CardDescription className="text-[10px]">Suas informações pessoais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1"><Label className="text-xs">Nome</Label><Input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="h-8 text-xs" /></div>
            <div className="space-y-1"><Label className="text-xs">Cargo</Label><Input value={profileForm.title} onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })} className="h-8 text-xs" /></div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Fuso horário</Label>
            <Select value={profileForm.timezone} onValueChange={(v) => setProfileForm({ ...profileForm, timezone: v })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Sao_Paulo">São Paulo (BRT)</SelectItem>
                <SelectItem value="America/New_York">New York (EST)</SelectItem>
                <SelectItem value="Europe/London">London (GMT)</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" className="h-8 text-xs" onClick={saveProfile}>Salvar Perfil</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Organização</CardTitle>
          <CardDescription className="text-[10px]">Configurações gerais da organização</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1"><Label className="text-xs">Nome</Label><Input value={orgForm.name} onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })} className="h-8 text-xs" /></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Moeda padrão</Label>
              <Select value={orgForm.currency} onValueChange={(v) => setOrgForm({ ...orgForm, currency: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">BRL (R$)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Fuso horário da organização</Label>
              <Select value={orgForm.timezone} onValueChange={(v) => setOrgForm({ ...orgForm, timezone: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">São Paulo (BRT)</SelectItem>
                  <SelectItem value="America/New_York">New York (EST)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button size="sm" className="h-8 text-xs" onClick={saveOrg}>Salvar Organização</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Indústrias</CardTitle>
          <CardDescription className="text-[10px]">Personalize as opções de indústria disponíveis ao cadastrar empresas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Nova indústria"
              value={newIndustry}
              onChange={(e) => setNewIndustry(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addIndustry()}
              className="h-8 text-xs flex-1"
            />
            <Button size="sm" className="h-8" onClick={addIndustry}><Plus className="h-3 w-3" /></Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {industries.map((ind) => (
              <Badge key={ind} variant="secondary" className="text-[10px] gap-1">
                {ind}
                <button onClick={() => removeIndustry(ind)} className="hover:text-destructive"><X className="h-2.5 w-2.5" /></button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


// ── Pipelines Tab ──
function PipelinesTab({ orgId }: { orgId: string | null }) {
  const { toast } = useToast();
  const [pipelines, setPipelines] = useState<Database["public"]["Tables"]["pipelines"]["Row"][]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState("");
  const [newPipelineName, setNewPipelineName] = useState("");
  const [newStageName, setNewStageName] = useState("");
  const [newStageColor, setNewStageColor] = useState("#3b82f6");
  const [newStageProb, setNewStageProb] = useState("0");

  const fetchAll = useCallback(async () => {
    if (!orgId) return;
    const [{ data: p }, { data: s }] = await Promise.all([
      supabase.from("pipelines").select("*").eq("org_id", orgId),
      supabase.from("pipeline_stages").select("*").eq("org_id", orgId).order("order"),
    ]);
    setPipelines(p || []);
    setStages(s || []);
    if (p?.length && !selectedPipeline) setSelectedPipeline(p[0].id);
  }, [orgId, selectedPipeline]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const createPipeline = async () => {
    if (!orgId || !newPipelineName) return;
    const { data } = await supabase.from("pipelines").insert({ org_id: orgId, name: newPipelineName, is_default: pipelines.length === 0 }).select().single();
    setNewPipelineName("");
    if (data) setSelectedPipeline(data.id);
    fetchAll();
    toast({ title: "Pipeline criado" });
  };

  const deletePipeline = async (id: string) => {
    await supabase.from("pipeline_stages").delete().eq("pipeline_id", id);
    await supabase.from("pipelines").delete().eq("id", id);
    setSelectedPipeline("");
    fetchAll();
    toast({ title: "Pipeline excluído" });
  };

  const addStage = async () => {
    if (!orgId || !selectedPipeline || !newStageName) return;
    const maxOrder = stages.filter((s) => s.pipeline_id === selectedPipeline).reduce((max, s) => Math.max(max, s.order), -1);
    await supabase.from("pipeline_stages").insert({
      org_id: orgId, pipeline_id: selectedPipeline, name: newStageName,
      order: maxOrder + 1, color: newStageColor, win_probability: parseFloat(newStageProb) || 0,
    });
    setNewStageName("");
    fetchAll();
    toast({ title: "Estágio adicionado" });
  };

  const deleteStage = async (id: string) => {
    await supabase.from("pipeline_stages").delete().eq("id", id);
    fetchAll();
    toast({ title: "Estágio excluído" });
  };

  const moveStage = async (stageId: string, direction: "up" | "down") => {
    const pStages = stages.filter((s) => s.pipeline_id === selectedPipeline).sort((a, b) => a.order - b.order);
    const idx = pStages.findIndex((s) => s.id === stageId);
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === pStages.length - 1)) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    await Promise.all([
      supabase.from("pipeline_stages").update({ order: pStages[swapIdx].order }).eq("id", pStages[idx].id),
      supabase.from("pipeline_stages").update({ order: pStages[idx].order }).eq("id", pStages[swapIdx].id),
    ]);
    fetchAll();
  };

  const pipelineStages = stages.filter((s) => s.pipeline_id === selectedPipeline).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Pipelines</CardTitle>
          <CardDescription className="text-[10px]">Gerencie seus pipelines de vendas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder="Nome do pipeline" value={newPipelineName} onChange={(e) => setNewPipelineName(e.target.value)} className="h-8 text-xs" />
            <Button size="sm" className="h-8 text-xs" onClick={createPipeline}><Plus className="mr-1 h-3 w-3" />Criar</Button>
          </div>
          {pipelines.length > 0 && (
            <div className="flex gap-2">
              <Select value={selectedPipeline} onValueChange={setSelectedPipeline}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {pipelines.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {selectedPipeline && (
                <Button variant="destructive" size="sm" className="h-8 text-[10px]" onClick={() => deletePipeline(selectedPipeline)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPipeline && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Estágios</CardTitle>
            <CardDescription className="text-[10px]">Configure estágios do pipeline selecionado. Arraste para reordenar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input placeholder="Nome" value={newStageName} onChange={(e) => setNewStageName(e.target.value)} className="h-8 text-xs flex-1" />
              <Input type="color" value={newStageColor} onChange={(e) => setNewStageColor(e.target.value)} className="w-10 h-8 p-0.5" />
              <Input type="number" placeholder="Prob %" value={newStageProb} onChange={(e) => setNewStageProb(e.target.value)} className="h-8 text-xs w-20" min="0" max="100" />
              <Button size="sm" className="h-8" onClick={addStage}><Plus className="h-3 w-3" /></Button>
            </div>
            <div className="space-y-1">
              {pipelineStages.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 rounded-md border border-border p-2">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveStage(s.id, "up")} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-[10px]">▲</button>
                    <button onClick={() => moveStage(s.id, "down")} disabled={i === pipelineStages.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-[10px]">▼</button>
                  </div>
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: s.color || "#888" }} />
                  <span className="text-xs font-medium flex-1">{s.name}</span>
                  <Badge variant="outline" className="text-[8px]">{s.win_probability || 0}%</Badge>
                  <span className="text-[9px] text-muted-foreground">#{s.order}</span>
                  <button onClick={() => deleteStage(s.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Appearance Tab ──
function AppearanceTab() {
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();

  const themes = [
    { value: "light" as const, label: "Claro", icon: Sun },
    { value: "dark" as const, label: "Escuro", icon: Moon },
    { value: "system" as const, label: "Sistema", icon: Monitor },
  ];

  const accents = [
    { value: "via", label: "Viver de IA", color: "hsl(214, 71%, 14%)" },
    { value: "blue", label: "Azul", color: "hsl(221, 83%, 53%)" },
    { value: "violet", label: "Violeta", color: "hsl(262, 83%, 58%)" },
    { value: "emerald", label: "Esmeralda", color: "hsl(160, 84%, 39%)" },
    { value: "orange", label: "Laranja", color: "hsl(25, 95%, 53%)" },
    { value: "rose", label: "Rosa", color: "hsl(347, 77%, 50%)" },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-1.5"><Palette className="h-4 w-4" />Tema</CardTitle>
          <CardDescription className="text-[10px]">Escolha entre modo claro, escuro ou automático</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {themes.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.value} onClick={() => setTheme(t.value)}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${theme === t.value ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50"}`}>
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Cor de Destaque</CardTitle>
          <CardDescription className="text-[10px]">Cor primária da interface</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {accents.map((a) => (
              <button key={a.value} onClick={() => setAccentColor(a.value)}
                className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-colors ${accentColor === a.value ? "border-primary" : "border-border hover:bg-accent/50"}`}>
                <div className="h-6 w-6 rounded-full" style={{ backgroundColor: a.color }} />
                <span className="text-[9px]">{a.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
