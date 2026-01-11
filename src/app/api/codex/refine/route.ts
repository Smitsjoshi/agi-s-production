import { NextRequest, NextResponse } from 'next/server';
import { refineUntilPerfect, healCode, optimizeForProduction } from '@/lib/codex/code-healer';

export async function POST(request: NextRequest) {
    try {
        const { code, action } = await request.json();

        if (!code) {
            return NextResponse.json(
                { error: 'Code is required' },
                { status: 400 }
            );
        }

        let result;

        switch (action) {
            case 'refine':
                result = await refineUntilPerfect(code);
                break;

            case 'heal':
                result = await healCode(code);
                break;

            case 'optimize':
                const optimized = await optimizeForProduction(code);
                result = { code: optimized };
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid action. Use: refine, heal, or optimize' },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error: any) {
        console.error('Code refinement error:', error);
        return NextResponse.json(
            { error: error.message || 'Refinement failed' },
            { status: 500 }
        );
    }
}
