
import { Action } from './types';

class UalRegistry {
  private actions: Map<string, Action> = new Map();

  register(action: Action) {
    this.actions.set(action.name, action);
  }

  getAction(name: string): Action | undefined {
    return this.actions.get(name);
  }

  listActions(): Action[] {
    return Array.from(this.actions.values());
  }
}

export const ualRegistry = new UalRegistry();
