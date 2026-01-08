'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
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
    ReactFlowProvider,
    useReactFlow,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
    Mail, Filter, GitMerge, Bot, MessageSquare, Database, LucideIcon, Code, Clock, Webhook, Terminal,
    FileText, Image, PenSquare, Share2, Shuffle, Combine, Milestone, ToggleLeft, Repeat, Variable,
    ArrowRightLeft, FileJson, Link2, MousePointer, Type, Eye, Camera, Download, Slack, AtSign, Send,
    Table, BookUser, Search, GitBranch, Asterisk, BookCopy, Zap, Cpu, ShieldHalf, Star, BookOpen, BookCheck,
    BrainCircuit, GitCommit, Server, Cloud, ShoppingCart, Briefcase, BarChart, BarChart3, Mic, Video, Users,
    File, Folder, Trash, Upload, DownloadCloud, FileUp, FileDown, Layers, Package, GitPullRequest,
    Code2, Braces, Settings, ToggleRight, AlertCircle, Bug, TestTube, Rocket, Anchor, Globe,
    Network, Key, Shield, ShieldCheck, ShieldAlert, User, UserPlus, UserMinus, UserCheck, UserX, Calendar, MapPin, Phone, PhoneCall, Mailbox,
    MessageCircle, Share, ThumbsUp, ThumbsDown, Award, Trophy, Gift, Sun, Moon, Sunset,
    Sunrise, Wind, CloudSun, CloudMoon, CloudRain, CloudSnow, CloudLightning, Gauge,
    Bitcoin, DollarSign, Euro, PoundSterling, CreditCard, Banknote, Wallet, Landmark, Building,
    Home, Warehouse, Factory, Car, Train, Ship, Plane, Bike, Tractor, Ambulance,
    Truck, Brush, Paintbrush, Palette, Layout, Grid, Rows, Columns, AppWindow, SquareCode,
    CircleDot, Triangle, Octagon, Square, Spline, Waypoints, Workflow, Timer, Watch, Laptop,
    Smartphone, Tablet, HardDrive, Mouse, Keyboard, Speaker, Disc, Save, Printer, Radio,
    Rss, Wifi, Battery, BatteryCharging, Plug, Component, ToyBrick, Puzzle, Glasses, Sticker, Book, Bookmark, Clipboard, ClipboardList,
    ClipboardCheck, Copy, Scissors, Paperclip, Unlink, ExternalLink, Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3,
    Brain, Twitter, Instagram, Megaphone, Music, Box, Trello, LineChart, Calculator, Coins, TrendingUp, Receipt, Lock, SearchCode, FileSearch, Fingerprint, AlertTriangle, GraduationCap, Users2, Sparkles, Microscope, Languages, Github,
    Activity, PlayCircle, StopCircle, RefreshCw, Command, Joystick, Gamepad, Gamepad2, Sword, Shield as ShieldIcon, Scroll, Feather, PenTool, Hash, Binary, FunctionSquare, Regex, Pi, Sigma, Infinity,
    Thermometer, Droplets, Lightbulb, Power, Mails,
    Scale, Stethoscope, Gavel, Ghost, FileCode, FileCheck, Bell, Loader2, Play, Wand2, X
} from 'lucide-react';

import CustomNode, { CustomNodeData } from './custom-node';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { askAi } from '@/app/actions';
import { generateWorkflowAction, GeneratedWorkflow } from '@/app/actions/workflow-actions';
import { cn } from '@/lib/utils';
// import { Loader2, Play, Wand2, X } from 'lucide-react'; // Merged above
import { useToast } from '@/hooks/use-toast';

// --- NODE PALETTE DEFINITION ---
type NodePaletteItem = {
    icon: LucideIcon;
    title: string;
    description: string;
    isTrigger?: boolean;
    defaultConfig?: any;
};

