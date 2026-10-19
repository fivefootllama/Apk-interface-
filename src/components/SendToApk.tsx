import React, { useState } from 'react';
import { sendCommandToApk, getLastResult } from '../services/ipc';

export function SendToApk() {
  const [action, setAction] = useState('sample_action');
  const [entrypoint, setEntrypoint] = useState('main');
  const [argsText, setArgsText] = useState('[]');
  const [kwargsText, setKwargsText] = useState('{}');
  const [status, setStatus] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);

  const send = async () => {
    let args = [] as any[];
    let kwargs = {} as any;
    try {
      args = JSON.parse(argsText);
      kwargs = JSON.parse(kwargsText);
    } catch (e) {
      setStatus('Invalid JSON for args/kwargs');
      return;
    }

    const payload = { action, entrypoint, args, kwargs };
    setStatus('Sending...');
    const res = await sendCommandToApk(payload);
    if (res && res.status === 'ok') {
      setStatus('Command sent — awaiting result');
      // poll for result once
      setTimeout(async () => {
        const r = await getLastResult();
        setLastResult(r);
        setStatus('Done');
      }, 800);
    } else {
      setStatus(`Error: ${res && res.message ? res.message : 'unknown'}`);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Send command to APK</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <div className="text-xs text-zinc-400">Action (module name)</div>
          <input value={action} onChange={(e) => setAction(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1" />
        </label>
        <label className="block">
          <div className="text-xs text-zinc-400">Entrypoint</div>
          <input value={entrypoint} onChange={(e) => setEntrypoint(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1" />
        </label>
      </div>

      <label className="block">
        <div className="text-xs text-zinc-400">Args (JSON array)</div>
        <textarea value={argsText} onChange={(e) => setArgsText(e.target.value)} rows={3} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 font-mono" />
      </label>

      <label className="block">
        <div className="text-xs text-zinc-400">Kwargs (JSON object)</div>
        <textarea value={kwargsText} onChange={(e) => setKwargsText(e.target.value)} rows={3} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 font-mono" />
      </label>

      <div className="flex items-center gap-3">
        <button onClick={send} className="px-3 py-1 rounded bg-emerald-600 text-black font-semibold">Send to APK</button>
        <div className="text-sm text-zinc-400">{status}</div>
      </div>

      <div>
        <h3 className="text-sm font-medium">Last result</h3>
        <pre className="bg-zinc-900 border border-zinc-800 rounded p-2 text-xs font-mono">{lastResult ? JSON.stringify(lastResult, null, 2) : 'No result yet'}</pre>
      </div>
    </div>
  );
}

export default SendToApk;
