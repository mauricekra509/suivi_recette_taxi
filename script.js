let currentWeekStart = new Date();
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
const today = new Date();
currentWeekStart.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));

function generateWeekTable() {
    const tableBody = document.getElementById('daily-table');
    tableBody.innerHTML = '';
    const startOfWeek = new Date(currentWeekStart);
    const calendarData = JSON.parse(localStorage.getItem('calendarData')) || {};
    let totalAmounts = 0, totalExpenses = 0, totalIncludingExpenses = 0;

    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dateKey = date.toDateString();
        const savedData = calendarData[dateKey] || { amount: 0, expense: 0, justification: '' };

        totalAmounts += parseFloat(savedData.amount);
        totalExpenses += parseFloat(savedData.expense);
        totalIncludingExpenses += parseFloat(savedData.amount) + parseFloat(savedData.expense);

        tableBody.innerHTML += `<tr data-date="${dateKey}" onclick="showDayData('${dateKey}')">
            <td>${date.toLocaleDateString()}</td>
            <td><input type="number" value="${savedData.amount}" class="daily-amount" onchange="updateWeeklySummary()"></td>
            <td><input type="number" value="${savedData.expense}" class="daily-expense" onchange="updateWeeklySummary()"></td>
            <td><input type="text" value="${savedData.justification}" class="daily-justification"></td>
        </tr>`;
    }

    updateWeeklySummary();
}

// 🔍 Fonction pour mettre à jour le résumé hebdomadaire
function updateWeeklySummary() {
    let totalAmounts = 0, totalExpenses = 0, totalIncludingExpenses = 0;
    const amounts = document.querySelectorAll('.daily-amount');
    const expenses = document.querySelectorAll('.daily-expense');

    amounts.forEach((input, index) => {
        totalAmounts += parseFloat(input.value) || 0;
        totalExpenses += parseFloat(expenses[index].value) || 0;
    });

    totalIncludingExpenses = totalAmounts + totalExpenses;

    document.getElementById('weekly-amounts').textContent = totalAmounts.toFixed(2);
    document.getElementById('weekly-expenses').textContent = totalExpenses.toFixed(2);
    document.getElementById('weekly-total').textContent = totalIncludingExpenses.toFixed(2);
}

// 🔄 Navigation entre les semaines
function previousWeek() {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    generateWeekTable();
}

function nextWeek() {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    generateWeekTable();
}

// 💾 Sauvegarde des données hebdomadaires
function saveWeeklyData() {
    const rows = document.querySelectorAll('#daily-table tr');
    const calendarData = JSON.parse(localStorage.getItem('calendarData')) || {};

    rows.forEach(row => {
        const date = row.dataset.date;
        const amount = row.querySelector('.daily-amount').value || 0;
        const expense = row.querySelector('.daily-expense').value || 0;
        const justification = row.querySelector('.daily-justification').value || '';
        calendarData[date] = { amount, expense, justification };
    });

    localStorage.setItem('calendarData', JSON.stringify(calendarData));
    alert('Données sauvegardées avec succès !');
    generateCalendar();
}

// 📅 Génération du calendrier avec les mois affichés
function generateCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const calendarData = JSON.parse(localStorage.getItem('calendarData')) || {};

    // Mettre à jour le titre du mois et de l'année
    document.getElementById('month-year').textContent = `${new Date(currentYear, currentMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dateKey = date.toDateString();
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        dayDiv.textContent = day;

        if (calendarData[dateKey]) {
            dayDiv.classList.add('has-data');
        }

        dayDiv.addEventListener('click', () => showDayData(dateKey));
        calendar.appendChild(dayDiv);
    }
}

// 📌 Affiche les détails du jour sélectionné
function showDayData(dateKey) {
    const calendarData = JSON.parse(localStorage.getItem('calendarData')) || {};
    const data = calendarData[dateKey];
    const dayDetails = document.getElementById('day-details');

    if (data) {
        dayDetails.innerHTML = `<p><strong>Date :</strong> ${dateKey}</p>
            <p><strong>Montant versé :</strong> ${data.amount} F</p>
            <p><strong>Dépenses :</strong> ${data.expense} F</p>
            <p><strong>Justification :</strong> ${data.justification}</p>`;
    } else {
        dayDetails.innerHTML = `<p>Aucune donnée enregistrée pour ce jour.</p>`;
    }
}

// 🔄 Navigation entre les mois
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

// 🚀 Initialisation à la charge de la page
window.onload = () => {
    generateWeekTable();
    generateCalendar();
};
