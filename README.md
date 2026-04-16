<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/770cb194-0d6b-420a-8a58-64454ffc9bd7

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Run in GitHub Codespaces

This repository includes a preconfigured dev container in [.devcontainer/devcontainer.json](.devcontainer/devcontainer.json).

1. Open the repository in GitHub.
2. Click `Code` -> `Codespaces` -> `Create codespace on main`.
3. Wait for the post-create setup to finish.
4. Run:
   `npm run dev`

The container installs .NET 8 and the CS-Script tools automatically:

- `cs-script.cli`
- `cs-syntaxer`
