import type {ActionLog , ActionStatus} from "./types";
import {isMutationType} from "./types";


export class ActionTracker
{
        private actions : ActionLog[] = [];

        //logging a new action, with optional id, timestamp and status
        log(
            entry : Omit<ActionLog , "id" | "timestamp"> & {
                id?: string , 
                timestamp?: Date
            },
        ): ActionLog{
            const action : ActionLog = {
                id : entry.id ?? `action_${this.actions.length}`,
                timestamp : entry.timestamp ?? new Date(),
                type : entry.type,
                path : entry.path,
                details : {...entry.details},
                status : entry.status ?? "pending",
                userApproved : entry.userApproved,
            }
            this.actions.push(action);
            return action;
        }

        //getting all the actions
        getActions(): readonly ActionLog[]{
            return this.actions;
        }

        //getting all the pending mutation actions
        getPendingMutations(): ActionLog[]{
            return this.actions.filter((a): a is ActionLog => isMutationType(a.type) && a.status === "pending");
        }

        //updating the status of an action by id, and optionally setting userApproved
        updateStatus(id : string , status : ActionStatus , userApproved? : boolean) : void{
            const a = this.actions.find((x) => x.id === id);
            if(!a) return;
            a.status = status;
            if(userApproved !== undefined ) {
                a.userApproved = userApproved;
            }
        }
}