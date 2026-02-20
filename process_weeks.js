const fs = require('fs');
const path = require('path');

const inputDir = 'c:\\Files\\Codes\\Site\\Alinggo\\data\\未整理\\1-15週 完整中英版20260220';
const outputBaseDir = 'c:\\Files\\Codes\\Site\\Alinggo\\data';

// Helper to remove some copy-paste garbage like "+1" if it's on a single line, but to be strictly adherent, we'll keep the text as is, just formatting it to markdown.
function formatMarkdown(text) {
    let lines = text.split('\n');
    let md = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        // Remove ________________________________________
        if (line.match(/^_{10,}$/)) continue;

        // Headers
        if (line.startsWith('🧬 第一部分') || line.startsWith('🧬 第二部分')) continue;
        if (line.startsWith('🧬 Week') && line.includes('Version')) continue;

        if (line.match(/^(主題：|Theme:)/)) {
            md.push('# ' + line + '\n');
        } else if (line.match(/^(🎯|🧠|🎬|💬|📚|🗣️)/)) {
            md.push('## ' + line + '\n');
        } else if (line.match(/^•\t/)) {
            md.push('- ' + line.replace(/^•\t/, '').trim());
        } else if (line.match(/^\d+\.\t/)) {
            md.push('### ' + line.replace(/^\d+\.\t/, '').trim() + '\n');
        } else if (line.match(/^o\t/)) {
            md.push('  - ' + line.replace(/^o\t/, '').trim());
        } else {
            md.push(line + '\n');
        }
    }
    return md.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function extractSummary(mdText, isEnglish) {
    // Extract learning goals
    let goalsMatch = mdText.match(/## 🎯.*?\n([\s\S]*?)(?=##|$)/);
    let goals = goalsMatch ? goalsMatch[1].trim() : '';

    // Extract title text
    let titleMatch = mdText.match(/# (主題：|Theme:)\s*(.*)/);
    let title = titleMatch ? titleMatch[2].trim() : '';

    if (isEnglish) {
        return `## Objective\n\n${goals}\n\n## Course Content\n\n${title}\n\n## ESP\n\nPlease refer to the ESP section for details.`;
    } else {
        return `## 課程目標\n\n${goals}\n\n## 課程內容\n\n${title}\n\n## ESP\n\n詳細內容請見 ESP 頁面。`;
    }
}

const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.txt'));
let configValidSections = ["content", "esp"];
let configUpdates = {};

files.forEach(file => {
    let weekMatch = file.match(/Week\s*(\d+)/i);
    if (!weekMatch) return;
    let weekNum = weekMatch[1];
    let weekId = 'W' + weekNum;

    let filePath = path.join(inputDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Split into 4 parts based on 🧬 Week .* Version .*
    // We can split by lines that start with "🧬 Week" and have "Version"
    let parts = content.split(/🧬\s*Week\s*\d+\s*\|\s*Version\s*[A-B].*/i);

    // The split result:
    // parts[0]: Before the first Version A (often contains 🧬 第一部分)
    // parts[1]: Content of Version A (Bilingual)
    // parts[2]: Content of Version B (ESP Bilingual) - wait, is there a separator "🧬 第二部分" in parts[2]? Yes.
    // parts[3]: Content of Version A (English)
    // parts[4]: Content of Version B (ESP English)

    if (parts.length < 5) {
        console.log(`Failed to parse 4 sections for ${file}`);
        return;
    }

    // Remove "🧬 第二部分" from parts[2]
    parts[2] = parts[2].replace(/________________________________________[\s\n]*🧬 第二部分.*/i, '');

    let contentBi = formatMarkdown(parts[1]);
    let espBi = formatMarkdown(parts[2]);
    let contentEn = formatMarkdown(parts[3]);
    let espEn = formatMarkdown(parts[4]);

    let sumBi = extractSummary(contentBi, false);
    let sumEn = extractSummary(contentEn, true);

    let outDir = path.join(outputBaseDir, weekId);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    fs.writeFileSync(path.join(outDir, 'content.md'), contentBi);
    fs.writeFileSync(path.join(outDir, 'esp.md'), espBi);
    fs.writeFileSync(path.join(outDir, 'content-en.md'), contentEn);
    fs.writeFileSync(path.join(outDir, 'esp-en.md'), espEn);
    fs.writeFileSync(path.join(outDir, 'summary.md'), sumBi);
    fs.writeFileSync(path.join(outDir, 'summary-en.md'), sumEn);

    console.log(`Successfully processed ${weekId}`);

    configUpdates[weekId] = {
        id: weekId,
        title: titleMatch = contentEn.match(/# Theme:\s*(.*)/) ? contentEn.match(/# Theme:\s*(.*)/)[1].trim() : `Week ${weekNum}`,
        cover: `data/${weekId}/W 01 01.jpg`, // Default cover placeholder
        sections: configValidSections
    };
});

// Update config.json
let configPath = path.join(outputBaseDir, 'config.json');
if (fs.existsSync(configPath)) {
    let config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    // Sort and add missing
    for (let w = 2; w <= 15; w++) {
        let wid = 'W' + w;
        if (configUpdates[wid]) {
            let existing = config.lessons.find(l => l.id === wid);
            if (!existing) {
                config.lessons.push(configUpdates[wid]);
            } else {
                existing.sections = configValidSections;
            }
        }
    }
    // Sort carefully
    config.lessons.sort((a, b) => {
        let nA = parseInt(a.id.replace('W', ''));
        let nB = parseInt(b.id.replace('W', ''));
        return nA - nB;
    });
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log("Updated config.json");
}

