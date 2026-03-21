/**
 * app.js – TODO-sovelluksen logiikka
 * Käyttää vain nativia JavaScriptiä ja localStorage:a.
 * Tukee suomen ja englannin kieltä (i18n).
 */

'use strict';

/* =========================================
   Vakiot
   ========================================= */

const STORAGE_KEY = 'todo_tasks_v1';
const THEME_KEY   = 'todo_theme';
const LANG_KEY    = 'todo_lang';
const MIN_LENGTH  = 3;

/* =========================================
   Käännökset (i18n)
   ========================================= */

const translations = {
  fi: {
    'page-title':        'TODO – Tehtävälista',
    'app-title':         '📋 Tehtävälista',
    'app-subtitle':      'Hallitse päivittäiset tehtäväsi',
    'label-task':        'Tehtävä',
    'placeholder-task':  'Kirjoita tehtävä tähän...',
    'label-priority':    'Prioriteetti',
    'opt-normal':        'Normaali',
    'opt-high':          'Korkea 🔴',
    'opt-low':           'Matala 🟢',
    'label-due-date':    'Määräpäivä (valinnainen)',
    'label-important':   'Merkitse tärkeäksi ⭐',
    'btn-add':           '+ Lisää tehtävä',
    'stat-total':        'Yhteensä',
    'stat-active':       'Avoinna',
    'stat-done':         'Tehty',
    'filter-all':        'Kaikki',
    'filter-active':     'Avoinna',
    'filter-done':       'Tehty',
    'filter-important':  'Tärkeät ⭐',
    'btn-clear-done':    '🗑 Poista tehdyt',
    'title-clear-done':  'Poista kaikki tehdyt',
    'empty-text':        'Ei tehtäviä näytettäväksi.',
    'aria-add-section':  'Lisää uusi tehtävä',
    'aria-stats':        'Tilastot',
    'aria-filters':      'Suodata tehtäviä',
    'aria-todo-list':    'Tehtävälista',
    'aria-theme':        'Vaihda teema',
    'err-empty':         'Tehtävä ei voi olla tyhjä.',
    'err-short':         (n) => `Tehtävän tulee olla vähintään ${n} merkkiä pitkä.`,
    'toast-added':       'Tehtävä lisätty ✓',
    'toast-deleted':     'Tehtävä poistettu',
    'toast-done':        'Merkitty tehdyksi ✓',
    'toast-active':      'Merkitty avoimeksi',
    'toast-no-done':     'Ei tehtyjä tehtäviä poistettavaksi',
    'toast-cleared':     (n) => `Poistettu ${n} tehtyä tehtävää`,
    'toast-dark':        'Dark mode käytössä 🌙',
    'toast-light':       'Light mode käytössä ☀️',
    'toast-lang':        'Kieli vaihdettu: Suomi 🇫🇮',
    'badge-high':        'Korkea',
    'badge-normal':      'Normaali',
    'badge-low':         'Matala',
    'badge-important':   '⭐ Tärkeä',
    'badge-overdue':     '⚠ Myöhässä: ',
    'badge-date':        '📅 ',
    'aria-mark-done':    'Merkitse tehdyksi',
    'aria-mark-active':  'Merkitse avoimeksi',
    'aria-delete':       'Poista tehtävä',
    'title-delete':      'Poista tehtävä',
    'lang-btn-label':    'EN',
  },
  en: {
    'page-title':        'TODO – Task List',
    'app-title':         '📋 Task List',
    'app-subtitle':      'Manage your daily tasks',
    'label-task':        'Task',
    'placeholder-task':  'Write your task here...',
    'label-priority':    'Priority',
    'opt-normal':        'Normal',
    'opt-high':          'High 🔴',
    'opt-low':           'Low 🟢',
    'label-due-date':    'Due date (optional)',
    'label-important':   'Mark as important ⭐',
    'btn-add':           '+ Add task',
    'stat-total':        'Total',
    'stat-active':       'Active',
    'stat-done':         'Done',
    'filter-all':        'All',
    'filter-active':     'Active',
    'filter-done':       'Done',
    'filter-important':  'Important ⭐',
    'btn-clear-done':    '🗑 Clear done',
    'title-clear-done':  'Remove all done tasks',
    'empty-text':        'No tasks to show.',
    'aria-add-section':  'Add new task',
    'aria-stats':        'Statistics',
    'aria-filters':      'Filter tasks',
    'aria-todo-list':    'Task list',
    'aria-theme':        'Toggle theme',
    'err-empty':         'Task cannot be empty.',
    'err-short':         (n) => `Task must be at least ${n} characters long.`,
    'toast-added':       'Task added ✓',
    'toast-deleted':     'Task deleted',
    'toast-done':        'Marked as done ✓',
    'toast-active':      'Marked as active',
    'toast-no-done':     'No completed tasks to remove',
    'toast-cleared':     (n) => `Removed ${n} completed task(s)`,
    'toast-dark':        'Dark mode enabled 🌙',
    'toast-light':       'Light mode enabled ☀️',
    'toast-lang':        'Language changed: English 🇬🇧',
    'badge-high':        'High',
    'badge-normal':      'Normal',
    'badge-low':         'Low',
    'badge-important':   '⭐ Important',
    'badge-overdue':     '⚠ Overdue: ',
    'badge-date':        '📅 ',
    'aria-mark-done':    'Mark as done',
    'aria-mark-active':  'Mark as active',
    'aria-delete':       'Delete task',
    'title-delete':      'Delete task',
    'lang-btn-label':    'FI',
  }
};

