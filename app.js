/**
 * app.js – TODO-sovelluksen logiikka
 * Käyttää vain nativia JavaScriptiä ja localStorage:a.
 */

'use strict';

/* =========================================
   Vakiot ja apumuuttujat
   ========================================= */

const STORAGE_KEY = 'todo_tasks_v1';
const THEME_KEY   = 'todo_theme';
const MIN_LENGTH  = 3; // Tehtävän minimipituus merkeissä

/* =========================================
   DOM-viittaukset
   ========================================= */

const form          = document.getElementById('todo-form');
const taskInput     = document.getElementById('task-input');
const taskError     = document.getElementById('task-error');
const prioritySelect = document.getElementById('priority-select');
const dueDateInput  = document.getElementById('due-date');
const importantCheck = document.getElementById('important-check');
const addBtn        = document.getElementById('add-btn');

const todoList      = document.getElementById('todo-list');
const emptyState    = document.getElementById('empty-state');

const countAll      = document.getElementById('count-all');
const countActive   = document.getElementById('count-active');
const countDone     = document.getElementById('count-done');

const filterBtns    = document.querySelectorAll('.filter-btn');
const clearDoneBtn  = document.getElementById('clear-done-btn');
const themeToggle   = document.getElementById('theme-toggle');
const toast         = document.getElementById('toast');

/* =========================================
   Tila (state)
   ========================================= */

let tasks         = [];   // Kaikki tehtävät
let activeFilter  = 'all'; // Aktiivinen suodatin
let toastTimer    = null;

/* =========================================
   Teema (dark / light mode)
   ========================================= */

/**
 * Ladataan tallennettu teema localStoragesta ja asetetaan se sivulle.
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
  showToast(next === 'dark' ? 'Dark mode käytössä 🌙' : 'Light mode käytössä ☀️');
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

  // Tyhjä kenttä
  if (value === '') {
    showInputError(taskInput, taskError, 'Tehtävä ei voi olla tyhjä.');
    return false;
  }

  // Liian lyhyt
  if (value.length < MIN_LENGTH) {
    showInputError(
      taskInput,
      taskError,
      `Tehtävän tulee olla vähintään ${MIN_LENGTH} merkkiä pitkä.`
    );
    return false;
  }

  // Kaikki ok
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
    dueDate:   dueDate,    // 'YYYY-MM-DD' tai ''
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
  tasks.unshift(task); // Uusin ensin
  saveTasks();
  renderList();
  updateStats();
  showToast('Tehtävä lisätty ✓');
}

/**
 * Poistaa tehtävän id:n perusteella.
 */
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderList();
  updateStats();
  showToast('Tehtävä poistettu');
}

/**
 * Vaihtaa tehtävän done-tilan.
 */
function toggleDone(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  saveTasks();
  renderList();
  updateStats();
  showToast(task.done ? 'Merkitty tehdyksi ✓' : 'Merkitty avoimeksi');
}

/**
 * Poistaa kaikki tehdyt tehtävät.
 */
function clearDone() {
  const count = tasks.filter(t => t.done).length;
  if (count === 0) {
    showToast('Ei tehtyjä tehtäviä poistettavaksi');
    return;
  }
  tasks = tasks.filter(t => !t.done);
  saveTasks();
  renderList();
  updateStats();
  showToast(`Poistettu ${count} tehtyä tehtävää`);
}

/* =========================================
   Suodatus
   ========================================= */

/**
 * Palauttaa tehtävät aktiivisen suodattimen mukaan.
 */
function getFilteredTasks() {
  switch (activeFilter) {
    case 'active':    return tasks.filter(t => !t.done);
    case 'done':      return tasks.filter(t => t.done);
    case 'important': return tasks.filter(t => t.important);
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
  toggleBtn.setAttribute('aria-label', task.done ? 'Merkitse avoimeksi' : 'Merkitse tehdyksi');
  toggleBtn.title = task.done ? 'Merkitse avoimeksi' : 'Merkitse tehdyksi';
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
  const priorityLabels = { high: 'Korkea', normal: 'Normaali', low: 'Matala' };
  priorityBadge.textContent = priorityLabels[task.priority] || task.priority;
  meta.appendChild(priorityBadge);

  // Tärkeä-badge
  if (task.important) {
    const importantBadge = document.createElement('span');
    importantBadge.className = 'badge badge-important';
    importantBadge.textContent = '⭐ Tärkeä';
    meta.appendChild(importantBadge);
  }

  // Päivämäärä-badge
  if (task.dueDate) {
    const dateBadge = document.createElement('span');
    const today     = new Date().toISOString().slice(0, 10);
    const isOverdue = !task.done && task.dueDate < today;
    dateBadge.className = `badge ${isOverdue ? 'badge-overdue' : 'badge-date'}`;
    dateBadge.textContent = (isOverdue ? '⚠ Myöhässä: ' : '📅 ') + formatDate(task.dueDate);
    meta.appendChild(dateBadge);
  }

  content.appendChild(textEl);
  content.appendChild(meta);

  // --- Poistonappi ---
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.setAttribute('aria-label', 'Poista tehtävä');
  deleteBtn.title = 'Poista tehtävä';
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
  const done   = tasks.filter(t => t.done).length;
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
  // Pieni viive, jotta CSS-siirtymä käynnistyy
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
 * Muotoilee ISO-päivämäärän suomalaiseen muotoon (pp.kk.vvvv).
 */
function formatDate(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}.${m}.${y}`;
}

/* =========================================
   Tapahtumankuuntelijat
   ========================================= */

// Lomakkeen lähetys (Lisää tehtävä)
form.addEventListener('submit', function (e) {
  e.preventDefault();

  if (!validateTaskInput()) return;

  const text      = taskInput.value.trim();
  const priority  = prioritySelect.value;
  const dueDate   = dueDateInput.value;
  const important = importantCheck.checked;

  addTask(text, priority, dueDate, important);

  // Nollataan lomake
  taskInput.value      = '';
  dueDateInput.value   = '';
  importantCheck.checked = false;
  prioritySelect.value = 'normal';
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

// Poista tehdyt -nappi
clearDoneBtn.addEventListener('click', clearDone);

// Teema-toggli
themeToggle.addEventListener('click', toggleTheme);

/* =========================================
   Käynnistys
   ========================================= */

loadTheme();
loadTasks();
renderList();
updateStats();
