import { useEffect, useState } from 'react';

// Simple global toast — usage: Toast.show('message', 'success'|'error')
let _setMsg = null;

export function Toast() {
  const [msg, setMsg] = useState(null);
  _setMsg = setMsg;

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3000);
    return () => clearTimeout(t);
  }, [msg]);

  if (!msg) return null;

  const bg = msg.type === 'error' ? '#dc3545' : '#28a745';
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, background: bg,
      color: '#fff', padding: '12px 20px', borderRadius: 8,
      boxShadow: '0 4px 12px rgba(0,0,0,.2)', zIndex: 9999,
      fontSize: 14, fontWeight: 500, maxWidth: 320
    }}>
      {msg.text}
    </div>
  );
}

export const toast = {
  show: (text, type = 'success') => _setMsg && _setMsg({ text, type }),
  success: (text) => toast.show(text, 'success'),
  error:   (text) => toast.show(text, 'error'),
};
