'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Users, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

const workspaces = [
  {
    id: 'ws-1',
    name: 'My Personal Workspace',
    owner: 'John Doe',
    isPersonal: true,
    members: 1,
  },
  {
    id: 'ws-2',
    name: 'Project Phoenix',
    owner: 'Jane Smith',
    isPersonal: false,
    members: 5,
  },
  {
    id: 'ws-3',
    name: 'Marketing Q3 Campaign',
    owner: 'John Doe',
    isPersonal: false,
    members: 12,
  }
];

export default function WorkspacesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Workspaces</h1>
        <p className="text-muted-foreground">
          Collaborate with your team, share agents, and manage projects in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Card className="flex flex-col items-center justify-center p-6 border-dashed hover:border-primary hover:bg-muted/50 transition-colors">
            <button className="text-center">
                <PlusCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 font-headline text-lg font-semibold">Create New Workspace</h2>
                <p className="mt-1 text-sm text-muted-foreground">Start a new collaborative project</p>
            </button>
        </Card>
        {workspaces.map((ws) => (
          <Card key={ws.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline text-lg">{ws.name}</CardTitle>
              <CardDescription>
                {ws.isPersonal ? 'Your personal space for projects and agents.' : `Owned by ${ws.owner}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center gap-4">
              <div className="flex items-center text-sm text-muted-foreground gap-2">
                {ws.isPersonal ? <User /> : <Users />}
                <span>{ws.members} member{ws.members > 1 ? 's' : ''}</span>
              </div>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href="#">Open Workspace</Link>
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
