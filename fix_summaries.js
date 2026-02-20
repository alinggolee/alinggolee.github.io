const fs = require('fs');
const path = require('path');

const dataDir = 'c:\\Files\\Codes\\Site\\Alinggo\\data';

function updateSummaries() {
    for (let i = 1; i <= 15; i++) {
        const weekDir = path.join(dataDir, `W${i}`);
        if (!fs.existsSync(weekDir)) continue;

        const contentEnPath = path.join(weekDir, 'content-en.md');
        const contentZhPath = path.join(weekDir, 'content.md');
        const espEnPath = path.join(weekDir, 'esp-en.md');
        const espZhPath = path.join(weekDir, 'esp.md');
        const summaryEnPath = path.join(weekDir, 'summary-en.md');
        const summaryZhPath = path.join(weekDir, 'summary.md');

        let titleEn = '', titleZh = '';
        let espTitleEn = '', espTitleZh = '';

        // Extract Title from content-en.md
        if (fs.existsSync(contentEnPath)) {
            const lines = fs.readFileSync(contentEnPath, 'utf8').split('\n');
            const h1 = lines.find(l => l.startsWith('# '));
            if (h1) titleEn = h1.replace('# ', '').trim();
        }

        // Extract Title from content.md
        if (fs.existsSync(contentZhPath)) {
            const lines = fs.readFileSync(contentZhPath, 'utf8').split('\n');
            const h1 = lines.find(l => l.startsWith('# '));
            if (h1) titleZh = h1.replace('# ', '').trim();
        }

        // Extract Title from esp-en.md
        if (fs.existsSync(espEnPath)) {
            const lines = fs.readFileSync(espEnPath, 'utf8').split('\n');
            const m = lines.find(l => l.startsWith('Theme: '));
            if (m) {
                espTitleEn = m.trim();
            } else {
                const h1 = lines.find(l => l.startsWith('# '));
                if (h1 && !h1.toLowerCase().includes('esp')) {
                    espTitleEn = h1.replace('# ', '').trim();
                } else {
                    const h2 = lines.find(l => l.startsWith('Theme: ') || l.startsWith('# Theme:'));
                    if (h2) espTitleEn = h2.replace('# ', '').trim();
                }
            }
        }

        // Extract Title from esp.md
        if (fs.existsSync(espZhPath)) {
            const lines = fs.readFileSync(espZhPath, 'utf8').split('\n');
            const h1 = lines.find(l => l.startsWith('主題：'));
            if (h1) {
                espTitleZh = h1.trim();
            } else {
                const h2 = lines.find(l => l.match(/主題：/));
                if (h2) espTitleZh = h2.replace('# ', '').trim();
            }
        }

        // Now rewrite summary-en.md by keeping the goals but changing Content and ESP sections
        if (fs.existsSync(summaryEnPath)) {
            let content = fs.readFileSync(summaryEnPath, 'utf8');
            let goalsMatch = content.match(/## Objective\n\n([\s\S]*?)(?=##|$)/);
            if (!goalsMatch) goalsMatch = content.match(/## 課程目標\n\n([\s\S]*?)(?=##|$)/); // fallback
            let goals = goalsMatch ? goalsMatch[1].trim() : '';

            let fallbackEn = fs.existsSync(contentEnPath) ? "" : "(Not available yet)";
            let newSummaryEn = `## Objective\n\n${goals}\n\n## Course Content\n\n${titleEn || fallbackEn}\n\n## ESP\n\n${espTitleEn || fallbackEn}`;
            fs.writeFileSync(summaryEnPath, newSummaryEn);
        }

        // Rewrite summary.md
        if (fs.existsSync(summaryZhPath)) {
            let content = fs.readFileSync(summaryZhPath, 'utf8');
            let goalsMatch = content.match(/## 課程目標\n\n([\s\S]*?)(?=##|$)/);
            if (!goalsMatch) goalsMatch = content.match(/## Objective\n\n([\s\S]*?)(?=##|$)/); // fallback
            let goals = goalsMatch ? goalsMatch[1].trim() : '';

            let newSummaryZh = `## 課程目標\n\n${goals}\n\n## 課程內容\n\n${titleZh || ''}\n\n## ESP\n\n${espTitleZh || ''}`;
            fs.writeFileSync(summaryZhPath, newSummaryZh);
        }
    }
}

updateSummaries();
console.log("Summaries updated.");
