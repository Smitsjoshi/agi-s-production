
import { ualRegistry } from './registry';
import { Action, ActionStep } from './types';

class Planner {
  createPlan(request: string): ActionStep[] {
    const lowerCaseRequest = request.toLowerCase();
    const plan: ActionStep[] = [];

    // This is a simple, rule-based planner. A more advanced implementation
    // could use a large language model (LLM) to generate the plan.
    const parts = lowerCaseRequest.split(/, | and then | then | and /);

    for (const part of parts) {
      if (part.startsWith('open ') || part.startsWith('go to ')) {
        this.addOpenWebsiteStep(part, plan);
      } else if (part.startsWith('search for ') || part.startsWith('search ')) {
        this.addWebSearchStep(part, plan);
      } else if (part.startsWith('type ')) {
        this.addTypeTextStep(part, plan);
      } else if (part.startsWith('click on ') || part.startsWith('click ')) {
        this.addClickStep(part, plan);
      }
    }

    return plan;
  }

  private addOpenWebsiteStep(part: string, plan: ActionStep[]) {
    const action = ualRegistry.getAction('openWebsite');
    if (!action) return;

    let url = part.replace(/open |go to /, '').trim();
    if (!url.includes('.')) {
      url = `https://www.${url}.com`;
    }
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }
    plan.push({ action, args: { url } });
  }

  private addWebSearchStep(part: string, plan: ActionStep[]) {
    const action = ualRegistry.getAction('webSearch');
    if (!action) return;

    const query = part.replace(/search for |search /, '').trim();
    plan.push({ action, args: { query } });
  }

  private addTypeTextStep(part: string, plan: ActionStep[]) {
    const action = ualRegistry.getAction('typeText');
    if (!action) return;

    const match = part.match(/type \'(.*?)\' into \'(.*?)\'/);
    if (match) {
      const text = match[1];
      const selector = match[2];
      plan.push({ action, args: { text, selector } });
    }
  }

  private addClickStep(part: string, plan: ActionStep[]) {
    const action = ualRegistry.getAction('click');
    if (!action) return;

    const selector = part.replace(/click on |click /, '').trim();
    plan.push({ action, args: { selector } });
  }
}

export const planner = new Planner();
