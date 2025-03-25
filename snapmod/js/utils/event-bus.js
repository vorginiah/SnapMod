// js/utils/event-bus.js
class EventBus {
    constructor() {
        this.events = {};
    }

    // Registra un listener per un evento
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    // Rimuove un listener per un evento
    off(eventName, callback) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
        }
    }

    // Emette un evento
    emit(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => callback(data));
        }
    }
}

// Istanza globale dell'Event Bus
const eventBus = new EventBus();