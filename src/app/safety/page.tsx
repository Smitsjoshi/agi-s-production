'use client';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function SafetyPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
            <ShieldAlert className="h-16 w-16 text-amber-400 mb-6" />
            <h1 className="text-4xl font-bold mb-4">Alignment Protocols</h1>
            <p className="text-gray-400 max-w-lg mb-8">
                AGI-S is bound by the 'Ghost Protocol' safety layer. It cannot execute actions that violate the core autonomy of the user or external systems.
            </p>
            <Link href="/" className="text-amber-400 hover:text-amber-300 underline">Review Guidelines</Link>
        </div>
    );
}
