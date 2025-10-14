
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bot, Key, Link } from 'lucide-react';

export default function ApiPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">API & Webhooks</h1>
        <p className="text-muted-foreground">
          Integrate your own tools and services with AGI-S.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Key /> API Keys
            </CardTitle>
            <CardDescription>
              Manage your API keys for programmatic access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">Your API Key</Label>
                <div className="flex items-center gap-2">
                  <Input id="api-key" type="password" value="**************" readOnly />
                  <Button variant="outline">Copy</Button>
                </div>
              </div>
              <Button>Generate New Key</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Link /> Webhooks
            </CardTitle>
            <CardDescription>
              Create webhooks to receive real-time updates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input id="webhook-url" placeholder="https://your-service.com/webhook" />
              </div>
              <Button>Add Webhook</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
