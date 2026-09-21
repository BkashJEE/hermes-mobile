import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ID = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,180}$/;
const UUID = /^[a-f0-9-]{36}$/;
const terminal = s => ['completed', 'failed', 'cancelled'].includes(s);
const fail = (message, status = 400) => Object.assign(new Error(message), { status });
const read = (file, fallback) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } };
const contentText = v => typeof v === 'string' ? v : Array.isArray(v) ? v.map(p => p.text || '').join('\n') : '';
export function localBase(value) {
  try { const u = new URL(value); return u.protocol === 'http:' && ['127.0.0.1','[::1]'].includes(u.hostname) && !u.username && !u.password && u.pathname === '/' && !u.search && !u.hash ? u.origin : null; } catch { return null; }
}
export function discover(root) {
  let dirs = []; try { dirs = fs.readdirSync(path.join(root, 'profiles'), { withFileTypes: true }).filter(d => d.isDirectory() && /^[a-zA-Z0-9][\w-]*$/.test(d.name)).map(d => d.name); } catch {}
  return ['default', ...dirs].map(id => {
    const dir = id === 'default' ? root : path.join(root, 'profiles', id);
    const state = read(path.join(dir, 'gateway_state.json'), {});
    const api = state.platforms?.api_server;
    let key = ''; try { key = fs.readFileSync(path.join(dir, '.env'), 'utf8').match(/^\s*(?:export\s+)?API_SERVER_KEY\s*=\s*(.+?)\s*$/m)?.[1]?.replace(/^["']|["']$/g, '') || ''; } catch {}
    const base = api?.state === 'connected' ? localBase(api.listener_base) : null;
    const name = id === 'default' ? 'Hermes' : id.charAt(0).toUpperCase() + id.slice(1);
    return { id, name, base, key };
  });
}
export function createBridge({ root = path.join(os.homedir(), '.hermes'), stateDir = path.join(os.homedir(), '.local/state/hermes-mobile'), port = 4186, fetcher = fetch } = {}) {
  fs.mkdirSync(stateDir, { recursive: true, mode: 0o700 });
  const file = path.join(stateDir, 'runs.json');
  const records = read(file, {});
  const inFlight = new Map();
  const cache = new Map();
  const persist = () => { const tmp = file + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(records), { mode: 0o600 }); fs.renameSync(tmp, file); };
  async function upstream(bot, method, route, body, key) {
    if (!bot?.base || !bot.key) throw fail('This profile’s API gateway is not connected.', 503);
    let res;
    try { res = await fetcher(new URL(route, bot.base), { method, redirect: 'error', signal: AbortSignal.timeout(12000), headers: { Authorization: `Bearer ${bot.key}`, Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}), ...(key ? { 'Idempotency-Key': key } : {}) }, body: body ? JSON.stringify(body) : undefined }); }
    catch { throw fail('The Hermes gateway did not respond. Check the connection, then retry the same request.', 503); }
    if (!res.ok) {
      const error = fail(res.status === 401 ? 'The gateway rejected its configured API key.' : `Hermes returned HTTP ${res.status}.`, res.status === 404 ? 404 : res.status === 409 ? 409 : 502);
      if (res.status === 404) {
        try { const detail = await res.json(); if (detail.error?.code === 'session_not_found') error.code = 'session_not_found'; } catch {}
      }
      throw error;
    }
    const text = await res.text();
    if (text.length > 4_000_000) throw fail('Hermes response exceeded the preview limit.', 502);
    try { return JSON.parse(text); } catch { throw fail('Hermes returned an invalid response.', 502); }
  }
  const botFor = id => { const bot = discover(root).find(p => p.id === id); if (!bot) throw fail('Unknown profile.', 404); return bot; };
  async function capabilities(bot, fresh = false) {
    const prev = cache.get(bot.id);
    if (!fresh && prev && Date.now() - prev.at < 15000 && prev.base === bot.base) return prev.data;
    const data = await upstream(bot, 'GET', '/v1/capabilities');
    cache.set(bot.id, { data, at: Date.now(), base: bot.base }); return data;
  }
  async function refresh(record) {
    if (!record.runId || terminal(record.status)) return record;
    try {
      const result = await upstream(botFor(record.profileId), 'GET', `/v1/runs/${encodeURIComponent(record.runId)}`);
      record.status = result.status || record.status;
      record.output = contentText(result.output);
      record.sessionId = result.session_id || record.sessionId;
      record.approval = result.status === 'waiting_for_approval' ? result.approval : null;
      record.activity = result.last_event || '';
      record.error = result.status === 'failed' ? 'Hermes reported that this run failed. Check the host for details.' : null;
      record.connectionError = null; record.updatedAt = Date.now(); persist();
    } catch (e) { record.connectionError = e.status === 404 ? 'This run is no longer available from Hermes. Open its conversation to check history.' : e.message; }
    return record;
  }
  async function send(body) {
    const { requestId, profileId, input, sessionId, tracked = false } = body;
    if (!UUID.test(requestId || '') || typeof input !== 'string' || !input.trim() || input.length > 16000 || typeof profileId !== 'string' || (sessionId && !ID.test(sessionId)) || typeof tracked !== 'boolean') throw fail('Invalid message. Use 1–16,000 characters.');
    const prior = records[requestId];
    const target = sessionId || `hm_${requestId}`;
    if (prior && (prior.profileId !== profileId || prior.input !== input || prior.originalSession !== target || prior.tracked !== tracked)) throw fail('This request ID belongs to a different message.', 409);
    if (prior?.runId) return refresh(prior);
    if (inFlight.has(requestId)) return inFlight.get(requestId);
    const pending = (async () => {
      const bot = botFor(profileId);
      const c = await capabilities(bot);
      if (!c.features?.run_submission || !c.features?.run_status || !c.features?.runs_idempotency?.supported) throw fail('This gateway must support recoverable, idempotent runs.', 409);
      if (Object.values(records).some(r => r.id !== requestId && r.profileId === profileId && r.sessionId === target && !terminal(r.status))) throw fail('This conversation already has an unfinished run.', 409);
      const record = prior || { id: requestId, profileId, input, sessionId: target, originalSession: target, tracked, createdAt: Date.now(), status: 'submitting', output: '' };
      records[requestId] = record; persist();
      try {
        const started = await upstream(bot, 'POST', '/v1/runs', { input, session_id: target }, requestId);
        if (!ID.test(started.run_id || '')) throw fail('Hermes did not return a run ID.', 502);
        record.runId = started.run_id; record.status = started.status || 'queued'; record.connectionError = null; persist();
        return refresh(record);
      } catch (e) { record.status = 'submission_unknown'; record.connectionError = 'Send was not confirmed. Retry this exact message to recover it without duplicating work.'; persist(); throw e; }
    })();
    inFlight.set(requestId, pending);
    try { return await pending; } finally { inFlight.delete(requestId); }
  }
  async function dispatch(method, route, body) {
    if (method === 'GET' && route === '/profiles') {
      const profiles = await Promise.all(discover(root).map(async bot => {
        try { const c = await capabilities(bot); return { id: bot.id, name: bot.name, connected: true, model: c.model, features: { send: Boolean(c.features?.run_submission && c.features?.run_status && c.features?.runs_idempotency?.supported), stop: Boolean(c.features?.run_stop), approval: Boolean(c.features?.run_approval_response), sessions: Boolean(c.features?.session_resources) } }; }
        catch (e) { return { id: bot.id, name: bot.name, connected: false, reason: e.message, features: {} }; }
      }));
      return { profiles, host: 'Omarchy · this computer', checkedAt: Date.now() };
    }
    if (method === 'GET' && route === '/runs') return { runs: await Promise.all(Object.values(records).sort((a,b)=>b.createdAt-a.createdAt).map(refresh)) };
    if (method === 'POST' && route === '/messages') return send(body);
    let m = route.match(/^\/profiles\/([\w-]+)\/sessions$/);
    if (method === 'GET' && m) {
      const result = await upstream(botFor(m[1]), 'GET', '/api/sessions?limit=30');
      return { sessions: (result.data || []).slice(0,30).map(s => ({ id: s.id, title: s.title || 'Untitled conversation', lastActive: s.last_active })) };
    }
    m = route.match(/^\/profiles\/([\w-]+)\/sessions\/([\w.:-]+)$/);
    if (method === 'GET' && m) {
      let result;
      try { result = await upstream(botFor(m[1]), 'GET', `/api/sessions/${encodeURIComponent(m[2])}/messages?limit=100&order=latest`); }
      catch (e) {
        // Runs are accepted before the new transcript row is persisted. Only a
        // known new session may be temporarily absent; unrelated 404s stay errors.
        const starting = Object.values(records).some(r => r.profileId === m[1] && r.sessionId === m[2] && r.originalSession === `hm_${r.id}` && r.runId && !r.connectionError &&
          (!terminal(r.status) || (r.status === 'completed' && Date.now() - r.updatedAt < 15000)));
        if (e.status === 404 && e.code === 'session_not_found' && starting) return { sessionId: m[2], messages: [], pending: true };
        throw e;
      }
      return { sessionId: result.session_id || m[2], messages: (result.data || []).filter(v => ['user','assistant'].includes(v.role) && contentText(v.content)).map(v => ({ id: v.id, role: v.role, content: contentText(v.content) })), limited: (result.data || []).length >= 100 };
    }
    m = route.match(/^\/runs\/([a-f0-9-]{36})\/(stop|approval)$/);
    if (method === 'POST' && m) {
      const record = records[m[1]]; if (!record?.runId) throw fail('Unknown run.', 404);
      await refresh(record);
      if (record.connectionError) throw fail('Reconnect to Hermes before controlling this run.', 409);
      const bot = botFor(record.profileId); const c = await capabilities(bot);
      if (m[2] === 'stop') {
        if (!c.features?.run_stop || terminal(record.status)) throw fail('This run cannot be stopped.', 409);
        await upstream(bot, 'POST', `/v1/runs/${record.runId}/stop`, {});
        record.status = 'stopping'; record.approval = null; persist(); return record;
      }
      if (!c.features?.run_approval_response || record.status !== 'waiting_for_approval' || !record.approval?.request_id || body.requestId !== record.approval.request_id || !['once','deny'].includes(body.choice)) throw fail('That exact approval is no longer pending.', 409);
      await upstream(bot, 'POST', `/v1/runs/${record.runId}/approval`, { request_id: body.requestId, choice: body.choice });
      return refresh(record);
    }
    throw fail('Unknown API route.', 404);
  }
  async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store'); res.setHeader('Content-Type', 'application/json'); res.setHeader('X-Content-Type-Options', 'nosniff');
    try {
      const expected = `http://127.0.0.1:${port}`;
      // Header forces foreign browsers through a preflight; there is deliberately no CORS grant.
      if (req.headers.host !== `127.0.0.1:${port}` || req.headers['x-hermes-mobile'] !== '1' || (req.headers.origin && req.headers.origin !== expected) || (req.headers['sec-fetch-site'] && !['same-origin','none'].includes(req.headers['sec-fetch-site']))) throw fail('Only this local app may access the Hermes bridge.', 403);
      if (!['GET','POST'].includes(req.method)) throw fail('Method not allowed.', 405);
      let body = {};
      if (req.method === 'POST') {
        if (!(req.headers['content-type'] || '').startsWith('application/json')) throw fail('Expected JSON.', 415);
        let raw = ''; for await (const chunk of req) { raw += chunk; if (raw.length > 24000) throw fail('Request too large.', 413); }
        try { body = JSON.parse(raw); } catch { throw fail('Invalid JSON.'); }
        if (!body || Array.isArray(body) || typeof body !== 'object') throw fail('Invalid JSON object.');
      }
      const route = new URL(req.url, expected).pathname;
      const result = await dispatch(req.method, route, body);
      res.end(JSON.stringify(result));
    } catch (e) { res.statusCode = e.status || 500; res.end(JSON.stringify({ error: e.status ? e.message : 'The local bridge could not complete this request.' })); }
  }
  return { handler, dispatch };
}
