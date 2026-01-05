'use client';

import React, { useState, useCallback } from 'react';
import ReactFlow, {
    Controls,
    Background,
    addEdge,
    Connection,
    Edge,
    Node,
    useNodesState,
    useEdgesState,
    MiniMap,
    BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
    Mail, Filter, GitMerge, Bot, MessageSquare, Database, LucideIcon, Code, Clock, Webhook, Terminal,
    FileText, Image, PenSquare, Share2, Shuffle, Combine, Milestone, ToggleLeft, Repeat, Variable,
    ArrowRightLeft, FileJson, Link2, MousePointer, Type, Eye, Camera, Download, Slack, AtSign, Send,
    Table, BookUser, Search, GitBranch, Asterisk, BookCopy, Zap, Cpu, ShieldHalf, Star, BookOpen, BookCheck,
    // New Icons for the massive update
    BrainCircuit, GitCommit, Server, Cloud, ShoppingCart, Briefcase, BarChart, Mic, Video, Users,
    File, Folder, Trash, Upload, DownloadCloud, FileUp, FileDown, Layers, Package, GitPullRequest,
    Code2, Braces, Settings, ToggleRight, AlertCircle, Bug, TestTube, Rocket, Anchor, Globe,
    Network, Key, Shield, User, UserPlus, UserMinus, Calendar, MapPin, Phone, Mailbox,
    MessageCircle, Share, ThumbsUp, ThumbsDown, Award, Trophy, Gift, Sun, Moon, Sunset,
    Sunrise, Wind, CloudSun, CloudMoon, CloudRain, CloudSnow, CloudLightning, Gauge,
    Bitcoin, DollarSign, Euro, PoundSterling, CreditCard, Banknote, Wallet, Landmark, Building,
    Home, Warehouse, Factory, Car, Train, Ship, Plane, Bike, Tractor, Ambulance,
    Truck, Brush, Paintbrush, Palette, Layout, Grid, Rows, Columns, AppWindow, SquareCode,
    CircleDot, Triangle, Octagon, Square, Spline, Waypoints, Workflow, Timer, Watch, Laptop,
    Smartphone, Tablet, HardDrive, Mouse, Keyboard, Speaker, Disc, Save, Printer, Radio,
    Rss, Wifi, Battery, BatteryCharging, Plug, Component, ToyBrick, Puzzle, Glasses, Sticker, Book, Bookmark, Clipboard, ClipboardList,
    ClipboardCheck, Copy, Scissors, Paperclip, Unlink, ExternalLink, Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3

} from 'lucide-react';

import CustomNode, { CustomNodeData } from './custom-node';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { askAi } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Loader2, Play } from 'lucide-react';

const initialNodes: Node<CustomNodeData>[] = [
    {
        id: '1',
        type: 'custom',
        data: {
            icon: Play,
            title: 'Manual Trigger',
            description: 'Starts the AI Agency flow.',
            isTrigger: true,
            config: { prompt: "Target Task: Research top AI automations for 2026 and build a landing page." }
        },
        position: { x: 50, y: 150 },
    },
    {
        id: '2',
        type: 'custom',
        data: {
            icon: Search,
            title: 'Deep Research Agent',
            description: 'Performs web intelligence gathering.',
            config: { prompt: "Identify the top 5 emerging AI automation tools and their key advantages for businesses." }
        },
        position: { x: 400, y: 50 },
    },
    {
        id: '3',
        type: 'custom',
        data: {
            icon: PenSquare,
            title: 'Prompt Engineer',
            description: 'Converts research into actionable prompts.',
            config: { prompt: "Based on the research, write a high-converting marketing prompt for a landing page." }
        },
        position: { x: 400, y: 250 },
    },
    {
        id: '4',
        type: 'custom',
        data: {
            icon: Code,
            title: 'CodeX (Generate Website)',
            description: 'Generates functional web components.',
            config: { prompt: "Build a sleek, dark-mode landing page using the generated marketing content." }
        },
        position: { x: 750, y: 150 },
    },
    {
        id: '5',
        type: 'custom',
        data: {
            icon: Slack,
            title: 'Slack Update',
            description: 'Notifies the team of completion.',
            config: {
                url: "https://hooks.slack.com/services/REPLACE_WITH_YOUR_WEBHOOK",
                prompt: "Workflow Complete: Website generated for 2026 AI tools."
            }
        },
        position: { x: 1100, y: 150 },
    },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true, type: 'smoothstep' },
    { id: 'e1-3', source: '1', target: '3', animated: true, type: 'smoothstep' },
    { id: 'e2-4', source: '2', target: '4', animated: true, type: 'smoothstep' },
    { id: 'e3-4', source: '3', target: '4', animated: true, type: 'smoothstep' },
    { id: 'e4-5', source: '4', target: '5', animated: true, type: 'smoothstep' }
];

const nodeTypes = {
    custom: CustomNode,
};

type NodePaletteItem = {
    icon: LucideIcon;
    title: string;
    description: string;
    isTrigger?: boolean;
};

