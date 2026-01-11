import { NextRequest, NextResponse } from 'next/server';
import { generateFullStack, routeToModel } from '@/lib/codex/multi-model';

export async function POST(request: NextRequest) {
    try {
        const { description, task } = await request.json();

        if (!description) {
            return NextResponse.json(
                { error: 'Description is required' },
                { status: 400 }
            );
        }

        // If specific task, route to that model
        if (task) {
            const result = await routeToModel(task, description);
            return NextResponse.json({ success: true, code: result });
        }

        // Otherwise, generate full-stack app
        const result = await generateFullStack(description);

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error: any) {
        console.error('Code generation error:', error);
        return NextResponse.json(
            { error: error.message || 'Code generation failed' },
            { status: 500 }
        );
    }
}
