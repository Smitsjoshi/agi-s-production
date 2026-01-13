
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { signIn } from '@/lib/firebase/auth';
import { useToast } from '@/hooks/use-toast';

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight, Github } from 'lucide-react';
import { signIn } from '@/lib/firebase/auth'; // Ensure this path is correct for your project
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // Added for Signup flow simulation
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    // Reset fields when toggling
    const toggleMode = () => {
        setIsLogin(!isLogin);
        setEmail('');
        setPassword('');
        setName('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulation for signup as we only had signIn imported. 
        // In a real app, you'd call signUp for the create account flow.
        try {
            if (isLogin) {
                await signIn(email, password);
                toast({ title: 'Welcome back', description: 'Access granted to AGI-S.' });
            } else {
                // Placeholder for signup logic
                // await signUp(email, password, name);
                toast({ title: 'Account Created', description: 'Welcome to the future.' });
            }
            router.push('/ask');
        } catch (error: any) {
            console.error(error);
            toast({
                title: 'Authentication Error',
                description: error.message || 'Access denied.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full"
            >
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                    <div className="px-8 pt-8 pb-6 text-center">
                        <motion.h1
                            className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400"
                            layoutId="title"
                        >
                            AGI-S
                        </motion.h1>
                        <motion.p
                            className="mt-2 text-sm text-gray-400"
                            key={isLogin ? 'login-sub' : 'signup-sub'}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {isLogin ? 'Enter the intelligence interface' : 'Join the next generation'}
                        </motion.p>
                    </div>

                    <div className="px-8 pb-8">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                        key="name-field"
                                    >
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-xs font-medium text-gray-300 uppercase tracking-wider">Name</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                placeholder="John Doe"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all duration-300"
                                                required={!isLogin}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-medium text-gray-300 uppercase tracking-wider">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="user@agi-s.io"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all duration-300"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-xs font-medium text-gray-300 uppercase tracking-wider">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all duration-300"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-none shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_30px_rgba(8,145,178,0.5)] transition-all duration-300 mt-6 h-11"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <span className="flex items-center">
                                        {isLogin ? 'Initialize Session' : 'Create Identity'}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </span>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 flex flex-col items-center gap-4 text-center">
                            <div className="relative w-full">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[#050505] px-2 text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            <Button variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white hover:text-white transition-colors h-10">
                                <Github className="mr-2 h-4 w-4" /> Github
                            </Button>

                            <p className="text-xs text-gray-500 mt-4">
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    onClick={toggleMode}
                                    className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors font-medium"
                                >
                                    {isLogin ? 'Sign up' : 'Sign in'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
