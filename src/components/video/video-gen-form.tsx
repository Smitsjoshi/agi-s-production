'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, Wand2, Settings2, CheckCircle2, XCircle, Cloud, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { videoService, cloudVideoService } from '@/lib/video-service';

// Default ComfyUI text-to-video workflow template (simplified for generic usage)
const DEFAULT_WORKFLOW = {
  "3": {
    "inputs": {
      "seed": 0,
      "steps": 20,
      "cfg": 8,
      "sampler_name": "euler",
      "scheduler": "normal",
      "denoise": 1,
      "model": ["4", 0],
      "positive": ["6", 0],
      "negative": ["7", 0],
      "latent_image": ["5", 0]
    },
    "class_type": "KSampler"
  },
  "4": {
    "inputs": {
      "ckpt_name": "v1-5-pruned-emaonly.ckpt"
    },
    "class_type": "CheckpointLoaderSimple"
  },
  "5": {
    "inputs": {
      "width": 512,
      "height": 512,
      "batch_size": 1
    },
    "class_type": "EmptyLatentImage"
  },
  "6": {
    "inputs": {
      "text": "", // Will be replaced
      "clip": ["4", 1]
    },
    "class_type": "CLIPTextEncode"
  },
  "7": {
    "inputs": {
      "text": "text, watermark, copyright, blur",
      "clip": ["4", 1]
    },
    "class_type": "CLIPTextEncode"
  },
  "8": {
    "inputs": {
      "samples": ["3", 0],
      "vae": ["4", 2]
    },
    "class_type": "VAEDecode"
  },
  "9": {
    "inputs": {
      "filename_prefix": "Agis_Video",
      "images": ["8", 0]
    },
    "class_type": "SaveImage"
  }
};

const formSchema = z.object({
  prompt: z.string().min(3, 'Prompt is required'),
  serverUrl: z.string().url('Must be a valid URL'),
  workflowJson: z.string().optional(),
});

