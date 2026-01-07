'use client';

import { useState, useId, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ShieldHalf, Sparkles, Check } from 'lucide-react';
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

const CritiqueCard = ({ critique }: { critique: CrucibleCritique }) => {
  const persona = ADVERSARY_PERSONAS.find(p => p.name === critique.personaName);
  const typedAnalysis = useTypewriter(critique.analysis);

  return (
    <Card className="overflow-hidden border-destructive/20 hover:border-destructive/40 transition-colors">
      <CardHeader className="flex flex-row items-center gap-4 bg-muted/30 p-4">
        <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
          <AvatarFallback className="bg-primary/10 text-primary">
            {persona?.icon ? <persona.icon className="h-6 w-6" /> : <ShieldHalf className="h-6 w-6" />}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">{critique.personaName}</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Risk Level</span>
              <Badge variant={(critique.riskScore ?? 0) > 75 ? "destructive" : (critique.riskScore ?? 0) > 40 ? "secondary" : "default"} className="font-mono">
                {critique.riskScore ?? 0}%
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {critique.keyConcerns.map(concern => (
              <Badge key={concern} variant="outline" className="text-[10px] py-0 border-destructive/30 text-destructive">{concern}</Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 bg-gradient-to-b from-transparent to-muted/5">
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-3">Threat Assessment</h4>
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line font-light">{typedAnalysis}</p>
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
    if (result) {
      setDisplayedCritiques([]);
      let critiqueIndex = 0;
      const intervalId = setInterval(() => {
        if (critiqueIndex < result.critiques.length) {
          setDisplayedCritiques(prev => [...prev, result.critiques[critiqueIndex]]);
          critiqueIndex++;
        } else {
          clearInterval(intervalId);
        }
      }, 800); // Faster reveal for better UX
      return () => clearInterval(intervalId);
    }
  }, [result]);

  const handlePersonaToggle = (personaId: string) => {
    setSelectedPersonas(prev => {
      const isSelected = prev.some(p => p.id === personaId);
      if (isSelected) {
        return prev.filter(p => p.id !== personaId);
      } else {
        const persona = ADVERSARY_PERSONAS.find(p => p.id === personaId);
        return persona ? [...prev, persona] : prev;
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan.trim() || selectedPersonas.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Intelligence Gap',
        description: 'You must provide a plan and select your adversaries to begin the simulation.',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setDisplayedCritiques([]);

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

    setIsLoading(false);
  };

  const executiveSummary = useTypewriter(result?.executiveSummary || '', 10);
  const avgRiskScore = result ? Math.round(result.critiques.reduce((acc, curr) => acc + (curr.riskScore || 0), 0) / result.critiques.length) : 0;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-xl">
              <ShieldHalf className="h-6 w-6 text-primary" />
            </div>
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-primary/20 bg-primary/5 text-primary">High Fidelity Simulation</Badge>
          </div>
          <h1 className="font-headline text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Crucible</h1>
          <p className="text-muted-foreground text-xl mt-3 max-w-2xl font-light leading-relaxed">
            The AI Red Team & Decision Simulator. Pressure-test your strategy against the world&apos;s most ruthless digital adversaries.
          </p>
        </div>
        <div className="flex gap-4">
          {result && (
            <Button variant="outline" onClick={() => { setPlan(''); setResult(null); setSelectedPersonas([]); }} className="rounded-full px-6">
              Reset Engine
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Configuration */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-primary/10 shadow-xl shadow-primary/5 overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/50 to-primary" />
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold">Strategy Input</CardTitle>
              <CardDescription>Detail your plan for the Red Team to dismantle.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="plan-input" className="text-xs font-black uppercase tracking-widest text-muted-foreground">The Blueprint</Label>
                    <span className="text-[10px] text-muted-foreground font-mono">{plan.length} chars</span>
                  </div>
                  <Textarea
                    id="plan-input"
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    placeholder="e.g., 'Launch a decentralized compute network targeting AI researchers with a token-based incentive model...'"
                    className="min-h-[200px] bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/40 text-sm leading-relaxed resize-none transition-all"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">The Red Team</Label>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[9px] font-bold uppercase tracking-tight px-2 hover:bg-primary/10"
                        onClick={() => setSelectedPersonas(ADVERSARY_PERSONAS)}
                        disabled={isLoading}
                      >
                        All
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[9px] font-bold uppercase tracking-tight px-2 text-destructive hover:bg-destructive/10"
                        onClick={() => setSelectedPersonas([])}
                        disabled={isLoading}
                      >
                        None
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20">
                    {ADVERSARY_PERSONAS.map((persona) => {
                      const isSelected = selectedPersonas.some(p => p.id === persona.id);
                      return (
                        <div
                          key={persona.id}
                          className={cn(
                            "group flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer border",
                            isSelected
                              ? "bg-primary/5 border-primary/30 shadow-sm"
                              : "bg-transparent border-transparent hover:bg-muted/50 grayscale-[0.8] opacity-60 hover:opacity-100 hover:grayscale-0"
                          )}
                          onClick={() => handlePersonaToggle(persona.id)}
                        >
                          <div className={cn(
                            "mt-0.5 h-4 w-4 shrink-0 rounded-full border transition-all flex items-center justify-center",
                            isSelected ? "bg-primary border-primary shadow-lg shadow-primary/20" : "border-muted-foreground/30"
                          )}>
                            {isSelected && <Check className="h-2.5 w-2.5 text-white stroke-[4]" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-bold text-xs tracking-tight">{persona.name}</span>
                              {persona.icon && <persona.icon className={cn("h-3 w-3", isSelected ? "text-primary" : "text-muted-foreground/30")} />}
                            </div>
                            <p className="text-[10px] leading-snug text-muted-foreground line-clamp-2">{persona.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-sm font-bold tracking-widest uppercase transition-all hover:scale-[1.01] active:scale-95 shadow-lg shadow-primary/20"
                  disabled={isLoading || !plan.trim() || selectedPersonas.length === 0}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Mobilizing the Red Team...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span>Initiate Simulation</span>
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Intensity Output */}
        <div className="lg:col-span-8 space-y-8 min-h-[600px]">
          <AnimatePresence mode="wait">
            {isLoading && !result ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex flex-col items-center justify-center py-40 text-center space-y-6 bg-muted/10 rounded-3xl border-2 border-dashed"
              >
                <div className="relative">
                  <div className="absolute inset-0 animate-ping bg-primary/20 rounded-full scale-150" />
                  <div className="relative bg-background p-6 rounded-full border shadow-2xl">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold tracking-tight">Constructing Adversarial Environment</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed">
                    The chosen personas are now forensically analyzing every weakness in your blueprint. Stand by for impact.
                  </p>
                </div>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                {/* Executive Summary Card */}
                <Card className="border-none shadow-2xl bg-gradient-to-br from-card to-background overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-4">
                    <div className="md:col-span-1 bg-muted/30 p-8 flex flex-col items-center justify-center border-r">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Risk Index</div>
                      <div className="relative h-32 w-32">
                        <svg viewBox="0 0 100 100" className="h-full w-full transform -rotate-90">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                          <motion.circle
                            cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                            className={cn((avgRiskScore > 75 ? "text-destructive" : avgRiskScore > 40 ? "text-orange-500" : "text-primary"))}
                            strokeDasharray="283"
                            initial={{ strokeDashoffset: 283 }}
                            animate={{ strokeDashoffset: 283 - (283 * avgRiskScore) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-black">{avgRiskScore}%</span>
                          <span className="text-[9px] uppercase font-bold tracking-tighter opacity-70">Critical</span>
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-3 p-8">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold font-headline">Intelligence Briefing</h2>
                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">Strategic Assessment</Badge>
                      </div>
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-lg font-light leading-relaxed text-foreground/80 first-letter:text-4xl first-letter:font-bold first-letter:mr-1">
                          {executiveSummary}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Critique Feed */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4 px-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">The Autopsy Reports</h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-muted to-transparent" />
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <AnimatePresence mode="popLayout">
                      {displayedCritiques.map((critique) => (
                        <motion.div
                          key={critique.personaName}
                          initial={{ opacity: 0, x: -20, scale: 0.98 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          transition={{ type: "spring", damping: 20, stiffness: 100 }}
                        >
                          <CritiqueCard critique={critique} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-40 border-2 border-dashed rounded-3xl opacity-50 space-y-4"
              >
                <div className="p-4 rounded-full bg-muted">
                  <ShieldHalf className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold uppercase tracking-widest mb-1">Engine Standby</p>
                  <p className="text-xs text-muted-foreground">Input your strategy to begin simulation.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
