
import { getAgent } from '@/lib/firebase/firestore';
import { Agent } from '@/lib/types';
import { ChatInterface } from '@/components/chat/chat-interface';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default async function AgentChatPage({ params }: { params: { id: string } }) {
  const agent: Agent | null = await getAgent(params.id);

  if (!agent) {
    return (
      <div>
        <h1 className="font-headline text-3xl font-bold">Agent Not Found</h1>
        <p className="text-muted-foreground">The requested agent could not be found.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
        <div className="flex items-center space-x-4 p-4 border-b">
            <Avatar className="h-12 w-12">
                {agent.avatar && <AvatarImage src={agent.avatar} alt={agent.name} />}
                <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <h1 className="font-headline text-2xl font-bold">{agent.name}</h1>
                <p className="text-muted-foreground">{agent.description}</p>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto">
            <ChatInterface agent={agent} />
        </div>
    </div>
  );
}
