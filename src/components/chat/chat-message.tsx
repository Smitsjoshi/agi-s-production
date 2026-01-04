'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, User, Loader2, Info, Link as LinkIcon, Globe, Bot, Copy, Check, GitBranch } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SourcePreview } from './source-preview';
import { cn } from '@/lib/utils';
import type { ChatMessage, SearchResult } from '@/lib/types';
import { Card, CardContent } from '../ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { useTheme } from 'next-themes';
import { fadeInUp } from '@/lib/ui-animations';

// Code block component with copy functionality
const CodeBlock = ({ language, value }: { language: string; value: string }) => {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
      <SyntaxHighlighter
        language={language || 'text'}
        style={theme === 'dark' ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          fontSize: '0.875rem'
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

// Enhanced markdown renderer
const EnhancedMarkdown = ({ content = '' }: { content: string }) => {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const value = String(children).replace(/\n$/, '');

            return !inline && match ? (
              <CodeBlock language={match[1]} value={value} />
            ) : (
              <code className="bg-muted px-1.5 py-0.5 rounded-sm text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full divide-y divide-border">
                  {children}
                </table>
              </div>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                {children}
                <LinkIcon className="h-3 w-3" />
              </a>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const SearchResultDisplay = ({ result }: { result: SearchResult }) => {
  const url = new URL(result.url);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <a href={result.url} target="_blank" rel="noopener noreferrer" className="group">
        <div className="flex items-center text-sm">
          <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
          <span className="text-muted-foreground truncate">{url.hostname}</span>
        </div>
        <h3 className="text-blue-400 group-hover:underline text-lg font-medium mt-1">{result.title}</h3>
      </a>
      <p className="text-sm text-neutral-400 mt-1">{result.snippet}</p>
    </motion.div>
  );
};

export function ChatMessageDisplay({
  message,
  isLoading = false,
  onBranch
}: {
  message: ChatMessage;
  isLoading?: boolean;
  onBranch?: (messageId: string) => void;
}) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  if (message.role === 'user') {
    return (
      <div className="flex items-start gap-4 relative z-10 justify-end">
        <div className="flex-1 rounded-lg bg-primary text-primary-foreground p-4 max-w-2xl">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        <Avatar>
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  const confidenceColor = (score: number) => {
    if (score > 0.8) return 'text-green-500';
    if (score > 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const isFinishedTyping = !isLoading && (message.content || message.liveWebAgentOutput);
  const isLiveAgentResponse = !!message.liveWebAgentOutput;

  return (
    <motion.div
      className="flex items-start gap-4 relative z-10"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <Avatar>
        <AvatarFallback>
          <Bot />
        </AvatarFallback>
      </Avatar>
      <Card className="flex-1 max-w-4xl">
        <CardContent className="p-4 space-y-4">
          {isLoading && !message.content ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="animate-spin" />
              <span>AGI-S is thinking...</span>
            </div>
          ) : (
            <TooltipProvider delayDuration={100}>
              <div className="text-sm">
                <EnhancedMarkdown content={message.content} />
              </div>

              {message.agentSteps && message.agentSteps.length > 0 && (
                <div className="mt-4 border rounded-md p-3 bg-muted/30">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Agent Execution Strategy</h4>
                  <div className="space-y-2">
                    {message.agentSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-1",
                          step.type === 'completed' ? "bg-green-500" :
                            step.type === 'failed' ? "bg-red-500" :
                              step.type === 'planning' ? "bg-blue-500" :
                                step.type === 'executing' ? "bg-yellow-500" : "bg-gray-500"
                        )} />
                        <div className="flex-1">
                          <span className="font-medium text-foreground">{step.type.toUpperCase()}</span>: {step.message}
                          {step.screenshot && (
                            <img src={`data:image/png;base64,${step.screenshot}`} alt="Step Screenshot" className="mt-1 rounded border max-w-[200px]" />
                          )}
                        </div>
                        <span className="text-muted-foreground tabular-nums">{new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {message.agentSteps && message.agentSteps.length > 0 && (
                <div className="mt-4 border rounded-md p-3 bg-muted/30">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Agent Execution Strategy</h4>
                  <div className="space-y-2">
                    {message.agentSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-1",
                          step.type === 'completed' ? "bg-green-500" :
                            step.type === 'failed' ? "bg-red-500" :
                              step.type === 'planning' ? "bg-blue-500" :
                                step.type === 'executing' ? "bg-yellow-500" : "bg-gray-500"
                        )} />
                        <div className="flex-1">
                          <span className="font-medium text-foreground">{step.type.toUpperCase()}</span>: {step.message}
                          {step.screenshot && (
                            <img src={`data:image/png;base64,${step.screenshot}`} alt="Step Screenshot" className="mt-1 rounded border max-w-[200px]" />
                          )}
                        </div>
                        <span className="text-muted-foreground tabular-nums">{new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isLiveAgentResponse && message.liveWebAgentOutput?.results && message.liveWebAgentOutput.results.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-base">Agent Results:</h4>
                  <div className="border-t pt-4">
                    {message.liveWebAgentOutput.results.map((result, index) => (
                      <SearchResultDisplay key={index} result={result} />
                    ))}
                  </div>
                </div>
              )}

              {isFinishedTyping && message.sources && message.sources.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Sources:</h4>
                  <div className="flex flex-wrap gap-2">
                    {message.sources.map((source, index) => (
                      <SourcePreview key={index} url={source.url} title={source.title} />
                    ))}
                  </div>
                </div>
              )}

              {isFinishedTyping && (message.reasoning || message.confidenceScore) && !isLiveAgentResponse && (
                <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
                  {message.reasoning && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="flex items-center gap-1.5 hover:text-foreground">
                          <Info className="h-4 w-4" />
                          <span>Show reasoning</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="start" className="max-w-sm z-50">
                        <p>{message.reasoning}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <div className="flex-1"></div> {/* Spacer */}
                  {message.confidenceScore && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Confidence:</span>
                      <span className={cn("font-bold", confidenceColor(message.confidenceScore))}>
                        {(message.confidenceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>
              )}

              {isFinishedTyping && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    variant={feedback === 'up' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                  >
                    <ThumbsUp className={cn("h-4 w-4", feedback === 'up' && "text-primary")} />
                  </Button>
                  <Button
                    variant={feedback === 'down' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                  >
                    <ThumbsDown className={cn("h-4 w-4", feedback === 'down' && "text-destructive")} />
                  </Button>

                  {onBranch && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 ml-auto"
                          onClick={() => onBranch(message.id)}
                        >
                          <GitBranch className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Branch conversation from here</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              )}
            </TooltipProvider>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
