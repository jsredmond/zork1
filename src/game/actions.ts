/**
 * Action Handlers
 * Implements game action handlers
 */

export interface StateChange {
  // TODO: Define state change structure
}

export interface ActionResult {
  success: boolean;
  message: string;
  stateChanges: StateChange[];
}

export interface ActionHandler {
  // TODO: Define action handler interface
}