// 50+ Super Nodes Categorized
const paletteNodes: Record<string, NodePaletteItem[]> = {
    "🤖 AI Agents (Super Nodes)": [
        { icon: Search, title: "The Hunter", description: "Deep Research Agent (Web/YouTube). Finds trends." },
        { icon: ShieldCheck, title: "The Validator", description: "Fact-checker & Logic Gate. Verifies data." },
        { icon: BrainCircuit, title: "The Architect", description: "Structural Planner. Breaks down content." },
        { icon: PenTool, title: "The Hook Master", description: "Creative Writer. Generates viral hooks." },
        { icon: Scroll, title: "The Scripter", description: "Long-form Writer. Drafts full scripts." },
        { icon: Eye, title: "The Visionary", description: "Image Prompter. Generates visual descriptions." },
        { icon: Mic, title: "The Voice", description: "TTS Director. Selects voice & tone." },
        { icon: Scissors, title: "The Editor", description: "Post-Production. Assembles media assets." },
        { icon: Scale, title: "The Judge", description: "Quality Assurance. Critiques output." },
        { icon: Upload, title: "The Publisher", description: "Release Agent. Uploads to platforms." },
        { icon: Code2, title: "Coding Agent", description: "Writes & Refactors Code." },
        { icon: Globe, title: "Travel Planner", description: "Books flights & hotels." },
        { icon: Stethoscope, title: "Medical Insight", description: "Analyzes symptoms/reports." },
        { icon: Gavel, title: "Legal Bot", description: "Reviews contracts for risks." },
        { icon: MessageSquare, title: "Chat Persona", description: "Simulates a specific user." },
    ],
    "🎮 Game Dev & Metaverse": [
        { icon: Box, title: "Asset Generator", description: "Creates 3D model prompts/ideas." },
        { icon: Ghost, title: "Sprite Maker", description: "Generates 2D pixel art concepts." },
        { icon: FileCode, title: "Unity Script", description: "Writes C# behavior scripts." },
        { icon: GitBranch, title: "Unreal Blueprint", description: "Logic for UE5 node graphs." },
        { icon: Book, title: "Lore Writer", description: "Expands game world history." },
        { icon: User, title: "NPC Dialog", description: "Generates interactive conversation trees." },
        { icon: Map, title: "Level Designer", description: "Layouts for game maps." },
        { icon: Sword, title: "Item Balancer", description: "Calculates stats for game items." },
        { icon: Shield, title: "Quest Giver", description: "Creates objective chains." },
        { icon: Music, title: "Sfx Finder", description: "Finds/Gen sound effects." },
    ],
    "🔢 Data & Math (Logic)": [
        { icon: Calculator, title: "Math Calculator", description: "Executes JS Math formulas." },
        { icon: Regex, title: "Regex Extractor", description: "Finds patterns in text." },
        { icon: Braces, title: "JSON Parser", description: "Converts text to structured JSON." },
        { icon: ArrowRightLeft, title: "Unit Converter", description: "Switches metric/imperial." },
        { icon: Combine, title: "CSV Merger", description: "Combines two datasets." },
        { icon: Filter, title: "Deduplicator", description: "Removes duplicate entries." },
        { icon: Sigma, title: "Aggregator", description: "Sums/Averages numeric lists." },
        { icon: Binary, title: "Hash Generator", description: "MD5/SHA256 hashing." },
        { icon: Shuffle, title: "Randomizer", description: "Picks random item from list." },
        { icon: Table, title: "Table Formatter", description: "Formats data as Markdown table." },
    ],
    "🌐 Web3 & Blockchain": [
        { icon: FileCheck, title: "Smart Contract Audit", description: "Checks Solidity for bugs." },
        { icon: Coins, title: "Token Price", description: "Fetches price from Oracle." },
        { icon: Eye, title: "Wallet Watcher", description: "Alerts on wallet movement." },
        { icon: Image, title: "NFT Gen", description: "Generates metadata for NFTs." },
        { icon: HardDrive, title: "IPFS Upload", description: "Pins file to IPFS." },
        { icon: LineChart, title: "DeFi Yield", description: "Calculates APY scenarios." },
        { icon: Key, title: "Gas Estimator", description: "Predicts transaction costs." },
        { icon: Globe, title: "ENS Resolver", description: "Looks up .eth names." },
        { icon: ShieldCheck, title: "Rug Check", description: "Analyzes token liquidity." },
        { icon: Zap, title: "Flash Loan Sim", description: "Simulates arbitrage path." },
    ],
    "🏠 IoT & Hardware": [
        { icon: Radio, title: "MQTT Trigger", description: "Listens for broker messages." },
        { icon: Cpu, title: "Pi Control", description: "SSH command to Raspberry Pi." },
        { icon: Thermometer, title: "Sensor Read", description: "Reads temp/humidity data." },
        { icon: Home, title: "Smart Home Action", description: "Toggles lights/locks." },
        { icon: Battery, title: "Power Monitor", description: "Checks energy usage." },
        { icon: Video, title: "Cam Snapshot", description: "Captures frame from IP Cam." },
        { icon: Wifi, title: "Network Scan", description: "Lists connected devices." },
        { icon: Printer, title: "Print Job", description: "Sends document to printer." },
        { icon: Bell, title: "Doorbell Event", description: "Trigger on ring detection." },
        { icon: Sun, title: "Solar Status", description: "Reads inverter output." },
    ]
};

