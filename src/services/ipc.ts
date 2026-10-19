export async function sendCommandToApk(command: any) {
  try {
    const res = await fetch('http://127.0.0.1:8765/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`IPC error: ${res.status} ${txt}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    return { status: 'error', message: String(err) };
  }
}

export async function getLastResult() {
  try {
    const res = await fetch('http://127.0.0.1:8765/last_result');
    if (res.status === 404) return null;
    const data = await res.json();
    return data.result;
  } catch (err) {
    return null;
  }
}
