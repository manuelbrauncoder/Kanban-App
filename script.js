const STORAGE_TOKEN = 'JITKBPP9J3Q9B7BIWJLFFQ7TFLUKRYW0QGHSN76I';
const STORAGE_URL = 'https://remote-storage.developerakademie.org/item';

async function init() {
    await loadTodos();
    updateHTML();
}

let todos = [];

let currentElementToDrag;


function updateHTML() {
    let backlogContainer = document.getElementById('backlog');
    backlogContainer.innerHTML = '';
    let backlog = todos.filter(b => b['category'] == 'backlog');
    
    for (let i = 0; i < backlog.length; i++) {
        const todo = backlog[i];
        backlogContainer.innerHTML += printToDo(todo);
    }

    let activeContainer = document.getElementById('active');
    activeContainer.innerHTML = '';
    let active = todos.filter(a => a['category'] == 'active');

    for (let i = 0; i < active.length; i++) {
        const todo = active[i];
        activeContainer.innerHTML += printToDo(todo);
    }

    let completeContainer = document.getElementById('complete');
    completeContainer.innerHTML = '';
    let complete = todos.filter(c => c['category'] == 'complete');

    for (let i = 0; i < complete.length; i++) {
        const todo = complete[i];
        completeContainer.innerHTML += printToDo(todo);
    }

}

function printToDo(todo) {
    return /*html*/ `
    <div draggable="true" ondragstart="startDragging(${todo['id']})" class="toDoBox">
        <div><u>${todo['title']}</u></div>
        <div>${todo['description']}</div>
    </div>
    `;
}

function startDragging(id) {
    currentElementToDrag = id;
}

async function moveTo(category) {
    todos[currentElementToDrag]['category'] = category;
    removeHighlight(category);
    updateHTML();
    await saveTodos();
}

function allowDrop(ev) {
    ev.preventDefault();
}

function removeHighlight(id) {
    document.getElementById(id).classList.remove('highlight')
}

function addHighlight(id) {
    document.getElementById(id).classList.add('highlight')
}

function showAddWindow() {
    document.getElementById('addWindow').classList.remove('d-none');
    document.getElementById('backlog').classList.add('d-none');
}

function hideAddWindow() {
    document.getElementById('addWindow').classList.add('d-none');
    document.getElementById('backlog').classList.remove('d-none');
}

async function addTodo() {
    let title = document.getElementById('title');
    let description = document.getElementById('description');
    let id = todos.length 
    let todo = {
        'id': id,
        'title': title.value,
        'description': description.value,
        'category': 'backlog'
    }
    todos.push(todo);
    updateHTML();
    hideAddWindow();
    await saveTodos();
    title.value = '';
    description.value = '';
}

async function loadTodos() {
    try {
        const storedData = await getItem('todos');
        if(storedData) {
            todos = JSON.parse(storedData);
        } else {
            console.warn('Key not exist');
        } 
    } catch(e) {
        console.error('loading error:', e);
    }
}

async function saveTodos() {
    await setItem('todos', JSON.stringify(todos));
}


async function setItem(key, value) {
    const payload = { key, value, token: STORAGE_TOKEN };
    return fetch(STORAGE_URL, { method: 'POST', body: JSON.stringify(payload) })
    .then(res => res.json());
}

async function getItem(key) {
    const url = `${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`;
    return fetch(url).then(res => res.json()).then(res => {
        if (res.data) {
            return res.data.value;
        } throw `Could not find data with key "${key}.`;
    });
}