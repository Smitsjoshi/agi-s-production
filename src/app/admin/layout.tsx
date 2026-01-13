import Link from 'next/link';
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-zinc-950 text-white font-sans">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-black/60 backdrop-blur-md">
                <div className="flex h-16 items-center px-6 border-b border-white/10">
                    <span className="text-xl font-bold tracking-tight text-white">AGI-S Admin</span>
                </div>
                <nav className="flex flex-col gap-2 p-4">
                    <Link href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                        <LayoutDashboard className="h-5 w-5" />
                        Overview
                    </Link>
                    <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                        <Users className="h-5 w-5" />
                        Users
                    </Link>
                    <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                        <Settings className="h-5 w-5" />
                        Settings
                    </Link>
                </nav>
                <div className="absolute bottom-4 left-4 right-4">
                    <button
                        onClick={async () => {
                            try {
                                await import('@/lib/firebase/auth').then(mod => mod.logOut());
                                window.location.href = '/';
                            } catch (e) {
                                console.error('Logout failed', e);
                            }
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-400 hover:bg-white/10 hover:text-red-300 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
