chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'saveLinks',
      title: 'Save Tabs Links',
      contexts: ['all']
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'saveLinks') {
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        const links = tabs.map(tab => tab.url);
        chrome.storage.local.get({ folders: [] }, (result) => {
          const folders = result.folders;
          const folderName = prompt('Enter folder name:');
          if (folderName) {
            const folder = { name: folderName, links: links };
            folders.push(folder);
            chrome.storage.local.set({ folders: folders }, () => {
              alert('Links saved to folder.');
            });
          }
        });
      });
    }
  });