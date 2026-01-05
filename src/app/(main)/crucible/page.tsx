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
      }, 2000); // Display a new critique every 2 seconds
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
        title: 'Missing Information',
        description: 'Please provide a plan and select at least one adversary persona.',
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
        title: 'Error during simulation',
        description: response.error || 'The AI failed to generate a critique. Please try again.',
      });
    }

    setIsLoading(false);
  };

  const executiveSummary = useTypewriter(result?.executiveSummary || '');

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold text-primary">Crucible</h1>
        <p className="text-muted-foreground text-lg mt-2">The AI Red Team & Decision Simulator. Pressure-test your ideas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="lg:col-span-1 sticky top-24">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Define your plan and select your adversaries.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="plan-input">Your Plan or Idea</Label>
                <Textarea
                  id="plan-input"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  placeholder="e.g., Launch a new productivity app targeting freelance developers with a subscription model..."
                  className="min-h-[150px]"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold opacity-70">Adversary Personas (The Red Team)</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[10px] font-black uppercase tracking-tighter px-2"
                      onClick={() => setSelectedPersonas(ADVERSARY_PERSONAS)}
                      disabled={isLoading}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[10px] font-black uppercase tracking-tighter px-2 text-destructive"
                      onClick={() => setSelectedPersonas([])}
                      disabled={isLoading}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                <div className="space-y-1 p-1 bg-muted/20 border rounded-xl max-h-[400px] overflow-y-auto scrollbar-hide">
                  {ADVERSARY_PERSONAS.map((persona) => {
                    const isSelected = selectedPersonas.some(p => p.id === persona.id);
                    return (
                      <div
                        key={persona.id}
                        className={cn(
                          "flex items-center space-x-3 p-2.5 rounded-lg transition-all cursor-pointer hover:bg-muted/40 group",
                          isSelected ? "bg-muted shadow-sm ring-1 ring-border" : "opacity-60 grayscale-[0.5]"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePersonaToggle(persona.id);
                        }}
                      >
                        {/* Presentational Checkbox */}
                        <div className={cn(
                          "h-4 w-4 shrink-0 rounded border transition-colors flex items-center justify-center",
                          isSelected ? "bg-primary border-primary" : "border-primary/50"
                        )}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm tracking-tight">{persona.name}</span>
                            <span className="text-[10px] leading-tight text-muted-foreground truncate">{persona.description}</span>
                          </div>
                        </div>
                        {persona.icon && <persona.icon className={cn("h-4 w-4 shrink-0", isSelected ? "text-primary" : "text-muted-foreground/30")} />}
                      </div>
                    );
                  })}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || !plan.trim() || selectedPersonas.length === 0}>
                {isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2" />Run Simulation</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-8">
          {isLoading && !result && (
            <div className="text-center p-16">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="mt-4 text-muted-foreground">The Red Team is assembling... Critiques are being generated.</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">Executive Summary</CardTitle>
                  <CardDescription>A high-level overview of the potential risks and blind spots in your plan.</CardDescription>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                  <p>{executiveSummary}</p>
                </CardContent>
              </Card>

              <div>
                <h2 className="font-headline text-xl font-bold mb-4">Adversary Critiques</h2>
                <div className="space-y-4">
                  <AnimatePresence>
                    {displayedCritiques.map((critique) => (
                      <motion.div
                        key={critique.personaName}
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <CritiqueCard critique={critique} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !result && (
            <div className="text-center py-24 border-2 border-dashed rounded-lg">
              <ShieldHalf className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Your simulation results will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
