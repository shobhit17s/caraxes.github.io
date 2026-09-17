import { useEffect, useMemo, useState } from "react";
import { favorites, others, type SubIndustryCard } from "./data";
import { KimCard } from "./components/KimCard";
import { DetailTable } from "./components/DetailTable";
import { TrendDrawer } from "./components/TrendDrawer";
import { Loader } from "./components/Loader";
import {
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Grid,
  List,
  Search,
  Sort,
} from "./components/icons";

const NAV = ["Home", "Portfolio Views", "Client Views", "Tasks & Alerts", "Financials", "Analysis"];
const GROUP_OPTIONS = ["Favorites", "Industries (L1)", "Country of Assets"];

export default function App() {
  const [selected, setSelected] = useState<SubIndustryCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [drawerCard, setDrawerCard] = useState<SubIndustryCard | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [groupBy, setGroupBy] = useState("Favorites");
  const [groupMenu, setGroupMenu] = useState(false);
  const [search, setSearch] = useState("");

  const openDetail = (card: SubIndustryCard) => {
    setSelected(card);
    setLoading(true);
  };

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setLoading(false), 850);
    return () => clearTimeout(t);
  }, [loading, selected?.id]);

  const all = useMemo(() => [...favorites, ...others], []);
  const q = search.trim().toLowerCase();
  const filterFn = (c: SubIndustryCard) => !q || c.name.toLowerCase().includes(q) || c.mostMoved.toLowerCase().includes(q);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Top nav */}
      <header className="sticky top-0 z-30 bg-navy-deep text-white">
        <div className="flex h-14 items-center gap-6 px-5">
          <div className="flex items-center gap-3">
            <span className="font-serif text-[22px] font-bold tracking-tight">J.P.Morgan</span>
            <span className="h-5 w-px bg-navy-line" />
            <span className="text-[14px] text-white/85">Framework Name</span>
          </div>
          <nav className="ml-6 hidden items-center gap-6 text-[13px] lg:flex">
            {NAV.map((item, i) => (
              <button
                key={item}
                className={`relative flex items-center gap-1 py-1 transition-colors hover:text-white ${
                  i === NAV.length - 1 ? "font-semibold text-white" : "text-white/80"
                }`}
              >
                {item}
                {i > 0 && <ChevronDown width={13} height={13} className="opacity-70" />}
                {i === NAV.length - 1 && <span className="absolute -bottom-[6px] left-0 right-0 h-0.5 bg-amber" />}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <Search width={17} height={17} className="text-white/80" />
            <span className="h-5 w-px bg-navy-line" />
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-coral to-amber" />
              <span className="text-[13px] text-white/90">User Name</span>
            </div>
          </div>
        </div>
      </header>

      {/* Page sub-header */}
      <div className="flex items-center justify-between border-b border-line bg-surface px-6 py-4">
        <h1 className="text-[20px] font-semibold text-ink">Key Industry Metrics (KIMs)</h1>
        <div className="flex items-center gap-6 text-[13px]">
          <button className="relative py-1 font-semibold text-ink">
            Home
            <span className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-amber" />
          </button>
          <button className="flex items-center gap-1 py-1 text-ink-soft hover:text-ink">
            Support <ChevronDown width={13} height={13} />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`shrink-0 border-r border-line bg-surface transition-all duration-300 ${
            sidebarOpen ? "w-[320px]" : "w-12"
          }`}
        >
          {sidebarOpen ? (
            <div className="flex h-[calc(100vh-8.4rem)] flex-col">
              <div className="flex items-center justify-between px-5 pb-3 pt-5">
                <h2 className="text-[16px] font-semibold text-ink">View Selector</h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setGroupMenu((m) => !m)}
                      className="inline-flex items-center gap-1.5 rounded-[3px] border border-line bg-surface px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-soft transition-colors hover:bg-canvas"
                    >
                      <Sort width={13} height={13} /> Group By <ChevronDown width={12} height={12} />
                    </button>
                    {groupMenu && (
                      <div
                        className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-[4px] border border-line bg-surface shadow-lg"
                        style={{ animation: "fade-up 140ms ease-out" }}
                      >
                        {GROUP_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => { setGroupBy(opt); setGroupMenu(false); }}
                            className={`block w-full px-3 py-2 text-left text-[13px] transition-colors ${
                              groupBy === opt ? "bg-navy text-white" : "text-ink hover:bg-canvas"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="rounded p-1 text-ink-soft hover:bg-canvas" aria-label="Collapse sidebar">
                    <ChevronsLeft width={16} height={16} />
                  </button>
                </div>
              </div>

              <button
                onClick={() => setSelected(null)}
                className={`mx-4 rounded-[3px] px-3 py-2.5 text-left text-[13px] font-semibold transition-colors ${
                  selected ? "text-ink hover:bg-canvas" : "bg-canvas text-ink"
                }`}
              >
                Overview
              </button>

              <div className="px-4 pb-2 pt-4">
                <div className="relative">
                  <Search width={15} height={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                  <input
                    placeholder="Search sub-industry"
                    className="w-full rounded-[3px] border-b border-line bg-transparent py-2 pl-8 pr-2 text-[13px] outline-none placeholder:text-ink-faint focus:border-navy"
                  />
                </div>
              </div>

              <p className="px-4 pb-1 pt-3 text-[12px] text-ink-faint">Select a sub-industry</p>
              <div className="flex-1 overflow-y-auto px-2">
                {all.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => openDetail(c)}
                    className={`flex w-full items-center justify-between gap-2 rounded-[3px] px-3 py-2.5 text-left text-[13px] transition-colors ${
                      selected?.id === c.id ? "bg-canvas font-medium text-ink" : "text-ink-soft hover:bg-canvas/70"
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    {c.moves > 0 ? (
                      <span className="shrink-0 rounded-[2px] bg-coral-tint px-1.5 py-0.5 text-[10.5px] font-medium text-ink">Material Move</span>
                    ) : (
                      <ChevronRight width={14} height={14} className="shrink-0 text-ink-faint" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center pt-5">
              <button onClick={() => setSidebarOpen(true)} className="rounded p-1.5 text-ink-soft hover:bg-canvas" aria-label="Expand sidebar">
                <ChevronsRight width={18} height={18} />
              </button>
            </div>
          )}
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {/* search bar row */}
          <div className="border-b border-line bg-surface px-6 py-3.5">
            <div className="relative max-w-md">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search KIMs (eg: Steel PPI, Inventory etc.)"
                className="w-full rounded-[3px] border-b border-line bg-transparent py-2 pr-8 text-[13.5px] outline-none placeholder:text-ink-faint focus:border-navy"
              />
              <Search width={16} height={16} className="absolute right-1 top-1/2 -translate-y-1/2 text-ink-faint" />
            </div>
          </div>

          <div className="px-6 py-6">
            {loading ? (
              <div className="flex min-h-[60vh] items-center justify-center">
                <Loader />
              </div>
            ) : selected ? (
              <DetailTable card={selected} onOpenTrend={setDrawerCard} />
            ) : (
              <Overview
                favorites={favorites.filter(filterFn)}
                others={others.filter(filterFn)}
                groupBy={groupBy}
                onOpen={openDetail}
                onOpenTrend={setDrawerCard}
              />
            )}
          </div>
        </main>
      </div>

      <TrendDrawer card={drawerCard} onClose={() => setDrawerCard(null)} />
    </div>
  );
}

function Overview({
  favorites,
  others,
  groupBy,
  onOpen,
  onOpenTrend,
}: {
  favorites: SubIndustryCard[];
  others: SubIndustryCard[];
  groupBy: string;
  onOpen: (c: SubIndustryCard) => void;
  onOpenTrend: (c: SubIndustryCard) => void;
}) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [materialOnly, setMaterialOnly] = useState(true);
  const total = favorites.length + others.length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-[22px] font-semibold text-ink">Overview of Sub-Industries</h2>
          <span className="rounded-[2px] bg-coral-tint px-2 py-1 text-[12px] font-medium text-ink">
            {String(total).padStart(2, "0")} / 120 sub-industries with material moves
          </span>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-soft">
            <input type="checkbox" checked={materialOnly} onChange={(e) => setMaterialOnly(e.target.checked)} className="h-4 w-4 accent-[color:var(--color-navy)]" />
            Show only material moves
          </label>
          <div className="flex overflow-hidden rounded-[3px] border border-line">
            <button onClick={() => setView("grid")} className={`p-1.5 ${view === "grid" ? "bg-navy text-white" : "bg-surface text-ink-soft"}`} aria-label="Grid view">
              <Grid width={16} height={16} />
            </button>
            <button onClick={() => setView("list")} className={`p-1.5 ${view === "list" ? "bg-navy text-white" : "bg-surface text-ink-soft"}`} aria-label="List view">
              <List width={16} height={16} />
            </button>
          </div>
        </div>
      </div>

      <Section title={groupBy === "Favorites" ? "Favorites" : groupBy} cards={favorites} view={view} onOpen={onOpen} onOpenTrend={onOpenTrend} />
      <div className="my-6 h-px bg-line" />
      <Section title="Other Sub-Industries" cards={others} view={view} onOpen={onOpen} onOpenTrend={onOpenTrend} />
    </div>
  );
}

function Section({
  title,
  cards,
  view,
  onOpen,
  onOpenTrend,
}: {
  title: string;
  cards: SubIndustryCard[];
  view: "grid" | "list";
  onOpen: (c: SubIndustryCard) => void;
  onOpenTrend: (c: SubIndustryCard) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section>
      <button onClick={() => setOpen((o) => !o)} className="mb-4 flex items-center gap-2 text-[16px] font-semibold text-ink">
        <ChevronDown width={17} height={17} className={`transition-transform ${open ? "" : "-rotate-90"}`} />
        {title}
      </button>
      {open && (
        <div className={view === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" : "space-y-3"}>
          {cards.map((c) => (
            <KimCard key={c.id} card={c} onOpen={onOpen} onOpenTrend={onOpenTrend} />
          ))}
        </div>
      )}
    </section>
  );
}
