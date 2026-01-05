'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideProps, Loader2, CheckCircle2, AlertCircle, Settings2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useReactFlow } from 'reactflow';

export type CustomNodeData = {
  icon: React.ComponentType<LucideProps>;
  title: string;
  description: string;
  isTrigger?: boolean;
  status?: 'idle' | 'running' | 'completed' | 'failed';
  result?: string;
  error?: string;
  config?: {
    prompt?: string;
    url?: string;
    method?: string;
    body?: string;
  };
};

const CustomNode = ({ id, data, selected }: NodeProps<CustomNodeData>) => {
  const Icon = data.icon;
  const status = data.status || 'idle';
  const { setNodes } = useReactFlow();

  const updateConfig = (field: string, value: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              config: {
                ...node.data.config,
                [field]: value,
              },
            },
          };
        }
        return node;
      })
    );
  };

  return (
    <div className={cn("w-80", selected && 'scale-[1.02] transition-transform')}>
      <Card className={cn(
        "bg-background/90 backdrop-blur-md border-2 transition-all overflow-hidden",
        selected ? "border-primary shadow-xl shadow-primary/20" : "border-border/20",
        data.isTrigger && "border-green-500/50",
        status === 'running' && "border-blue-500 animate-pulse",
        status === 'completed' && "border-green-500",
        status === 'failed' && "border-red-500"
      )}>
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-3 bg-muted/30">
          <div className={cn(
            "p-2 rounded-lg",
            data.isTrigger ? "bg-green-500/10" : "bg-primary/10",
            status === 'running' && "bg-blue-500/10",
            status === 'failed' && "bg-red-500/10"
          )}>
            {status === 'running' ? (
              <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
            ) : (
              <Icon className={cn(
                "h-6 w-6",
                data.isTrigger ? "text-green-500" : "text-primary",
                status === 'failed' && "text-red-500"
              )} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-bold truncate">{data.title}</CardTitle>
          </div>
          {status === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          {status === 'failed' && <AlertCircle className="h-4 w-4 text-red-500" />}
        </CardHeader>

        <CardContent className="p-3 space-y-3 pb-4">
          {/* Node Description (Static) */}
          {!selected && !data.result && (
            <p className="text-[10px] text-muted-foreground line-clamp-2">{data.description}</p>
          )}

          {/* Configuration Section (Editable) */}
          {selected && (
            <div className="space-y-3 pt-1 nodrag">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-wider">
                  <Settings2 className="h-3 w-3" />
                  Configuration
                </div>
                <span className="text-[8px] text-muted-foreground italic">Double-click to delete node</span>
              </div>

              {/* Prompt Field */}
              <div className="space-y-1">
                <Label className="text-[9px] text-muted-foreground uppercase">Prompt / Instruction</Label>
                <Textarea
                  placeholder="Enter task details..."
                  className="text-[11px] min-h-[60px] bg-muted/20"
                  value={data.config?.prompt || ''}
                  onChange={(e) => updateConfig('prompt', e.target.value)}
                />
              </div>

              {/* URL Field (for Integrations) */}
              {(data.title.includes('Request') || data.title.includes('Slack') || data.title.includes('Hook') || data.title.includes('Send') || data.title.includes('API')) && (
                <div className="space-y-1">
                  <Label className="text-[9px] text-muted-foreground uppercase">Target URL / Webhook</Label>
                  <input
                    type="text"
                    placeholder="https://api.example.com/..."
                    className="w-full bg-muted/20 border border-border/50 rounded p-1 text-[11px] outline-none focus:border-primary"
                    value={data.config?.url || ''}
                    onChange={(e) => updateConfig('url', e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Result Section */}
          {(data.result || data.error) && (
            <div className="pt-2 border-t border-border/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold text-primary uppercase">Execution Result</span>
              </div>
              <div className={cn(
                "text-[10px] font-mono whitespace-pre-wrap break-words line-clamp-6 overflow-y-auto max-h-32 p-2 rounded bg-background/50 border border-border/10",
                data.error ? "text-red-400" : "text-muted-foreground"
              )}>
                {data.error || data.result}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Handle type="target" position={Position.Left} className="!bg-primary !border-2 !border-background !w-3 !h-3" isConnectable={true} />
      <Handle type="source" position={Position.Right} className="!bg-primary !border-2 !border-background !w-3 !h-3" isConnectable={true} />
    </div>
  );
};

export default memo(CustomNode);
