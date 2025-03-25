// js/utils/storage.js
class Storage {
    constructor() {
        this.prefix = 'snapmod_'; // Prefisso per evitare conflitti in LocalStorage
    }

    // Salva un valore in LocalStorage
    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to LocalStorage:', error);
            return false;
        }
    }

    // Recupera un valore da LocalStorage
    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(this.prefix + key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error('Error reading from LocalStorage:', error);
            return defaultValue;
        }
    }

    // Rimuove un valore da LocalStorage
    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error('Error removing from LocalStorage:', error);
            return false;
        }
    }

    // Aggiorna un valore in LocalStorage (merge con i dati esistenti)
    update(key, newData) {
        const existingData = this.get(key, {});
        const updatedData = { ...existingData, ...newData };
        return this.set(key, updatedData);
    }
}

// Istanza globale dello Storage
const storage = new Storage();