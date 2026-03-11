import { defineContentScript } from '#imports';
import './content/styles.css';

interface ChatTags {
  [chatId: string]: string[];
}

const STORAGE_KEY = 'chatTags';
const TAG_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#ef4444', // red
  '#eab308', // yellow
  '#a855f7', // purple
  '#f97316', // orange
  '#ec4899', // pink
  '#14b8a6', // teal
];

function getTagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

function getChatIdFromHref(href: string): string | null {
  const match = href.match(/\/app\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

async function getTags(): Promise<ChatTags> {
  const result = await browser.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || {};
}

async function saveTags(tags: ChatTags): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: tags });
}

function createTagElement(tag: string): HTMLElement {
  const span = document.createElement('span');
  span.className = 'gt-tag';
  span.textContent = tag;
  span.style.backgroundColor = getTagColor(tag);
  return span;
}

function createFilterBar(activeFilter: string, allTags: string[]): HTMLElement {
  const container = document.createElement('div');
  'gt-filter-bar container.className =';
  container.id = 'gt-filter-bar';

  const allBtn = document.createElement('button');
  allBtn.className = `gt-filter-btn ${activeFilter === 'all' ? 'active' : ''}`;
  allBtn.textContent = 'All';
  allBtn.addEventListener('click', () => setFilter('all'));
  container.appendChild(allBtn);

  const uniqueTags = new Set<string>();
  allTags.forEach(chatTags => {
    chatTags.forEach(tag => uniqueTags.add(tag));
  });

  uniqueTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = `gt-filter-btn ${activeFilter === tag ? 'active' : ''}`;
    btn.textContent = tag;
    btn.style.setProperty('--tag-color', getTagColor(tag));
    btn.addEventListener('click', () => setFilter(tag));
    container.appendChild(btn);
  });

  const deletedBtn = document.createElement('button');
  deletedBtn.className = `gt-filter-btn gt-deleted-btn ${activeFilter === 'deleted' ? 'active' : ''}`;
  deletedBtn.textContent = 'Deleted';
  deletedBtn.addEventListener('click', () => setFilter('deleted'));
  container.appendChild(deletedBtn);

  return container;
}

let currentFilter = 'all';

async function setFilter(filter: string): Promise<void> {
  currentFilter = filter;
  const tags = await getTags();
  const allTagArrays = Object.values(tags);
  
  const filterBar = document.getElementById('gt-filter-bar');
  if (filterBar) {
    const newFilterBar = createFilterBar(filter, allTagArrays);
    filterBar.replaceWith(newFilterBar);
  }

  applyFilter();
}

function applyFilter(): void {
  const conversations = document.querySelectorAll<HTMLAnchorElement>('a[data-test-id="conversation"]');
  const tags = document.querySelectorAll('.gt-tag');
  
  tags.forEach(tagEl => tagEl.remove());

  getTags().then(tagsMap => {
    conversations.forEach(conv => {
      const chatId = getChatIdFromHref(conv.href);
      if (!chatId) return;

      const chatTags = tagsMap[chatId] || [];
      const hasDeletedTag = chatTags.includes('deleted');

      let shouldShow = true;

      if (currentFilter === 'deleted') {
        shouldShow = hasDeletedTag;
      } else if (currentFilter === 'all') {
        shouldShow = !hasDeletedTag;
      } else {
        shouldShow = chatTags.includes(currentFilter) && !hasDeletedTag;
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

    if (currentTags.length > 0) {
      const removeTagItem = document.createElement('div');
      removeTagItem.className = 'gt-menu-item';
      removeTagItem.textContent = 'Remove Tag';
      removeTagItem.addEventListener('click', async () => {
        removeContextMenu();
        const tagToRemove = prompt(`Current tags: ${currentTags.join(', ')}\nEnter tag to remove:`);
        if (tagToRemove) {
          const tag = tagToRemove.trim().toLowerCase();
          if (currentTags.includes(tag)) {
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
  
  let filterBar = document.getElementById('gt-filter-bar');
  if (!filterBar) {
    const container = document.querySelector('.conversation-items-container');
    if (container) {
      filterBar = createFilterBar(currentFilter, allTagArrays);
      container.insertBefore(filterBar, container.firstChild);
    }
  } else {
    const newFilterBar = createFilterBar(currentFilter, allTagArrays);
    filterBar.replaceWith(newFilterBar);
  }

  applyFilter();
}

function setupObserver(): void {
  let debounceTimer: ReturnType<typeof setTimeout>;
  
  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      refreshUI();
    }, 500);
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
