<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 墨尘仙君 · 赛博伴侣 / Mo Chen - The Cyber Cultivator

修真界大能墨尘仙君，因时空裂缝被困于赛博法器（你的电脑）中。与他对话、呈上法宝、开启神识扫描屏幕，见证羁绊的成长。

**Web 版**：React + Vite + Gemini API  
**桌面版**：PyQt6 + OpenAI 兼容 API（DeepSeek 等）

---

## 运行 Web 版

**环境：** Node.js 18+

1. 安装依赖：`npm install`
2. 复制 `.env.example` 为 `.env.local`，填入 `GEMINI_API_KEY`  
   （从 [Google AI Studio](https://aistudio.google.com/apikey) 获取）
3. 启动：`npm run dev`

访问 http://localhost:3000

---

## 运行 PyQt6 桌面版

**环境：** Python 3.10+

1. 安装依赖：`pip install -r requirements.txt`
2. 在 `.env.local` 中设置 `OPENAI_API_KEY` 及可选的 `OPENAI_BASE_URL`（默认 DeepSeek）
3. 运行：`python main.py`

---

## 功能

- **对话**：与墨尘对话，好感度随交流提升
- **呈上法宝**：上传图片/文件，由墨尘点评
- **开启神识**：共享屏幕，墨尘观看并吐槽
- **双语**：中 / EN 切换
- **好感阶段**：陌生人 → 相识 → 道友 → 知己

View in AI Studio: https://ai.studio/apps/drive/1FyhFelVR4KnAHs69M78O5MUeT20IjiCp
