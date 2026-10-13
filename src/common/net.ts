// Connexion WebSocket avec reconnexion automatique (backoff exponentiel).

import { useEffect, useRef, useState } from 'react';
import type { ClientMsg, ServerMsg } from '../../shared/protocol.ts';

export type NetStatus = 'connexion' | 'connecte' | 'reconnexion' | 'arrete';

/** Codes de fermeture serveur après lesquels il ne faut pas se reconnecter. */
const FINAL_CLOSE = new Set([4001, 4002, 4003]);

export class Link {
  private ws: WebSocket | null = null;
  private attempt = 0;
  private timer: number | null = null;
  private stopped = false;
  status: NetStatus = 'connexion';

  constructor(
    private readonly onOpen: (link: Link) => void,
    private readonly onMessage: (msg: ServerMsg) => void,
    private readonly onStatus: (s: NetStatus) => void,
  ) {
    this.connect();
    window.addEventListener('online', this.retryNow);
    document.addEventListener('visibilitychange', this.onVisible);
  }

  private onVisible = () => {
    if (document.visibilityState === 'visible') this.retryNow();
  };

  private retryNow = () => {
    if (this.stopped || this.ws?.readyState === WebSocket.OPEN) return;
    if (this.timer) clearTimeout(this.timer);
    this.attempt = 0;
    this.connect();
  };

  private setStatus(s: NetStatus) {
    this.status = s;
    this.onStatus(s);
  }

  private connect() {
    if (this.stopped) return;
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${proto}://${location.host}/ws`);
    this.ws = ws;
    ws.onopen = () => {
      this.attempt = 0;
      this.setStatus('connecte');
      this.onOpen(this);
    };
    ws.onmessage = (e) => {
      try {
        this.onMessage(JSON.parse(e.data));
      } catch {
        /* message ignoré */
      }
    };
    ws.onclose = (e) => {
      if (this.ws !== ws) return;
      if (FINAL_CLOSE.has(e.code)) {
        this.stop();
        return;
      }
      if (this.stopped) return;
      this.setStatus('reconnexion');
      const delay = Math.min(8000, 500 * 2 ** this.attempt++) + Math.random() * 300;
      this.timer = window.setTimeout(() => this.connect(), delay);
    };
  }

  send(msg: ClientMsg) {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg));
  }

  stop() {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
    window.removeEventListener('online', this.retryNow);
    document.removeEventListener('visibilitychange', this.onVisible);
    this.ws?.close();
    this.setStatus('arrete');
  }
}

/** Hook React : ouvre un lien et le referme au démontage. */
export function useLink(onOpen: (l: Link) => void, onMessage: (m: ServerMsg) => void): [Link | null, NetStatus] {
  const [status, setStatus] = useState<NetStatus>('connexion');
  const [link, setLink] = useState<Link | null>(null);
  const handlers = useRef({ onOpen, onMessage });
  handlers.current = { onOpen, onMessage };
  useEffect(() => {
    const l = new Link(
      (x) => handlers.current.onOpen(x),
      (m) => handlers.current.onMessage(m),
      setStatus,
    );
    setLink(l);
    return () => l.stop();
  }, []);
  return [link, status];
}

export const storage = {
  get(k: string): string | null {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string) {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* stockage indisponible : la reconnexion manuelle reste possible */
    }
  },
  del(k: string) {
    try {
      localStorage.removeItem(k);
    } catch {
      /* idem */
    }
  },
};
