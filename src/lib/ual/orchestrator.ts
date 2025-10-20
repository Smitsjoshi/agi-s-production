
import { ualRegistry } from './registry';
import { planner } from './planner';
import './actions/listFiles';
import './actions/openWebsite';
import './actions/webSearch';
import './actions/typeText';
import './actions/click';

class UalOrchestrator {
  async handleRequest(request: string) {
    const plan = planner.createPlan(request);

    if (plan.length === 0) {
      throw new Error('Could not create a plan to handle the request.');
    }

    let lastResult: any = null;
    for (const step of plan) {
      lastResult = await step.action.execute(step.args);
    }

    return lastResult;
  }
}

export const ualOrchestrator = new UalOrchestrator();
