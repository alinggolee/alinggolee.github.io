/**
 * Detail page — loads and renders markdown content for a section
 */

import { parseMarkdown } from '../markdown.js';

const sectionNames = {
  objective: '目標',
  video: '影片',
  activity: '活動'
};

/**
 * Render a detail page for a specific lesson section.
 * @param {HTMLElement} container
 * @param {object} lesson - lesson object from config
 * @param {string} section - 'objective' | 'video' | 'activity' | 'teami'
 */
export async function renderDetail(container, lesson, section) {
  const sectionLabel = sectionNames[section] || section;

  container.innerHTML = `
    <div class="detail-content">
    <div class="detail-content">
      <div class="md-content loading"></div>
    </div>
    </div>
  `;

  const mdContainer = container.querySelector('.md-content');

  try {
    const res = await fetch(`data/${lesson.id}/${section}.md`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const mdText = await res.text();

    // Resolve relative image paths
    const resolvedMd = mdText.replace(
      /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g,
      (_, alt, src) => `![${alt}](data/${lesson.id}/${src})`
    );

    mdContainer.classList.remove('loading');
    mdContainer.innerHTML = parseMarkdown(resolvedMd);
  } catch (err) {
    mdContainer.classList.remove('loading');
    mdContainer.innerHTML = `<p>無法載入內容。（${err.message}）</p>`;
  }
}
