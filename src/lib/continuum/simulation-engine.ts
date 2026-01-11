
export interface TimelineEvent {
    year: number;
    title: string;
    description: string;
    intensity: number; // 1-10 impact
    type: 'war' | 'discovery' | 'political' | 'culture';
}

export class SimulationEngine {

    // Simulate the "Butterfly Effect"
    // Changing one event ripples changes forward
    static async simulateTimelineChange(
        originalTimeline: TimelineEvent[],
        targetYear: number,
        changeDescription: string
    ): Promise<TimelineEvent[]> {

        // 1. Keep history BEFORE the split
        const past = originalTimeline.filter(e => e.year < targetYear);

        // 2. Insert the Branch Point
        const branchEvent: TimelineEvent = {
            year: targetYear,
            title: "Divergence Point",
            description: changeDescription,
            intensity: 10,
            type: 'political'
        };

        // 3. Generate NEW future (Mocking AI generation for the Engine structure)
        // In real app, this calls 'askAi' with the new context
        const newFuture = this.generateProceduralFuture(targetYear, 5); // Generate 5 subsequent eras

        return [...past, branchEvent, ...newFuture];
    }

    private static generateProceduralFuture(startYear: number, count: number): TimelineEvent[] {
        let currentYear = startYear;
        const events: TimelineEvent[] = [];

        for (let i = 0; i < count; i++) {
            currentYear += Math.floor(Math.random() * 50) + 10; // +10 to +60 years
            events.push({
                year: currentYear,
                title: `Resulting Event ${i + 1}`,
                description: "The timeline adjusts to the divergence...",
                intensity: Math.floor(Math.random() * 10),
                type: 'political'
            });
        }
        return events;
    }
}
