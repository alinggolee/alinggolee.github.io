import os
import re

base_dir = r"c:\Files\Codes\Site\Alinggo\data"

en_titles = {
    "W1": "Week 1 ｜Gender Education Introduction",
    "W2": "Week 2 ｜Gender Concepts & Naming",
    "W3": "Week 3 ｜Gender expression ",
    "W4": "Week 4 ｜Media, gender and critical thinking",
    "W5": "Week 5 ｜Sexual Orientation",
    "W6": "Week 6 ｜Diversity, Gender, and Parenting",
    "W7": "Week 7 ｜GBP, Trans Experience and Privilege",
    "W8": "Week 8 ｜Diversity and Structural Inequality(Taruku)",
    "W9": "Week 9 ｜Tradition, Change, and Gendered Identity",
    "W10": "Week 10｜Sexual harassment",
    "W11": "Week 11｜Body & Beauty Standards",
    "W12": "Week 12｜Understanding Digital Gender-Based Violence",
    "W13": "Week 13｜Digital Gender-Based Violence: Critical Reflection",
    "W14": "Week 14｜Advocacy & Educational Design: Ready for an Adventure (Community Outreach Version)",
    "W15": "Week 15 ｜Final Structural Integration",
}

tw_titles = {
    "W1": "Week 1 ｜性別教育概論",
    "W2": "Week 2 ｜性別概念與命名",
    "W3": "Week 3 ｜性別特質與表現",
    "W4": "Week 4 ｜媒體、性別與批判性思考",
    "W5": "Week 5 ｜性傾向",
    "W6": "Week 6 ｜多樣性、性別與教養",
    "W7": "Week 7 ｜性別薑餅人、跨性別經驗與特權",
    "W8": "Week 8 ｜多樣性與結構不平等（太魯閣族）",
    "W9": "Week 9 ｜傳統、變遷與性別認同",
    "W10": "Week 10｜性騷擾",
    "W11": "Week 11｜身體與審美標準",
    "W12": "Week 12｜理解數位性別暴力",
    "W13": "Week 13｜數位性別暴力：批判性反思",
    "W14": "Week 14｜倡議與教育設計：Ready for an Adventure?（社區推廣版）",
    "W15": "Week 15 ｜最終結構整合",
}

def clean_emojis(content):
    # Remove emojis: 📚, 🗣️, 🛠, 🗣
    for emoji in ["📚", "🗣️", "🛠", "🗣"]:
        content = content.replace(emoji + " ", "")
        content = content.replace(emoji, "")
    return content

for i in range(1, 16):
    folder = f"W{i}"
    folder_path = os.path.join(base_dir, folder)
    
    if not os.path.isdir(folder_path):
        continue
        
    en_t = en_titles[folder]
    tw_t = tw_titles[folder]
    
    files = {
        "content-en.md": en_t,
        "esp-en.md": en_t,
        "content.md": tw_t,
        "esp.md": tw_t
    }
    
    for filename, new_title in files.items():
        filepath = os.path.join(folder_path, filename)
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            lines = content.split('\n')
            for idx, line in enumerate(lines):
                if line.startswith('#') and not line.startswith('##'):
                    lines[idx] = f"# {new_title}"
                    break
            
            new_content = '\n'.join(lines)
            new_content = clean_emojis(new_content)
            
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
                
print("Done updating headers and removing emojis!")
