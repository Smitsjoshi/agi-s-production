'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Loader2, Wand2, FileDown, Clipboard, Code, Play,
    RotateCcw, Save, History, Smartphone, Tablet, Monitor,
    Maximize2, Copy, Check, Sparkles, MessageSquare, Settings2, ShieldHalf,
    Zap, Heart, Rocket, GitBranch, RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { askAi } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import Editor from '@monaco-editor/react';
import { CodeSkeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/error-boundary';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Language configurations
const LANGUAGES = [
    { value: 'html', label: 'HTML', monaco: 'html', extension: 'html' },
    { value: 'css', label: 'CSS', monaco: 'css', extension: 'css' },
    { value: 'javascript', label: 'JavaScript', monaco: 'javascript', extension: 'js' },
    { value: 'typescript', label: 'TypeScript', monaco: 'typescript', extension: 'ts' },
    { value: 'react', label: 'React (JSX)', monaco: 'javascript', extension: 'jsx' },
    { value: 'vue', label: 'Vue', monaco: 'html', extension: 'vue' },
    { value: 'python', label: 'Python', monaco: 'python', extension: 'py' },
    { value: 'java', label: 'Java', monaco: 'java', extension: 'java' },
    { value: 'cpp', label: 'C++', monaco: 'cpp', extension: 'cpp' },
    { value: 'csharp', label: 'C#', monaco: 'csharp', extension: 'cs' },
    { value: 'go', label: 'Go', monaco: 'go', extension: 'go' },
    { value: 'rust', label: 'Rust', monaco: 'rust', extension: 'rs' },
    { value: 'php', label: 'PHP', monaco: 'php', extension: 'php' },
    { value: 'ruby', label: 'Ruby', monaco: 'ruby', extension: 'rb' },
    { value: 'swift', label: 'Swift', monaco: 'swift', extension: 'swift' },
    { value: 'kotlin', label: 'Kotlin', monaco: 'kotlin', extension: 'kt' },
    { value: 'sql', label: 'SQL', monaco: 'sql', extension: 'sql' },
    { value: 'json', label: 'JSON', monaco: 'json', extension: 'json' },
    { value: 'yaml', label: 'YAML', monaco: 'yaml', extension: 'yaml' },
    { value: 'markdown', label: 'Markdown', monaco: 'markdown', extension: 'md' },
];

const PREVIEW_MODES = [
    { value: 'desktop', label: 'Desktop', icon: Monitor, width: '100%' },
    { value: 'tablet', label: 'Tablet', icon: Tablet, width: '768px' },
    { value: 'mobile', label: 'Mobile', icon: Smartphone, width: '375px' },
];

interface CodeVersion {
    id: string;
    code: string;
    prompt: string;
    language: string;
    timestamp: number;
}

interface SavedCode {
    id: string;
    name: string;
    code: string;
    language: string;
    timestamp: number;
}

export default function CodeXPage() {
    const [showDisclaimer, setShowDisclaimer] = useState(true);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('html');
    const [previewMode, setPreviewMode] = useState('desktop');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState<CodeVersion[]>([]);
    const [savedCodes, setSavedCodes] = useState<SavedCode[]>([]);
    const [conversationHistory, setConversationHistory] = useState<Array<{ role: string, content: string }>>([]);
    const { toast } = useToast();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const editorRef = useRef<any>(null);

    // Load saved codes and history on mount
    useEffect(() => {
        const saved = storage.get<SavedCode[]>(STORAGE_KEYS.CODE_LIBRARY, []);
        const hist = storage.get<CodeVersion[]>(STORAGE_KEYS.CODE_HISTORY, []);
        setSavedCodes(saved);
        setHistory(hist);
    }, []);

    // Auto-save to history
    useEffect(() => {
        if (code && history.length > 0 && history[0].code !== code) {
            const newHistory = [
                {
                    id: Date.now().toString(),
                    code,
                    prompt: prompt || 'Manual edit',
                    language,
                    timestamp: Date.now(),
                },
                ...history.slice(0, 9), // Keep last 10
            ];
            setHistory(newHistory);
            storage.set(STORAGE_KEYS.CODE_HISTORY, newHistory);
        }
    }, [code]);

    const handleGenerate = async (iterationPrompt?: string) => {
        const currentPrompt = iterationPrompt || prompt;
        if (!currentPrompt.trim()) return;

        setIsLoading(true);

        try {
            // Build conversation context
            const messages = [
                ...conversationHistory,
                { role: 'user', content: currentPrompt }
            ];

            // Add current code context if iterating
            let fullPrompt = currentPrompt;
            if (code && iterationPrompt) {
                fullPrompt = `Current code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nUser request: ${currentPrompt}`;
            }

            const response = await askAi(fullPrompt, 'CodeX', [], undefined, { language });

            if (response?.componentCode) {
                const newCode = response.componentCode;
                setCode(newCode);

                // Add to history
                const newVersion: CodeVersion = {
                    id: Date.now().toString(),
                    code: newCode,
                    prompt: currentPrompt,
                    language,
                    timestamp: Date.now(),
                };
                const newHistory = [newVersion, ...history.slice(0, 9)];
                setHistory(newHistory);
                storage.set(STORAGE_KEYS.CODE_HISTORY, newHistory);

                // Update conversation
                setConversationHistory([
                    ...messages,
                    { role: 'assistant', content: newCode }
                ]);

                if (!iterationPrompt) {
                    setPrompt('');
                }
            } else {
                throw new Error('Invalid response from AI');
            }
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: 'Failed to generate code. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async () => {
        if (code) {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            toast({ title: 'Copied to clipboard!' });
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        if (code) {
            const lang = LANGUAGES.find(l => l.value === language);
            const extension = lang?.extension || 'txt';
            const blob = new Blob([code], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `code.${extension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast({ title: `Downloaded as code.${extension}` });
        }
    };

    const handleSave = () => {
        if (code) {
            // This will be replaced with a proper input prompt component
            const name = window.prompt(`Enter a name for this code:`, `Code ${savedCodes.length + 1}`);
            if (name) {
                const newSaved: SavedCode = {
                    id: Date.now().toString(),
                    name,
                    code,
                    language,
                    timestamp: Date.now(),
                };
                const updated = [newSaved, ...savedCodes];
                setSavedCodes(updated);
                storage.set(STORAGE_KEYS.CODE_LIBRARY, updated);
                toast({ title: 'Saved to library!' });
            }
        }
    };

    const loadFromHistory = (version: CodeVersion) => {
        setCode(version.code);
        setLanguage(version.language);
        toast({ title: 'Loaded from history' });
    };

    const loadFromLibrary = (saved: SavedCode) => {
        setCode(saved.code);
        setLanguage(saved.language);
        toast({ title: `Loaded: ${saved.name}` });
    };

    const handleEditorMount = (editor: any) => {
        editorRef.current = editor;
    };

    const formatCode = () => {
        if (editorRef.current) {
            editorRef.current.getAction('editor.action.formatDocument').run();
            toast({ title: 'Code formatted' });
        }
    };

    const refreshPreview = () => {
        if (iframeRef.current) {
            iframeRef.current.src = iframeRef.current.src;
            toast({ title: 'Preview refreshed' });
        }
    };

    // Update preview when code changes
    useEffect(() => {
        if (iframeRef.current && (language === 'html' || language === 'react' || language === 'javascript')) {
            const doc = iframeRef.current.contentDocument;
            if (doc) {
                // Robust extraction: find code within backticks or use the whole string if clean
                const codeBlockRegex = /```(?:\w+)?\s*([\s\S]*?)\s*```/g;
                let previewCode = code;
                const matches = [...code.matchAll(codeBlockRegex)];

                if (matches.length > 0) {
                    previewCode = matches.map(m => m[1].trim()).join('\n\n');
                } else {
                    // Strip bold labels if any
                    previewCode = code.replace(/\*\*[^*]+\*\*/g, '').replace(/```/g, '').trim();
                }

                doc.open();
                doc.write(previewCode);
                doc.close();
            }
        }
    }, [code, language]);

    const canPreview = ['html', 'react', 'css', 'javascript'].includes(language);
    const currentPreviewMode = PREVIEW_MODES.find(m => m.value === previewMode);
    const PreviewIcon = currentPreviewMode?.icon || Monitor;

    return (
        <ErrorBoundary>
            <AnimatePresence>
                {showDisclaimer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="max-w-md w-full bg-card border border-border p-8 rounded-2xl shadow-2xl relative"
                        >
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-yellow-500/10 p-4 rounded-full border border-yellow-500/20">
                                <ShieldHalf className="h-10 w-10 text-yellow-500" />
                            </div>

                            <h2 className="text-2xl font-headline font-bold mb-4 mt-4">CodeX: Experimental Mode</h2>
                            <div className="space-y-4 text-muted-foreground text-sm leading-relaxed mb-8">
                                <p>
                                    Welcome to the AGI-S CodeX Beta. This environment is highly experimental and may behave unexpectedly.
                                </p>
                                <div className="bg-muted/50 p-3 rounded-lg border border-border/50 text-foreground font-medium">
                                    ⚠️ IMPORTANT: Use this only for generating frontend components (HTML/CSS/JS). Do not attempt to generate large-scale backend systems.
                                </div>
                                <p>
                                    Live Preview is currently optimized for single-file components. Complex multi-file architectures may not render correctly in the current preview engine.
                                </p>
                            </div>

                            <Button
                                onClick={() => setShowDisclaimer(false)}
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                I Understand, Let's Build
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex h-[calc(100vh-6rem)] gap-4">
                {/* Left Panel: Prompt + Code Editor */}
                <div className="flex w-1/2 flex-col gap-4">
                    {/* Prompt Area */}
                    <Card className="flex flex-col" style={{ flex: '0 0 30%' }}>
                        <div className="p-3 border-b flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Wand2 className="h-5 w-5 text-primary" />
                                <p className="font-headline font-medium">AI Code Generator</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Select value={language} onValueChange={setLanguage}>
                                    <SelectTrigger className="w-[140px] h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LANGUAGES.map(lang => (
                                            <SelectItem key={lang.value} value={lang.value}>
                                                {lang.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <CardContent className="p-4 flex-1 flex flex-col gap-2">
                            <Textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe what you want to build... (e.g., 'Create a responsive pricing card with 3 tiers')"
                                className="flex-1 bg-background border-border resize-none text-sm"
                                disabled={isLoading}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                        handleGenerate();
                                    }
                                }}
                            />
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => handleGenerate()}
                                    disabled={isLoading || !prompt.trim()}
                                    className="flex-1"
                                    size="sm"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Generate
                                        </>
                                    )}
                                </Button>
                                {code && (
                                    <Button
                                        onClick={() => {
                                            const iteratePrompt = prompt.trim();
                                            if (iteratePrompt) {
                                                handleGenerate(iteratePrompt);
                                            }
                                        }}
                                        disabled={isLoading || !prompt.trim()}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Iterate
                                    </Button>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Press Ctrl+Enter to generate • Use "Iterate" to modify existing code
                            </p>
                        </CardContent>
                    </Card>

                    {/* Code Editor */}
                    <Card className="flex flex-col" style={{ flex: '0 0 70%' }}>
                        <div className="p-3 border-b flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Code className="h-5 w-5 text-primary" />
                                <p className="font-headline font-medium">Code Editor</p>
                                {code && (
                                    <Badge variant="secondary" className="text-xs">
                                        {LANGUAGES.find(l => l.value === language)?.label}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={handleCopy}
                                    disabled={!code}
                                    title="Copy code"
                                >
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={formatCode}
                                    disabled={!code}
                                    title="Format code"
                                >
                                    <Settings2 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={handleDownload}
                                    disabled={!code}
                                    title="Download"
                                >
                                    <FileDown className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={handleSave}
                                    disabled={!code}
                                    title="Save to library"
                                >
                                    <Save className="h-4 w-4" />
                                </Button>
                                <Separator orientation="vertical" className="h-6 mx-1" />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            disabled={history.length === 0}
                                            title="History"
                                        >
                                            <History className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-64">
                                        <DropdownMenuLabel>Recent Generations</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <ScrollArea className="h-64">
                                            {history.map((version) => (
                                                <DropdownMenuItem
                                                    key={version.id}
                                                    onClick={() => loadFromHistory(version)}
                                                    className="flex flex-col items-start gap-1 cursor-pointer"
                                                >
                                                    <span className="text-xs font-medium truncate w-full">
                                                        {version.prompt}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(version.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </DropdownMenuItem>
                                            ))}
                                        </ScrollArea>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <CardContent className="p-0 flex-1 overflow-hidden">
                            {isLoading && !code ? (
                                <CodeSkeleton />
                            ) : code ? (
                                <Editor
                                    height="100%"
                                    language={LANGUAGES.find(l => l.value === language)?.monaco || 'plaintext'}
                                    value={code}
                                    onChange={(value) => setCode(value || '')}
                                    onMount={handleEditorMount}
                                    theme="vs-dark"
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                        lineNumbers: 'on',
                                        roundedSelection: true,
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        tabSize: 2,
                                        wordWrap: 'on',
                                        formatOnPaste: true,
                                        formatOnType: true,
                                    }}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <div className="text-center">
                                        <Code className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Code will appear here</p>
                                        <p className="text-xs mt-1">Describe what you want to build above</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel: Preview */}
                <Card className="w-1/2 flex flex-col">
                    <div className="p-3 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <PreviewIcon className="h-5 w-5 text-primary" />
                            <p className="font-headline font-medium">Live Preview</p>
                        </div>
                        <div className="flex items-center gap-1">
                            {canPreview && (
                                <>
                                    {PREVIEW_MODES.map(mode => {
                                        const Icon = mode.icon;
                                        return (
                                            <Button
                                                key={mode.value}
                                                variant={previewMode === mode.value ? 'default' : 'ghost'}
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setPreviewMode(mode.value)}
                                                title={mode.label}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </Button>
                                        );
                                    })}
                                    <Separator orientation="vertical" className="h-6 mx-1" />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={refreshPreview}
                                        title="Refresh preview"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setIsFullscreen(!isFullscreen)}
                                        title="Toggle fullscreen"
                                    >
                                        <Maximize2 className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                    <CardContent className="p-4 flex-1 overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-lg">
                            {isLoading && !code ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="animate-spin text-primary h-8 w-8" />
                                </div>
                            ) : code && canPreview ? (
                                <motion.div
                                    key={previewMode}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className="h-full flex items-center justify-center"
                                    style={{ width: currentPreviewMode?.width }}
                                >
                                    <iframe
                                        ref={iframeRef}
                                        className="w-full h-full bg-white rounded border"
                                        sandbox="allow-scripts allow-forms allow-same-origin"
                                        title="Preview"
                                    />
                                </motion.div>
                            ) : code && !canPreview ? (
                                <div className="text-center text-muted-foreground p-8">
                                    <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Preview not available for {LANGUAGES.find(l => l.value === language)?.label}</p>
                                    <p className="text-xs mt-1">Use the code editor to view and edit your code</p>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground">
                                    <Monitor className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Live preview will appear here</p>
                                    <p className="text-xs mt-1">Generate code to see it in action</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ErrorBoundary>
    );
}