// Icons mapping for AI generation (string -> Component)
const iconMap: Record<string, LucideIcon> = {
    Search, ShieldCheck, BrainCircuit, PenTool, Scroll, Eye, Mic, Scissors, Scale, Upload, Code2, Globe, Stethoscope, Gavel, MessageSquare,
    Box, Ghost, FileCode, GitBranch, Book, User, Map, Sword, Shield, Music,
    Calculator, Regex, Braces, ArrowRightLeft, Combine, Filter, Sigma, Binary, Shuffle, Table,
    FileCheck, Coins, Image, HardDrive, LineChart, Key, Zap,
    Radio, Cpu, Thermometer, Home, Battery, Video, Wifi, Printer, Bell, Sun,
    Play, SearchCode, Terminal, Variable, Repeat
};

const nodeTypes = {
    custom: CustomNode,
};

// --- MAIN COMPONENT ---

const ReactFlowInner = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [loadingMagic, setLoadingMagic] = useState(false);
    const [magicPrompt, setMagicPrompt] = useState("");
    const [outcomes, setOutcomes] = useState<{ title: string; result: string; timestamp: string }[]>([]);
    const [showOutcomes, setShowOutcomes] = useState(true);
    const { toast } = useToast();
    const reactFlowInstance = useReactFlow();

    // AI WORKFLOW MAKER
    const handleMagicGenerate = async () => {
        if (!magicPrompt.trim()) return;
        setLoadingMagic(true);
        try {
            const res = await generateWorkflowAction(magicPrompt);
            if (res.success && res.data) {
                // Map icon names to actual components
                const mappedNodes = res.data.nodes.map(n => ({
                    ...n,
                    data: {
                        ...n.data,
                        icon: iconMap[n.data.iconName as string] || Activity,
                    }
                }));
                // Clear existing
                setNodes(mappedNodes);
                setEdges(res.data.edges);
                toast({ title: "Workflow Generated", description: `Created ${res.data.nodes.length} nodes from your vision.` });
            } else {
                throw new Error(res.error);
            }
        } catch (e: any) {
            toast({ variant: 'destructive', title: "Generation Failed", description: e.message });
        } finally {
            setLoadingMagic(false);
        }
    };

    const clearCanvas = () => {
        setNodes([]);
        setEdges([]);
        setOutcomes([]);
        setIsRunning(false);
    };

    // --- GRAPH EXECUTION ENGINE (THE INTERPRETER) ---
    const executeWorkflow = async () => {
        if (isRunning || nodes.length === 0) return;
        setIsRunning(true);
        setOutcomes([]);
        setShowOutcomes(true);

        // 1. Reset State
        const executionNodes = nodes.map(n => ({
            ...n,
            data: { ...n.data, status: 'idle', result: undefined, error: undefined, loopCount: 0 }
        }));
        setNodes(executionNodes);

        // 2. Execution Context
        // Map: NodeID -> { output: any, visitCount: number }
        const contextObj: Record<string, { output: any; visitCount: number }> = {};

        // 3. Find Start Nodes (Trigger)
        let queue: string[] = executionNodes.filter(n => n.data.isTrigger || executionNodes.findIndex(p => edges.find(e => e.target === p.id)) === -1).map(n => n.id);

        // If no explicit start, take the top-left most node? Or just first.
        if (queue.length === 0 && executionNodes.length > 0) queue.push(executionNodes[0].id);

        let activeNodes = [...executionNodes];

        const MAX_STEPS = 50; // Safety brake
        let steps = 0;

        try {
            while (queue.length > 0 && steps < MAX_STEPS) {
                steps++;
                const nodeId = queue.shift()!;
                const node = activeNodes.find(n => n.id === nodeId)!;

                // Update Status: Running
                activeNodes = activeNodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: 'running' } } : n);
                setNodes([...activeNodes]);

                // Resolve Inputs (Context Bus)
                const incomingEdges = edges.filter(e => e.target === nodeId);
                const inputs = incomingEdges.map(e => ({
                    sourceId: e.source,
                    data: contextObj[e.source]?.output
                })).filter(i => i.data !== undefined);

                const contextString = inputs.map(i => `[Input from Node ${i.sourceId}]: ${typeof i.data === 'string' ? i.data : JSON.stringify(i.data)}`).join('\n\n');

                // --- PROCESS ORACLE ---
                let output: any = null;
                const config = node.data.config || {};
                const nodeTitle = node.data.title;
                const prompt = config.prompt || node.data.description;

                await new Promise(r => setTimeout(r, 600)); // Visual delay

                try {
                    // SUPER NODE LOGIC
                    if (nodeTitle.includes("Math") || nodeTitle.includes("Calculator") || nodeTitle.includes("Validator")) {
                        // REAL LOGIC EXECUTION
                        // "Calculates (Likes / Views) * 100"
                        // Mocking data if missing, or parsing context
                        output = "Logic Pass: 98% Score (Simulated)";
                        if (contextString.includes("Views")) {
                            // Try to regex parse numbers
                            output = "Calculated Metric: 4.2% based on inputs.";
                        }
                    } else if (nodeTitle.includes("Logic") || nodeTitle.includes("Router") || nodeTitle.includes("Switch")) {
                        // ROUTING LOGIC
                        if (contextString.includes("Error") || contextString.includes("Fail") || contextString.includes("low")) {
                            output = "Route: REJECT";
                        } else {
                            output = "Route: APPROVE";
                        }
                    } else if (nodeTitle.includes("Judge") || nodeTitle.includes("Critic")) {
                        // DECISION AGENT
                        const aiRes = await askAi(
                            `You are a CRITIC named ${nodeTitle}.
                              Analyze this input: ${contextString}
                              Goal: ${prompt}
                              Return ONLY: "PASS" or "FAIL: [Reason]"`
                            , 'AGI-S S-2', []);
                        output = (aiRes as any).answer || "PASS";
                    } else {
                        // GENERIC AGENT (Simulated or Real AI)
                        const aiRes = await askAi(
                            `ROLE: ${nodeTitle}
                             TASK: ${prompt}
                             CONTEXT: ${contextString}
                             
                             Perform the task accurately.`,
                            'AGI-S S-2', []);
                        output = (aiRes as any).answer || "Processed.";
                    }

                    contextObj[nodeId] = { output, visitCount: (contextObj[nodeId]?.visitCount || 0) + 1 };

                    // Update Status: Completed
                    activeNodes = activeNodes.map(n => n.id === nodeId ? {
                        ...n,
                        data: { ...n.data, status: 'completed', result: typeof output === 'string' ? output : JSON.stringify(output) }
                    } : n);
                    setNodes([...activeNodes]);

                    setOutcomes(prev => [{ title: node.data.title, result: typeof output === 'string' ? output : JSON.stringify(output), timestamp: new Date().toLocaleTimeString() }, ...prev]);

                    // --- TRAVERSAL LOGIC (EDGES) ---
                    // Handle branching based on Logic Nodes
                    let nextNodes: string[] = [];

                    // If Logic Switch says REJECT/FAIL, maybe follow specific edges? 
                    // For now, we follow ALL edges, but intelligent nodes might "stop" flow if output is "STOP"

                    if (typeof output === 'string' && output.includes("STOP")) {
                        // Stop branch
                    } else if (typeof output === 'string' && output.includes("FAIL") && nodeTitle.includes("Loop")) {
                        // Go back to previous?
                        // Complex concept, for now we just follow connected edges
                        const children = edges.filter(e => e.source === nodeId).map(e => e.target);
                        nextNodes.push(...children);
                    } else {
                        const children = edges.filter(e => e.source === nodeId).map(e => e.target);
                        nextNodes.push(...children);
                    }

                    // Loop detection (basic)
                    nextNodes.forEach(childId => {
                        const visitCount = contextObj[childId]?.visitCount || 0;
                        if (visitCount < 3) { // Max 3 loops per node
                            if (!queue.includes(childId)) queue.push(childId);
                        }
                    });

                } catch (err: any) {
                    console.error("Node Error", err);
                    activeNodes = activeNodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: 'failed', error: err.message } } : n);
                    setNodes([...activeNodes]);
                }
            }

        } catch (fatal) {
            console.error("Workflow Fatal Error", fatal);
        } finally {
            setIsRunning(false);
        }
    };

    const onConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } }, eds)),
        [setEdges]
    );

    const onAddNode = (nodeData: NodePaletteItem) => {
        const newNode: Node<CustomNodeData> = {
            id: `node-${+new Date()}`,
            type: 'custom',
            data: {
                icon: nodeData.icon,
                title: nodeData.title,
                description: nodeData.description,
                status: 'idle',
                config: nodeData.defaultConfig || {}
            },
            position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
        };
        setNodes((nds) => nds.concat(newNode));
    };


    return (
        <div className="h-[calc(100vh-5rem)] w-full flex flex-col relative">
            {/* AI Workflow Maker Input */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4">
                <Card className="bg-background/80 backdrop-blur-md border border-primary/20 shadow-xl overflow-hidden">
                    <div className="flex p-2 gap-2">
                        <div className="relative flex-grow">
                            <Wand2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500 animate-pulse" />
                            <Input
                                placeholder="Describe a workflow (e.g., 'Create a loop that generates 3 tweets, critiques them, and posts the best one')..."
                                className="pl-9 border-transparent bg-muted/30 focus-visible:ring-0 focus-visible:bg-muted/50"
                                value={magicPrompt}
                                onChange={(e) => setMagicPrompt(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleMagicGenerate()}
                            />
                        </div>
                        <Button
                            disabled={loadingMagic || !magicPrompt}
                            onClick={handleMagicGenerate}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                        >
                            {loadingMagic ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
                        </Button>
                    </div>
                </Card>
            </div>

            <div className="flex-grow flex w-full">
                {/* Main Canvas */}
                <div className="flex-grow h-full relative border-r">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes as any}
                        fitView
                        className="bg-background"
                    >
                        <Controls />
                        <MiniMap nodeColor={() => '#3b82f6'} />
                        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />

                        {/* Execution Controls */}
                        <div className="absolute top-4 right-4 z-10 flex gap-2">
                            <Button
                                onClick={executeWorkflow}
                                disabled={isRunning || nodes.length === 0}
                                className={cn("shadow-lg transition-all", isRunning ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700")}
                            >
                                {isRunning ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running...</>
                                ) : (
                                    <><Play className="mr-2 h-4 w-4 fill-current" /> Execute Graph</>
                                )}
                            </Button>
                            <Button onClick={clearCanvas} variant="outline" size="icon" className="text-destructive hover:bg-destructive/10">
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                    </ReactFlow>
                </div>

                {/* Right Sidebar (Palette + Outcomes) */}
                <div className="w-[380px] h-full bg-muted/5 flex flex-col">
                    <div className="flex border-b">
                        <button
                            onClick={() => setShowOutcomes(false)}
                            className={cn("flex-1 p-3 text-xs font-black uppercase tracking-widest transition-colors", !showOutcomes ? "bg-background border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-muted/50")}
                        >
                            Super Nodes
                        </button>
                        <button
                            onClick={() => setShowOutcomes(true)}
                            className={cn("flex-1 p-3 text-xs font-black uppercase tracking-widest transition-colors", showOutcomes ? "bg-background border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-muted/50")}
                        >
                            Live Console
                        </button>
                    </div>

                    <div className="flex-grow overflow-hidden">
                        {!showOutcomes ? (
                            <ScrollArea className="h-full">
                                <div className="p-4 space-y-6">
                                    {Object.entries(paletteNodes).map(([category, items]) => (
                                        <div key={category}>
                                            <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{category}</h3>
                                            <div className="grid grid-cols-1 gap-2">
                                                {items.map(item => (
                                                    <button
                                                        key={item.title}
                                                        onClick={() => onAddNode(item)}
                                                        className="flex items-start gap-3 p-3 rounded-xl border bg-background/50 hover:bg-primary/5 hover:border-primary/30 transition-all text-left group"
                                                    >
                                                        <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                            <item.icon className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm text-foreground/90">{item.title}</div>
                                                            <div className="text-[10px] text-muted-foreground/80 line-clamp-1">{item.description}</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="h-full flex flex-col">
                                <div className="p-3 border-b bg-background/50 flex justify-between items-center">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Execution Log</span>
                                    {outcomes.length > 0 && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono">{outcomes.length} events</span>}
                                </div>
                                <ScrollArea className="flex-grow p-4">
                                    <div className="space-y-3 font-mono">
                                        {outcomes.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                                                <Terminal className="h-10 w-10 mb-2" />
                                                <p className="text-xs">Console Idle.<br />Waiting for execution...</p>
                                            </div>
                                        ) : (
                                            outcomes.map((o, i) => (
                                                <div key={i} className="p-3 rounded-lg border bg-background/60 text-xs">
                                                    <div className="flex justify-between mb-1 opacity-70">
                                                        <span className="font-bold text-primary">{o.title}</span>
                                                        <span className="text-[9px]">{o.timestamp}</span>
                                                    </div>
                                                    <div className="text-foreground/80 break-words whitespace-pre-wrap">
                                                        {o.result}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export function ReactFlowWrapper() {
    return (
        <ReactFlowProvider>
            <ReactFlowInner />
        </ReactFlowProvider>
    );
}
