'use client';
import { Terminal } from 'lucide-react';
import Link from 'next/link';

export default function APIPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center font-mono">
            <Terminal className="h-16 w-16 text-emerald-400 mb-6" />
            <h1 className="text-4xl font-bold mb-4">Neural Link V2</h1>
            <p className="text-gray-400 max-w-lg mb-8">
                Direct lattice access is currently restricted to Alpha Cohort users. Documentation is being encrypted.
            </p>
            <div className="bg-zinc-900 p-4 rounded-lg mb-8 text-left text-sm text-emerald-400">
                $ curl -X POST https://api.agi-s.io/v1/cortex/init
            </div>
            <Link href="/" className="text-emerald-400 hover:text-emerald-300 underline">Return to Base</Link>
        </div>
    );
}
