// assets/js/main.js
class ReservationSystem {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.setupCalendar();
    }

    init() {
        this.token = localStorage.getItem('token');
        this.updateNavigation();
        this.selectedDate = null;
        this.selectedTime = null;
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('loginBtn').addEventListener('click', () => this.showSection('loginForm'));
        document.getElementById('registerBtn').addEventListener('click', () => this.showSection('registerForm'));
        document.getElementById('appointmentBtn').addEventListener('click', () => this.showSection('appointmentSection'));
        document.getElementById('profileBtn').addEventListener('click', () => this.showSection('profileSection'));
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Forms
        document.getElementById('loginFormElement').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerFormElement').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('profileFormElement').addEventListener('submit', (e) => this.handleProfileUpdate(e));
        document.getElementById('deleteAccount').addEventListener('click', () => this.handleDeleteAccount());
    }

    setupCalendar() {
        const calendar = document.getElementById('calendar');
        const today = new Date();
        this.renderCalendar(today);
    }

    renderCalendar(date) {
        const calendar = document.getElementById('calendar');
        const year = date.getFullYear();
        const month = date.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        let html = `
            <div class="calendar-header">
                <button onclick="reservationSystem.previousMonth()">←</button>
                <h3>${new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date)}</h3>
                <button onclick="reservationSystem.nextMonth()">→</button>
            </div>
            <div class="calendar-grid">
                <div class="calendar-day-header">Lun</div>
                <div class="calendar-day-header">Mar</div>
                <div class="calendar-day-header">Mer</div>
                <div class="calendar-day-header">Jeu</div>
                <div class="calendar-day-header">Ven</div>
                <div class="calendar-day-header">Sam</div>
                <div class="calendar-day-header">Dim</div>
        `;

        // Ajouter les jours vides au début
        let firstDayOfWeek = firstDay.getDay() || 7;
        for (let i = 1; i < firstDayOfWeek; i++) {
            html += '<div class="calendar-day empty"></div>';
        }

        // Ajouter les jours du mois
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const currentDate = new Date(year, month, day);
            const isToday = this.isSameDay(currentDate, new Date());
            const isSelected = this.selectedDate && this.isSameDay(currentDate, this.selectedDate);
            const isPast = currentDate < new Date().setHours(0, 0, 0, 0);

            html += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''}"
                     onclick="reservationSystem.selectDate(${year}, ${month}, ${day})">
                    ${day}
                </div>`;
        }

        html += '</div>';
        calendar.innerHTML = html;
    }

    async selectDate(year, month, day) {
        const selectedDate = new Date(year, month, day);
        if (selectedDate < new Date().setHours(0, 0, 0, 0)) {
            this.showNotification('Impossible de sélectionner une date passée', true);
            return;
        }

        this.selectedDate = selectedDate;
        this.renderCalendar(selectedDate);
        await this.loadTimeSlots(selectedDate);
    }

    async loadTimeSlots(date) {
        try {
            const slots = await this.api('timeslots', {
                date: date.toISOString().split('T')[0]
            });

            const timeSlots = document.getElementById('timeSlots');
            timeSlots.innerHTML = '';

            const workingHours = this.generateWorkingHours();
            workingHours.forEach(time => {
                const isAvailable = slots.available.includes(time);
                const isSelected = this.selectedTime === time;
                
                const slot = document.createElement('div');
                slot.className = `time-slot ${isAvailable ? 'available' : ''} ${isSelected ? 'selected' : ''}`;
                slot.textContent = time;
                
                if (isAvailable) {
                    slot.onclick = () => this.selectTimeSlot(time);
                }
                
                timeSlots.appendChild(slot);
            });
        } catch (error) {
            this.showNotification(error.message, true);
        }
    }

    selectTimeSlot(time) {
        this.selectedTime = time;
        this.loadTimeSlots(this.selectedDate);

        // Afficher un bouton de confirmation
        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Confirmer le rendez-vous';
        confirmButton.className = 'confirm-appointment';
        confirmButton.onclick = () => this.confirmAppointment();
        
        const timeSlots = document.getElementById('timeSlots');
        timeSlots.appendChild(confirmButton);
    }

    async confirmAppointment() {
        if (!this.selectedDate || !this.selectedTime) {
            this.showNotification('Veuillez sélectionner une date et une heure', true);
            return;
        }

        try {
            await this.api('appointments/create', {
                date: this.selectedDate.toISOString().split('T')[0],
                time: this.selectedTime
            });

            this.showNotification('Rendez-vous confirmé avec succès');
            this.selectedDate = null;
            this.selectedTime = null;
            this.loadAppointments();
            this.setupCalendar();
        } catch (error) {
            this.showNotification(error.message, true);
        }
    }

    async cancelAppointment(appointmentId) {
        if (confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
            try {
                await this.api('appointments/cancel', { id: appointmentId });
                this.showNotification('Rendez-vous annulé avec succès');
                this.loadAppointments();
            } catch (error) {
                this.showNotification(error.message, true);
            }
        }
    }

    logout() {
        localStorage.removeItem('token');
        this.token = null;
        this.updateNavigation();
        this.showNotification('Déconnexion réussie');
    }

    // Utilitaires
    async api(endpoint, data = null) {
        const options = {
            method: data ? 'POST' : 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (this.token) {
            options.headers['Authorization'] = `Bearer ${this.token}`;
        }

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`/api/${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Une erreur est survenue');
        }

        return result;
    }

    showNotification(message, isError = false) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.remove('hidden', 'error');
        if (isError) notification.classList.add('error');

        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }

    generateWorkingHours() {
        const hours = [];
        for (let i = 9; i <= 17; i++) {
            hours.push(`${i.toString().padStart(2, '0')}:00`);
            if (i !== 17) {
                hours.push(`${i.toString().padStart(2, '0')}:30`);
            }
        }
        return hours;
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    previousMonth() {
        const date = new Date(this.selectedDate || new Date());
        date.setMonth(date.getMonth() - 1);
        this.renderCalendar(date);
    }

    nextMonth() {
        const date = new Date(this.selectedDate || new Date());
        date.setMonth(date.getMonth() + 1);
        this.renderCalendar(date);
    }
}

// Initialisation
const reservationSystem = new ReservationSystem();