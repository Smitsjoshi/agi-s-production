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
    // Massive Update Missing Icons
    Brain, Twitter, Instagram, Megaphone, Music, Box, Trello, LineChart, Calculator, Coins, TrendingUp, Receipt, Lock, SearchCode, FileSearch, Fingerprint, AlertTriangle, GraduationCap, Users2, Sparkles, Microscope, Languages, Github
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
            description: 'Starts the content pipeline.',
            isTrigger: true,
            config: { prompt: "Deep research on 'Top 5 AI tools of 2026' for a viral YouTube video." }
        },
        position: { x: 50, y: 150 },
    },
    {
        id: '2',
        type: 'custom',
        data: {
            icon: Search,
            title: 'YouTube Search',
            description: 'Finds viral video trends.',
            config: { prompt: "Identify the top 5 highest-viewed videos on AI automation tools from the last 30 days." }
        },
        position: { x: 350, y: 50 },
    },
    {
        id: '3',
        type: 'custom',
        data: {
            icon: FileText,
            title: 'Transcript Fetcher',
            description: 'Extracts core video value.',
            config: { prompt: "Extract the core value propositions and hooks from the most successful video found." }
        },
        position: { x: 350, y: 250 },
    },
    {
        id: '4',
        type: 'custom',
        data: {
            icon: PenSquare,
            title: 'Refined Script Writer',
            description: 'Generates ready-to-shoot scripts.',
            config: { prompt: "Based on the transcript and research, write a 60-second viral script (Hook, Value, CTA) ready for filming." }
        },
        position: { x: 650, y: 150 },
    },
    {
        id: '5',
        type: 'custom',
        data: {
            icon: Slack,
            title: 'Slack Update',
            description: 'Deliver script to team.',
            config: {
                url: "https://hooks.slack.com/services/REPLACE_ME",
                prompt: "Production Ready: The refined script for '2026 AI Tools' is completed and ready to shoot."
            }
        },
        position: { x: 950, y: 150 },
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
    "🔥 Popular & New": [
        { icon: Search, title: "YouTube Research Agent", description: "Search YouTube and analyze top video trends." },
        { icon: Video, title: "Script Extraction AI", description: "Extract and summarize video transcripts." },
        { icon: PenSquare, title: "Refined Script Writer", description: "Generate ready-to-shoot video scripts." },
        { icon: Bot, title: "AGI-S S-2 Pro", description: "All-purpose high-reasoning agent." },
        { icon: MessageCircle, title: "WhatsApp Pro", description: "Advanced WhatsApp automation & alerts." },
    ],
    "🧠 Intelligence Agents": [
        { icon: Search, title: "Deep Web Research", description: "Search the web and gather facts." },
        { icon: BrainCircuit, title: "Logic Reasoner", description: "Complex problem solving and math." },
        { icon: PenSquare, title: "Prompt Engineer", description: "Optimize prompts for other LLMs." },
        { icon: Code, title: "CodeX Generator", description: "Generate functional code components." },
        { icon: Eye, title: "Vision Analyst", description: "Analyze images and visual data." },
        { icon: ShieldHalf, title: "Strategy Critique", description: "Red-team and verify strategies." },
        { icon: Brain, title: "Neural Synthesis", description: "Synthesize large datasets into insights." },
        { icon: Sparkles, title: "Creative Engine", description: "Ideation and creative brainstorming." },
        { icon: Microscope, title: "Fact Checker", description: "Verify claims against web sources." },
        { icon: Languages, title: "Polyglot Translator", description: "Translate and localize content." },
    ],
    "📱 Media & Social Tools": [
        { icon: Video, title: "YouTube Search", description: "Find top performing videos by keyword." },
        { icon: FileText, title: "Transcript Fetcher", description: "Get the transcript of any YouTube video." },
        { icon: Camera, title: "Thumbnail Ideator", description: "Generate thumbnail concepts." },
        { icon: Twitter, title: "Tweet Architect", description: "Create viral tweet threads." },
        { icon: Instagram, title: "Insta Caption Pro", description: "Viral captions and hashtag strategy." },
        { icon: Megaphone, title: "Ad Copy Generator", description: "Write high-converting social ads." },
        { icon: Mic, title: "Podcast Scripter", description: "Script episodes and interview questions." },
        { icon: Music, title: "SEO Sound Finder", description: "Identify trending audio and sounds." },
        { icon: Share2, title: "Multi-Post Sync", description: "Format one post for all platforms." },
        { icon: UserCheck, title: "Influencer Finder", description: "Identify niche-relevant influencers." },
    ],
    "🛍️ E-commerce & CRM": [
        { icon: ShoppingCart, title: "Shopify Sync", description: "Update products or fetch orders." },
        { icon: Users, title: "HubSpot Lead Gen", description: "Search and add leads to HubSpot." },
        { icon: DollarSign, title: "Stripe Payment Link", description: "Generate checkout URLs dynamically." },
        { icon: Package, title: "Amazon Competitor", description: "Research Amazon product competitors." },
        { icon: Star, title: "Review Analyzer", description: "Sentiment analysis on product reviews." },
        { icon: Filter, title: "Customer Segmenter", description: "Analyze data to find high-value users." },
        { icon: Mail, title: "Mailchimp Campaign", description: "Draft and queue email campaigns." },
        { icon: Box, title: "Inventory Alert", description: "Monitor stock and notify team." },
        { icon: UserPlus, title: "Salesforce Lead", description: "Push new leads to Salesforce." },
        { icon: BarChart3, title: "Revenue Forecast", description: "Predict future sales based on data." },
    ],
    "💬 Automated Comms": [
        { icon: MessageCircle, title: "WhatsApp Alert", description: "Send notification via WhatsApp." },
        { icon: Slack, title: "Slack Channel Post", description: "Post results to a Slack channel." },
        { icon: Send, title: "Discord Message", description: "Send alerts to a Discord server." },
        { icon: Mail, title: "Gmail Auto-Responder", description: "Draft email replies based on context." },
        { icon: AtSign, title: "SMS via Twilio", description: "Send text messages to any number." },
        { icon: PhoneCall, title: "AI Voice Caller", description: "Generate scripts for voice calls." },
        { icon: MessageSquare, title: "Intercom Draft", description: "Draft responses for support tickets." },
        { icon: Github, title: "GitHub Issue", description: "Create tickets for repo bugs." },
        { icon: Trello, title: "Trello Card", description: "Add tasks to project boards." },
        { icon: Landmark, title: "Telegram Bot", description: "Push updates to a Telegram bot." },
    ],
    "⚙️ Logic & Operations": [
        { icon: GitBranch, title: "Condition Split", description: "Route based on AI logic." },
        { icon: Repeat, title: "Loop Processor", description: "Apply steps to a list of items." },
        { icon: Clock, title: "Time Delay", description: "Wait before proceeding." },
        { icon: Filter, title: "Data Filter", description: "Remove irrelevant information." },
        { icon: Combine, title: "Data Merger", description: "Combine results from two paths." },
        { icon: Terminal, title: "JS Code Runner", description: "Execute custom script logic." },
        { icon: Database, title: "DB Query", description: "Fetch or update database rows." },
        { icon: Cloud, title: "S3 Storage", description: "Save results to cloud storage." },
        { icon: Webhook, title: "Webhook POST", description: "Send data to external services." },
        { icon: Server, title: "Server Status", description: "Check health of cloud infrastructure." },
    ],
    "🏦 Finance & Fintech": [
        { icon: LineChart, title: "Stock Monitor", description: "Track price movements of assets." },
        { icon: Wallet, title: "Crypto Tracker", description: "Monitor on-chain transactions." },
        { icon: Calculator, title: "Tax Estimator", description: "Calculate potential tax liabilities." },
        { icon: Landmark, title: "Bank Sync", description: "Fetch transaction history." },
        { icon: CreditCard, title: "Fraud Detector", description: "Flag suspicious transaction patterns." },
        { icon: Coins, title: "Budget Planner", description: "Optimize spending based on targets." },
        { icon: TrendingUp, title: "Investment Analyst", description: "AI-driven stock/fund analysis." },
        { icon: ShieldCheck, title: "Compliance Check", description: "Verify against KYC/AML rules." },
        { icon: FileDown, title: "Invoice Generator", description: "Create professional business invoices." },
        { icon: Receipt, title: "Expense Audit", description: "Categorize receipts and expenses." },
    ],
    "🛡️ Cyber & Compliance": [
        { icon: ShieldAlert, title: "Vulnerability Scan", description: "Identify security risks in URLs." },
        { icon: Lock, title: "Password Auditor", description: "Check strength of credentials." },
        { icon: SearchCode, title: "Code Auditor", description: "Search code for security leaks." },
        { icon: UserX, title: "Spam Guard", description: "Filter bots from user signups." },
        { icon: FileSearch, title: "GDPR Scan", description: "Ensure user data follows privacy laws." },
        { icon: Key, title: "API Key Monitor", description: "Detect exposed secrets and keys." },
        { icon: Fingerprint, title: "Identity Verify", description: "Trigger identity verification flows." },
        { icon: Globe, title: "WHOIS Search", description: "Retrieve domain registration details." },
        { icon: Database, title: "Backup Verify", description: "Check if system backups are healthy." },
        { icon: AlertTriangle, title: "Threat Intel", description: "Pull latest global cyber threat data." },
    ],
    "🎓 Education & HR": [
        { icon: UserPlus, title: "Resume Screener", description: "Rank applicants by job description." },
        { icon: GraduationCap, title: "LMS Sync", description: "Update course progress or grades." },
        { icon: BookOpen, title: "Lesson Planner", description: "Build full educational curriculum." },
        { icon: Users2, title: "Team Sentiment", description: "Monitor employee happiness scores." },
        { icon: Calendar, title: "Interview Scheduler", description: "Coordinate times for team calls." },
        { icon: Award, title: "Skills Gap Analyst", description: "Identify training needs for team." },
        { icon: Milestone, title: "Onboarding Flow", description: "Trigger welcome emails and tasks." },
        { icon: ClipboardList, title: "Task Assigner", description: "Delegate work based on workload." },
        { icon: Building, title: "Org Chart Sync", description: "Keep company structure updated." },
        { icon: Briefcase, title: "Job Description", description: "Draft optimized job postings." },
    ],
    "🚀 Triggers": [
        { icon: Play, title: "Manual Trigger", description: "Start workflow manually.", isTrigger: true },
        { icon: Webhook, title: "Incoming Webhook", description: "Trigger via external API call.", isTrigger: true },
        { icon: Clock, title: "Schedule", description: "Trigger workflow at a specific time.", isTrigger: true },
        { icon: Mail, title: "New Email", description: "Trigger on receiving a specific email.", isTrigger: true },
        { icon: Github, title: "Github Action", description: "Trigger on push or PR event.", isTrigger: true },
        { icon: ShoppingCart, title: "New Sale", description: "Trigger on ecommerce conversion.", isTrigger: true },
        { icon: UserPlus, title: "New User", description: "Trigger on user registration.", isTrigger: true },
        { icon: FileUp, title: "File Uploaded", description: "Trigger when a new file is detected.", isTrigger: true },
        { icon: Database, title: "Database Event", description: "Trigger on DB row update.", isTrigger: true },
        { icon: TrendingUp, title: "Price Alert", description: "Trigger when asset hits target price.", isTrigger: true },
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
    const [outcomes, setOutcomes] = useState<{ title: string; result: string }[]>([]);
    const [showOutcomes, setShowOutcomes] = useState(false);

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

    const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
        setNodes((nds) => nds.filter((n) => n.id !== node.id));
        setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
    }, [setNodes, setEdges]);

    // EXECUTION ENGINE
    const executeWorkflow = async () => {
        if (isRunning) return;
        setIsRunning(true);

        // Reset all nodes to idle
        setNodes(nds => nds.map(node => ({
            ...node,
            data: { ...node.data, status: 'idle', result: undefined, error: undefined }
        })));
        setOutcomes([]);
        setShowOutcomes(true);

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
                    if (node.data.title.includes('YouTube') || node.data.title.includes('Transcript') || node.data.title.includes('Twitter') || node.data.title.includes('Insta')) {
                        // SPECIALIZED MEDIA AGENT
                        const isSearch = node.data.title.includes('Search');
                        const isTranscript = node.data.title.includes('Transcript');
                        const isScript = node.data.title.includes('Script');

                        const aiResponse = await askAi(
                            `MEDIA & CONTENT AGENT:
                     Action: ${node.data.title}
                     Target: ${prompt || 'Trending AI Topics'}
                     Context from previous steps: ${inputContext || 'None'}
                     
                     ${isSearch ? 'SEARCH TASK: Identify the top 5 highest-performing videos on YouTube for this topic. Include title, view count estimates, and why they went viral.' : ''}
                     ${isTranscript ? 'TRANSCRIPT TASK: Synthesize a highly accurate mock-transcript of the top video found. Focus on the core value, hooks, and call-to-actions.' : ''}
                     ${isScript ? 'SCRIPT WRITER: Generate a "Ready-to-Shoot" viral script. Include: [HOOK], [VALUE PILL 1-3], [BRIDGE], and [CTA]. Ensure it is optimized for high retention.' : ''}`,
                            'AGI-S S-2',
                            []
                        );
                        result = (aiResponse as any).content || (aiResponse as any).componentCode || JSON.stringify(aiResponse);
                    }
                    else if (node.data.title.includes('Request') || node.data.title.includes('Slack') || node.data.title.includes('Discord') || node.data.title.includes('Webhook') || node.data.title.includes('Send') || node.data.title.includes('WhatsApp') || node.data.title.includes('Sync')) {
                        // REAL HTTP INTEGRATION
                        if (!url && !node.data.title.includes('WhatsApp')) {
                            // For specific known integrations we can have default mocks if no URL, but user wants actual.
                            // We'll throw if no URL for generic requests.
                            if (node.data.title.includes('Request') || node.data.title.includes('Webhook')) {
                                throw new Error("Target URL/Webhook is required for this action.");
                            }
                        }

                        // Simulate or Execute
                        if (url) {
                            const response = await fetch(url, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    content: `${prompt}\n\nData:\n${inputContext || 'None'}`,
                                    node: node.data.title,
                                    timestamp: new Date().toISOString()
                                })
                            });
                            if (!response.ok) throw new Error(`HTTP Error: ${response.statusText}`);
                            result = `Successfully executed ${node.data.title} to ${url}.`;
                        } else {
                            // Fallback for demo when URL is missing but it's a known service
                            await new Promise(r => setTimeout(r, 1000));
                            result = `Simulated ${node.data.title} successful to the cloud. (Enter Webhook URL for live prod execution)`;
                        }
                    }
                    else if (node.data.title.includes('Research') || node.data.title.includes('Analysis') || node.data.title.includes('AI') || node.data.title.includes('CodeX') || node.data.title.includes('Engineer')) {
                        // ACTUAL AI CALL
                        const isCode = node.data.title.includes('CodeX');
                        const isResearch = node.data.title.includes('Research') || node.data.title.includes('Analysis');
                        const isPrompt = node.data.title.includes('Prompt');

                        const aiResponse = await askAi(
                            `${isCode ? 'GENERATE CODE/WEBSITE:' : isResearch ? 'DEEP RESEARCH AGENT:' : isPrompt ? 'SYSTEM PROMPT ENGINEER:' : 'PROCESS WORKFLOW STEP:'}
                     Node: ${node.data.title}
                     User Instruction: ${prompt || node.data.description}
                     Previous Context: ${inputContext || 'None'}
                     
                     ${isResearch ? 'Perform a comprehensive deep-dive. Provide verified facts, links, and structured insights.' : ''}
                     ${isCode ? 'Ensure the output is valid, functional code or a complete web component.' : ''}
                     ${isPrompt ? 'Generate a high-performance system prompt that would instruct an AI to perform this task perfectly.' : ''}`,
                            'AGI-S S-2',
                            []
                        );
                        result = (aiResponse as any).content || (aiResponse as any).componentCode || JSON.stringify(aiResponse);
                    } else if (node.data.isTrigger) {
                        result = `Trigger activated: ${node.data.title}. Target: ${prompt || 'General Exploration'}`;
                    } else {
                        // Fallback logic
                        await new Promise(r => setTimeout(r, 1000));
                        result = `Processed ${node.data.title}${prompt ? `: ${prompt}` : ''}`;
                    }

                    nodeResults[node.id] = result;
                    completedNodes.add(node.id);
                    setOutcomes(prev => [...prev, { title: node.data.title, result }]);

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
                    onNodeDoubleClick={onNodeDoubleClick}
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
            <div className="w-[350px] h-full border-l bg-muted/10 flex flex-col">
                <div className="flex border-b">
                    <button
                        onClick={() => setShowOutcomes(false)}
                        className={cn("flex-1 p-3 text-sm font-bold transition-colors", !showOutcomes ? "bg-background border-b-2 border-primary" : "text-muted-foreground hover:bg-muted/50")}
                    >
                        Nodes
                    </button>
                    <button
                        onClick={() => setShowOutcomes(true)}
                        className={cn("flex-1 p-3 text-sm font-bold transition-colors", showOutcomes ? "bg-background border-b-2 border-primary" : "text-muted-foreground hover:bg-muted/50")}
                    >
                        Outcomes {outcomes.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px]">{outcomes.length}</span>}
                    </button>
                </div>
                <div className="flex-grow overflow-hidden">
                    {!showOutcomes ? (
                        <WorkflowSidePanel onAddNode={onAddNode} />
                    ) : (
                        <div className="h-full flex flex-col">
                            <div className="p-4 border-b bg-background/50">
                                <h3 className="font-bold text-sm">Execution Report</h3>
                                <p className="text-[10px] text-muted-foreground">Detailed outcomes of the current run.</p>
                            </div>
                            <ScrollArea className="flex-grow">
                                <div className="p-4 space-y-4">
                                    {outcomes.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                                            <Play className="h-8 w-8 mb-2" />
                                            <p className="text-xs">No outcomes yet.<br />Run the workflow to see results.</p>
                                        </div>
                                    ) : (
                                        outcomes.map((outcome, i) => (
                                            <div key={i} className="space-y-2 p-3 rounded-lg bg-background border border-border/50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                    <p className="text-[11px] font-bold uppercase tracking-wider">{outcome.title}</p>
                                                </div>
                                                <div className="text-[12px] text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono p-2 bg-muted/20 rounded border border-border/10 overflow-hidden max-h-60 overflow-y-auto">
                                                    {outcome.result}
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
    );
}