const paletteNodes: Record<string, NodePaletteItem[]> = {
    "Triggers": [
        { icon: Play, title: "Manual Trigger", description: "Start workflow manually.", isTrigger: true },
        { icon: Webhook, title: "Incoming Webhook", description: "Trigger via external API call.", isTrigger: true },
        { icon: Clock, title: "Schedule", description: "Trigger workflow at a specific time.", isTrigger: true },
    ],
    "Intelligence & Research": [
        { icon: Search, title: "Deep Research Agent", description: "Search and analyze web data autonomously." },
        { icon: Bot, title: "AI Knowledge (S-2)", description: "High-speed reasoning and processing." },
        { icon: PenSquare, title: "Prompt Engineer", description: "Convert input data into optimized prompts." },
        { icon: Code, title: "CodeX (Generate Website)", description: "Generate functional code or full UI components." },
    ],
    "Automated Integrations": [
        { icon: MessageCircle, title: "WhatsApp Integration", description: "Send alerts to WhatsApp via Webhook." },
        { icon: Slack, title: "Slack Update", description: "Post results to a Slack channel." },
        { icon: Database, title: "CRM Sync", description: "Update customer records via API." },
        { icon: Download, title: "HTTP Request", description: "Make a custom API call (GET/POST)." },
        { icon: Send, title: "Discord Alert", description: "Send a message to a Discord server." },
    ],
    "Operations & Hosting": [
        { icon: Globe, title: "Domain Purchase", description: "Execute domain search and registration steps." },
        { icon: Server, title: "Cloud Hosting", description: "Deploy code to cloud infrastructure." },
        { icon: Package, title: "Trial Fulfillment", description: "Manage trial offers and customer groups." },
    ],
};

