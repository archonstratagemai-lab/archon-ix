import { useEffect, useRef } from "react";

const PERCENTS = [25, 50, 75, 100] as const;

/**
 * GhostTracker – injects invisible milestone markers at 25/50/75/100% of
 * the document height. An IntersectionObserver fires once per milestone and
 * logs a custom event, enabling scroll-depth analytics without a global
 * scroll listener.
 */
export default function GhostTracker() {
  const observed = useRef<Set<number>>(new Set());

  useEffect(() => {
    const marker = document.createElement("div");
    marker.className = "ghost-markers";

    PERCENTS.forEach((p) => {
      const el = document.createElement("div");
      el.className = "ghost-milestone";
      el.dataset.percent = String(p);
      marker.appendChild(el);
    });

    document.body.appendChild(marker);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const p = Number((entry.target as HTMLElement).dataset.percent);
            if (!observed.current.has(p)) {
              observed.current.add(p);
              window.dispatchEvent(
                new CustomEvent("ghost:scroll", { detail: { percent: p } })
              );
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    marker.querySelectorAll(".ghost-milestone").forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      marker.remove();
    };
  }, []);

  return null;
}
