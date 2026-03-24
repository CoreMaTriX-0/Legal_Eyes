/**
 * Chat History Utility
 * Manages chat sessions in localStorage for persistence.
 */

const STORAGE_KEY = 'legal_eyes_chat_history';

/**
 * Get all chat sessions, sorted by most recent first.
 */
export function getAllChats() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const chats = data ? JSON.parse(data) : [];
    return chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  } catch {
    return [];
  }
}

/**
 * Get a single chat session by ID.
 */
export function getChat(id) {
  const chats = getAllChats();
  return chats.find(c => c.id === id) || null;
}

/**
 * Save (create or update) a chat session.
 */
export function saveChat(chat) {
  const chats = getAllChats();
  const idx = chats.findIndex(c => c.id === chat.id);
  const now = new Date().toISOString();

  const updated = {
    ...chat,
    updatedAt: now,
    createdAt: chat.createdAt || now,
    title: chat.title || generateTitle(chat.messages),
  };

  if (idx >= 0) {
    chats[idx] = updated;
  } else {
    chats.unshift(updated);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  return updated;
}

/**
 * Delete a chat session by ID.
 */
export function deleteChat(id) {
  const chats = getAllChats().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

/**
 * Update a chat session's title.
 */
export function updateChatTitle(id, newTitle) {
  const chats = getAllChats();
  const idx = chats.findIndex(c => c.id === id);
  if (idx >= 0) {
    chats[idx].title = newTitle;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  }
}

/**
 * Clear all chat history.
 */
export function clearAllChats() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Auto-generate a title from the first user message or document.
 */
export function generateTitle(messages) {
  if (!messages || messages.length === 0) return 'New Chat';
  const first = messages.find(m => m.role === 'user');
  if (!first) return 'New Chat';
  
  if (first.fileData?.name) {
    // Remove extension for a cleaner title
    return first.fileData.name.replace(/\.[^/.]+$/, "");
  }
  
  const text = first.text || '';
  return text.length > 50 ? text.substring(0, 50) + '…' : text || 'New Chat';
}

/**
 * Generate a unique chat ID.
 */
export function generateChatId() {
  return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Group chats by date category.
 */
export function groupChatsByDate(chats) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const groups = {
    'Today': [],
    'Yesterday': [],
    'Last 7 Days': [],
    'Older': [],
  };

  chats.forEach(chat => {
    const chatDate = new Date(chat.updatedAt);
    if (chatDate >= today) {
      groups['Today'].push(chat);
    } else if (chatDate >= yesterday) {
      groups['Yesterday'].push(chat);
    } else if (chatDate >= lastWeek) {
      groups['Last 7 Days'].push(chat);
    } else {
      groups['Older'].push(chat);
    }
  });

  return groups;
}
