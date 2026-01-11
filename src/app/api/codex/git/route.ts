import { NextRequest, NextResponse } from 'next/server';
import { GitManager, GitHubManager, generateCommitMessage } from '@/lib/codex/git-manager';

export async function POST(request: NextRequest) {
    try {
        const { action, config, data } = await request.json();

        switch (action) {
            case 'init':
                const gitManager = new GitManager(config);
                await gitManager.init();
                await gitManager.configure();
                return NextResponse.json({ success: true, message: 'Git initialized' });

            case 'commit':
                const git = new GitManager(config);
                await git.addAll();
                const commit = await git.commit(data.message);
                return NextResponse.json({ success: true, commit });

            case 'create-repo':
                if (!config.githubToken) {
                    return NextResponse.json(
                        { error: 'GitHub token required' },
                        { status: 400 }
                    );
                }
                const github = new GitHubManager(config.githubToken);
                const repo = await github.createRepo(data.name, data.isPrivate);
                return NextResponse.json({ success: true, repo });

            case 'push':
                const gitPush = new GitManager(config);
                await gitPush.push(data.remote, data.branch);
                return NextResponse.json({ success: true, message: 'Pushed successfully' });

            case 'generate-message':
                const message = await generateCommitMessage(data.diff);
                return NextResponse.json({ success: true, message });

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }

    } catch (error: any) {
        console.error('Git operation error:', error);
        return NextResponse.json(
            { error: error.message || 'Git operation failed' },
            { status: 500 }
        );
    }
}
