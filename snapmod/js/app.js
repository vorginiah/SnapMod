// js/app.js
class App {
    constructor() {
        this.currentView = null;
        this.init();
    }

    // Inizializza l'app
    init() {
        // Controlla se c'è un admin loggato o un utente loggato
        if (adminLogin.isAdminLoggedIn) {
            this.currentView = 'admin';
            adminLogin.renderAdminPanel();
        } else if (magicLogin.user) {
            this.currentView = 'user';
            magicLogin.renderUserDashboard();
        } else {
            this.renderHomeScreen();
        }

        // Aggiunge un pulsante di navigazione nell'header
        this.addNavigation();
    }

    // Mostra la schermata iniziale con scelta tra login utente e admin
    renderHomeScreen() {
        const appDiv = document.getElementById('app');
        appDiv.innerHTML = `
            <div class="card p-4 mx-auto" style="max-width: 400px;">
                <h3 class="text-center mb-4" data-i18n="appName">SnapMod</h3>
                <p class="text-center mb-4" data-i18n="slogan">SNAP. BUILD.</p>
                <button class="btn btn-primary w-100 mb-3" id="userLoginBtn" data-i18n="loginTitle">Login to SnapMod</button>
                <button class="btn btn-secondary w-100" id="adminLoginBtn" data-i18n="adminLoginTitle">Admin Login</button>
            </div>
        `;

        document.getElementById('userLoginBtn').addEventListener('click', () => {
            this.currentView = 'user';
            magicLogin.renderLoginForm();
        });

        document.getElementById('adminLoginBtn').addEventListener('click', () => {
            this.currentView = 'admin';
            adminLogin.renderAdminLoginForm();
        });

        settings.updateLanguage();
    }

    // Aggiunge un pulsante di navigazione nell'header
    addNavigation() {
        const header = document.querySelector('header');
        const navDiv = document.createElement('div');
        navDiv.className = 'ms-auto me-3';
        navDiv.innerHTML = `
            <button class="btn btn-outline-primary" id="navHomeBtn" data-i18n="backButton">Back</button>
        `;
        header.insertBefore(navDiv, header.lastElementChild);

        document.getElementById('navHomeBtn').addEventListener('click', () => {
            this.currentView = null;
            adminLogin.isAdminLoggedIn = false;
            magicLogin.user = null;
            this.renderHomeScreen();
        });

        settings.updateLanguage();
    }
}

// Inizializza l'app
const app = new App();