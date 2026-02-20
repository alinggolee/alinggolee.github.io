const fs = require('fs');
const path = require('path');

const imgDir = 'c:\\Files\\Codes\\Site\\Alinggo\\data\\未整理\\圖片';
const dataDir = 'c:\\Files\\Codes\\Site\\Alinggo\\data';

const files = fs.readdirSync(imgDir);

// Mapping to find the best cover image for each week.
// Key: Week ID, Value: image file name
let coverMap = {
    "W1": "W 01 01.jpg",
    "W2": "w 02 01naming2.jpg",
    "W3": "w 03 01 g expression.jpg",
    "W4": "w 04-01.jpg",
    "W5": "w 05-01.jpg",
    "W6": "w 06-01.jpg",
    "W7": "w 07.jpg",
    "W8": "w 08-01.jpg",
    "W9": "w 09-01.jpg",
    "W10": "w 10 01反性騷.jpg",
    "W11": "w 11-01.jpg",
    "W12": "w 12-14.jpg", // maybe W12, W13, W14 uses something else
    "W13": "w13-01 05.jpg",
    "W14": "w14.JPG",
    "W15": "w 15-01.jpg"
};

for (let [weekId, imgName] of Object.entries(coverMap)) {
    // case-insensitive find in files
    let actualImgName = files.find(f => f.toLowerCase() === imgName.toLowerCase());
    if (actualImgName) {
        let srcPath = path.join(imgDir, actualImgName);
        let weekDir = path.join(dataDir, weekId);

        if (!fs.existsSync(weekDir)) fs.mkdirSync(weekDir, { recursive: true });

        let destPath = path.join(weekDir, actualImgName);
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${actualImgName} to ${weekId}`);

        coverMap[weekId] = actualImgName; // update with actual case
    } else {
        console.log(`Could not find image ${imgName} for ${weekId}`);
    }
}

// Update config.json covers
let configPath = path.join(dataDir, 'config.json');
if (fs.existsSync(configPath)) {
    let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config.lessons.forEach(lesson => {
        if (coverMap[lesson.id] && files.find(f => f.toLowerCase() === coverMap[lesson.id].toLowerCase())) {
            lesson.cover = `data/${lesson.id}/${coverMap[lesson.id]}`;
        }
    });
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log("Updated config.json covers");
}

