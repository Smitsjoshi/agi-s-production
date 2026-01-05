'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideProps, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export type CustomNodeData = {
  icon: React.ComponentType<LucideProps>;
  title: string;
  description: string;
  isTrigger?: boolean;
  status?: 'idle' | 'running' | 'completed' | 'failed';
  result?: string;
  error?: string;
};

const CustomNode = ({ data, selected }: NodeProps<CustomNodeData>) => {
  const Icon = data.icon;
  const status = data.status || 'idle';

  return (
    <div className={cn("w-72", selected && 'scale-[1.02] transition-transform')}>
      <Card className={cn(
        "bg-background/80 backdrop-blur-sm border-2 transition-all overflow-hidden",
        selected ? "border-primary shadow-lg shadow-primary/20" : "border-border/20",
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

        {(data.result || data.error) && (
          <CardContent className="p-3 bg-background/50 border-t border-border/10">
            <div className="text-[10px] font-mono whitespace-pre-wrap break-words line-clamp-4 overflow-hidden text-muted-foreground">
              {data.error || data.result}
            </div>
          </CardContent>
        )}
      </Card>
      <Handle type="target" position={Position.Left} className="!bg-primary !border-2 !border-background !w-3 !h-3" isConnectable={true} />
      <Handle type="source" position={Position.Right} className="!bg-primary !border-2 !border-background !w-3 !h-3" isConnectable={true} />
    </div>
  );
};

export default memo(CustomNode);
