import { ActionTracker } from "./action-tracker";
//this is approval flow for the agent, it will be used to approve or reject actions that require user approval
export async function runApprovalFlow(tracker: ActionTracker): Promise<boolean> {
    return true;
}