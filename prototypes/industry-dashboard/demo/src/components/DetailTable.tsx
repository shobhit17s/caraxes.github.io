import { Fragment, useState } from "react";
import { detailCategories, quarters, type MetricRow, type SubIndustryCard } from "../data";
import { ArrowUp, ChevronDown, Download, Info } from "./icons";
import { Sparkline } from "./Sparkline";

function heatColor(v: number, min: number, max: number) {
  const t = (v - min) / (max - min || 1); // 0..1
  // low = red tint, high = green tint, mid = neutral
  if (t > 0.62) {
    const a = (t - 0.62) / 0.38;
    return `rgba(124,192,136,${0.18 + a * 0.42})`;
  }
  if (t < 0.38) {
    const a = (0.38 - t) / 0.38;
    return `rgba(226,121,93,${0.14 + a * 0.4})`;
  }
  return "transparent";
}

export function DetailTable({
  card,
  onOpenTrend,
}: {
  card: SubIndustryCard;
  onOpenTrend: (card: SubIndustryCard) => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const allQ = detailCategories.flatMap((c) => c.rows.flatMap((r) => r.quarterly));
  const qMin = Math.min(...allQ);
  const qMax = Math.max(...allQ);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-[22px] font-semibold text-ink">{card.name}</h2>
          <span className="rounded-[2px] bg-coral-tint px-2 py-1 text-[12px] font-medium text-ink">
            {String(card.moves).padStart(2, "0")} / {String(card.kims).padStart(2, "0")} material movements
          </span>
        </div>
        <button className="inline-flex items-center gap-2 rounded-[3px] border border-line bg-surface px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide text-ink-soft transition-colors hover:bg-canvas">
          Download <Download width={14} height={14} />
        </button>
      </div>

      <div className="overflow-x-auto rounded-[4px] border border-line bg-surface">
        <table className="w-full min-w-[980px] border-collapse text-left text-[12.5px]">
          <thead>
            <tr className="border-b border-line bg-canvas text-ink-soft">
              <th className="sticky left-0 z-10 bg-canvas px-4 py-3 font-semibold">Category &amp; KIMs</th>
              <th className="px-3 py-3 font-semibold">
                <span className="inline-flex items-center gap-1">Latest Value <Info width={12} height={12} className="text-link" /></span>
                <div className="text-[10px] font-normal text-ink-faint">(as of date)</div>
              </th>
              <th className="px-3 py-3 font-semibold">
                % Change<div className="text-[10px] font-normal text-ink-faint">(frequency)</div>
              </th>
              <th colSpan={quarters.length} className="border-l border-line px-3 py-2 text-center font-semibold">
                Quarterly Data
                <div className="mt-1 flex justify-center gap-3 text-[10px] font-normal text-ink-faint">
                  {quarters.map((q) => <span key={q} className="w-9">{q}</span>)}
                </div>
              </th>
              <th className="border-l border-line px-3 py-3 text-center font-semibold">Annual<div className="text-[10px] font-normal text-ink-faint">2022</div></th>
              <th className="border-l border-line px-3 py-3 text-center font-semibold">Trend</th>
            </tr>
          </thead>
          <tbody>
            {detailCategories.map((cat) => {
              const isCollapsed = collapsed[cat.category];
              return (
                <Fragment key={cat.category}>
                  <tr className="border-b border-line bg-surface">
                    <td colSpan={3 + quarters.length + 2} className="px-4 py-2.5">
                      <button
                        onClick={() => setCollapsed((c) => ({ ...c, [cat.category]: !c[cat.category] }))}
                        className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink"
                      >
                        <ChevronDown width={15} height={15} className={`transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                        {cat.category}
                      </button>
                    </td>
                  </tr>
                  {!isCollapsed &&
                    cat.rows.map((row, ri) => (
                      <Row key={ri} row={row} qMin={qMin} qMax={qMax} onTrend={() => onOpenTrend(card)} />
                    ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-6 text-[12px] text-ink-soft">
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-coral" /> Material Movement</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-ink-faint/50" /> No Material Movement</span>
        <span className="ml-auto inline-flex items-center gap-2">
          Impact on sub-industry:
          <span className="text-[11px]">Positive</span>
          <span className="h-2.5 w-28 rounded-full" style={{ background: "linear-gradient(90deg,#7cc088,#eef0f2,#e2795d)" }} />
          <span className="text-[11px]">Negative</span>
        </span>
      </div>
    </div>
  );
}

function Row({ row, qMin, qMax, onTrend }: { row: MetricRow; qMin: number; qMax: number; onTrend: () => void }) {
  const down = row.change >= 15;
  return (
    <tr className="border-b border-line/70 last:border-0 transition-colors hover:bg-canvas/60">
      <td className="sticky left-0 z-10 bg-surface px-4 py-2.5">
        <div className="flex items-center gap-2 pl-5">
          <span className={`h-2 w-2 rounded-full ${row.material ? "bg-coral" : "bg-ink-faint/40"}`} />
          <div>
            <div className="font-medium text-ink">{row.name}</div>
            <div className="text-[10.5px] text-ink-faint">{row.unit}</div>
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <div className="font-semibold text-ink">{row.value}</div>
        <div className="text-[10.5px] text-ink-faint">{row.asOfDate}</div>
      </td>
      <td className="px-3 py-2.5">
        <span className={`inline-flex items-center gap-1 rounded-[2px] px-1.5 py-0.5 text-[12px] font-semibold text-ink ${row.material ? (down ? "bg-neg" : "bg-pos") : ""}`}>
          {row.change.toFixed(2)}%
          {down ? <ArrowUp width={11} height={11} className="rotate-180 text-neg-strong" /> : <ArrowUp width={11} height={11} className="text-pos-strong" />}
        </span>
        <div className="mt-0.5 text-[10.5px] text-ink-faint">{row.freq}</div>
      </td>
      {row.quarterly.map((q, i) => (
        <td key={i} className="border-l border-line/40 px-2 py-2.5 text-center text-[12px] tabular-nums" style={{ background: heatColor(q, qMin, qMax) }}>
          {q}
        </td>
      ))}
      <td className="border-l border-line px-3 py-2.5 text-center text-[12px] tabular-nums text-ink-soft">{row.annual}</td>
      <td className="border-l border-line px-3 py-2.5">
        <button onClick={onTrend} className="mx-auto flex items-center justify-center text-navy transition-transform hover:scale-110" aria-label="Open trend">
          <Sparkline data={row.quarterly} />
        </button>
      </td>
    </tr>
  );
}
