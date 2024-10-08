document.body.classList.add('light-theme'); // Define o modo claro como padrão

const taskInput = document.getElementById('new-task');
const addTaskButton = document.getElementById('add-task');
const taskList = document.getElementById('tasks');
const themeToggle = document.getElementById('theme-toggle-btn');
const pendingCount = document.getElementById('pending-count');
const deleteAllButton = document.getElementById('delete-all-tasks');
const confirmDeleteBtn = document.getElementById('confirmDelete');
const cancelDeleteBtn = document.getElementById('cancelDelete');
const deleteModal = document.getElementById('deleteModal'); // Corrigir modal

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let taskToDelete = null;
let currentFilter = 'all'; // Variável para controlar o filtro atual

// Adicionar tarefa
function addTask(taskText) {
    if (!taskText.trim()) { // Verificar se a tarefa não é vazia ou apenas espaços
        showToast('A tarefa não pode ser vazia');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
    };

    tasks.push(task);
    taskInput.value = '';  // Limpar o campo de entrada após adicionar
    saveTasks();
    renderTasks();
    showToast('Tarefa adicionada');
}

// Renderizar lista de tarefas
function renderTasks() {
    taskList.innerHTML = '';

    // Filtrar tarefas com base no filtro atual
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'completed') return task.completed;
        if (currentFilter === 'pending') return !task.completed;
        return true; // Todos
    });

    filteredTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.setAttribute('draggable', true);
        taskItem.dataset.id = task.id;
        taskItem.className = task.completed ? 'completed' : '';
        taskItem.innerHTML = `
            <span>${task.text}</span>
            <div class="task-actions">
                <button class="edit-task">✏️</button>
                <button class="complete-task">✔️</button>
                <button class="delete-task">❌</button>
            </div>
        `;

        // Completar tarefa
        taskItem.querySelector('.complete-task').addEventListener('click', () => {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
            showToast(task.completed ? 'Tarefa concluída' : 'Tarefa marcada como pendente');
        });

        // Editar tarefa
        taskItem.querySelector('.edit-task').addEventListener('click', () => {
            const prompt = document.createElement('div');
            prompt.classList.add('prompt');
            prompt.innerHTML = `
                <input type="text" value="${task.text}" placeholder="Editar tarefa">
                <button>Salvar</button>
            `;
            document.body.appendChild(prompt);

            prompt.querySelector('button').addEventListener('click', () => {
                const newTaskText = prompt.querySelector('input').value;
                if (newTaskText.trim()) {
                    task.text = newTaskText;
                    saveTasks();
                    renderTasks();
                    showToast('Tarefa editada');
                    document.body.removeChild(prompt);
                } else {
                    showToast('A tarefa não pode ser vazia');
                }
            });
        });

        // Excluir tarefa (abrir modal)
        taskItem.querySelector('.delete-task').addEventListener('click', () => {
            openDeleteModal(task.id);
        });

        taskList.appendChild(taskItem);
    });

    updatePendingCount();
}

// Atualizar contador de tarefas pendentes
function updatePendingCount() {
    const pendingTasks = tasks.filter(task => !task.completed);
    pendingCount.textContent = pendingTasks.length;
}

// Salvar tarefas no localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Alternar tema
themeToggle.addEventListener('click', function () {
    document.body.classList.toggle('light-theme'); // Alterna o tema claro
    document.body.classList.toggle('dark-theme');  // Alterna o tema escuro
    updateTasksTheme();
});

function updateTasksTheme() {
    if (document.body.classList.contains('dark-theme')) {
        document.body.classList.remove('light-theme');
    }
}

// Mostrar notificação toast
function showToast(message) {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => toast.classList.remove('show'), 3000);
    setTimeout(() => document.body.removeChild(toast), 3500);  // Remover toast após a animação
}

// Modal de exclusão
function openDeleteModal(taskId) {
    deleteModal.style.display = 'flex';
    taskToDelete = taskId;
}

function closeDeleteModal() {
    deleteModal.style.display = 'none';
    taskToDelete = null;
}

function deleteTask() {
    if (taskToDelete !== null) {
        tasks = tasks.filter(task => task.id !== taskToDelete);
        saveTasks();
        renderTasks();
        closeDeleteModal();
        showToast('Tarefa excluída');
    }
}

// Função para apagar todas as tarefas
function deleteAllTasks() {
    if (tasks.length === 0) {
        showToast('Não há tarefas para excluir');
        return;
    }

    openDeleteModal(null);  // Abre o modal de confirmação para apagar tudo
}

// Evento de confirmação para excluir uma única tarefa ou todas as tarefas
confirmDeleteBtn.addEventListener('click', () => {
    if (taskToDelete !== null) {
        deleteTask(); // Excluir uma tarefa específica
    } else {
        tasks = []; // Limpa o array de tarefas
        saveTasks(); // Salva no localStorage (esvaziando)
        renderTasks(); // Renderiza a lista vazia
        showToast('Todas as tarefas foram excluídas');
        closeDeleteModal();
    }
});

// Ação de fechar o modal sem deletar
cancelDeleteBtn.addEventListener('click', closeDeleteModal);

// Botão de adicionar tarefa
addTaskButton.addEventListener('click', () => addTask(taskInput.value));
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask(taskInput.value);
});

// Botão de apagar todas as tarefas
deleteAllButton.addEventListener('click', deleteAllTasks);

// Eventos de filtro
document.getElementById('all-tasks').addEventListener('click', () => {
    currentFilter = 'all';
    renderTasks();
    setActiveFilterButton('all-tasks');
});

document.getElementById('pending-tasks').addEventListener('click', () => {
    currentFilter = 'pending';
    renderTasks();
    setActiveFilterButton('pending-tasks');
});

document.getElementById('completed-tasks').addEventListener('click', () => {
    currentFilter = 'completed';
    renderTasks();
    setActiveFilterButton('completed-tasks');
});

// Função para definir o botão de filtro ativo
function setActiveFilterButton(activeId) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.classList.remove('active');
    });
    document.getElementById(activeId).classList.add('active');
}

// Carregar tarefas no início
renderTasks();
