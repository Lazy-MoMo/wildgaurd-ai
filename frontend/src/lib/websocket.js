import { animals, alerts, wsConnected } from './stores.js';

const WS_URL = import.meta.env.PUBLIC_WS_URL ?? 'ws://localhost:8000/api/live';
let socket = null;

export function connectWS() {
  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    wsConnected.set(true);
    console.log('🟢 WS connected');
  };

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === 'animal_update') {
      animals.update(list =>
        list.map(a => a.animal_id === msg.data.animal_id ? { ...a, ...msg.data } : a)
      );
    }
    if (msg.type === 'new_alert') {
      alerts.update(list => [msg.data, ...list].slice(0, 100));
    }
  };

  socket.onclose = () => {
    wsConnected.set(false);
    console.log('🔴 WS disconnected — retrying in 3s');
    setTimeout(connectWS, 3000);
  };
}

export function disconnectWS() {
  socket?.close();
}
