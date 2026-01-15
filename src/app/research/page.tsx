'use client';
import { Construction } from 'lucide-react';
import Link from 'next/link';

export default function ResearchPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
            <Construction className="h-16 w-16 text-cyan-400 mb-6 animate-pulse" />
            <h1 className="text-4xl font-bold mb-4">Neural Architecture Search</h1>
            <p className="text-gray-400 max-w-lg mb-8">
                We are currently training our next generation of recursive models. Declassified papers will be published here shortly.
            </p>
            <Link href="/" className="text-cyan-400 hover:text-cyan-300 underline">Return to Base</Link>
        </div>
    );
}