/**
 * Palauttaa käännetyn merkkijonon nykyisellä kielellä.
 * Tukee funktiomuotoisia käännöksiä parametreilla.
 */
function t(key, ...args) {
  const val = translations[currentLang][key] || translations['fi'][key] || key;
  return typeof val === 'function' ? val(...args) : val;
}

/* =========================================
   DOM-viittaukset
   ========================================= */

const form           = document.getElementById('todo-form');
const taskInput      = document.getElementById('task-input');
const taskError      = document.getElementById('task-error');
const prioritySelect = document.getElementById('priority-select');
const dueDateInput   = document.getElementById('due-date');
const importantCheck = document.getElementById('important-check');
const addBtn         = document.getElementById('add-btn');

const todoList   = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');

const countAll    = document.getElementById('count-all');
const countActive = document.getElementById('count-active');
const countDone   = document.getElementById('count-done');

const filterBtns   = document.querySelectorAll('.filter-btn');
const clearDoneBtn = document.getElementById('clear-done-btn');
const themeToggle  = document.getElementById('theme-toggle');
const langToggle   = document.getElementById('lang-toggle');
const toast        = document.getElementById('toast');

/* =========================================
   Tila (state)
   ========================================= */

let tasks        = [];
let activeFilter = 'all';
let currentLang  = 'fi';
let toastTimer   = null;

/* =========================================
   Kieli (i18n)
   ========================================= */

/**
 * Ladataan tallennettu kieli localStoragesta ja päivitetään UI.
 */
function loadLanguage() {
  currentLang = localStorage.getItem(LANG_KEY) || 'fi';
  applyLanguage();
}

/**
 * Vaihtaa kielen fi ↔ en, tallentaa ja päivittää UI.
 */
function toggleLanguage() {
  currentLang = currentLang === 'fi' ? 'en' : 'fi';
  localStorage.setItem(LANG_KEY, currentLang);
  applyLanguage();
  renderList(); // Päivitetään badget ym. dynaamiset tekstit
  showToast(t('toast-lang'));
}

/**
 * Päivittää kaikki käännetyt tekstit sivulla.
 */
function applyLanguage() {
  // <html lang>
  document.documentElement.lang = currentLang;

  // <title>
  document.title = t('page-title');

  // data-i18n: tekstisisältö
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  // data-i18n-placeholder: kentän placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  // Aria-labelit osioille
  document.getElementById('add-section').setAttribute('aria-label', t('aria-add-section'));
  document.getElementById('stats-section').setAttribute('aria-label', t('aria-stats'));
  document.getElementById('filter-group').setAttribute('aria-label', t('aria-filters'));
  todoList.setAttribute('aria-label', t('aria-todo-list'));

  // Teema-napin aria-label
  themeToggle.setAttribute('aria-label', t('aria-theme'));

  // Clear done -napin title
  clearDoneBtn.setAttribute('title', t('title-clear-done'));

  // Lang-napin teksti (näyttää mihin kieleen vaihdetaan)
  langToggle.textContent = t('lang-btn-label');
}

/* =========================================
   Teema (dark / light mode)
   ========================================= */

/**
 * Ladataan tallennettu teema localStoragesta.
 */
