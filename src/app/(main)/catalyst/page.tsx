'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Wand2, BookOpen, Book, Youtube, Newspaper, Check, X, Lightbulb, Sparkles, MessageCircle, GraduationCap, Award, Info, ListChecks, Trophy, User, Calendar, Clock, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateCatalystAction, askAi } from '@/app/actions';
import type { CatalystOutput } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from "@/components/ui/progress";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

// --- TYPES ---
type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

// --- CONSTANTS ---
const exampleGoals = [
  "Master Advanced Prompt Engineering for LLMs",
  "Principles of Quantum Computing",
  "Zero to Hero: Next.js 14 & Tailwind CSS",
  "Deep Dive into Behavioral Economics"
];

// --- QUIZ COMPONENT ---
const QuizComponent = ({ quizData, onComplete }: { quizData: { question: string, options: string[], correctAnswer: string }[], onComplete?: (score: number) => void }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (onComplete) {
      const score = quizData.filter((q, i) => answers[i] === q.correctAnswer).length;
      onComplete(score);
    }
  };

  return (
    <div className="space-y-6 mt-4">
      {quizData.map((q, i) => {
        const isCorrect = submitted && answers[i] === q.correctAnswer;
        const selectedAnswer = answers[i];
        return (
          <div key={i} className="p-4 border rounded-xl bg-muted/20 backdrop-blur-sm">
            <p className="font-bold mb-4">{i + 1}. {q.question}</p>
            <RadioGroup value={selectedAnswer} onValueChange={(val) => handleAnswerChange(i, val)} disabled={submitted}>
              {q.options.map(opt => {
                const isSelected = selectedAnswer === opt;
                const isCorrectOption = q.correctAnswer === opt;
                const radioId = `q${i}-opt-${opt.replace(/[^a-zA-Z0-9]/g, '')}`;

                let stateColor = "";
                if (submitted) {
                  if (isCorrectOption) stateColor = "text-green-500 font-bold";
                  else if (isSelected && !isCorrectOption) stateColor = "text-red-500 font-bold";
                }

                return (
                  <div key={opt} className={cn("flex items-center space-x-3 p-3 rounded-lg transition-colors", submitted && isSelected ? 'bg-background shadow-sm' : 'hover:bg-muted/30')}>
                    <RadioGroupItem value={opt} id={radioId} />
                    <Label htmlFor={radioId} className={cn("flex-1 cursor-pointer text-sm", stateColor)}>
                      {opt}
                    </Label>
                    {submitted && isCorrectOption && <Check className="h-5 w-5 text-green-500" />}
                    {submitted && isSelected && !isCorrectOption && <X className="h-5 w-5 text-red-500" />}
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        );
      })}
      {!submitted ? (
        <Button onClick={handleSubmit} disabled={Object.keys(answers).length !== quizData.length} className="w-full">Submit Assessment</Button>
      ) : (
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => { setSubmitted(false); setAnswers({}); }} className="flex-1">Restart</Button>
        </div>
      )}
    </div>
  );
};

// --- CHAT TUTOR COMPONENT ---
const TutorChat = ({ context }: { context: string }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hello! I am Dr. Catalyst, your personal tutor for this curriculum. Ask me anything about the modules, and I'll help you master the concepts.", timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }]);
    setIsThinking(true);

    try {
      const response = await askAi(
        `You are Dr. Catalyst, an expert tutor.
                 STRICT CONTEXT: You are teaching a student about: "${context}".
                 User Question: "${userMsg}"
                 
                 Rules:
                 1. Only answer questions related to the curriculum.
                 2. If off-topic, politely redirect.
                 3. Be encouraging and Socratic (ask guiding questions).
                 4. Keep answers concise but insightful.`,
        'AGI-S S-2',
        messages.map(m => ({ role: m.role, content: m.content }))
      );

      const answer = (response as any).answer || "I apologize, I'm having trouble connecting to the knowledge base.";
      setMessages(prev => [...prev, { role: 'assistant', content: answer, timestamp: new Date() }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection error. Please try again.", timestamp: new Date() }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col rounded-3xl border-2 border-primary/10 shadow-2xl overflow-hidden bg-background/50 backdrop-blur-3xl">
      <CardHeader className="bg-primary/5 border-b border-primary/10 px-6 py-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-primary shadow-lg ring-2 ring-primary/20">
            <AvatarFallback className="bg-primary text-primary-foreground font-black">DR</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg font-black">Dr. Catalyst</CardTitle>
            <CardDescription className="text-primary font-bold text-xs">AI Academic Tutor</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0 relative">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex gap-3 max-w-[85%]", m.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className={cn("text-xs font-bold", m.role === 'user' ? "bg-muted text-foreground" : "bg-primary text-primary-foreground")}>
                    {m.role === 'user' ? "ME" : "DR"}
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                  m.role === 'user' ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted/80 rounded-tl-none border"
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex gap-3 max-w-[85%]">
                <Avatar className="h-8 w-8 shrink-0"><AvatarFallback className="bg-primary text-primary-foreground">DR</AvatarFallback></Avatar>
                <div className="p-3 rounded-2xl bg-muted/80 rounded-tl-none border flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 bg-background/80 border-t border-primary/5">
        <form
          className="flex w-full gap-2"
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
        >
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about the curriculum..."
            className="rounded-full bg-muted/50 border-transparent focus:bg-background focus:border-primary/20"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isThinking} className="rounded-full h-10 w-10 shrink-0">
            <MessageCircle className="h-5 w-5" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function CatalystPage() {
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CatalystOutput | null>(null);
  const [progress, setProgress] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const handleGenerate = async (currentGoal: string) => {
    if (!currentGoal.trim()) return;
    setIsLoading(true);
    setResult(null);
    setProgress(0);
    setCompletedQuizzes(new Set());

    try {
      const response = await generateCatalystAction({ goal: currentGoal });
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        throw new Error(response.error || 'Failed to generate learning path.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Generating Path',
        description: error.message,
      });
    }

    setIsLoading(false);
  };

  const handleQuizComplete = (moduleIndex: number) => {
    if (!completedQuizzes.has(moduleIndex)) {
      const next = new Set(completedQuizzes);
      next.add(moduleIndex);
      setCompletedQuizzes(next);
      const totalSteps = (result?.modules.length || 0) + 1; // Modules + Final Exam
      setProgress((next.size / totalSteps) * 100);
      toast({ title: "Module Completed!", description: "Great job. Keep going!" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate(goal);
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <div className="container mx-auto p-4 md:p-8">
        <AnimatePresence>
          {!result && (
            <motion.div
              key="prompt-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-3xl mx-auto py-20"
            >
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-6">
                  <GraduationCap className="h-10 w-10 text-primary" />
                </div>
                <h1 className="font-headline text-6xl font-black text-primary tracking-tight">Catalyst</h1>
                <p className="text-muted-foreground text-xl mt-4 max-w-xl mx-auto">The Super Educator. Transform your curiosity into a professional-grade curriculum in seconds.</p>
              </div>

              <Card className="shadow-2xl border-2 border-primary/10 overflow-hidden bg-card/50 backdrop-blur-xl">
                <form onSubmit={handleSubmit}>
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl">Establish Your Focus</CardTitle>
                    <CardDescription className="text-base">Target a specific skill, academic subject, or technical certification.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="relative group">
                      <Input
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="e.g., 'Master Advanced Prompt Engineering for LLMs'"
                        className="text-lg h-16 pl-6 pr-16 bg-muted/30 border-2 border-transparent focus:border-primary/30 transition-all rounded-2xl"
                        disabled={isLoading}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Sparkles className="h-6 w-6 text-primary/40 animate-pulse" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col gap-6 pb-12">
                    <Button type="submit" disabled={isLoading || !goal.trim()} className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20">
                      {isLoading ? <Loader2 className="animate-spin mr-2" /> : <><Wand2 className="mr-2" />Architect Curriculum</>}
                    </Button>
                    <div className="w-full space-y-4">
                      <div className="flex items-center gap-4">
                        <Separator className="flex-1" />
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">Example Tracks</span>
                        <Separator className="flex-1" />
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {exampleGoals.map(g => (
                          <Button key={g} variant="outline" size="sm" onClick={() => handleGenerate(g)} disabled={isLoading} className="rounded-full hover:bg-primary/5 hover:text-primary transition-all border-primary/20">
                            {g}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardFooter>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading && !result && (
          <div className="fixed inset-0 bg-background/95 z-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full animate-pulse" />
              <Loader2 className="h-24 w-24 animate-spin text-primary relative" />
            </div>
            <h2 className="text-3xl font-black mb-2">Designing Your Mastery Path</h2>
            <p className="text-xl text-muted-foreground max-w-md">Our AI Dean is curating modules, assessments, and professional resources tailored to your goal.</p>
          </div>
        )}

        {result && (
          <motion.div
            key="result-view"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto pb-24"
          >
            {/* Header Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center gap-2">
                  <BadgeUI variant="outline" className="border-primary/20 text-primary uppercase font-black tracking-tighter">{result.difficulty}</BadgeUI>
                  <BadgeUI variant="outline" className="text-muted-foreground font-mono">{result.estimatedTime}</BadgeUI>
                </div>
                <h1 className="font-headline text-5xl font-black tracking-tight leading-tight">{result.title}</h1>
                <p className="text-muted-foreground text-xl max-w-3xl leading-relaxed">{result.description}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {result.keyTakeaways.map((tk, i) => (
                    <span key={i} className="text-sm border-l-4 border-primary/30 pl-3 py-1 font-medium bg-muted/20 pr-4 rounded-r-lg">
                      {tk}
                    </span>
                  ))}
                </div>
              </div>
              <Card className="lg:col-span-1 bg-primary/5 border-primary/10 shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Prerequisites</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.prerequisites.map((p, i) => (
                    <div key={i} className="flex gap-2 items-start text-sm">
                      <ListChecks className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="opacity-80">{p}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Progress Bar */}
            <div className="sticky top-20 z-40 bg-background/80 backdrop-blur-md py-4 mb-8 border-b border-primary/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Curriculum Mastery</span>
                <span className="text-xs font-mono font-bold">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-muted/30" />
            </div>

            <Tabs defaultValue="curriculum" className="space-y-8">
              <TabsList className="grid w-full grid-cols-5 h-14 p-1 rounded-2xl bg-muted/30 border">
                <TabsTrigger value="curriculum" className="rounded-xl font-bold uppercase text-[10px] tracking-widest">
                  <BookOpen className="mr-2 h-4 w-4" /> Curriculum
                </TabsTrigger>
                <TabsTrigger value="schedule" className="rounded-xl font-bold uppercase text-[10px] tracking-widest">
                  <Calendar className="mr-2 h-4 w-4" /> Schedule
                </TabsTrigger>
                <TabsTrigger value="library" className="rounded-xl font-bold uppercase text-[10px] tracking-widest">
                  <Book className="mr-2 h-4 w-4" /> Library
                </TabsTrigger>
                <TabsTrigger value="tutor" className="rounded-xl font-bold uppercase text-[10px] tracking-widest">
                  <MessageCircle className="mr-2 h-4 w-4" /> AI Tutor
                </TabsTrigger>
                <TabsTrigger value="final" className="rounded-xl font-bold uppercase text-[10px] tracking-widest">
                  <Award className="mr-2 h-4 w-4" /> Exam
                </TabsTrigger>
              </TabsList>

              {/* TAB: CURRICULUM */}
              <TabsContent value="curriculum" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  <div className="md:col-span-8">
                    <Accordion type="single" collapsible defaultValue="item-0" className="w-full space-y-6">
                      {result.modules.map((module, index) => (
                        <AccordionItem value={`item-${index}`} key={index} className="bg-card/50 border rounded-2xl mb-4 overflow-hidden border-primary/5 hover:border-primary/20 transition-all">
                          <AccordionTrigger className="p-8 text-lg font-semibold hover:no-underline">
                            <div className="flex items-center gap-6">
                              <div className="relative">
                                <div className={cn("absolute inset-0 blur-lg opacity-20 bg-primary rounded-full", completedQuizzes.has(index) ? "bg-green-500" : "")} />
                                <span className={cn("flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 text-primary font-black text-2xl relative border-2 border-primary/5 shadow-inner", completedQuizzes.has(index) ? "bg-green-500/10 text-green-500 border-green-500/20" : "")}>
                                  {completedQuizzes.has(index) ? <Check className="h-8 w-8" /> : (index + 1)}
                                </span>
                              </div>
                              <div className="text-left">
                                <h3 className="text-2xl font-black">{module.title}</h3>
                                <p className="text-muted-foreground text-sm font-light mt-1">{module.description}</p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="p-8 pt-0">
                            <div className="space-y-10 border-l-2 border-primary/10 ml-[2.35rem] pl-10 pt-4">
                              {/* Concepts */}
                              <div className="grid grid-cols-1 gap-8">
                                {module.concepts.map(concept => (
                                  <div key={concept.name} className="space-y-4">
                                    <h4 className="font-black text-lg flex items-center gap-3">
                                      <span className="h-2 w-2 rounded-full bg-primary" />
                                      {concept.name}
                                    </h4>
                                    <p className="text-base text-muted-foreground/90 leading-relaxed font-light">{concept.explanation}</p>
                                    <div className="flex gap-3 flex-wrap">
                                      {concept.resources.map(res => {
                                        const Icon = res.type === 'Video' ? Youtube : res.type === 'Article' ? Newspaper : Book;
                                        return (
                                          <Button key={res.url} variant="outline" size="sm" asChild className="rounded-xl border-primary/10 hover:bg-primary/5">
                                            <a href={res.url} target="_blank" rel="noopener noreferrer">
                                              <Icon className="mr-2 h-4 w-4 text-primary" />
                                              {res.title}
                                            </a>
                                          </Button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <Separator className="bg-primary/5" />

                              {/* Project */}
                              <Card className="bg-muted/30 border-none shadow-none rounded-2xl p-6">
                                <h3 className="font-black text-lg mb-4 flex items-center gap-3"><Lightbulb className="h-6 w-6 text-amber-500" />Mastery Challenge: {module.project.title}</h3>
                                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{module.project.description}</p>
                                {module.project.steps && (
                                  <div className="space-y-3">
                                    {module.project.steps.map((step, si) => (
                                      <div key={si} className="flex gap-3 text-sm font-medium bg-background/50 p-3 rounded-xl border border-primary/5">
                                        <span className="text-primary font-black">0{si + 1}.</span>
                                        <span className="opacity-80">{step}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </Card>

                              <Separator className="bg-primary/5" />

                              {/* Quiz */}
                              <div>
                                <h3 className="font-black text-xl mb-6 flex items-center gap-3 text-green-500"><Trophy className="h-7 w-7" />Achievement Unlock</h3>
                                <QuizComponent quizData={module.quiz} onComplete={() => handleQuizComplete(index)} />
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>

                  {/* Sidebar/Quick Info */}
                  <div className="md:col-span-4 space-y-6">
                    <Card className="bg-muted/10 border-primary/10 rounded-2xl border-2 border-dashed">
                      <CardHeader>
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 italic">
                          <Lightbulb className="h-4 w-4" /> Academic Study Tips
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {result.studyTips?.map((tip, i) => (
                          <div key={i} className="text-sm font-medium bg-background/40 p-3 rounded-xl border border-primary/5 shadow-sm">
                            {tip}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* TAB: SCHEDULE */}
              <TabsContent value="schedule" className="max-w-4xl mx-auto">
                <Card className="p-6 rounded-3xl border-2 border-primary/10 shadow-xl bg-card/80 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-black text-2xl"><Calendar className="h-6 w-6 text-primary" /> Recommended Study Timeline</CardTitle>
                    <CardDescription>A structured pace to master {result.title} in {result.estimatedTime}.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-0">
                    <div className="relative border-l-2 border-primary/20 ml-6 space-y-8 py-4">
                      {result.modules.map((m, i) => (
                        <div key={i} className="relative pl-8">
                          <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-background border-4 border-primary shadow-sm" />
                          <h4 className="font-bold text-lg">Week {i + 1}: {m.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 mb-2">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> ~2 Hours</span>
                            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {m.concepts.length} Concepts</span>
                          </div>
                          <p className="text-sm opacity-80">{m.description}</p>
                        </div>
                      ))}
                      <div className="relative pl-8">
                        <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-background border-4 border-green-500 shadow-sm animate-pulse" />
                        <h4 className="font-bold text-lg text-green-500">Final Week: Mastery Exam</h4>
                        <p className="text-sm opacity-80 mt-1">Review all material and complete the final assessment.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB: LIBRARY */}
              <TabsContent value="library" className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {result.modules.flatMap(m => m.concepts.flatMap(c => c.resources)).map((res, i) => {
                    const Icon = res.type === 'Video' ? Youtube : res.type === 'Article' ? Newspaper : Book;
                    return (
                      <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="group">
                        <Card className="h-full hover:border-primary/50 transition-all hover:shadow-lg rounded-2xl overflow-hidden">
                          <div className="h-2 bg-primary/20 group-hover:bg-primary transition-colors" />
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="p-3 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                                <Icon className="h-6 w-6 text-primary" />
                              </div>
                              <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h4 className="font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">{res.title}</h4>
                            <div className="text-xs uppercase font-black tracking-widest text-muted-foreground">{res.type}</div>
                          </CardContent>
                        </Card>
                      </a>
                    )
                  })}
                </div>
              </TabsContent>

              {/* TAB: TUTOR */}
              <TabsContent value="tutor">
                <TutorChat context={`Title: ${result.title}. Description: ${result.description}. Overview: ${JSON.stringify(result.modules.map(m => m.title))}`} />
              </TabsContent>


              {/* TAB: FINAL EXAM */}
              <TabsContent value="final" className="max-w-3xl mx-auto py-12">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center p-6 rounded-[2.5rem] bg-amber-500/10 mb-8 border-4 border-amber-500/20 shadow-2xl">
                    <Trophy className="h-20 w-20 text-amber-500 drop-shadow-lg" />
                  </div>
                  <h2 className="text-4xl font-black mb-4">Final Master Assessment</h2>
                  <p className="text-muted-foreground text-lg">Prove your expertise. Complete this comprehensive exam to achieve curriculum mastery.</p>
                </div>
                {result.finalExam ? (
                  <Card className="p-8 rounded-3xl border-2 border-primary/10 shadow-2xl bg-card/80 backdrop-blur-xl">
                    <QuizComponent quizData={result.finalExam} onComplete={() => handleQuizComplete(999)} />
                  </Card>
                ) : (
                  <div className="text-center p-12 bg-muted/20 border-2 border-dashed rounded-3xl opacity-50">
                    Assessment currently under development by the Academic Dean.
                  </div>
                )}
              </TabsContent>

            </Tabs>

            <div className="text-center pt-24 border-t border-primary/5 mt-20">
              <Button
                variant="ghost"
                onClick={() => { setResult(null); setGoal('') }}
                className="hover:bg-destructive/10 hover:text-destructive group font-black text-sm uppercase tracking-[0.3em] py-8 border-2 border-transparent hover:border-destructive/20 rounded-3xl px-12 transition-all"
              >
                <X className="mr-3 h-5 w-5 group-hover:rotate-90 transition-transform" /> Abandon Current Path & Start Anew
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
