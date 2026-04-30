export async function copyText(
  text: string,
  clipboard: Pick<Clipboard, 'writeText'> | undefined,
  documentRef: Pick<Document, 'body' | 'createElement' | 'execCommand'> | undefined,
): Promise<boolean> {
  if (clipboard) {
    try {
      await clipboard.writeText(text);
      return true;
    } catch {
      // Some Storybook/browser surfaces deny navigator.clipboard even on localhost.
    }
  }

  return copyTextWithSelectionFallback(text, documentRef);
}

function copyTextWithSelectionFallback(
  text: string,
  documentRef: Pick<Document, 'body' | 'createElement' | 'execCommand'> | undefined,
): boolean {
  if (!documentRef?.body) {
    return false;
  }

  const textarea = documentRef.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.top = '-1000px';

  documentRef.body.appendChild(textarea);
  textarea.select();

  try {
    return documentRef.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}
