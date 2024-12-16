document.addEventListener('DOMContentLoaded', () => {
    const foldersDiv = document.getElementById('folders');
    const showTabsButton = document.getElementById('showTabsButton');
    const openAllButton = document.createElement('button');
    openAllButton.textContent = 'Open All Links';
  
    function displayFolders() {
        chrome.storage.local.get({ folders: [] }, (result) => {
          const folders = result.folders;
          foldersDiv.innerHTML = '';
          folders.forEach((folder, index) => {
            const sessionDiv = document.createElement('div');
            sessionDiv.classList.add('session');
      
            const sessionLeftDiv = document.createElement('div');
            sessionLeftDiv.classList.add('session-left');
      
            const sessionNameDiv = document.createElement('div');
            sessionNameDiv.classList.add('session-name');
            sessionNameDiv.textContent = folder.name;
            sessionNameDiv.addEventListener('click', () => {
              displayLinks(folder.links, index);
            });
      
            const sessionTabsDiv = document.createElement('div');
            sessionTabsDiv.classList.add('session-tabs');
            sessionTabsDiv.textContent = `${folder.links.length} links`;
      
            const sessionSubtitleDiv = document.createElement('div');
            sessionSubtitleDiv.classList.add('session-subtitle');
            sessionSubtitleDiv.textContent = 'Show Links List';
      
            sessionLeftDiv.appendChild(sessionNameDiv);
            sessionLeftDiv.appendChild(sessionTabsDiv);
            sessionLeftDiv.appendChild(sessionSubtitleDiv);
      
            const sessionActionsDiv = document.createElement('div');
            sessionActionsDiv.classList.add('session-actions');
      
            const editButton = document.createElement('span');
            editButton.classList.add('action-icon', 'icon-in-box', 'action-plus-bigger');
            editButton.textContent = 'Edit';
            const editText = document.createElement('span');
            editText.classList.add('action-text');
            editText.textContent = 'Edit Folder';
            editButton.appendChild(editText);
            editButton.addEventListener('click', (event) => {
              event.stopPropagation();
              const newName = prompt('Enter new folder name:', folder.name);
              if (newName) {
                folders[index].name = newName;
                chrome.storage.local.set({ folders: folders }, displayFolders);
              }
            });
      
            const deleteButton = document.createElement('span');
            deleteButton.classList.add('action-icon', 'icon-in-box', 'action-open');
            deleteButton.textContent = 'Delete';
            const deleteText = document.createElement('span');
            deleteText.classList.add('action-text');
            deleteText.textContent = 'Delete Folder';
            deleteButton.appendChild(deleteText);
            deleteButton.addEventListener('click', (event) => {
              event.stopPropagation();
              if (confirm(`Are you sure you want to delete the folder "${folder.name}"?`)) {
                folders.splice(index, 1);
                chrome.storage.local.set({ folders: folders }, displayFolders);
              }
            });
      
            sessionActionsDiv.appendChild(editButton);
            sessionActionsDiv.appendChild(deleteButton);
      
            sessionDiv.appendChild(sessionLeftDiv);
            sessionDiv.appendChild(sessionActionsDiv);
      
            foldersDiv.appendChild(sessionDiv);
          });
        });
      }
      
  
    function displayLinks(links, folderIndex) {
      foldersDiv.innerHTML = '';
      links.forEach((link, linkIndex) => {
        const linkDiv = document.createElement('div');
        linkDiv.classList.add('link');
  
        const anchor = document.createElement('a');
        anchor.href = link;
        anchor.textContent = link;
        anchor.target = '_blank';
        linkDiv.appendChild(anchor);
  
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => {
          const newLink = prompt('Enter new link:', link);
          if (newLink) {
            links[linkIndex] = newLink;
            saveLinks(folderIndex, links);
          }
        });
        linkDiv.appendChild(editButton);
  
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
          links.splice(linkIndex, 1);
          saveLinks(folderIndex, links);
        });
        linkDiv.appendChild(deleteButton);
  
        foldersDiv.appendChild(linkDiv);
      });
  
      if (folderIndex === -1) {
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save Links';
        saveButton.addEventListener('click', () => {
          const folderName = prompt('Enter folder name:');
          if (!folderName || folderName.trim() === '') {
            alert('Folder name cannot be empty.');
            return;
          }
          if (folderName) {
            chrome.storage.local.get({ folders: [] }, (result) => {
              if (chrome.runtime.lastError) {
                console.error('Error fetching folders:', chrome.runtime.lastError);
                return;
              }
              const folders = result.folders;
              folders.push({ name: folderName, links: links });
              chrome.storage.local.set({ folders: folders }, displayFolders);
            });
          }
        });
        foldersDiv.appendChild(saveButton);
      }
  
      const backButton = document.createElement('button');
      backButton.textContent = 'Back';
      backButton.addEventListener('click', displayFolders);
      foldersDiv.appendChild(backButton);
  
      openAllButton.addEventListener('click', () => {
        links.forEach(link => {
          window.open(link, '_blank');
        });
      });
      foldersDiv.appendChild(openAllButton);
    }
  
    function saveLinks(folderIndex, links) {
      if (folderIndex === -1) {
        console.error('Error: Cannot save links for a non-existent folder.');
        return;
      }
  
      chrome.storage.local.get({ folders: [] }, (result) => {
        const folders = result.folders;
        if (!folders[folderIndex]) {
          console.error('Error: Folder not found.');
          return;
        }
        folders[folderIndex].links = links;
        chrome.storage.local.set({ folders: folders }, () => {
          displayLinks(links, folderIndex);
        });
      });
    }
  
    function showTabLinks() {
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        const links = tabs.map(tab => tab.url);
        displayLinks(links, -1); // -1 indicates it's not from a folder
      });
    }
  
    showTabsButton.addEventListener('click', showTabLinks);
  
    displayFolders();
  });