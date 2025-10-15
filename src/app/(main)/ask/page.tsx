'use client';
import { ChatInterface } from "@/components/chat/chat-interface";
import { TourTooltip } from "@/components/tour-tooltip";

export default function AskPage() {
  return (
    <div className="h-full">
      <ChatInterface />
      <TourTooltip />
    </div>
  );
}
