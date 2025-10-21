import { DollarSign, Scale, Users, HardHat, Briefcase, Microscope, Cpu, GitCommit, Search, Code, BarChart2, Brush } from 'lucide-react';
import type { AdversaryPersona } from './types';

export const ADVERSARY_PERSONAS: AdversaryPersona[] = [
    {
        id: 'cfo',
        name: 'The Skeptical CFO',
        description: 'Focuses on budget holes, unsustainable costs, and lack of a clear revenue model.',
        icon: DollarSign,
    },
    {
        id: 'competitor_ceo',
        name: 'The Competitor\'s CEO',
        description: 'Identifies market vulnerabilities, competitive threats, and areas a rival could easily exploit.',
        icon: Briefcase,
    },
    {
        id: 'ethicist',
        name: 'The Devil\'s Advocate Ethicist',
        description: 'Questions the moral, societal, and long-term unintended consequences of the plan.',
        icon: Scale,
    },
    {
        id: 'customer',
        name: 'The Jaded Customer',
        description: 'Points out user experience flaws, friction points, and why they wouldn\'t adopt or pay for it.',
        icon: Users,
    },
    {
        id: 'engineer',
        name: 'The Pragmatic Engineer',
        description: 'Critiques technical feasibility, scalability issues, and hidden implementation complexities.',
        icon: HardHat,
    },
    {
        id: 'legal',
        name: 'The Cautious Legal Counsel',
        description: 'Identifies potential regulatory hurdles, data privacy risks, and intellectual property issues.',
        icon: Microscope,
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
