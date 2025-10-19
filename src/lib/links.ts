import {
  Briefcase,
  GitCommit,
  GitFork,
  Github,
  GitMerge,
  GitPullRequest,
  Heart,
  HelpCircle,
  IterationCcw,
  IterationCw,
  MessageSquare,
  Plus,
  Settings,
  Terminal,
  User,
  Users,
} from 'lucide-react';

export const links = [
  {
    title: 'Singularity',
    href: '/singularity',
    icon: GitCommit,
    description: 'A single, unified view of your entire software development lifecycle.',
    children: [
      {
        title: 'Settings',
        href: '/singularity/settings',
        icon: Settings,
        description: 'Configure your Singularity settings.'
      },
    ],
  },
  {
    title: 'Supernova',
    href: '/supernova',
    icon: GitMerge,
    description: 'A powerful tool for managing and merging code branches.',
    children: [
      {
        title: 'Settings',
        href: '/supernova/settings',
        icon: Settings,
        description: 'Configure your Supernova settings.'
      },
    ],
    locked: true,
  },
  {
    title: 'Continuum',
    href: '/continuum',
    icon: GitPullRequest,
    description: 'A continuous integration and delivery platform.',
    children: [
      {
        title: 'Settings',
        href: '/continuum/settings',
        icon: Settings,
        description: 'Configure your Continuum settings.'
      },
    ],
    locked: true,
  },
  {
    title: 'Dimension',
    href: '/dimension',
    icon: GitFork,
    description: 'A tool for managing and tracking different versions of your code.',
    children: [
      {
        title: 'Settings',
        href: '/dimension/settings',
        icon: Settings,
        description: 'Configure your Dimension settings.'
      },
    ],
    locked: true,
  },
  {
    title: 'Fabric',
    href: '/fabric',
    icon: IterationCw,
    description: 'A tool for building and deploying your applications.',
    children: [
      {
        title: 'Settings',
        href: '/fabric/settings',
        icon: Settings,
        description: 'Configure your Fabric settings.'
      },
    ],
    locked: true,
  },
  {
    title: 'Spacetime',
    href: '/spacetime',
    icon: IterationCcw,
    description: 'A tool for visualizing and analyzing your application\'s performance over time.',
    children: [
      {
        title: 'Settings',
        href: '/spacetime/settings',
        icon: Settings,
        description: 'Configure your Spacetime settings.'
      },
    ],
    locked: true,
  },
  {
    title: 'Wormhole',
    href: '/wormhole',
    icon: Briefcase,
    description: 'A tool for securely sharing files and data between different environments.',
    children: [
      {
        title: 'Settings',
        href: '/wormhole/settings',
        icon: Settings,
        description: 'Configure your Wormhole settings.'
      },
    ],
    locked: true,
  },
  {
    title: 'Multiverse',
    href: '/multiverse',
    icon: Users,
    description: 'A tool for managing multiple development environments.',
    children: [
      {
        title: 'Settings',
        href: '/multiverse/settings',
        icon: Settings,
        description: 'Configure your Multiverse settings.'
      },
    ],
    locked: true,
  },
];
