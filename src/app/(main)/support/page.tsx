'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageCircle } from 'lucide-react';

const supportCategories = [
  'Suggestion',
  'Error Report',
  'Feature Request',
  'General Feedback',
  'Other',
];

export default function SupportPage() {
  const [category, setCategory] = useState<string>(supportCategories[0]);
  const [message, setMessage] = useState('');

  const handleEmail = () => {
    const subject = `Support Request: ${category}`;
    const body = `Category: ${category}\n\nMessage:\n${message}`;
    window.location.href = `mailto:mmsjsmit@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleWhatsApp = () => {
    const text = `*Support Request: ${category}*\n\n*Message:*\n${message}`;
    window.open(`https://wa.me/9687820005?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Submit a Support Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Category</Label>
            <RadioGroup value={category} onValueChange={setCategory}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {supportCategories.map((cat) => (
                  <div key={cat} className="flex items-center">
                    <RadioGroupItem value={cat} id={cat} className="peer sr-only" />
                    <Label
                      htmlFor={cat}
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary w-full cursor-pointer"
                    >
                      {cat}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Tell us how we can help..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button onClick={handleEmail} disabled={!message.trim()}>
              <Mail className="mr-2 h-4 w-4" /> Send via Email
            </Button>
            <Button onClick={handleWhatsApp} disabled={!message.trim()}>
              <MessageCircle className="mr-2 h-4 w-4" /> Send via WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
