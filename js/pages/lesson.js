/**
 * Lesson page — 目標 on top (with course title), 影片/活動/TEAMI in a row
 */

import { Router } from '../router.js';
import { parseMarkdown } from '../markdown.js';

/**
 * Parse summary.md into sections by ## headings.
 */
function parseSummary(md) {
  const result = {};
  const parts = md.split(/^## /m);
  for (const part of parts) {
    if (!part.trim()) continue;
    const firstLine = part.split('\n')[0].trim();
    const body = part.slice(firstLine.length).trim();
    if (/目標/.test(firstLine)) result.objective = body;
    else if (/影片/.test(firstLine)) result.video = body;
    else if (/活動/.test(firstLine)) result.activity = body;
  }
  return result;
}

export async function renderLesson(container, lesson) {
  const wrapper = document.createElement('div');

  const hasVideo = lesson.sections.includes('video');
  const hasActivity = lesson.sections.includes('activity');
  const hasTeami = lesson.sections.includes('teami');

  // Build bottom row items
  let bottomItems = '';
  if (hasVideo) {
    bottomItems += `
          <div class="section-block" data-section="video">
            <div class="section-block-header">
              <span class="section-block-title">影片</span>
              <span class="section-block-link" data-nav="#/lesson/${lesson.id}/video">完整 →</span>
            </div>
            <div class="section-block-body" id="summary-video">
              <div class="loading"></div>
            </div>
          </div>`;
  }
  if (hasActivity) {
    bottomItems += `
          <div class="section-block" data-section="activity">
            <div class="section-block-header">
              <span class="section-block-title">活動</span>
              <span class="section-block-link" data-nav="#/lesson/${lesson.id}/activity">完整 →</span>
            </div>
            <div class="section-block-body" id="summary-activity">
              <div class="loading"></div>
            </div>
          </div>`;
  }
  // Always render TEEMI
  bottomItems += `
          <div class="teami-block">
            <div>
              <div class="teami-block-title">TEEMI</div>
              <a href="https://teemi.tw/" target="_blank" rel="noopener" class="teami-btn">📎 開啟資源</a>
            </div>
          </div>`;

  wrapper.innerHTML = `
    <div class="lesson-sections">
      <div class="section-block" data-section="objective">
        <div class="section-block-header">
          <span class="section-block-title is-main">${lesson.id} — ${lesson.title}</span>
          <span class="section-block-link" data-nav="#/lesson/${lesson.id}/objective">查看完整 →</span>
        </div>
        <div class="section-block-body" id="summary-objective">
          <div class="loading"></div>
        </div>
      </div>
      <div class="lesson-bottom-row">
        ${bottomItems}
      </div>
    </div>
  `;

  // Navigation
  wrapper.addEventListener('click', (e) => {
    const link = e.target.closest('.section-block-link[data-nav]');
    if (!link) return;
    e.preventDefault();
    Router.navigate(link.dataset.nav);
  });

  container.replaceChildren(wrapper);

  // Fetch summary
  try {
    const res = await fetch(`data/${lesson.id}/summary.md`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let md = await res.text();
    md = md.replace(
      /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g,
      (_, alt, src) => `![${alt}](data/${lesson.id}/${src})`
    );

    const parsed = parseSummary(md);
    for (const [key, content] of Object.entries(parsed)) {
      const el = wrapper.querySelector(`#summary-${key}`);
      if (el) {
        el.innerHTML = `<div class="md-content">${parseMarkdown(content)}</div>`;
      }
    }
  } catch {
    for (const key of ['objective', 'video', 'activity']) {
      const el = wrapper.querySelector(`#summary-${key}`);
      if (el) el.innerHTML = '<p style="color:var(--color-text-muted)">尚未填寫摘要</p>';
    }
  }
}
