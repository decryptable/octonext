import { browser } from './browser';

export type Message =
  | { type: 'request-host-permission'; origin: string }
  | { type: 'has-host-permission'; origin: string }
  | { type: 'open-options' };

export type MessageResult = {
  'request-host-permission': boolean;
  'has-host-permission': boolean;
  'open-options': void;
};

export type MessageHandler = {
  [K in Message['type']]: (
    message: Extract<Message, { type: K }>,
  ) => Promise<MessageResult[K]> | MessageResult[K];
};

export async function sendMessage<K extends Message['type']>(
  message: Extract<Message, { type: K }>,
): Promise<MessageResult[K]> {
  return (await browser.runtime.sendMessage(message)) as MessageResult[K];
}

export function registerMessageHandler(handlers: Partial<MessageHandler>): void {
  browser.runtime.onMessage.addListener((raw: unknown): Promise<unknown> | undefined => {
    const message = raw as Message;
    const handler = handlers[message.type] as
      | ((m: Message) => Promise<unknown> | unknown)
      | undefined;
    if (!handler) return undefined;
    return Promise.resolve(handler(message));
  });
}