function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.dataset.theme = saved;
  themeToggle.textContent = saved === 'dark' ? '☀️' : '🌙';
}

/**
 * Vaihtaa teeman light ↔ dark ja tallentaa valinnan.
 */
function toggleTheme() {
  const current = document.documentElement.dataset.theme;
  const next    = current === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem(THEME_KEY, next);
  themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
  showToast(next === 'dark' ? t('toast-dark') : t('toast-light'));
}

/* =========================================
   LocalStorage – luku ja tallennus
   ========================================= */

/**
 * Ladataan tehtävät localStoragesta ohjelman käynnistyessä.
 */
function loadTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    tasks = stored ? JSON.parse(stored) : [];
  } catch (e) {
    tasks = [];
  }
}

/**
 * Tallennetaan tehtävät localStorageen aina kun lista muuttuu.
 */
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/* =========================================
   Validointi
   ========================================= */

/**
 * Tarkistaa tehtäväkentän arvon.
 * Palauttaa true jos ok, false jos virhe.
 */
function validateTaskInput() {
  const value = taskInput.value.trim();

  if (value === '') {
    showInputError(taskInput, taskError, t('err-empty'));
    return false;
  }

  if (value.length < MIN_LENGTH) {
    showInputError(taskInput, taskError, t('err-short', MIN_LENGTH));
    return false;
  }

  clearInputError(taskInput, taskError);
  return true;
}

/**
 * Näyttää virheilmoituksen ja korostaa kentän punaisella.
 */
function showInputError(inputEl, errorEl, message) {
  inputEl.classList.add('input-error');
  errorEl.textContent = message;
  inputEl.setAttribute('aria-invalid', 'true');
}

/**
 * Poistaa virheilmoituksen ja korostuksen.
 */
function clearInputError(inputEl, errorEl) {
  inputEl.classList.remove('input-error');
  errorEl.textContent = '';
  inputEl.removeAttribute('aria-invalid');
}

/* =========================================
   Tehtävien hallinta (CRUD)
   ========================================= */

/**
 * Luo uuden tehtävä-objektin.
 */
function createTask(text, priority, dueDate, important) {
  return {
    id:        Date.now().toString(),
    text:      text,
    priority:  priority,
    dueDate:   dueDate,
    important: important,
    done:      false,
    createdAt: new Date().toISOString()
  };
}

/**
 * Lisää uuden tehtävän listaan.
 */
function addTask(text, priority, dueDate, important) {
  const task = createTask(text, priority, dueDate, important);
  tasks.unshift(task);
  saveTasks();
  renderList();
  updateStats();
  showToast(t('toast-added'));
}

/**
 * Poistaa tehtävän id:n perusteella.
 */
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderList();
  updateStats();
  showToast(t('toast-deleted'));
}

/**
 * Vaihtaa tehtävän done-tilan.
 */
function toggleDone(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;
  task.done = !task.done;
  saveTasks();
  renderList();
  updateStats();
  showToast(task.done ? t('toast-done') : t('toast-active'));
}

/**
 * Poistaa kaikki tehdyt tehtävät.
 */
function clearDone() {
  const count = tasks.filter(item => item.done).length;
  if (count === 0) {
    showToast(t('toast-no-done'));
    return;
  }
  tasks = tasks.filter(item => !item.done);
  saveTasks();
  renderList();
  updateStats();
  showToast(t('toast-cleared', count));
}

/* =========================================
   Suodatus
   ========================================= */

/**
 * Palauttaa tehtävät aktiivisen suodattimen mukaan.
 */
function getFilteredTasks() {
  switch (activeFilter) {
    case 'active':    return tasks.filter(item => !item.done);
    case 'done':      return tasks.filter(item => item.done);
    case 'important': return tasks.filter(item => item.important);
    default:          return tasks;
  }
}

/* =========================================
   Renderöinti
   ========================================= */

/**
 * Renderöi listan nykyisten suodatettujen tehtävien mukaan.
 */
function renderList() {
  const filtered = getFilteredTasks();
  todoList.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    filtered.forEach(task => {
      todoList.appendChild(createTaskElement(task));
    });
  }
}

