import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import { BOOKS, DSA_CATS, DSA_GROUPS, groupColor } from './data.js';
import { AXIS_H, CARD_W, LABEL_W, LANE_PAD, SUB_H, baseX, layoutBooks, zoomAt } from './timeline.js';

function Cover({ book, w = 30, h = 42, showText = false }) {
  const fallback = `linear-gradient(145deg,${groupColor(book.group, 72)},${groupColor(book.group, 38)})`;
  return (
    <div className="cover" style={{ width: w, height: h, background: fallback }}>
      {book.cover ? <img src={book.cover} alt={`${book.title} 書影`} draggable="false" /> : null}
      {showText && !book.cover && (
        <>
          <b>{book.title}</b>
          <span>{book.author}</span>
        </>
      )}
    </div>
  );
}

function Header({ q, setQ, groups, setGroups, cats, setCats, shown, syncState, viewMode, setViewMode, onSync }) {
  const [open, setOpen] = useState(false);
  const toggle = (set, value) => {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    return next;
  };

  return (
    <header>
      <div className="brand">
        <b>空間デザインを読む年表</b>
        <span>BOOKS × DSA 12 CATEGORIES</span>
      </div>
      <label className="search">
        <span aria-hidden="true">⌕</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="書名・著者・概念を検索…" />
      </label>
      <div className="groups">
        {Object.entries(DSA_GROUPS).map(([key, group]) => (
          <button
            className={groups.has(key) ? 'on' : ''}
            style={{ '--g': groupColor(key) }}
            onClick={() => setGroups(toggle(groups, key))}
            key={key}
          >
            <i />
            {group.label}
          </button>
        ))}
      </div>
      <button className={open || cats.size ? 'catBtn on' : 'catBtn'} onClick={() => setOpen(!open)}>
        カテゴリー ▾
      </button>
      {open && (
        <div className="catMenu">
          {DSA_CATS.map((cat) => (
            <label key={cat.id}>
              <input
                type="checkbox"
                checked={cats.has(cat.id)}
                onChange={() => setCats(toggle(cats, cat.id))}
              />
              <span>
                {String(cat.id).padStart(2, '0')} {cat.name}
              </span>
            </label>
          ))}
        </div>
      )}
      <div className="viewSwitch"><button className={viewMode === 'timeline' ? 'on' : ''} onClick={() => setViewMode('timeline')}>年表</button><button className={viewMode === 'grid' ? 'on' : ''} onClick={() => setViewMode('grid')}>グリッド</button></div><button className="syncBtn" onClick={onSync} disabled={syncState.status === 'syncing'}>{syncState.status === 'syncing' ? '同期中…' : '同期'}</button><div className="count">{shown === syncState.total ? `${syncState.total}冊` : `${shown} / ${syncState.total} 冊`}</div>
    </header>
  );
}

function Detail({ book, books, onClose, onPick, onApplyCover }) {
  const [coverSearch, setCoverSearch] = useState({ status: 'idle', candidates: [], message: '' });
  if (!book) return null;
  const related = books.filter((item) => item.id !== book.id && (item.cat === book.cat || item.author === book.author)).slice(0, 6);
  const findCovers = async () => {
    setCoverSearch({ status: 'loading', candidates: [], message: '' });
    try {
      const params = new URLSearchParams({ isbn: book.isbn || '', title: book.title, author: book.author });
      const response = await fetch(`/api/cover-candidates?${params}`);
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.message || '書影候補の取得に失敗しました');
      setCoverSearch({ status: 'done', candidates: payload.candidates || [], message: `${payload.candidates?.length || 0}件` });
    } catch (error) {
      setCoverSearch({ status: 'error', candidates: [], message: error instanceof Error ? error.message : '書影候補の取得に失敗しました' });
    }
  };
  return (
    <aside className="detail">
      <div className="dtop">
        <code>BOOK #{String(book.id).padStart(3, '0')}</code>
        <button onClick={onClose}>×</button>
      </div>
      <div className="hero">
        <Cover book={book} w={108} h={154} showText />
        <strong>{book.year}</strong>
      </div>
      <div className="badge" style={{ '--g': groupColor(book.group) }}>
        {String(book.cat).padStart(2, '0')} {book.catName}
      </div>
      <h1>{book.title}</h1>
      <p className="meta">{book.author} · {book.pub} · {book.year}</p>
      <p className="key">KEY: {book.concept}</p>
      <p className="note">{book.note}</p>
      <div className="coverTools">
        <button onClick={findCovers} disabled={coverSearch.status === 'loading'}>{coverSearch.status === 'loading' ? '検索中…' : '書影候補を探す'}</button>
        {coverSearch.message && <span>{coverSearch.message}</span>}
      </div>
      {coverSearch.candidates.length > 0 && (
        <div className="coverCandidates">
          {coverSearch.candidates.map((candidate) => (
            <button key={candidate.url} onClick={() => onApplyCover(book.id, candidate.url)} title={`${candidate.source} / ${candidate.confidence}`}>
              <img src={candidate.url} alt={`${book.title} 書影候補`} />
              <small>{candidate.source}</small>
            </button>
          ))}
        </div>
      )}
      <h2>関連本</h2>
      {related.map((item) => (
        <button className="rel" key={item.id} onClick={() => onPick(item)}>
          {item.year} {item.title}
        </button>
      ))}
    </aside>
  );
}


