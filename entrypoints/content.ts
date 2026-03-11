import { defineContentScript } from '#imports';
import './content/styles.css';

interface ChatTags {
  [chatId: string]: string[];
}

const STORAGE_KEY = 'chatTags';

function getChatIdFromHref(href: string): string | null {
  const match = href.match(/\/app\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

let tagsCache: ChatTags = {};
let cacheLoaded = false;

async function getTags(): Promise<ChatTags> {
  if (cacheLoaded) {
    return tagsCache;
  }
  const result = await browser.storage.local.get(STORAGE_KEY);
  tagsCache = result[STORAGE_KEY] || {};
  cacheLoaded = true;
  return tagsCache;
}

async function saveTags(tags: ChatTags): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: tags });
  tagsCache = tags;
}

function createTagElement(tag: string): HTMLElement {
  const span = document.createElement('span');
  span.className = 'gt-tag';
  span.textContent = tag;
  span.style.color = '#666';
  return span;
}

function createFilterBar(activeFilters: Set<string>, allTags: string[]): HTMLElement {
  const container = document.createElement('div');
  container.className = 'gt-filter-bar';
  container.id = 'gt-filter-bar';

  const allBtn = document.createElement('button');
  allBtn.className = `gt-filter-btn ${activeFilters.has('all') ? 'active' : ''}`;
  allBtn.textContent = 'All';
  allBtn.title = 'Click to show all (Ctrl+Click for multiple)';
  allBtn.addEventListener('click', (e) => setFilter('all', e.ctrlKey || e.metaKey));
  container.appendChild(allBtn);

  const uniqueTags = new Set<string>();
  allTags.forEach(chatTags => {
    chatTags.forEach(tag => {
      if (tag !== 'deleted') {
        uniqueTags.add(tag);
      }
    });
  });

  uniqueTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = `gt-filter-btn ${activeFilters.has(tag) ? 'active' : ''}`;
    btn.textContent = tag;
    btn.title = 'Ctrl+Click to select multiple (intersection)';
    btn.addEventListener('click', (e) => setFilter(tag, e.ctrlKey || e.metaKey));
    container.appendChild(btn);
  });

  const deletedBtn = document.createElement('button');
  deletedBtn.className = `gt-filter-btn gt-deleted-btn ${activeFilters.has('__deleted__') ? 'active' : ''}`;
  deletedBtn.title = 'Ctrl+Click for intersection';
  deletedBtn.textContent = 'Deleted';
  deletedBtn.addEventListener('click', (e) => setFilter('__deleted__', e.ctrlKey || e.metaKey));
  container.appendChild(deletedBtn);

  return container;
}

let activeFilters = new Set<string>(['all']);

async function setFilter(filter: string, addToSelection: boolean = false): Promise<void> {
  if (addToSelection) {
    if (filter === 'all') {
      activeFilters = new Set<string>(['all']);
    } else {
      activeFilters.delete('all');
      if (activeFilters.has(filter)) {
        activeFilters.delete(filter);
      } else {
        activeFilters.add(filter);
      }
      if (activeFilters.size === 0) {
        activeFilters.add('all');
      }
    }
  } else {
    activeFilters = new Set<string>([filter]);
  }
  
  updateFilterButtonStates();
  applyFilter();
}

function updateFilterButtonStates(): void {
  const filterBar = document.getElementById('gt-filter-bar');
  if (!filterBar) return;
  
  const buttons = filterBar.querySelectorAll('.gt-filter-btn');
  buttons.forEach(btn => {
    const btnEl = btn as HTMLButtonElement;
    const btnText = btnEl.textContent?.toLowerCase().trim();
    
    let isActive = false;
    if (btnText === 'all') {
      isActive = activeFilters.has('all');
    } else if (btnText === 'deleted') {
      isActive = activeFilters.has('__deleted__');
    } else if (btnText) {
      isActive = activeFilters.has(btnText);
    }
    
    btnEl.classList.toggle('active', isActive);
  });
}

function applyFilter(): void {
  const conversations = document.querySelectorAll<HTMLAnchorElement>('a[data-test-id="conversation"]');
  const tags = document.querySelectorAll('.gt-tag');
  
  tags.forEach(tagEl => tagEl.remove());

  getTags().then(tagsMap => {
    const filters = Array.from(activeFilters);
    const hasAll = filters.includes('all');
    const hasDeleted = filters.includes('__deleted__');
    const tagFilters = filters.filter(f => f !== 'all' && f !== '__deleted__');

    conversations.forEach(conv => {
      const chatId = getChatIdFromHref(conv.href);
      if (!chatId) return;

      const chatTags = tagsMap[chatId] || [];
      const hasDeletedTag = chatTags.includes('deleted');

      let shouldShow = true;

      if (hasAll || (tagFilters.length === 0 && !hasDeleted)) {
        shouldShow = !hasDeletedTag;
      } else if (hasDeleted && tagFilters.length === 0) {
        shouldShow = hasDeletedTag;
      } else {
        if (hasDeleted) {
          shouldShow = hasDeletedTag && tagFilters.every(tag => chatTags.includes(tag));
        } else {
          shouldShow = !hasDeletedTag && tagFilters.every(tag => chatTags.includes(tag));
        }
      }

      conv.style.display = shouldShow ? '' : 'none';

      if (shouldShow && chatTags.length > 0) {
        const titleEl = conv.querySelector('.conversation-title');
        if (titleEl) {
          chatTags.forEach(tag => {
            if (tag !== 'deleted') {
              const tagEl = createTagElement(tag);
              titleEl.appendChild(tagEl);
            }
          });
        }
      }
    });
  });
}

