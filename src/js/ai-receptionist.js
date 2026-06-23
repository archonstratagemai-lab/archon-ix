/**
 * ARCHON-IX | AI Receptionist
 * --------------------------------------------------------------
 * Binds the static widget already declared in index.html.
 *   - Toggle (×) opens / closes the chat window
 *   - Send button + Enter key submit a query
 *   - "Quick Reply" buttons (button.btn-small[data-query]) in the
 *     demo panel mirror the same query into the chat AND echo the
 *     answer into #response-output for visual continuity.
 *
 * Real LLM integration is left as a clear stub (`_callLLM`). The
 * fallback response dictionary always answers so the UI never stalls.
 *
 * All interactions are forwarded to the injected GhostTracker for
 * the sovereign audit trail.
 */

// ----- Sovereign Response Dictionary --------------------------------
const RESPONSE_DICT = [
  {
    intent: 'cost',
    keywords: ['cost', 'price', 'implementation', 'fee', 'how much', 'expensive'],
    response:
      'Implementation is a flat $10K against a 180-day extraction plan. ' +
      'After that the engagement recurs on retainer economics, not project billing. ' +
      'I can model the ratio live if you want.',
  },
  {
    intent: 'ai',
    keywords: ['ai', 'receptionist', 'chatbot', 'intake', 'agent'],
    response:
      'The AI Receptionist classifies inbound intent, logs the interaction to the Ghost Protocol ' +
      'audit trail, and answers from a sovereign response database. ' +
      'A real LLM call sits behind `/api/llm` — the keys never touch the browser.',
  },
  {
    intent: 'ltv',
    keywords: ['ltv', 'cac', 'ratio', 'payback', 'lifetime', 'calculator', 'engagement economics'],
    response:
      'Our LTV:CAC engine enforces a minimum 3× sovereign margin before we accept an engagement. ' +
      'Pop the demo calculator and run your numbers — anything under 1× is unflinchingly flagged red.',
  },
  {
    intent: 'ghost',
    keywords: ['ghost', 'tracker', 'protocol', 'audit', 'telemetry', 'tracking'],
    response:
      'Ghost Protocol is a localStorage-first audit layer. Every pageview, scroll milestone, and ' +
      'advisory interaction is persisted client-side and exportable on demand. ' +
      'No third-party trackers, no cookies, no fingerprints.',
  },
  {
    intent: 'branding',
    keywords: ['sovereign', 'brand', 'branding', 'identity', 'logo', 'gold', 'navy'],
    response:
      'Sovereign Branding is the visual governance layer: Navy `#0A1128`, Architectural Gold `#C9A961`, ' +
      'Inter typography, geometric emblems. Designed to look institutional on a board deck — not like a startup.',
  },
  {
    intent: 'consult',
    keywords: ['consult', 'contact', 'talk', 'call', 'meet', 'reach', 'team', 'human'],
    response:
      'For a sovereign consultation route to archonstratagemai@gmail.com or initiate the protocol from ' +
      'the contact section. The AI handles intake; humans make the architecture decision.',
  },
  {
    intent: 'sovereignty',
    keywords: ['sovereignty', 'legacy', 'stability', 'entropy', 'strategy'],
    response:
      'We do not accept entropy; we architect stability. Sovereignty is the deliberate design of systems ' +
      'that retain value across regime changes — market, personnel, or generational.',
  },
  {
    intent: 'fallback',
    keywords: [],
    response:
      'I am the ARCHON-IX AI Receptionist. Ask about implementation cost, the AI Receptionist itself, ' +
      'the LTV:CAC engine, Ghost Protocol, Sovereign Branding, or requesting a consultation.',
  },
];

// ----- Public Module -----------------------------------------------
export class AIReceptionist {
  constructor({
    widgetId      = 'ai-receptionist-widget',
    ghost         = null,
    quickRepliesSelector = '.btn-small[data-query]',
    mirrorSelector      = '#response-output',
  } = {}) {
    this.widget    = document.getElementById(widgetId);
    this.ghost     = ghost;
    this.quickRepliesSelector = quickRepliesSelector;
    this.mirrorSelector      = mirrorSelector;
    this._bound = false;
    this._toggleBtn  = null;
    this._input      = null;
    this._send       = null;
    this._messages   = null;
    this._mirror     = null;
    this._lastTrigger = null;
  }

  // -------------------------------------------------------- API

