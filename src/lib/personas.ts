import { DollarSign, Scale, Users, HardHat, Briefcase, Microscope, Cpu, GitCommit, Search, Code, BarChart2, Brush, ShieldAlert, Zap, Globe, Gauge, Fingerprint, Rocket } from 'lucide-react';
import type { AdversaryPersona } from './types';

export const ADVERSARY_PERSONAS: AdversaryPersona[] = [
    {
        id: 'cfo',
        name: 'The Merciless CFO',
        description: 'Analyzes burn rates, P&L projections, and identifies unsustainable financial dependencies or unit economic flaws.',
        icon: DollarSign,
    },
    {
        id: 'competitor_ceo',
        name: 'The Ruthless Rival CEO',
        description: 'Identifies strategic blind spots, competitive advantages he could neutralize, and ways to outpace your market entry.',
        icon: Briefcase,
    },
    {
        id: 'ethicist',
        name: 'The Moral Arbitrator',
        description: 'Forensically examines the long-term societal, moral, and systemic consequences that could lead to public backlash.',
        icon: Scale,
    },
    {
        id: 'customer',
        name: 'The Hyper-Critical User',
        description: 'Exposes adoption friction, perceived lack of value, and psychological barriers to switching from existing solutions.',
        icon: Users,
    },
    {
        id: 'engineer',
        name: 'The Systems Architect',
        description: 'Tears down technical feasibility, scalability bottlenecks, and highlights hidden infrastructure complexities that lead to failure.',
        icon: HardHat,
    },
    {
        id: 'legal',
        name: 'The Compliance Hawk',
        description: 'Targets potential regulatory violations, intellectual property vulnerabilities, and catastrophic liability risks.',
        icon: Microscope,
    },
    {
        id: 'hacker',
        name: 'The Adversarial Infiltrator',
        description: 'Simulates cyberattacks, identifies data integrity gaps, and exploits trust boundaries in your architecture.',
        icon: ShieldAlert,
    },
    {
        id: 'visionary',
        name: 'The Exponential Futurist',
        description: 'Critiques the plan based on rapid technological convergence and the high probability of immediate obsolescence.',
        icon: Zap,
    },
    {
        id: 'environmentalist',
        name: 'The ESG Auditor',
        description: 'Evaluates environmental sustainability, carbon footprint transparency, and potential greenwashing vulnerabilities.',
        icon: Globe,
    },
    {
        id: 'logistician',
        name: 'The Supply Chain Veteran',
        description: 'Exposes operational fragility, procurement bottlenecks, and the "Chaos Theory" of global logistics.',
        icon: Gauge,
    },
    {
        id: 'detective',
        name: 'The Intelligence Operative',
        description: 'Uncovers geopolitical risks, hidden counter-intelligence threats, and covert institutional resistance to your plan.',
        icon: Fingerprint,
    },
    {
        id: 'disruptor',
        name: 'The Chaos Agent',
        description: 'Challenges the plan for being too conservative, forcing a radical shift or identifying where you lack true "Killer Intent".',
        icon: Rocket,
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
