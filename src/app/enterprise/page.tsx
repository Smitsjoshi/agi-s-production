'use client';
import { Building2 } from 'lucide-react';
import Link from 'next/link';

export default function EnterprisePage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
            <Building2 className="h-16 w-16 text-blue-400 mb-6" />
            <h1 className="text-4xl font-bold mb-4">Sovereign Deployment</h1>
            <p className="text-gray-400 max-w-lg mb-8">
                Run AGI-S entirely on your On-Premise infrastructure. Air-gapped, compliant, and untethered from the grid.
            </p>
            <Link href="/" className="text-blue-400 hover:text-blue-300 underline">Contact Council</Link>
        </div>
    );
}