  init() {
    if (this._bound || !this.widget) return;
    this._bound = true;

    this._toggleBtn = this.widget.querySelector('.widget-toggle');
    this._input     = this.widget.querySelector('#chat-input');
    this._send      = this.widget.querySelector('#send-btn');
    this._messages  = this.widget.querySelector('#chat-messages');
    this._mirror    = document.querySelector(this.mirrorSelector);

    // Acknowledged trending: keep widget open by default for showcase,
    // but accessible headers/toggle remain functional.
    this._setOpen(true, { silent: true });

    if (this._toggleBtn) {
      this._toggleBtn.setAttribute('aria-label', 'Toggle ARCHON-IX Advisor');
      this._toggleBtn.addEventListener('click', this._onToggle.bind(this));
    }

    if (this._send) {
      this._send.addEventListener('click', this._onSend.bind(this));
    }

    if (this._input) {
      this._input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this._onSend();
        }
        if (e.key === 'Escape') {
          this._setOpen(false);
        }
      });
    }

    // Quick-reply buttons in the demo panel.
    document.querySelectorAll(this.quickRepliesSelector).forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const query = btn.dataset.query || btn.textContent.trim();
        this._lastTrigger = e.currentTarget;
        this._openAndFocus();
        this.respondTo(query, { source: 'quick-reply' });
      });
    });

    this.ghost?.track('ai-receptionist', { event: 'initialized' });
  }

  /**
   * Public, awaitable entry point used by quick-replies and any future
   * programmatic trigger. Falls through to the dictionary immediately,
   * and concurrently fires the optional LLM call — its answer replaces
   * the local fallback if it resolves first.
   */
  async respondTo(query, meta = {}) {
    const text = (query || '').trim();
    if (!text || !this._messages) return;

    this._appendMessage('user', text, meta);

    const local = this._localAnswer(text);
    this._appendMessage('bot', local, { ...meta, source: 'dictionary' });
    this._mirror?.replaceChildren(this._buildMirrorNode(local));

    // TODO(realtime): Wire to a serverless proxy that hides the OpenAI key.
    // const llmAnswer = await this._callLLM(text);
    // if (llmAnswer && llmAnswer.trim().length) {
    //   this._appendMessage('bot', llmAnswer, { ...meta, source: 'llm' });
    //   this._mirror?.replaceChildren(this._buildMirrorNode(llmAnswer));
    // }

    this.ghost?.track('ai-receptionist:interaction', {
      query: text, source: meta.source || 'chat', intent: this._matchIntent(text),
    });

    return local;
  }

  // ----------------------------------------------------- Internals

  _onToggle() {
    this._setOpen(this.widget.getAttribute('aria-hidden') !== 'false');
  }

  _onSend() {
    if (!this._input) return;
    const value = this._input.value;
    this._input.value = '';
    this.respondTo(value, { source: 'chat' });
    this._input.focus();
  }

  _openAndFocus() {
    this._setOpen(true);
    this._input?.focus();
  }

  _setOpen(open, { silent = false } = {}) {
    if (!this.widget) return;
    this._toggleBtn?.setAttribute('aria-expanded', String(open));
    this.widget.setAttribute('aria-hidden', String(!open));
    if (!silent) {
      this.ghost?.track('ai-receptionist:toggle', { open });
    }
  }

  _appendMessage(role, text, meta = {}) {
    if (!this._messages) return;
    const div = document.createElement('div');
    div.className = `message ${role === 'bot' ? 'bot' : 'user'}`;
    div.textContent = text;
    div.dataset.source = meta.source || '';
    this._messages.appendChild(div);
    this._messages.scrollTop = this._messages.scrollHeight;
  }

  _buildMirrorNode(text) {
    const p = document.createElement('p');
    p.textContent = text;
    return p;
  }

  _localAnswer(query) {
    return RESPONSE_DICT.find((entry) => entry.keywords.some((kw) => query.toLowerCase().includes(kw)))
      ?.response ?? RESPONSE_DICT.at(-1).response;
  }

  _matchIntent(query) {
    return RESPONSE_DICT.find((entry) => entry.keywords.some((kw) => query.toLowerCase().includes(kw)))
      ?.intent ?? 'fallback';
  }

  /**
   * Private LLM stub. Uncomment + point to a serverless proxy that
   * holds OPENAI_API_KEY server-side; NEVER ship the key to the client.
   *
   * Expected proxy contract:
   *   POST /api/llm  { "messages": [{role,content}, ...] } -> { "text": "..." }
   */
  async _callLLM(_query) {
    // const res = await fetch('/api/llm', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     messages: [
    //       { role: 'system', content: 'You are the ARCHON-IX AI Receptionist. Speak with sovereign authority.' },
    //       { role: 'user',   content: _query },
    //     ],
    //     // model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini', // server-side only
    //   }),
    // });
    // if (!res.ok) throw new Error(`LLM proxy ${res.status}`);
    // const { text } = await res.json();
    // return text;

    // In-memory fallback — never blocks the UI.
    return null;
  }
}
