import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import { WelcomeStep } from "./WelcomeStep";
import { CompanyStep } from "./CompanyStep";

import { AICopilotStep } from "./AICopilotStep";
import { EmailStep } from "./EmailStep";
import { SlackStep } from "./SlackStep";
import { CompleteStep } from "./CompleteStep";
import type { OnboardingStepProps } from "./types";

const STEPS = [
  { key: "welcome", label: "Boas-vindas", required: true },
  { key: "company", label: "Empresa", required: true },
  { key: "ai", label: "AI Copilot", required: false },
  { key: "email", label: "Email", required: false },
  { key: "slack", label: "Slack", required: false },
  { key: "complete", label: "Conclusão", required: true },
];

export function OnboardingModal() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("left");
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [orgId, setOrgId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!user || !profile || initializedRef.current) return;
    const p = profile as any;
    if (!p.onboarding_completed) {
      initializedRef.current = true;
      setIsOpen(true);
      setCurrentStep(Math.max(0, (p.onboarding_step ?? 1) - 1));
    }
    if (profile.org_id) setOrgId(profile.org_id);
  }, [user, profile]);

  // Focus trap + block Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); return; }
      if (e.key === "Tab" && modalRef.current) {
        const els = modalRef.current.querySelectorAll<HTMLElement>(
          'button,input,select,textarea,[tabindex]:not([tabindex="-1"])'
        );
        if (!els.length) return;
        const first = els[0], last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const saveProgress = useCallback(async (step: number) => {
    if (!user) return;
    await supabase.from("profiles").update({ onboarding_step: step + 1 } as any).eq("id", user.id);
  }, [user]);

  const advancingRef = useRef(false);

  const handleNext = useCallback(() => {
    if (advancingRef.current) return;
    if (currentStep < STEPS.length - 1) {
      advancingRef.current = true;
      const next = currentStep + 1;
      setDirection("left");
      setCompletedSteps(prev => new Set([...prev, STEPS[currentStep].key]));
      setCurrentStep(next);
      setCanContinue(false);
      // Don't call saveProgress here to avoid profile re-fetch loop
      // Progress is saved on completion
      setTimeout(() => { advancingRef.current = false; }, 300);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection("right");
      setCurrentStep(currentStep - 1);
      setCanContinue(true);
    }
  }, [currentStep]);

  const handleComplete = useCallback(async (navigateTo?: string) => {
    if (!user) return;
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    await supabase.from("profiles").update({ onboarding_completed: true, onboarding_step: STEPS.length } as any).eq("id", user.id);
    setTimeout(() => {
      setIsOpen(false);
      if (navigateTo) navigate(navigateTo);
    }, 600);
  }, [user, navigate]);

  const updateStepData = useCallback((key: string, value: any) => {
    setStepData(prev => ({ ...prev, [key]: value }));
  }, []);

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const isWelcome = step.key === "welcome";
  const isComplete = step.key === "complete";
  const showFooter = !isWelcome && !isComplete;

  const stepProps: OnboardingStepProps = {
    orgId,
    userId: user?.id ?? "",
    userEmail: user?.email ?? "",
    userName: (profile as any)?.name ?? user?.email?.split("@")[0] ?? "",
    stepData,
    setStepData: updateStepData,
    setCanContinue,
    onNext: handleNext,
    onComplete: handleComplete,
    setOrgId,
    completedSteps,
  };

  const renderStep = () => {
    switch (step.key) {
      case "welcome": return <WelcomeStep {...stepProps} />;
      case "company": return <CompanyStep {...stepProps} />;
      case "ai": return <AICopilotStep {...stepProps} />;
      case "email": return <EmailStep {...stepProps} />;
      case "slack": return <SlackStep {...stepProps} />;
      case "complete": return <CompleteStep {...stepProps} />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Configuração inicial">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        ref={modalRef}
        className="relative w-full h-full md:w-[92vw] md:max-w-[640px] md:h-auto md:max-h-[85vh] md:rounded-2xl border border-border bg-card flex flex-col overflow-hidden"
      >
        {showFooter && (
          <div className="px-6 pt-5 pb-3 border-b border-border shrink-0">
            <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden mb-3">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Passo {currentStep + 1} de {STEPS.length} · {step.label}
              </span>
              <Badge variant={step.required ? "destructive" : "secondary"} className="text-xs">
                {step.required ? "Obrigatório" : "Opcional"}
              </Badge>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div
            key={currentStep}
            className="px-6 py-6 onboarding-slide-in"
            style={{ animationName: direction === "left" ? "onboardingSlideLeft" : "onboardingSlideRight" }}
          >
            {renderStep()}
          </div>
        </div>

        {showFooter && (
          <div className="border-t border-border px-6 py-4 flex items-center justify-between shrink-0">
            <Button variant="ghost" size="sm" onClick={handleBack} disabled={currentStep <= 1}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
            </Button>
            <div className="flex flex-col items-end gap-1">
              <Button size="sm" onClick={handleNext} disabled={step.required && !canContinue}>
                Continuar <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              {!step.required && (
                <button
                  onClick={handleNext}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
                >
                  Pular por agora
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
