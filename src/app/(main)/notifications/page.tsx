'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Bell, Trash2 } from 'lucide-react';

interface NotificationRule {
  id: string;
  name: string;
  trigger: string;
  enabled: boolean;
}

export default function NotificationsPage() {
  const [rules, setRules] = useState<NotificationRule[]>([
    { id: '1', name: 'New Summary Notification', trigger: 'ai_summary', enabled: true },
    { id: '2', name: 'Stock Alert: AAPL > $300', trigger: 'stock_price', enabled: false },
  ]);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleTrigger, setNewRuleTrigger] = useState('');

  const addRule = () => {
    if (newRuleName && newRuleTrigger) {
      const newRule: NotificationRule = {
        id: Date.now().toString(),
        name: newRuleName,
        trigger: newRuleTrigger,
        enabled: true,
      };
      setRules([...rules, newRule]);
      setNewRuleName('');
      setNewRuleTrigger('');
    }
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(rule => rule.id === id ? { ...rule, enabled: !rule.enabled } : rule));
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="grid gap-8">
        <Card className="max-w-4xl mx-auto w-full">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Smart Notifications & Automations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-6">Manage your rule-based notifications and scheduled tasks.</p>
            
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Input
                placeholder="Notification Name (e.g., Daily Summary)"
                value={newRuleName}
                onChange={(e) => setNewRuleName(e.target.value)}
              />
              <Select onValueChange={setNewRuleTrigger} value={newRuleTrigger}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a trigger..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai_summary">AI Generates a New Summary</SelectItem>
                  <SelectItem value="stock_price">Stock Price Change</SelectItem>
                  <SelectItem value="news_alert">New News Article</SelectItem>
                  <SelectItem value="scheduled">Scheduled Time</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addRule}>Add Notification Rule</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-4xl mx-auto w-full">
          <CardHeader>
            <CardTitle>Your Notification Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rules.map(rule => (
                <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Bell className="text-muted-foreground" />
                    <div>
                      <p className="font-semibold">{rule.name}</p>
                      <p className="text-sm text-muted-foreground">Trigger: {rule.trigger.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {rules.length === 0 && (
                <p className="text-center text-muted-foreground">You have no notification rules.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