/**
 * Rakentaa yhden tehtävärivin DOM-elementin.
 */
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'todo-item' + (task.done ? ' done' : '');
  li.dataset.id = task.id;
  li.dataset.priority = task.priority;

  // --- Valmistumisnappi ---
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'toggle-btn';
  toggleBtn.setAttribute('aria-label', task.done ? t('aria-mark-active') : t('aria-mark-done'));
  toggleBtn.title = task.done ? t('aria-mark-active') : t('aria-mark-done');
  toggleBtn.innerHTML = task.done ? '✓' : '';
  toggleBtn.addEventListener('click', () => toggleDone(task.id));

  // --- Sisältö ---
  const content = document.createElement('div');
  content.className = 'todo-content';

  const textEl = document.createElement('span');
  textEl.className = 'todo-text';
  textEl.textContent = task.text;

  const meta = document.createElement('div');
  meta.className = 'todo-meta';

  // Prioriteetti-badge
  const priorityBadge = document.createElement('span');
  priorityBadge.className = `badge badge-${task.priority}`;
  priorityBadge.textContent = t(`badge-${task.priority}`);
  meta.appendChild(priorityBadge);

  // Tärkeä-badge
  if (task.important) {
    const importantBadge = document.createElement('span');
    importantBadge.className = 'badge badge-important';
    importantBadge.textContent = t('badge-important');
    meta.appendChild(importantBadge);
  }

  // Päivämäärä-badge
  if (task.dueDate) {
    const dateBadge = document.createElement('span');
    const today     = new Date().toISOString().slice(0, 10);
    const isOverdue = !task.done && task.dueDate < today;
    dateBadge.className = `badge ${isOverdue ? 'badge-overdue' : 'badge-date'}`;
    dateBadge.textContent = (isOverdue ? t('badge-overdue') : t('badge-date')) + formatDate(task.dueDate);
    meta.appendChild(dateBadge);
  }

  content.appendChild(textEl);
  content.appendChild(meta);

  // --- Poistonappi ---
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.setAttribute('aria-label', t('aria-delete'));
  deleteBtn.title = t('title-delete');
  deleteBtn.innerHTML = '🗑';
  deleteBtn.addEventListener('click', () => deleteTask(task.id));

  li.appendChild(toggleBtn);
  li.appendChild(content);
  li.appendChild(deleteBtn);

  return li;
}

/* =========================================
   Tilastot
   ========================================= */

/**
 * Päivittää laskurit.
 */
function updateStats() {
  const total  = tasks.length;
  const done   = tasks.filter(item => item.done).length;
  const active = total - done;

  countAll.textContent    = total;
  countActive.textContent = active;
  countDone.textContent   = done;
}

/* =========================================
   Toast-ilmoitus
   ========================================= */

/**
 * Näyttää lyhyen toast-ilmoituksen.
 */
function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.remove('hidden');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 320);
  }, 2200);
}

/* =========================================
   Apufunktiot
   ========================================= */

/**
 * Muotoilee ISO-päivämäärän muotoon pp.kk.vvvv.
 */
function formatDate(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}.${m}.${y}`;
}

/* =========================================
   Tapahtumankuuntelijat
   ========================================= */

// Lomakkeen lähetys
form.addEventListener('submit', function (e) {
  e.preventDefault();

  if (!validateTaskInput()) return;

  const text      = taskInput.value.trim();
  const priority  = prioritySelect.value;
  const dueDate   = dueDateInput.value;
  const important = importantCheck.checked;

  addTask(text, priority, dueDate, important);

  taskInput.value        = '';
  dueDateInput.value     = '';
  importantCheck.checked = false;
  prioritySelect.value   = 'normal';
  clearInputError(taskInput, taskError);
  taskInput.focus();
});

// Poistetaan virhekorostus kun käyttäjä alkaa kirjoittaa
taskInput.addEventListener('input', function () {
  if (taskInput.classList.contains('input-error')) {
    clearInputError(taskInput, taskError);
  }
});

// Suodatinnapit
filterBtns.forEach(btn => {
  btn.addEventListener('click', function () {
    filterBtns.forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    activeFilter = this.dataset.filter;
    renderList();
  });
});

// Poista tehdyt
clearDoneBtn.addEventListener('click', clearDone);

// Teema-toggli
themeToggle.addEventListener('click', toggleTheme);

// Kielitoggli
langToggle.addEventListener('click', toggleLanguage);

/* =========================================
   Käynnistys
   ========================================= */

loadTheme();
loadLanguage();
loadTasks();
renderList();
updateStats();
