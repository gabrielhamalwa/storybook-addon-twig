const STYLE_ID = 'storybook-addon-twig-styles';

const ADDON_CSS = `
.satw-panel {
  box-sizing: border-box;
  height: 100%;
  min-height: 100%;
  background: #101418;
  color: #f5f7fb;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.satw-panel--empty {
  display: grid;
  align-content: center;
  gap: 8px;
  padding: 24px;
  color: #c7d0dd;
}

.satw-panel__header {
  display: flex;
  min-height: 44px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid #27313d;
  padding: 8px 12px;
}

.satw-panel__file {
  margin-left: 8px;
  color: #9da9b8;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 12px;
}

.satw-panel__button {
  border: 1px solid #465567;
  border-radius: 4px;
  background: #18212b;
  color: #f5f7fb;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  padding: 7px 10px;
}

.satw-panel__button:hover {
  background: #223041;
}

.satw-panel__code {
  height: calc(100% - 45px);
  overflow: auto;
}

.satw-code {
  box-sizing: border-box;
  margin: 0;
  min-height: 100%;
  overflow: auto;
  padding: 16px;
}

.satw-code code {
  counter-reset: satw-line;
  display: grid;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 1.55;
}

.satw-code .line {
  min-height: 1.55em;
}

.satw-code--wrap-lines .line {
  white-space: pre-wrap;
  word-break: break-word;
}

.satw-code--line-numbers .line::before {
  color: #748094;
  content: counter(satw-line);
  counter-increment: satw-line;
  display: inline-block;
  margin-right: 16px;
  min-width: 3ch;
  text-align: right;
  user-select: none;
}

.satw-code-block {
  margin: 16px 0;
  overflow: hidden;
  border-radius: 6px;
}
`;

export function installAddonStyles(documentRef: Pick<Document, 'createElement' | 'getElementById' | 'head'>): void {
  if (documentRef.getElementById(STYLE_ID)) {
    return;
  }

  const style = documentRef.createElement('style');
  style.id = STYLE_ID;
  style.textContent = ADDON_CSS;
  documentRef.head.appendChild(style);
}
