import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, Server, Globe } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-gray-400">System overview and control center.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-zinc-900 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-200">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">12,345</div>
                        <p className="text-xs text-gray-400">+180% from last month</p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-200">Active Agents</CardTitle>
                        <Activity className="h-4 w-4 text-cyan-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">573</div>
                        <p className="text-xs text-gray-400">+201 since last hour</p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-200">System Load</CardTitle>
                        <Server className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">12%</div>
                        <p className="text-xs text-gray-400">Optimal condition</p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-200">Global Connectivity</CardTitle>
                        <Globe className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">99.9%</div>
                        <p className="text-xs text-gray-400">Uptime</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Mock */}
            <div className="rounded-xl border border-white/10 bg-zinc-900 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h3 className="font-semibold text-white">Recent System Events</h3>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                <div className="flex items-center gap-4">
                                    <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                                    <div>
                                        <p className="text-sm font-medium text-white">Agent swarmed deployed to sector {7 + i}</p>
                                        <p className="text-xs text-gray-500">2 minutes ago</p>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 font-mono">ID: {Math.random().toString(36).substring(7).toUpperCase()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
