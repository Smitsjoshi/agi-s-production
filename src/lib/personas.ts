import { DollarSign, Scale, Users, HardHat, Briefcase, Microscope, Cpu, GitCommit, Search, Code, BarChart2, Brush, ShieldAlert, Zap, Globe, Gauge, Fingerprint, Rocket, UserPlus, Megaphone, Database, TrendingUp } from 'lucide-react';
import type { AdversaryPersona } from './types';

export const ADVERSARY_PERSONAS: AdversaryPersona[] = [
    {
        id: 'cfo',
        name: 'The Strategic CFO',
        description: 'Analyzes burn rates, P&L projections, and identifies unsustainable financial dependencies or unit economic vulnerabilities.',
        icon: DollarSign,
    },
    {
        id: 'competitor_ceo',
        name: 'The Rival CEO',
        description: 'Identifies strategic blind spots, competitive advantages that could be neutralized, and vectors to outpace your market entry.',
        icon: Briefcase,
    },
    {
        id: 'ethicist',
        name: 'The Moral Arbitrator',
        description: 'Examines long-term societal, ethical, and systemic consequences that could lead to public backlash or institutional resistance.',
        icon: Scale,
    },
    {
        id: 'customer',
        name: 'The Critical Adopter',
        description: 'Exposes adoption friction, perceived lack of value, and psychological barriers to switching from existing market solutions.',
        icon: Users,
    },
    {
        id: 'engineer',
        name: 'The Systems Architect',
        description: 'Analyzes technical feasibility, scalability bottlenecks, and highlights hidden infrastructure complexities that threaten stability.',
        icon: HardHat,
    },
    {
        id: 'legal',
        name: 'The Compliance Hawk',
        description: 'Targets potential regulatory violations, intellectual property vulnerabilities, and significant compliance liability risks.',
        icon: Microscope,
    },
    {
        id: 'hacker',
        name: 'The Security Infiltrator',
        description: 'Simulates adversarial attacks, identifies data integrity gaps, and exploits trust boundaries in your technical architecture.',
        icon: ShieldAlert,
    },
    {
        id: 'visionary',
        name: 'The Exponential Futurist',
        description: 'Critiques the plan based on rapid technological convergence and the probability of accelerated market obsolescence.',
        icon: Zap,
    },
    {
        id: 'environmentalist',
        name: 'The ESG Auditor',
        description: 'Evaluates environmental sustainability, carbon footprint transparency, and potential greenwashing vulnerabilities in the strategy.',
        icon: Globe,
    },
    {
        id: 'logistician',
        name: 'The Supply Chain Veteran',
        description: 'Exposes operational fragility, procurement bottlenecks, and the structural risks of global logistics dependencies.',
        icon: Gauge,
    },
    {
        id: 'detective',
        name: 'The Intelligence Operative',
        description: 'Uncovers geopolitical risks, hidden counter-intelligence threats, and covert institutional resistance to your ecosystem.',
        icon: Fingerprint,
    },
    {
        id: 'disruptor',
        name: 'The Market Catalyst',
        description: 'Challenges the plan for being too conservative, identifying where you lack radical innovation or true strategic aggression.',
        icon: Rocket,
    },
    {
        id: 'talent',
        name: 'The Talent Architect',
        description: 'Identifies risks related to team burnout, hiring bottlenecks, specialized skill scarcity, and cultural fragmentation.',
        icon: UserPlus,
    },
    {
        id: 'pr',
        name: 'The PR Spin Doctor',
        description: 'Forensics on narrative failures, media hostility, and brand dilution that could undermine market perception.',
        icon: Megaphone,
    },
    {
        id: 'data',
        name: 'The Data Sovereign',
        description: 'Critiques data ownership models, privacy leakage risks, and algorithmic bias that could lead to systemic failure.',
        icon: Database,
    },
    {
        id: 'growth',
        name: 'The Growth Hacker',
        description: 'Exposes unsustainable customer acquisition costs, churn loops, and the "Viral Dead-ends" in your scaling strategy.',
        icon: TrendingUp,
    },
];

export const HIVE_MIND_AGENTS = [
    {
        id: 'orchestrator',
        name: 'Orchestrator',
        description: 'The central agent that delegates tasks to the swarm.',
        icon: GitCommit,
    },
    {
        id: 'researcher',
        name: 'Researcher',
        description: 'An agent specialized in gathering information from the web and other sources.',
        icon: Search,
    },
    {
        id: 'coder',
        name: 'Coder',
        description: 'An agent specialized in writing and debugging code.',
        icon: Code,
    },
    {
        id: 'analyst',
        name: 'Analyst',
        description: 'An agent specialized in analyzing data and identifying patterns.',
        icon: BarChart2,
    },
    {
        id: 'visualizer',
        name: 'Visualizer',
        description: 'An agent specialized in creating visualizations and user interfaces.',
        icon: Brush,
    },

];
