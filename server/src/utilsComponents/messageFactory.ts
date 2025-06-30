import { v4 as uuidv4 } from 'uuid';

export interface ServerMessage {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
}

export function createServerMessage(sender: string, content: string): ServerMessage {
    return {
        id: uuidv4(),
        sender,
        content,
        timestamp: new Date().toISOString(),
    }
}