const WorkflowSidePanel = ({ onAddNode }: { onAddNode: (nodeType: CustomNodeData) => void }) => (
    <Card className="h-full rounded-none border-l-0">
        <CardHeader>
            <CardTitle>Nodes</CardTitle>
            <CardDescription>Click a node to add it to the canvas.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-14rem)]">
                <Accordion type="multiple" defaultValue={Object.keys(paletteNodes)} className="w-full">
                    {Object.entries(paletteNodes).map(([category, nodes]) => (
                        <AccordionItem value={category} key={category} className="px-3">
                            <AccordionTrigger className="font-semibold text-primary hover:no-underline">{category}</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-1">
                                    {nodes.map(node => (
                                        <button key={node.title} className="w-full text-left" onClick={() => onAddNode({ ...node })}>
                                            <div className="p-2 rounded-lg hover:bg-muted flex items-start gap-3">
                                                <node.icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                                <div>
                                                    <p className="font-semibold text-sm">{node.title}</p>
                                                    <p className="text-xs text-muted-foreground">{node.description}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </ScrollArea>
        </CardContent>
    </Card>
);

export function ReactFlowWrapper() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [isRunning, setIsRunning] = useState(false);

    const onNodesDelete = useCallback((deleted: Node[]) => {
        setNodes((nds) => nds.filter((node) => !deleted.find((d) => d.id === node.id)));
    }, [setNodes]);

    const onEdgesDelete = useCallback((deleted: Edge[]) => {
        setEdges((eds) => eds.filter((edge) => !deleted.find((d) => d.id === edge.id)));
    }, [setEdges]);

    const clearCanvas = () => {
        setNodes([]);
        setEdges([]);
        setIsRunning(false);
    };

    // EXECUTION ENGINE
    const executeWorkflow = async () => {
        if (isRunning) return;
        setIsRunning(true);

        // Reset all nodes to idle
        setNodes(nds => nds.map(node => ({
            ...node,
            data: { ...node.data, status: 'idle', result: undefined, error: undefined }
        })));

        const nodeResults: Record<string, any> = {};
        const completedNodes = new Set<string>();

        // Find trigger nodes
        const triggerNodes = nodes.filter(n => n.data.isTrigger);
        let queue = [...triggerNodes];

        while (queue.length > 0) {
            // Find nodes ready to run (all parents completed)
            const readyNodes = queue.filter(node => {
                const incomingEdges = edges.filter(e => e.target === node.id);
                return incomingEdges.every(e => completedNodes.has(e.source));
            });

            if (readyNodes.length === 0 && queue.length > 0) {
                console.error("Circular dependency or unreachable nodes detected", queue);
                break;
            }

            // Process ready nodes in parallel (or sequence for simplicity first)
            for (const node of readyNodes) {
                // Remove from queue
                queue = queue.filter(n => n.id !== node.id);

                // Update status to running
                setNodes(nds => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, status: 'running' } } : n));

                try {
                    // Collect inputs from parents
                    const incomingEdges = edges.filter(e => e.target === node.id);
                    const parentResults = incomingEdges.map(e => nodeResults[e.source]).filter(Boolean);
                    const inputContext = parentResults.join('\n\n---\n\n');

                    let result = '';
                    const prompt = node.data.config?.prompt || '';
                    const url = node.data.config?.url || '';

                    // AGENTIC EXECUTION
                    if (node.data.title.includes('Request') || node.data.title.includes('Slack') || node.data.title.includes('Discord') || node.data.title.includes('Webhook') || node.data.title.includes('Send') || node.data.title.includes('WhatsApp')) {
                        // REAL HTTP INTEGRATION
                        if (!url) {
                            throw new Error("Target URL/Webhook is required for this action.");
                        }

                        const response = await fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                content: `${prompt}\n\nData from previous steps:\n${inputContext || 'None'}`,
                                node: node.data.title,
                                timestamp: new Date().toISOString()
                            })
                        });

                        if (!response.ok) throw new Error(`HTTP Error: ${response.statusText}`);
                        result = `Successfully executed ${node.data.title} to ${url}.`;
                    }
                    else if (node.data.title.includes('Research') || node.data.title.includes('Analysis') || node.data.title.includes('AI') || node.data.title.includes('CodeX') || node.data.title.includes('Synthesis') || node.data.title.includes('Crucible')) {
                        // ACTUAL AI CALL
                        const isCode = node.data.title.includes('CodeX');
                        const isResearch = node.data.title.includes('Research') || node.data.title.includes('Analysis');

                        const aiResponse = await askAi(
                            `${isCode ? 'GENERATE CODE/WEBSITE:' : isResearch ? 'DEEP RESEARCH AGENT:' : 'PROCESS WORKFLOW STEP:'}
                     Node: ${node.data.title}
                     User Instruction: ${prompt || node.data.description}
                     Previous Context: ${inputContext || 'None'}
                     
                     ${isResearch ? 'Perform a comprehensive deep-dive. Provide verified facts, links, and structured insights.' : ''}
                     ${isCode ? 'Ensure the output is valid, functional code or a complete web component.' : ''}`,
                            'AGI-S S-2',
                            []
                        );
                        result = (aiResponse as any).content || (aiResponse as any).componentCode || JSON.stringify(aiResponse);
                    } else if (node.data.isTrigger) {
                        result = `Trigger activated: ${node.data.title}. Input: ${prompt || 'Manual'}`;
                    } else {
                        // Fallback logic
                        await new Promise(r => setTimeout(r, 1000));
                        result = `Processed ${node.data.title}${prompt ? `: ${prompt}` : ''}`;
                    }

                    nodeResults[node.id] = result;
                    completedNodes.add(node.id);

                    // Update status to completed
                    setNodes(nds => nds.map(n => n.id === node.id ? {
                        ...n,
                        data: { ...n.data, status: 'completed', result }
                    } : n));

                    // Add children to queue
                    const children = edges.filter(e => e.source === node.id).map(e => nodes.find(n => n.id === e.target)).filter(Boolean) as Node<CustomNodeData>[];
                    for (const child of children) {
                        if (!queue.find(q => q.id === child.id)) {
                            queue.push(child);
                        }
                    }

                } catch (error: any) {
                    console.error(`Node ${node.id} failed:`, error);
                    setNodes(nds => nds.map(n => n.id === node.id ? {
                        ...n,
                        data: { ...n.data, status: 'failed', error: error.message || 'Execution failed' }
                    } : n));
                    // Stop the branch? Or continue? Usually stop dependent nodes.
                }
            }
        }

        setIsRunning(false);
    };

    const onConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true, type: 'smoothstep' }, eds)),
        [setEdges]
    );

    const onAddNode = (nodeData: CustomNodeData) => {
        const newNode: Node<CustomNodeData> = {
            id: `node-${+new Date()}`,
            type: 'custom',
            data: { ...nodeData },
            position: { x: Math.random() * 200 + 200, y: Math.random() * 200 },
        };
        setNodes((nds) => nds.concat(newNode));
    }


    return (
        <div className="h-[calc(100vh-5rem)] w-full flex">
            <div className="flex-grow h-full" style={{ width: 'calc(100% - 350px)' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodesDelete={onNodesDelete}
                    onEdgesDelete={onEdgesDelete}
                    deleteKeyCode={["Backend", "Delete"]}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-background"
                >
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                        <Button
                            onClick={executeWorkflow}
                            disabled={isRunning || nodes.length === 0}
                            className={cn(isRunning && "bg-blue-600")}
                        >
                            {isRunning ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running...</>
                            ) : (
                                <><Play className="mr-2 h-4 w-4" /> Run Workflow</>
                            )}
                        </Button>
                        <Button onClick={clearCanvas} variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50/10">
                            <Trash className="mr-2 h-4 w-4" /> Clear Canvas
                        </Button>
                    </div>
                    <Controls />
                    <MiniMap nodeColor={(node) => {
                        if (node.type === 'custom' && (node.data as CustomNodeData).isTrigger) return '#22c55e';
                        return '#0ea5e9';
                    }} />
                    <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                </ReactFlow>
            </div>
            <div className="w-[350px] h-full border-l">
                <WorkflowSidePanel onAddNode={onAddNode} />
            </div>
        </div>
    );
}
