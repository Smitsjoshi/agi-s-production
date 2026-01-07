'use client';

import { useState, useId, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Loader2,
  ShieldHalf,
  Sparkles,
  Check,
  ShieldAlert,
  Zap,
  ArrowLeft,
  Share2,
  RefreshCcw,
  Terminal,
  CheckCircle2,
  Crosshair
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateCrucibleAction } from '@/app/actions';
import type { CrucibleOutput, AdversaryPersona, CrucibleCritique } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { AnimatePresence, motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ADVERSARY_PERSONAS } from '@/lib/personas';
import { cn } from '@/lib/utils';


const useTypewriter = (text: string, speed = 20) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    setDisplayText('');
    if (text) {
      let i = 0;
      const timerId = setInterval(() => {
        if (i < text.length) {
          setDisplayText(prev => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(timerId);
        }
      }, speed);
      return () => clearInterval(timerId);
    }
  }, [text, speed]);

  return displayText;
};

const RiskGauge = ({ value }: { value: number }) => {
  const rotation = (value / 100) * 180;
  return (
    <div className="relative w-40 h-20 overflow-hidden">
      <div className="absolute inset-x-0 top-0 w-40 h-40 bg-muted/20 rounded-full border-[12px] border-muted" />
      <motion.div
        className={cn(
          "absolute inset-x-0 top-0 w-40 h-40 rounded-full border-[12px] border-transparent transition-colors duration-1000",
          value > 75 ? "border-t-destructive border-r-destructive" :
            value > 40 ? "border-t-amber-500 border-r-amber-500" :
              "border-t-emerald-500 border-r-emerald-500"
        )}
        initial={{ rotate: -90 }}
        animate={{ rotate: -90 + rotation }}
        transition={{ duration: 2, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ transformOrigin: 'center center' }}
      />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end h-full">
        <span className="text-3xl font-black leading-none">{value}%</span>
        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">Risk Index</span>
      </div>
    </div>
  );
};

