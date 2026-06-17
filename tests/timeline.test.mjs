import test from 'node:test';import assert from 'node:assert/strict';
import {zoomAt,layoutBooks,SCALE_MIN,SCALE_MAX} from '../src/timeline.js';
test('zoomAt keeps cursor world point stable',()=>{const v={s:1,tx:10,ty:20};const z=zoomAt(v,200,120,2);assert.equal((200-z.tx)/z.s,(200-v.tx)/v.s);assert.equal((120-z.ty)/z.s,(120-v.ty)/v.s);});
test('zoomAt clamps scale',()=>{assert.equal(zoomAt({s:1,tx:0,ty:0},0,0,99).s,SCALE_MAX);assert.equal(zoomAt({s:1,tx:0,ty:0},0,0,.01).s,SCALE_MIN);});
test('layout has 12 lanes and book positions',()=>{const l=layoutBooks();assert.equal(l.lanes.length,12);assert.ok(l.width>7000);assert.ok(l.lanes.every(x=>x.books.every(b=>Number.isFinite(b._x))));});
test('seed books include cover images for timeline cards', async()=>{const {BOOKS}=await import('../src/data.js');assert.ok(BOOKS.every(b=>typeof b.cover==='string'&&b.cover.startsWith('data:image/svg+xml')));});
