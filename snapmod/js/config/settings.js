// js/config/settings.js
class Settings {
    constructor() {
        this.defaultSettings = {
            theme: 'light',
            language: 'it'
        };
        this.settings = this.loadSettings();
        this.translations = {};
        this.loadTranslations().then(() => {
            this.applySettings();
            this.renderSettingsPanel();
        });
    }

    loadSettings() {
        return storage.get('settings', this.defaultSettings);
    }

    saveSettings() {
        storage.set('settings', this.settings);
    }

    async loadTranslations() {
        const languages = ['en', 'it', 'ro'];
        for (const lang of languages) {
            const response = await fetch(`js/i18n/${lang}.json`);
            this.translations[lang] = await response.json();
        }
    }

    t(key, params = {}) {
        const translation = this.translations[this.settings.language][key] || key;
        return Object.keys(params).reduce((str, param) => {
            return str.replace(`{${param}}`, params[param]);
        }, translation);
    }

    applySettings() {
        const themeStyle = document.getElementById('theme-style');
        themeStyle.href = `css/ios-${this.settings.theme}.css`;
        this.updateLanguage();
    }

    updateLanguage() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const params = {};
            if (element.hasAttribute('data-i18n-params')) {
                const paramStr = element.getAttribute('data-i18n-params');
                paramStr.split(',').forEach(param => {
                    const [k, v] = param.split(':');
                    params[k.trim()] = v.trim();
                });
            }
            element.textContent = this.t(key, params);
        });
    }

    renderSettingsPanel() {
        const userPermissions = typeof magicLogin !== 'undefined' && magicLogin.user ? permissions.getPermissions(magicLogin.user.email) : [];
        if (permissions.hasPermission(magicLogin.user?.email, 'settings') || (typeof adminLogin !== 'undefined' && adminLogin.isAdminLoggedIn && permissions.hasAdminPermission('settings'))) {
            const appDiv = document.getElementById('app');
            const adminCredentials = storage.get('adminCredentials', { username: 'admin', password: 'snapmod2025' });

            appDiv.innerHTML = `
                <div class="card p-4">
                    <h3 data-i18n="settingsTitle">Settings</h3>
                    <div class="mb-4">
                        <h5 data-i18n="themeLabel">Theme</h5>
                        <select class="form-control" id="themeSelect">
                            <option value="light" ${this.settings.theme === 'light' ? 'selected' : ''} data-i18n="themeLight">Light</option>
                            <option value="dark" ${this.settings.theme === 'dark' ? 'selected' : ''} data-i18n="themeDark">Dark</option>
                        </select>
                    </div>
                    <div class="mb-4">
                        <h5 data-i18n="languageLabel">Language</h5>
                        <select class="form-control" id="languageSelect">
                            <option value="it" ${this.settings.language === 'it' ? 'selected' : ''} data-i18n="languageItalian">Italiano</option>
                            <option value="en" ${this.settings.language === 'en' ? 'selected' : ''} data-i18n="languageEnglish">English</option>
                            <option value="ro" ${this.settings.language === 'ro' ? 'selected' : ''} data-i18n="languageRomanian">Română</option>
                        </select>
                    </div>
                    ${typeof adminLogin !== 'undefined' && adminLogin.isAdminLoggedIn ? `
                        <div class="mb-4">
                            <h5 data-i18n="adminCredentialsTitle">Admin Credentials</h5>
                            <div class="mb-3">
                                <label for="adminUsername" class="form-label" data-i18n="usernameLabel">Username</label>
                                <input type="text" class="form-control" id="adminUsername" value="${adminCredentials.username}">
                            </div>
                            <div class="mb-3">
                                <label for="adminPassword" class="form-label" data-i18n="passwordLabel">Password</label>
                                <input type="password" class="form-control" id="adminPassword" value="${adminCredentials.password}">
                            </div>
                            <button class="btn btn-primary" id="saveAdminCredentials" data-i18n="saveAdminCredentialsButton">Save Admin Credentials</button>
                        </div>
                    ` : ''}
                    <button class="btn btn-secondary" id="backBtn" data-i18n="backButton">Back</button>
                </div>
            `;

            document.getElementById('themeSelect').addEventListener('change', (e) => {
                this.settings.theme = e.target.value;
                this.saveSettings();
                this.applySettings();
            });

            document.getElementById('languageSelect').addEventListener('change', (e) => {
                this.settings.language = e.target.value;
                this.saveSettings();
                this.applySettings();
            });

            if (document.getElementById('saveAdminCredentials')) {
                document.getElementById('saveAdminCredentials').addEventListener('click', () => {
                    const newUsername = document.getElementById('adminUsername').value;
                    const newPassword = document.getElementById('adminPassword').value;
                    if (newUsername && newPassword) {
                        storage.set('adminCredentials', {
                            username: newUsername,
                            password: newPassword
                        });
                        alert(this.t('adminCredentialsUpdatedMessage'));
                        this.renderSettingsPanel();
                    } else {
                        alert(this.t('enterCredentialsPrompt'));
                    }
                });
            }

            document.getElementById('backBtn').addEventListener('click', () => {
                if (typeof adminLogin !== 'undefined' && adminLogin.isAdminLoggedIn) {
                    adminLogin.renderAdminPanel();
                } else if (typeof magicLogin !== 'undefined') {
                    magicLogin.renderUserDashboard();
                }
            });

            this.updateLanguage();
        } else {
            alert(this.t('noPermissionMessage'));
            if (typeof magicLogin !== 'undefined') {
                magicLogin.renderUserDashboard();
            }
        }
    }
}

const settings = new Settings();