function BookGrid({ books, dim, selected, onPick }) {
  const visible = books.filter((book) => !dim(book));
  return (
    <section className="gridView">
      <div className="gridIntro">
        <b>BOOK GRID</b>
        <span>{visible.length}冊を一覧表示</span>
      </div>
      <div className="gridBooks">
        {visible.map((book) => (
          <button className={selected === book.id ? 'gridCard selected' : 'gridCard'} key={book.id} onClick={() => onPick(book)}>
            <Cover book={book} w={72} h={102} />
            <span className="gridMeta">
              <em>{book.year}</em>
              <strong>{book.title}</strong>
              <small>{book.author}</small>
              <i>{String(book.cat).padStart(2, '0')} {book.catName}</i>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function Swimlane({ books, dim, selected, onPick, focus }) {
  const data = useMemo(() => layoutBooks(books), [books]);
  const ref = useRef(null);
  const gesture = useRef({ pointers: new Map(), start: null, moved: false, last: null, velocity: { x: 0, y: 0 } });
  const inertiaFrame = useRef(null);
  const viewRef = useRef({ s: 0.55, tx: LABEL_W + 20, ty: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [view, setViewState] = useState(viewRef.current);
  const setView = (next) => {
    setViewState((current) => {
      const resolved = typeof next === 'function' ? next(current) : next;
      viewRef.current = resolved;
      return resolved;
    });
  };

  useEffect(() => () => cancelAnimationFrame(inertiaFrame.current), []);

  const stopInertia = () => cancelAnimationFrame(inertiaFrame.current);

  const animateViewTo = (next, duration = 260) => {
    stopInertia();
    const start = performance.now();
    const from = viewRef.current;
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setView({
        s: from.s + (next.s - from.s) * eased,
        tx: from.tx + (next.tx - from.tx) * eased,
        ty: from.ty + (next.ty - from.ty) * eased,
      });
      if (t < 1) inertiaFrame.current = requestAnimationFrame(step);
    };
    inertiaFrame.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    if (!focus || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const current = viewRef.current;
    animateViewTo({
      ...current,
      tx: rect.width / 2 - (focus._x + CARD_W / 2) * current.s,
      ty: rect.height / 2 - (data.lanes[focus.cat - 1].y + LANE_PAD + focus._sub * SUB_H + 26) * current.s,
    });
  }, [data.lanes, focus]);

  const resolveTap = (event) => {
    if (gesture.current.moved) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-bookid]');
    if (target) onPick(data.lanes.flatMap((lane) => lane.books).find((book) => book.id === Number(target.dataset.bookid)));
  };

  const updatePointers = (event) => {
    gesture.current.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  };

  const onPointerDown = (event) => {
    event.preventDefault();
    stopInertia();
    setIsDragging(true);
    ref.current.setPointerCapture(event.pointerId);
    updatePointers(event);
    const pointers = [...gesture.current.pointers.values()];
    gesture.current.moved = false;
    gesture.current.start =
      pointers.length === 2
        ? { type: 'pinch', pointers, distance: distance(pointers[0], pointers[1]), view }
        : { type: 'pan', x: event.clientX, y: event.clientY, view };
    gesture.current.last = { x: event.clientX, y: event.clientY, t: performance.now() };
    gesture.current.velocity = { x: 0, y: 0 };
  };

  const onPointerMove = (event) => {
    if (!gesture.current.start) return;
    event.preventDefault();
    updatePointers(event);
    const pointers = [...gesture.current.pointers.values()];
    const start = gesture.current.start;

    if (pointers.length >= 2 && start.type === 'pinch') {
      const center = midpoint(pointers[0], pointers[1]);
      const factor = distance(pointers[0], pointers[1]) / start.distance;
      gesture.current.moved = true;
      setView(zoomAt(start.view, center.x - LABEL_W, center.y - 60, factor));
      return;
    }

    if (start.type === 'pan') {
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      const now = performance.now();
      const last = gesture.current.last || { x: event.clientX, y: event.clientY, t: now };
      const dt = Math.max(16, now - last.t);
      gesture.current.velocity = { x: ((event.clientX - last.x) / dt) * 16, y: ((event.clientY - last.y) / dt) * 16 };
      gesture.current.last = { x: event.clientX, y: event.clientY, t: now };
      if (Math.hypot(dx, dy) > 2) gesture.current.moved = true;
      setView({ ...start.view, tx: start.view.tx + dx, ty: start.view.ty + dy });
    }
  };

  const onPointerUp = (event) => {
    resolveTap(event);
    gesture.current.pointers.delete(event.pointerId);
    const shouldGlide = gesture.current.moved && gesture.current.pointers.size === 0;
    const velocity = { ...gesture.current.velocity };
    gesture.current.start = null;
    setIsDragging(false);
    if (!shouldGlide || Math.hypot(velocity.x, velocity.y) < 0.4) return;
    const glide = () => {
      velocity.x *= 0.92;
      velocity.y *= 0.92;
      setView((current) => ({ ...current, tx: current.tx + velocity.x, ty: current.ty + velocity.y }));
      if (Math.hypot(velocity.x, velocity.y) > 0.12) inertiaFrame.current = requestAnimationFrame(glide);
    };
    inertiaFrame.current = requestAnimationFrame(glide);
  };

  return (
    <main
      ref={ref}
      className={isDragging ? 'dragging' : ''}
      onWheel={(event) => {
        event.preventDefault();
        if (event.shiftKey) {
          setView((current) => ({ ...current, tx: current.tx - event.deltaY }));
          return;
        }
        stopInertia();
        const delta = Math.max(-80, Math.min(80, event.deltaY));
        const factor = Math.exp(-delta * (event.ctrlKey || event.metaKey ? 0.012 : 0.0024));
        setView((current) => zoomAt(current, event.clientX - LABEL_W, event.clientY - 60, factor));
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={(event) => {
        event.preventDefault();
        setView((current) => zoomAt(current, event.clientX - LABEL_W, event.clientY - 60, 1.8));
      }}
    >
      <div className="axis" style={{ left: LABEL_W }}>
        {Array.from({ length: 22 }, (_, i) => 1820 + i * 10).map((year) => (
          <div className="tick" style={{ left: view.tx + baseX(year) * view.s }} key={year}>
            <b>{year}</b>
            <span>{year}s</span>
          </div>
        ))}
      </div>
      <div className="labels">
        <b>DSA CATEGORY</b>
        {data.lanes.map((lane) => (
          <div
            className="lab"
            style={{ top: AXIS_H + view.ty + lane.y * view.s, height: lane.h * view.s, '--g': groupColor(lane.cat.group) }}
            key={lane.cat.id}
          >
            <code>{String(lane.cat.id).padStart(2, '0')}</code>
            <strong>{lane.cat.name}</strong>
            <span>
              {lane.cat.en} · {lane.books.length}冊
            </span>
          </div>
        ))}
      </div>
      <div className="world" style={{ transform: `translate(${view.tx}px,${AXIS_H + view.ty}px) scale(${view.s})`, width: data.width, height: data.height }}>
        {Array.from({ length: 22 }, (_, i) => 1820 + i * 10).map((year) => (
          <div className="dec" style={{ left: baseX(year), width: 380 }} key={year} />
        ))}
        {data.lanes.map((lane) => (
          <section className="lane" style={{ top: lane.y, height: lane.h, '--g': groupColor(lane.cat.group, 52) }} key={lane.cat.id}>
            {lane.books.map((book) => (
              <button
                data-bookid={book.id}
                className={`${dim(book) ? 'dim ' : ''}${selected === book.id ? 'sel ' : ''}book`}
                style={{ left: book._x, top: LANE_PAD + book._sub * SUB_H }}
                key={book.id}
              >
                <Cover book={book} />
                <span>
                  <em>{book.year}</em>
                  <b>{book.title}</b>
                  <small>{book.author}</small>
                </span>
              </button>
            ))}
          </section>
        ))}
      </div>
      <div className="zoom">
        <b>{Math.round(view.s * 100)}%</b>
        <button onClick={() => animateViewTo(zoomAt(viewRef.current, (ref.current?.clientWidth || 1000) / 2, (ref.current?.clientHeight || 600) / 2, 1.3))}>＋</button>
        <button onClick={() => animateViewTo(zoomAt(viewRef.current, (ref.current?.clientWidth || 1000) / 2, (ref.current?.clientHeight || 600) / 2, 1 / 1.3))}>－</button>
        <button onClick={() => animateViewTo({ s: 0.55, tx: LABEL_W + 20, ty: 20 }, 320)}>全体</button>
      </div>
    </main>
  );
}

function App() {
  const [books, setBooks] = useState(BOOKS);
  const [syncState, setSyncState] = useState({ status: 'idle', total: BOOKS.length, message: 'seed data' });
  const [q, setQ] = useState('');
  const [groups, setGroups] = useState(new Set());
  const [cats, setCats] = useState(new Set());
  const [selectedId, setSelectedId] = useState(null);
  const [focus, setFocus] = useState(null);
  const [viewMode, setViewMode] = useState('timeline');

  const matchesFilter = (book) => (!groups.size || groups.has(book.group)) && (!cats.size || cats.has(book.cat));
  const matchesQuery = (book) => !q || [book.title, book.author, book.concept, book.note].join(' ').toLowerCase().includes(q.toLowerCase());
  const shown = books.filter((book) => matchesFilter(book) && matchesQuery(book)).length;
  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('syncedBooks') || 'null');
      if (Array.isArray(cached) && cached.length) {
        setBooks(cached);
        setSyncState({ status: 'cached', total: cached.length, message: 'local cache' });
      }
    } catch {
      localStorage.removeItem('syncedBooks');
    }
  }, []);

  const pick = (book) => {
    if (!book) return;
    setSelectedId(book.id);
    setFocus({ ...book, _t: Date.now() });
  };

  const applyCover = (bookId, cover) => {
    setBooks((current) => {
      const next = current.map((book) => (book.id === bookId ? { ...book, cover } : book));
      localStorage.setItem('syncedBooks', JSON.stringify(next));
      return next;
    });
  };

  const syncBooks = async () => {
    setSyncState((current) => ({ ...current, status: 'syncing', message: 'syncing' }));
    try {
      const response = await fetch('/api/books');
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.message || 'Sync failed');
      setBooks(payload.books);
      setSelectedId(null);
      setFocus(null);
      localStorage.setItem('syncedBooks', JSON.stringify(payload.books));
      setSyncState({ status: 'synced', total: payload.books.length, message: payload.syncedAt });
    } catch (error) {
      setSyncState((current) => ({ ...current, status: 'error', message: error instanceof Error ? error.message : 'Sync failed' }));
    }
  };

  return (
    <div data-theme="archive">
      <Header q={q} setQ={setQ} groups={groups} setGroups={setGroups} cats={cats} setCats={setCats} shown={shown} syncState={syncState} viewMode={viewMode} setViewMode={setViewMode} onSync={syncBooks} />
      <div className="shell">
        {viewMode === 'timeline' ? <Swimlane books={books} dim={(book) => !matchesFilter(book) || !matchesQuery(book)} selected={selectedId} onPick={pick} focus={focus} /> : <BookGrid books={books} dim={(book) => !matchesFilter(book) || !matchesQuery(book)} selected={selectedId} onPick={pick} />}
        <Detail book={books.find((book) => book.id === selectedId)} books={books} onClose={() => setSelectedId(null)} onPick={pick} onApplyCover={applyCover} />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