const CritiqueCard = ({ critique }: { critique: CrucibleCritique }) => {
  const [showSolution, setShowSolution] = useState(false);
  const persona = ADVERSARY_PERSONAS.find(p => p.name === critique.personaName);
  const typedAnalysis = useTypewriter(critique.analysis, 10);

  return (
    <Card className="group relative overflow-hidden border-none bg-gradient-to-br from-background to-muted/10 shadow-xl transition-all hover:shadow-2xl hover:translate-y-[-2px]">
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1",
        (critique.riskScore ?? 0) > 75 ? "bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]" :
          (critique.riskScore ?? 0) > 40 ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" :
            "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
      )} />

      <CardHeader className="flex flex-row items-start gap-6 p-8 pb-4 relative z-10">
        <div className="relative group/avatar">
          <div className="absolute -inset-1.5 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-2xl blur-md opacity-50 group-hover/avatar:opacity-100 transition duration-500" />
          <Avatar className="h-16 w-16 rounded-2xl border-none shadow-xl relative z-10">
            <AvatarFallback className="bg-background/80 backdrop-blur-md text-primary rounded-2xl">
              {persona?.icon ? <persona.icon className="h-8 w-8" /> : <ShieldHalf className="h-8 w-8" />}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black italic uppercase tracking-tight">{critique.personaName}</CardTitle>
              <div className="flex flex-wrap gap-2">
                {critique.keyConcerns.map(concern => (
                  <Badge key={concern} variant="outline" className="bg-background/50 border-primary/10 text-[9px] uppercase font-black tracking-widest py-0.5 text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-colors">
                    {concern}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground block mb-1">Threat Level</span>
              <div className="relative inline-flex items-center justify-center p-0.5 rounded-lg bg-gradient-to-br from-white/10 to-transparent">
                <Badge variant="secondary" className={cn(
                  "font-mono text-lg px-3 py-0 rounded-md border-none",
                  (critique.riskScore ?? 0) > 75 ? "bg-destructive/10 text-destructive" :
                    (critique.riskScore ?? 0) > 40 ? "bg-amber-500/10 text-amber-500" :
                      "bg-emerald-500/10 text-emerald-500"
                )}>
                  {critique.riskScore ?? 0}%
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 pt-4 relative z-10">
        <div className="space-y-6">
          <div className="relative">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-3 flex items-center gap-2">
              <Crosshair className="h-3 w-3" /> Vulnerability Analysis
            </h4>
            <div className="text-base text-foreground/80 leading-relaxed font-medium bg-muted/20 p-6 rounded-2xl border border-white/5 whitespace-pre-wrap">
              {typedAnalysis || critique.analysis}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <p className="text-[10px] text-muted-foreground italic">
              Verification required by Strategic Advisory Council
            </p>
            <Button
              onClick={() => setShowSolution(!showSolution)}
              variant={showSolution ? "default" : "outline"}
              className={cn(
                "rounded-xl font-bold transition-all shadow-lg active:scale-95 h-10 px-4",
                showSolution ? "bg-primary hover:bg-primary/90" : "border-primary/20 hover:bg-primary/10 hover:border-primary/40"
              )}
            >
              {showSolution ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> <span>Solution Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> <span>Reveal Strategic Pivot</span>
                </div>
              )}
            </Button>
          </div>

          <AnimatePresence>
            {showSolution && critique.strategicPivot && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-6 p-6 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner relative group/pivot">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl pointer-events-none" />
                  <div className="relative z-10">
                    <h5 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3">
                      <Zap className="h-3 w-3 fill-current" /> Pivot Recommendation
                    </h5>
                    <p className="text-sm text-foreground leading-relaxed font-semibold">
                      {critique.strategicPivot}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};


export default function CruciblePage() {
  const [plan, setPlan] = useState('');
  const [selectedPersonas, setSelectedPersonas] = useState<AdversaryPersona[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CrucibleOutput | null>(null);
  const [displayedCritiques, setDisplayedCritiques] = useState<CrucibleCritique[]>([]);
  const { toast } = useToast();
  const id = useId();

  useEffect(() => {
    if (result && result.critiques) {
      setDisplayedCritiques([]);
      let critiqueIndex = 0;
      const intervalId = setInterval(() => {
        if (critiqueIndex < (result?.critiques?.length || 0)) {
          setDisplayedCritiques(prev => [...prev, result.critiques[critiqueIndex]]);
          critiqueIndex++;
        } else {
          clearInterval(intervalId);
        }
      }, 600);
      return () => clearInterval(intervalId);
    }
  }, [result]);

  const reset = () => {
    setPlan('');
    setResult(null);
    setSelectedPersonas([]);
    setDisplayedCritiques([]);
  };

  const togglePersona = (persona: AdversaryPersona) => {
    setSelectedPersonas(prev => {
      const isSelected = prev.some(p => p.id === persona.id);
      if (isSelected) {
        return prev.filter(p => p.id !== persona.id);
      } else {
        return [...prev, persona];
      }
    });
  };

  const handleSimulate = async () => {
    if (!plan.trim() || selectedPersonas.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Intelligence Gap',
        description: 'You must provide a plan and select your adversaries to begin the simulation.',
      });
      return;
    }

    setIsLoading(true);
    // DO NOT reset result here to avoid early unmount before new result arrives
    setDisplayedCritiques([]);

    try {
      const response = await generateCrucibleAction({
        plan,
        personas: selectedPersonas.map(p => p.id),
      });

      if (response.success && response.data) {
        setResult(response.data);
      } else {
        toast({
          variant: 'destructive',
          title: 'Simulation Failure',
          description: response.error || 'The Red Team failed to converge. Please re-run the simulation.',
        });
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Unexpected Crash',
        description: 'A structural error occurred. Please refresh the page.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executiveSummary = useTypewriter(result?.executiveSummary || '', 10);
  const avgRiskScore = (result && result.critiques && result.critiques.length > 0)
    ? Math.round(result.critiques.reduce((acc, curr) => acc + (curr.riskScore || 0), 0) / result.critiques.length)
    : 0;

  const headerSection = (
    <div className="relative z-10 space-y-4 mb-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-md shadow-lg shadow-primary/5">
          <ShieldAlert className="h-6 w-6 text-primary animate-pulse" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            The Crucible
          </h1>
          <p className="text-sm text-muted-foreground/80 font-medium">
            Strategic Inversion & Stress Testing Engine
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container max-w-7xl mx-auto py-10 px-4 min-h-screen selection:bg-primary/20 animate-in fade-in duration-700">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="config"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            {headerSection}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Configuration Panel */}
              <div className="lg:col-span-8 space-y-6">
                <Card className="border-none bg-gradient-to-br from-background via-background to-muted/20 shadow-2xl overflow-hidden group">
                  <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

                  <CardContent className="p-8 relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="space-y-1">
                        <Label htmlFor="plan-input" className="text-sm font-bold uppercase tracking-widest text-primary/80">Strategy Blueprint</Label>
                        <p className="text-xs text-muted-foreground">Describe your plan, product, or technical architecture for analysis.</p>
                      </div>
                      <Badge variant="outline" className="font-mono text-[10px] bg-background/50 backdrop-blur-sm border-primary/20">
                        {plan.length} / 2000
                      </Badge>
                    </div>

                    <div className="relative group/input">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl blur opacity-0 group-hover/input:opacity-100 transition duration-500" />
                      <Textarea
                        id="plan-input"
                        placeholder="e.g., We are launching a decentralized identity protocol on Layer 2 to solve the high gas fee issue for social dApps..."
                        className="min-h-[280px] text-base leading-relaxed bg-background/80 backdrop-blur-sm border-primary/10 focus-visible:ring-primary/30 rounded-xl placeholder:text-muted-foreground/40 transition-all resize-none shadow-inner"
                        value={plan}
                        onChange={(e) => setPlan(e.target.value)}
                        maxLength={2000}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between pt-4">
                  <p className="text-xs text-muted-foreground/60 italic">
                    Simulation powered by AGI-S Advanced Reasoning Engine
                  </p>
                  <Button
                    onClick={handleSimulate}
                    disabled={isLoading || !plan.trim() || selectedPersonas.length === 0}
                    size="lg"
                    className="h-14 px-8 rounded-xl font-bold text-base shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Initializing Council...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 fill-current" />
                        <span>Begin Simulation</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>

              {/* Persona Selection Sidebar */}
              <div className="lg:col-span-4 space-y-6">
                <div className="p-6 rounded-2xl bg-muted/30 border border-primary/5 backdrop-blur-xl relative overflow-hidden group">
                  <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-700" />
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between border-b border-primary/10 pb-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/90">Command Council</h3>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Adversary Deployment</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPersonas(ADVERSARY_PERSONAS)}
                          className="h-8 px-2 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all"
                        >
                          Mobilize All
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPersonas([])}
                          className="h-8 px-2 text-[10px] font-black uppercase tracking-widest hover:bg-destructive/10 hover:text-destructive transition-all"
                        >
                          Stand Down
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 max-h-[720px] overflow-y-auto pr-3 custom-scrollbar">
                      {ADVERSARY_PERSONAS.map((persona) => {
                        const isSelected = selectedPersonas.some(p => p.id === persona.id);
                        return (
                          <motion.button
                            key={persona.id}
                            whileHover={{ scale: 1.01, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => togglePersona(persona)}
                            className={cn(
                              "relative flex flex-col items-start gap-3 p-5 rounded-2xl border transition-all duration-500 group/btn text-left overflow-hidden",
                              isSelected
                                ? "bg-primary/10 border-primary/40 shadow-[0_0_20px_rgba(var(--primary),0.05)] ring-1 ring-primary/20"
                                : "bg-background/20 border-white/5 hover:border-primary/20 hover:bg-background/40"
                            )}
                          >
                            {isSelected && (
                              <div className="absolute top-0 right-0 p-2 opacity-10">
                                <ShieldAlert className="h-12 w-12 text-primary" />
                              </div>
                            )}

                            <div className="flex items-center gap-4 w-full relative z-10">
                              <div className={cn(
                                "p-2.5 rounded-xl transition-all duration-500 shadow-xl",
                                isSelected
                                  ? "bg-primary text-primary-foreground shadow-primary/20 scale-110"
                                  : "bg-muted/50 text-muted-foreground group-hover/btn:text-primary group-hover/btn:bg-primary/5"
                              )}>
                                <persona.icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className={cn(
                                    "text-[12px] font-black leading-tight uppercase tracking-widest block transition-all",
                                    isSelected ? "text-primary translate-x-1" : "text-foreground/70"
                                  )}>
                                    {persona.name.replace('The ', '')}
                                  </span>
                                  {isSelected && (
                                    <Badge variant="outline" className="text-[8px] font-black uppercase border-primary/20 bg-primary/5 text-primary animate-pulse">
                                      Active
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-tighter">
                                  Expert Vector Analysis
                                </span>
                              </div>
                            </div>

                            <p className={cn(
                              "text-[11px] leading-relaxed transition-all mt-1 font-medium relative z-10",
                              isSelected ? "text-foreground/90" : "text-muted-foreground/50 group-hover/btn:text-muted-foreground/80"
                            )}>
                              {persona.description}
                            </p>

                            {isSelected && (
                              <motion.div
                                layoutId="check-bubble"
                                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-tl-xl bg-primary flex items-center justify-center shadow-lg"
                              >
                                <Check className="h-3 w-3 text-primary-foreground stroke-[3px]" />
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10 focus:outline-none"
          >
            {/* Results Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-primary/10">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reset}
                  className="mb-2 -ml-3 text-muted-foreground hover:text-primary transition-colors h-8 px-3"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back to Blueprint
                </Button>
                <h1 className="text-4xl font-black tracking-tight text-foreground uppercase italic leading-none">
                  Intelligence <span className="text-primary tracking-normal not-italic">Briefing</span>
                </h1>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Crucible Output ID: {id.slice(0, 8)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="rounded-xl border-primary/20 hover:bg-primary/5 transition-all h-10 px-4">
                  <Share2 className="h-4 w-4 mr-2" /> Share Assessment
                </Button>
                <Button onClick={reset} className="rounded-xl bg-primary shadow-lg shadow-primary/20 h-10 px-4">
                  <RefreshCcw className="h-4 w-4 mr-2" /> New Simulation
                </Button>
              </div>
            </div>

            {/* Executive Summary & Risk Index */}
            <Card className="border-none bg-gradient-to-br from-muted/20 to-background shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <ShieldAlert className="h-40 w-40" />
              </div>
              <CardContent className="p-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-center">
                  <div className="lg:col-span-1 flex flex-col items-center justify-center py-6 px-10 rounded-3xl bg-background/40 backdrop-blur-xl border border-white/5 shadow-inner">
                    <RiskGauge value={avgRiskScore} />
                    <div className="text-center mt-6">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block mb-1">Status Level</span>
                      <Badge className={cn(
                        "text-xs font-black uppercase px-4 py-1 tracking-widest border-none",
                        avgRiskScore > 75 ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20" :
                          avgRiskScore > 40 ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" :
                            "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                      )}>
                        {avgRiskScore > 75 ? "Critical Failure" :
                          avgRiskScore > 40 ? "High Vulnerability" : "Stable Baseline"}
                      </Badge>
                    </div>
                  </div>
                  <div className="lg:col-span-3 space-y-6">
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-4 flex items-center gap-2">
                        <Terminal className="h-4 w-4" /> Strategic Assessment
                      </h2>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-xl font-medium leading-relaxed text-foreground/90 whitespace-pre-wrap selection:bg-primary/30">
                          {executiveSummary}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Critique Feed */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground">The Autopsy Reports</h3>
                <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              </div>

              <div className="grid grid-cols-1 gap-8">
                {displayedCritiques.map((critique, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <CritiqueCard critique={critique} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
