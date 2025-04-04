chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-ui") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return;

    await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ["styles.css"] });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  }
});