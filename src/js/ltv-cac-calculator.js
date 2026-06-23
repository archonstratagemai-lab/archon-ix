/**
 * ARCHON-IX | LTV:CAC Engine
 * --------------------------------------------------------------
 * Sovereign financial model for client lifetime value vs.
 * customer acquisition cost.
 *
 *   LTV            = Monthly Retainer × Contract Months
 *                    (production model would be: (Retainer × Margin) / Churn)
 *   LTV:CAC Ratio  = LTV / Acquisition Cost
 *   Payback Months = Acquisition Cost / Monthly Retainer
 *
 * Health thresholds (industry-standard):
 *   Green   ratio >= 3.0  -> "Sovereign margin"
 *   Yellow  ratio >= 1.0  -> "Acceptable, monitor"
 *   Red     ratio <  1.0  -> "Unsustainable"
 */

const HEALTH = {
  GREEN:  { label: 'SOVEREIGN MARGIN',  className: 'health-green'  },
  YELLOW: { label: 'APPROACHING THRESHOLD', className: 'health-yellow' },
  RED:    { label: 'UNSUSTAINABLE',     className: 'health-red'    },
};

export class LTVCACCalculator {
  constructor({ formId = 'ltv-cac-form', resultId = 'calc-result' } = {}) {
    this.form = document.getElementById(formId);
    this.result = document.getElementById(resultId);
    this._bound = false;
  }

  init() {
    if (!this.form || !this.result || this._bound) return;
    this._bound = true;
    this.form.addEventListener('submit', this._onSubmit.bind(this));
    // Live recalculation as user types
    this.form.addEventListener('input', this._onSubmit.bind(this));
    // Compute once on load for default values
    this._onSubmit(new Event('init'));
  }

  // ----------------------------------------------------- Math

  compute({ retainer, contractMonths, cac }) {
    const r = Number(retainer) || 0;
    const m = Number(contractMonths) || 0;
    const c = Number(cac) || 0;

    const ltv = r * m;
    const ratio = c > 0 ? ltv / c : Infinity;
    const paybackMonths = r > 0 ? c / r : Infinity;

    const health = this._health(ratio);

    return {
      ltv,
      ratio: Number.isFinite(ratio) ? ratio : null,
      paybackMonths: Number.isFinite(paybackMonths) ? paybackMonths : null,
      health,
    };
  }

  _health(ratio) {
    if (!Number.isFinite(ratio)) return HEALTH.GREEN; // treat unbounded as sovereign
    if (ratio >= 3) return HEALTH.GREEN;
    if (ratio >= 1) return HEALTH.YELLOW;
    return HEALTH.RED;
  }

  // ------------------------------------------------- Rendering

  _onSubmit(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    if (!this.form || !this.result) return;

    const data = {
      retainer:       this.form.querySelector('#retainer')?.value,
      contractMonths: this.form.querySelector('#contract')?.value,
      cac:            this.form.querySelector('#cac')?.value,
    };

    const { ltv, ratio, paybackMonths, health } = this.compute(data);

    const fmt = (n, prefix = '$') =>
      Number.isFinite(n) ? `${prefix}${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—';

    const ratioFmt = ratio === null
      ? '—'
      : Number.isFinite(ratio) ? `${ratio.toFixed(2)}x` : '∞x';

    const paybackFmt = paybackMonths === null
      ? '—'
      : Number.isFinite(paybackMonths)
        ? `${paybackMonths.toFixed(1)} mo.`
        : 'Never';

    this.result.classList.remove('health-green', 'health-yellow', 'health-red');
    this.result.classList.add(health.className);
    this.result.innerHTML = `
      <div class="calc-row"><span>LTV</span><strong>${fmt(ltv)}</strong></div>
      <div class="calc-row"><span>Acquisition Cost</span><strong>${fmt(data.cac)}</strong></div>
      <div class="calc-row ratio"><span>LTV:CAC Ratio</span><strong>${ratioFmt}</strong></div>
      <div class="calc-row"><span>Payback Period</span><strong>${paybackFmt}</strong></div>
      <div class="health-badge ${health.className}">${health.label}</div>
    `;
  }
}
