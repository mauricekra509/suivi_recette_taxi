// Lien de l'API MockAPI
const apiURL = "https://67bbfcbaed4861e07b38c5e0.mockapi.io/recettes";

let currentWeekStart = new Date();
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
const today = new Date();

currentWeekStart.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));

// Génère le tableau de la semaine en récupérant les données depuis MockAPI
async function generateWeekTable() {
    const tableBody = document.getElementById('daily-table');
    tableBody.innerHTML = '';
    const startOfWeek = new Date(currentWeekStart);
    const data = await fetchData();

    let totalAmounts = 0, totalExpenses = 0, totalIncludingExpenses = 0;

    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dateKey = date.toISOString().split('T')[0]; // Format YYYY-MM-DD

        const savedData = data.find(item => item.date === dateKey) || { amount: 0, expense: 0, justification: '' };

        totalAmounts += parseFloat(savedData.amount);
        totalExpenses += parseFloat(savedData.expense);
        totalIncludingExpenses += parseFloat(savedData.amount) + parseFloat(savedData.expense);

        tableBody.innerHTML += `
            <tr data-date="${dateKey}" onclick="showDayData('${dateKey}')">
                <td>${date.toLocaleDateString()}</td>
                <td><input type="number" value="${savedData.amount}" class="daily-amount"></td>
                <td><input type="number" value="${savedData.expense}" class="daily-expense"></td>
                <td><input type="text" value="${savedData.justification}" class="daily-justification"></td>
            </tr>`;
    }

    document.getElementById('weekly-amounts').textContent = totalAmounts.toFixed(2);
    document.getElementById('weekly-expenses').textContent = totalExpenses.toFixed(2);
    document.getElementById('weekly-total').textContent = totalIncludingExpenses.toFixed(2);
}

// Enregistre les données de la semaine sur MockAPI
async function saveWeeklyData() {
    const rows = document.querySelectorAll('#daily-table tr');
    const existingData = await fetchData();

    for (const row of rows) {
        const date = row.dataset.date;
        const amount = row.querySelector('.daily-amount').value || 0;
        const expense = row.querySelector('.daily-expense').value || 0;
        const justification = row.querySelector('.daily-justification').value || '';

        const existingEntry = existingData.find(entry => entry.date === date);

        if (existingEntry) {
            // Met à jour l'enregistrement existant
            await fetch(`${apiURL}/${existingEntry.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, amount, expense, justification })
            });
        } else {
            // Crée un nouvel enregistrement
            await fetch(apiURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, amount, expense, justification })
            });
        }
    }

    alert("Données sauvegardées avec succès !");
    generateCalendar();
}

// Récupère les données depuis MockAPI
async function fetchData() {
    const response = await fetch(apiURL);
    const data = await response.json();
    return data;
}

// Affiche les détails d'une journée sélectionnée
async function showDayData(dateKey) {
    const data = await fetchData();
    const dayData = data.find(item => item.date === dateKey);
    const dayDetails = document.getElementById('day-details');

    if (dayData) {
        dayDetails.innerHTML = `<p><strong>Date :</strong> ${dateKey}</p>
            <p><strong>Montant versé :</strong> ${dayData.amount} F</p>
            <p><strong>Dépenses :</strong> ${dayData.expense} F</p>
            <p><strong>Justification :</strong> ${dayData.justification}</p>`;
    } else {
        dayDetails.innerHTML = `<p>Aucune donnée enregistrée pour ce jour.</p>`;
    }
}

// Génère le calendrier en affichant les jours avec des données sauvegardées
async function generateCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const data = await fetchData();

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dateKey = date.toISOString().split('T')[0];
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        dayDiv.textContent = day;

        if (data.find(item => item.date === dateKey)) {
            dayDiv.classList.add('has-data');
        }

        dayDiv.addEventListener('click', () => showDayData(dateKey));
        calendar.appendChild(dayDiv);
    }
}

// Navigation des semaines et mois
function previousWeek() {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    generateWeekTable();
}

function nextWeek() {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    generateWeekTable();
}

function previousMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar();
}

// Initialise l'affichage
window.onload = () => {
    generateWeekTable();
    generateCalendar();
};
