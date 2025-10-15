
import { PlusCircle, PanelLeft, MessageSquare, Languages } from 'lucide-react';

export const tourSteps = [
  {
    target: '.new-chat-button',
    content: 'Start a new chat session.',
    icon: PlusCircle,
  },
  {
    target: '.sidebar-toggle',
    content: 'Toggle the sidebar to show or hide the navigation menu.',
    icon: PanelLeft,
  },
  {
    target: '.chat-input',
    content: 'Type your message here.',
    icon: MessageSquare,
  },
  {
    target: '.language-switcher',
    content: 'Change the display language of the application.',
    icon: Languages,
  },
];
