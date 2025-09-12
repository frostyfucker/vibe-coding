
# Vibe Codin'

Vibe Codin' is a social coding platform that blends video conferencing with an AI-powered assistant. It's designed to make remote collaboration more engaging, productive, and fun.

The platform provides a shared workspace where users can see and talk to each other through live video streams while working on code in a synchronized editor. An intelligent AI agent, "Vibe Bot," is integrated into the session to analyze code, offer suggestions, and help solve problems in real time.

## Key Features

- **Real-Time Video Conferencing:** See and hear your collaborators with low-latency video and audio powered by WebRTC.
- **AI-Powered Assistant:** Get help from Vibe Bot, an integrated Gemini-powered AI that can answer questions, debug code, and provide suggestions.
- **Media Controls:** Full control over your media with mute/unmute and camera on/off toggles.
- **Shared Code Editor:** A simple, shared space for writing code together.
- **Positive Atmosphere:** A "Celebrate!" button that showers the screen with confetti to appreciate a job well done and keep the vibes positive.

## Tech Stack

This project is built with a modern frontend stack, leveraging powerful APIs for real-time communication and artificial intelligence.

- **UI Framework:** [React](https://reactjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Real-Time Communication:** [WebRTC](https://webrtc.org/) for peer-to-peer video and audio streaming.
- **AI Integration:** [Google Gemini API](https://ai.google.dev/) via the `@google/genai` SDK.

### Libraries & Packages

- `@google/genai`: The official Google client library for the Gemini API, used for all interactions with the Vibe Bot.
- `react-markdown`: Renders the AI's Markdown responses into formatted text and code blocks.
- `react-syntax-highlighter`: Provides syntax highlighting for code snippets shared by the AI assistant.

### A Note on the Code Editor

The current implementation of the code editor uses a standard HTML `<textarea>` element for simplicity and rapid prototyping. It is not using the Monaco Editor. A future enhancement could involve integrating a more powerful editor like Monaco or CodeMirror to provide features like syntax highlighting, autocompletion, and more advanced editing capabilities.
