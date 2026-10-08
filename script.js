const STORAGE_KEY = 'todo.tasks.v1';

let tasks = loadTasks();
let currentFilter = 'all';

const form       = document.getElementById('task-form');
const input      = document.getElementById('task-input');
const listEl     = document.getElementById('task-list');
const counterEl  = document.getElementById('counter');
const clearBtn   = document.getElementById('clear-completed');
const filterBtns = document.querySelectorAll('.filter-btn');
const toastEl    = document.getElementById('toast');

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

const formatDate = (iso) =>
  new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });

let toastTimer;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
}

function plural(n, one, few, many) {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

function getVisibleTasks() {
  if (currentFilter === 'active')    return tasks.filter(t => !t.completed);
  if (currentFilter === 'completed') return tasks.filter(t =>  t.completed);
  return tasks;
}

function render() {
  const visible = getVisibleTasks();

  listEl.innerHTML = '';

  if (visible.length === 0) {
    const empty = document.createElement('li');
    empty.style.cssText = 'text-align:center;color:#8a90a2;padding:16px;font-size:14px;';
    empty.textContent = tasks.length === 0
      ? 'Список пуст. Добавьте первую задачу!'
      : 'Здесь пока ничего нет.';
    listEl.appendChild(empty);
  } else {
    visible.forEach(task => listEl.appendChild(createTaskElement(task)));
  }

  const active = tasks.filter(t => !t.completed).length;
  counterEl.textContent =
    `Невыполнено: ${active} ${plural(active, 'задача', 'задачи', 'задач')}`;

  filterBtns.forEach(btn =>
    btn.classList.toggle('active', btn.dataset.filter === currentFilter)
  );
}

function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'task-item' + (task.completed ? ' completed' : '');
  li.dataset.id = task.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', () => toggleTask(task.id));

  const body = document.createElement('div');
  body.className = 'task-body';

  const text = document.createElement('span');
  text.className = 'task-text';
  text.textContent = task.text;

  const date = document.createElement('span');
  date.className = 'task-date';
  date.textContent = 'Создано: ' + formatDate(task.createdAt);

  body.append(text, date);

  const del = document.createElement('button');
  del.className = 'delete-btn';
  del.title = 'Удалить';
  del.setAttribute('aria-label', 'Удалить задачу');
  del.textContent = '✕';
  del.addEventListener('click', () => removeTask(task.id, li));

  li.append(checkbox, body, del);
  return li;
}

function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    showToast('Введите текст задачи');
    return;
  }

  const newTask = {
    id: Date.now(),
    text: trimmed,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.unshift(newTask);
  saveTasks();
  render();
  showToast('Задача добавлена ✅');
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
  render();
}

function removeTask(id, li) {
  li.classList.add('removing');
  setTimeout(() => {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
    showToast('Задача удалена 🗑️');
  }, 220);
}

function clearCompleted() {
  if (!tasks.some(t => t.completed)) {
    showToast('Нет выполненных задач');
    return;
  }
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  render();
  showToast('Выполненные задачи очищены 🧹');
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  addTask(input.value);
  input.value = '';
  input.focus();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    render();
  });
});

clearBtn.addEventListener('click', clearCompleted);

render();
input.focus();