function createContextMenu(chatId: string, x: number, y: number): void {
  removeContextMenu();

  const menu = document.createElement('div');
  menu.id = 'gt-context-menu';
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;

  getTags().then(tags => {
    const currentTags = tags[chatId] || [];

    const addTagItem = document.createElement('div');
    addTagItem.className = 'gt-menu-item';
    addTagItem.textContent = 'Add Tag';
    addTagItem.addEventListener('click', async () => {
      removeContextMenu();
      const tagName = prompt('Enter tag name:');
      if (tagName && tagName.trim()) {
        const newTag = tagName.trim().toLowerCase();
        if (!currentTags.includes(newTag)) {
          tags[chatId] = [...currentTags, newTag];
          await saveTags(tags);
          refreshUI();
        }
      }
    });
    menu.appendChild(addTagItem);

    if (currentTags.filter(t => t !== 'deleted').length > 0) {
      const removeTagItem = document.createElement('div');
      removeTagItem.className = 'gt-menu-item';
      removeTagItem.textContent = 'Remove Tag';
      removeTagItem.addEventListener('click', async () => {
        removeContextMenu();
        const nonDeletedTags = currentTags.filter(t => t !== 'deleted');
        const tagToRemove = prompt(`Current tags: ${nonDeletedTags.join(', ')}\nEnter tag to remove:`);
        if (tagToRemove) {
          const tag = tagToRemove.trim().toLowerCase();
          if (nonDeletedTags.includes(tag)) {
            tags[chatId] = currentTags.filter(t => t !== tag);
            await saveTags(tags);
            refreshUI();
          }
        }
      });
      menu.appendChild(removeTagItem);
    }

    const deleteItem = document.createElement('div');
    deleteItem.className = 'gt-menu-item gt-delete-item';
    const hasDeletedTag = currentTags.includes('deleted');
    deleteItem.textContent = hasDeletedTag ? 'Restore Chat' : 'Delete Chat';
    deleteItem.addEventListener('click', async () => {
      removeContextMenu();
      if (hasDeletedTag) {
        tags[chatId] = currentTags.filter(t => t !== 'deleted');
      } else {
        tags[chatId] = [...currentTags.filter(t => t !== 'deleted'), 'deleted'];
      }
      await saveTags(tags);
      refreshUI();
    });
    menu.appendChild(deleteItem);

    document.body.appendChild(menu);

    const menuRect = menu.getBoundingClientRect();
    if (menuRect.right > window.innerWidth) {
      menu.style.left = `${window.innerWidth - menuRect.width - 10}px`;
    }
    if (menuRect.bottom > window.innerHeight) {
      menu.style.top = `${window.innerHeight - menuRect.height - 10}px`;
    }
  });
}

function removeContextMenu(): void {
  const existing = document.getElementById('gt-context-menu');
  if (existing) existing.remove();
}

async function refreshUI(): Promise<void> {
  const tags = await getTags();
  const allTagArrays = Object.values(tags);
  
  const container = document.querySelector('.conversation-items-container');
  let filterBar = document.getElementById('gt-filter-bar');
  
  // Get existing tags from filter bar to compare
  const existingTagBtns = filterBar?.querySelectorAll('.gt-filter-btn');
  const existingTags = new Set<string>();
  existingTagBtns?.forEach(btn => {
    const text = (btn as HTMLButtonElement).textContent?.toLowerCase().trim();
    if (text && text !== 'all' && text !== 'deleted') {
      existingTags.add(text);
    }
  });
  
  // Get new unique tags from storage
  const newUniqueTags = new Set<string>();
  allTagArrays.forEach(chatTags => {
    chatTags.forEach(tag => {
      if (tag !== 'deleted') newUniqueTags.add(tag);
    });
  });
  
  // Check if tags changed
  let tagsChanged = false;
  if (existingTags.size !== newUniqueTags.size) {
    tagsChanged = true;
  } else {
    for (const tag of newUniqueTags) {
      if (!existingTags.has(tag)) {
        tagsChanged = true;
        break;
      }
    }
  }
  
  // Recreate filter bar if tags changed or it doesn't exist
  if (!filterBar && container) {
    filterBar = createFilterBar(activeFilters, allTagArrays);
    container.insertBefore(filterBar, container.firstChild);
  } else if (tagsChanged && container) {
    filterBar?.remove();
    filterBar = createFilterBar(activeFilters, allTagArrays);
    container.insertBefore(filterBar, container.firstChild);
  } else {
    updateFilterButtonStates();
  }
  
  applyFilter();
}

function setupObserver(): void {
  let debounceTimer: ReturnType<typeof setTimeout>;
  
  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      refreshUI();
    }, 200);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

export default defineContentScript({
  matches: ['*://gemini.google.com/*'],
  main() {
    console.log('Gemini Tagger: Content script loaded');

    document.addEventListener('contextmenu', (e) => {
      const target = e.target as HTMLElement;
      const conversation = target.closest<HTMLAnchorElement>('a[data-test-id="conversation"]');
      
      if (conversation) {
        e.preventDefault();
        const chatId = getChatIdFromHref(conversation.href);
        if (chatId) {
          createContextMenu(chatId, e.clientX, e.clientY);
        }
      }
    });

    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#gt-context-menu')) {
        removeContextMenu();
      }
    });

    setupObserver();
    
    setTimeout(() => refreshUI(), 1000);
  },
});
