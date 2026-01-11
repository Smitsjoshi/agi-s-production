import { NextRequest, NextResponse } from 'next/server';
import { deploy, runPreDeployChecks } from '@/lib/codex/deployer';

export async function POST(request: NextRequest) {
    try {
        const { files, config } = await request.json();

        if (!files || !config) {
            return NextResponse.json(
                { error: 'Files and config are required' },
                { status: 400 }
            );
        }

        // Run pre-deployment checks
        const checks = await runPreDeployChecks(files);

        if (!checks.passed) {
            return NextResponse.json({
                success: false,
                error: 'Pre-deployment checks failed',
                issues: checks.issues,
                warnings: checks.warnings
            }, { status: 400 });
        }

        // Deploy
        const result = await deploy(files, config);

        return NextResponse.json({
            success: result.success,
            url: result.url,
            logs: result.logs,
            error: result.error,
            warnings: checks.warnings
        });

    } catch (error: any) {
        console.error('Deployment error:', error);
        return NextResponse.json(
            { error: error.message || 'Deployment failed' },
            { status: 500 }
        );
    }
}