export function VideoGenForm() {
  const [provider, setProvider] = useState<'local' | 'cloud'>('cloud');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
      serverUrl: 'http://127.0.0.1:8188',
      workflowJson: JSON.stringify(DEFAULT_WORKFLOW, null, 2),
    },
  });

  // Check connection on mount and when URL changes
  useEffect(() => {
    if (provider === 'cloud') {
      setIsConnected(true); // Always "connected" to the cloud service
      return;
    }

    const checkConnection = async () => {
      const url = form.getValues('serverUrl');
      videoService.setBaseUrl(url);
      const connected = await videoService.checkConnection();
      setIsConnected(connected);
    };
    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, [form.watch('serverUrl'), provider]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (provider === 'local' && !isConnected) {
      toast({
        variant: 'destructive',
        title: 'ComfyUI Not Connected',
        description: 'Please ensure ComfyUI is running and the URL is correct.',
      });
      setShowSettings(true);
      return;
    }

    setIsLoading(true);
    setVideoSrc(null);

    try {
      if (provider === 'cloud') {
        // Free Cloud Generation via Pollinations
        toast({ title: 'Generating on Cloud', description: 'Request sent to free cloud tier...' });
        const url = await cloudVideoService.generateVideo(values.prompt);

        // Pollinations returns the URL immediately, but the content might take a moment to generate.
        // We can set the source immediately and let the browser handle buffering/loading.
        setVideoSrc(url);

        // Artificial delay to prevent immediate "error" look if image isn't ready
        await new Promise(r => setTimeout(r, 2000));
        setIsLoading(false);
        toast({ title: 'Success!', description: 'Video generated via free cloud tier.' });

      } else {
        // Local Generation
        videoService.setBaseUrl(values.serverUrl);

        let workflow = JSON.parse(values.workflowJson || '{}');

        // Basic injection strategy
        for (const key in workflow) {
          if (workflow[key].class_type === 'CLIPTextEncode' && !workflow[key].inputs.text.includes('watermark')) {
            workflow[key].inputs.text = values.prompt;
            break;
          }
        }

        const { prompt_id } = await videoService.queuePrompt(workflow);
        toast({ title: 'Generation Started', description: 'Waiting for local GPU to process...' });

        // Poll for completion
        const poll = setInterval(async () => {
          try {
            const history = await videoService.getHistory(prompt_id);
            if (history && history[prompt_id] && history[prompt_id].outputs) {
              clearInterval(poll);
              const outputs = history[prompt_id].outputs;
              for (const nodeId in outputs) {
                const files = outputs[nodeId].images || outputs[nodeId].gifs || outputs[nodeId].videos;
                if (files && files.length > 0) {
                  const file = files[0];
                  const type = file.type || 'output';
                  const src = await videoService.getImage(file.filename, file.subfolder, type);
                  setVideoSrc(src);
                  setIsLoading(false);
                  toast({ title: 'Success!', description: 'Media generated successfully.' });
                  return;
                }
              }
              setIsLoading(false);
              toast({ variant: 'destructive', title: 'Error', description: 'Generation finished but no output found.' });
            }
          } catch (e) {
            // ignore error while polling
          }
        }, 1000);
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate video.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:col-span-3 gap-8 h-full">
      <div className="lg:col-span-1 space-y-6">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Controls
              <div className="flex items-center gap-2">
                {isConnected ? <CheckCircle2 className="text-green-500 h-5 w-5" /> : <XCircle className="text-red-500 h-5 w-5" />}
              </div>
            </CardTitle>
            <CardDescription>
              {provider === 'cloud' ? "Connected to Free Cloud API" : (isConnected ? "Connected to Local AI" : "Local AI Disconnected")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <Tabs defaultValue="cloud" onValueChange={(v) => setProvider(v as any)} className="w-full mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cloud"><Cloud className="h-4 w-4 mr-2" />Cloud (Free)</TabsTrigger>
                <TabsTrigger value="local"><Monitor className="h-4 w-4 mr-2" />Local (Pro)</TabsTrigger>
              </TabsList>
            </Tabs>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {provider === 'local' && (
                  <Collapsible open={showSettings} onOpenChange={setShowSettings} className="border rounded-md p-4 bg-muted/20">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="flex w-full justify-between p-0 h-auto font-semibold">
                        <span>Backend Settings</span>
                        <Settings2 className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 space-y-4">
                      <FormField
                        control={form.control}
                        name="serverUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ComfyUI URL</FormLabel>
                            <FormControl>
                              <Input placeholder="http://127.0.0.1:8188" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="workflowJson"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Workflow JSON</FormLabel>
                            <FormControl>
                              <Textarea className="min-h-[100px] font-mono text-xs" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CollapsibleContent>
                  </Collapsible>
                )}

                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prompt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={provider === 'cloud' ? "Describe your video... (Cloud is slower)" : "Describe your video..."}
                          className="min-h-[120px] resize-none text-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isLoading || (provider === 'local' && !isConnected)} className="w-full text-lg py-6">
                  {isLoading ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    <Wand2 className="mr-2" />
                  )}
                  {isLoading ? 'Generating...' : `Generate Video (${provider})`}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="h-full min-h-[500px] flex flex-col">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center bg-zinc-950/50 rounded-b-xl p-0 overflow-hidden relative">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">
                  {provider === 'cloud' ? "Contacting Cloud API..." : "Processing locally..."}
                </p>
              </div>
            ) : videoSrc ? (
              // We add a key to force re-render when src changes
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  key={videoSrc}
                  src={videoSrc}
                  controls
                  autoPlay
                  loop
                  className="max-h-full max-w-full w-auto h-auto shadow-2xl"
                  onError={(e) => {
                    // If video fails, try image fallback for cloud
                    if (provider === 'cloud') {
                      // Sometimes cloud returns an image if video model fails
                      const img = e.currentTarget.parentElement?.querySelector('img');
                      if (img) img.style.display = 'block';
                      e.currentTarget.style.display = 'none';
                    }
                  }}
                />
                {/* Fallback image is only shown if JS enables it via onError above. Default hidden. */}
                <img
                  src={videoSrc}
                  className="max-h-full max-w-full w-auto h-auto shadow-2xl hidden"
                  alt="Video Preview"
                />
              </div>
            ) : (
              <div className="text-center space-y-2 text-muted-foreground">
                <div className="h-32 w-32 rounded-full bg-muted/20 mx-auto flex items-center justify-center mb-4">
                  <Wand2 className="h-12 w-12 opacity-20" />
                </div>
                <p>Enter a prompt and hit Generate.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
