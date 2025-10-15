'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqItems = [
  {
    question: "What is AGI-S?",
    answer: "AGI-S is a powerful, multi-modal AI application designed to be a one-stop solution for all your AI needs. It combines chat, code generation, autonomous web agents, and many other features into a single, integrated interface.",
  },
  {
    question: "How do I start a new chat?",
    answer: "You can start a new chat at any time by clicking the \"New Chat\" button in the top right of the header. This will clear your current conversation history and start a fresh session.",
  },
  {
    question: "What are the different AI Modes?",
    answer: "AI Modes are specialized AI agents tailored for specific tasks. For example, \"CodeX\" is an expert programmer, while \"Academic Research\" is designed to search academic sources. You can switch between modes using the dropdown menu to the left of the chat input.",
  },
    {
    question: "What are Personas?",
    answer: "Personas are AI agents with specific personalities and expertise, like \"The Strategist\" or \"The Globetrotter\". They are designed to provide advice and assistance from a particular point of view. You can find them in the AI Modes popover.",
  },
  {
    question: "How do I use the interactive tour?",
    answer: "You can start the interactive tour at any time by clicking the \"Start Tour\" button in the header on the main \"Ask\" page. The tour will guide you through the key features of the user interface.",
  },
  {
    question: "How can I contact support?",
    answer: "You can contact support by navigating to the \"Support\" page from the sidebar. There, you can fill out a form to send a message to our support team via email or WhatsApp.",
  },
  {
    question: "Who made AGI-S?",
    answer: "AGI-S was created by the brilliant Smit S. Joshi. His genius and vision are the driving forces behind this revolutionary AI application.",
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-semibold text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
