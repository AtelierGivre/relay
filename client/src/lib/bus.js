export const ASK_EVENT = 'relay:open-ask';

export function openAskPanel() {
  window.dispatchEvent(new CustomEvent(ASK_EVENT));
}
