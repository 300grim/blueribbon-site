import { useEffect, useRef } from 'react';

const isDebug = typeof (window as any).GetParentResourceName !== 'function';

export function debugNuiEvent(action: string, data: unknown) {
  window.dispatchEvent(new MessageEvent('message', { data: { action, ...data } }));
}

export function useNuiEvent<T = unknown>(action: string, handler: (data: T) => void) {
  const savedHandler = useRef(handler);
  useEffect(() => { savedHandler.current = handler; }, [handler]);
  useEffect(() => {
    function eventListener(event: MessageEvent) {
      const { action: eventAction, ...rest } = event.data || {};
      if (eventAction === action) savedHandler.current(rest as T);
    }
    window.addEventListener('message', eventListener);
    return () => window.removeEventListener('message', eventListener);
  }, [action]);
}

/**
 * Fetch data from Lua via NUI callback
 * @param eventName - The event name registered with RegisterNuiCallback
 * @param data - Data to send with the request
 * @param mockData - Mock data to return in browser dev mode
 * @returns Response from Lua (or mockData in dev)
 */
export async function fetchNui<T = unknown>(
  eventName: string,
  data: Record<string, unknown> = {},
  mockData?: T
): Promise<T> {
  if (isDebug && mockData !== undefined) {
    console.log(`[NUI Dev] ${eventName}:`, mockData);
    return mockData;
  }
  if (isDebug) {
    console.warn(`[NUI Dev] No mock for '${eventName}'. Pass mockData as 3rd arg.`);
    return {} as T;
  }
  const resourceName = (window as any).GetParentResourceName();
  const response = await fetch(`https://${resourceName}/${eventName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

if (isDebug) {
  setTimeout(() => debugNuiEvent('setVisible', { visible: true }), 100);
}
