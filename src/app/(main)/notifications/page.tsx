'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotificationsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Smart Notifications & Automations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Coming soon! This page will allow you to set up rule-based notifications and scheduled tasks.</p>
        </CardContent>
      </Card>
    </div>
  );
}
