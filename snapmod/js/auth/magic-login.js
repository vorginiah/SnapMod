// js/auth/magic-login.js
class MagicLogin {
    constructor() {
        this.magic = new Magic('pk_live_BEA6FED7D878D2B1');
        this.user = null;
        this.init();
    }

    async init() {
        const isLoggedIn = await this.magic.user.isLoggedIn();
        if (isLoggedIn) {
            this.user = await this.magic.user.getMetadata();
            this.saveUserData();
            this.renderUserDashboard();
        } else {
            this.renderLoginForm();
        }
    }

    saveUserData() {
        const users = storage.get('users', []);
        const existingUser = users.find(u => u.email === this.user.email);
        if (!existingUser) {
            users.push({
                email: this.user.email,
                permissions: permissions.defaultPermissions.user,
                createdAt: new Date().toISOString()
            });
            storage.set('users', users);
        }
    }

    renderLoginForm() {
        const appDiv = document.getElementById('app');
        appDiv.innerHTML = `
            <div class="card p-4 mx-auto" style="max-width: 400px;">
                <h3 class="text-center mb-4" data-i18n="loginTitle">Login to SnapMod</h3>
                <div class="mb-3">
                    <label for="emailInput" class="form-label" data-i18n="emailLabel">Email</label>
                    <input type="email" class="form-control" id="emailInput" placeholder="${settings.t('emailPlaceholder')}">
                </div>
                <button class="btn btn-primary w-100" id="loginBtn" data-i18n="loginButton">Login with Magic Link</button>
            </div>
        `;

        document.getElementById('loginBtn').addEventListener('click', async () => {
            const email = document.getElementById('emailInput').value;
            if (email) {
                try {
                    await this.magic.auth.loginWithMagicLink({ email });
                    this.user = await this.magic.user.getMetadata();
                    this.saveUserData();
                    this.renderUserDashboard();
                } catch (error) {
                    alert('Error during login: ' + error.message);
                }
            } else {
                alert(settings.t('invalidEmailMessage'));
            }
        });

        settings.updateLanguage();
    }

    renderUserDashboard() {
        const appDiv = document.getElementById('app');
        const userPermissions = permissions.getPermissions(this.user.email);

        appDiv.innerHTML = `
            <div class="card p-4">
                <h3 data-i18n="welcomeMessage" data-i18n-params="email:${this.user.email}">Welcome, ${this.user.email}</h3>
                <p><span data-i18n="permissionsLabel">Permissions</span>: ${userPermissions.length ? userPermissions.join(', ') : settings.t('none')}</p>
                <div class="mb-3">
                    ${userPermissions.includes('dashboard') ? `<button class="btn btn-primary me-2" id="dashboardBtn" data-i18n="dashboardTitle">Dashboard</button>` : ''}
                    ${userPermissions.includes('employees') ? `<button class="btn btn-primary me-2" id="employeesBtn" data-i18n="employeesTitle">Employees</button>` : ''}
                    ${userPermissions.includes('vehicles') ? `<button class="btn btn-primary me-2" id="vehiclesBtn" data-i18n="vehiclesTitle">Vehicles</button>` : ''}
                    ${userPermissions.includes('settings') ? `<button class="btn btn-primary me-2" id="settingsBtn" data-i18n="settingsTitle">Settings</button>` : ''}
                </div>
                <button class="btn btn-primary mb-3" id="changeEmailBtn" data-i18n="changeEmailButton">Change Email</button>
                <button class="btn btn-danger mb-3" id="logoutBtn" data-i18n="logoutButton">Logout</button>
                <div id="dashboardContent"></div>
            </div>
        `;

        if (document.getElementById('dashboardBtn')) {
            document.getElementById('dashboardBtn').addEventListener('click', () => {
                new Dashboard(userPermissions);
            });
        }

        if (document.getElementById('employeesBtn')) {
            document.getElementById('employeesBtn').addEventListener('click', () => {
                employeesModule.renderEmployees();
            });
        }

        if (document.getElementById('vehiclesBtn')) {
            document.getElementById('vehiclesBtn').addEventListener('click', () => {
                vehiclesModule.renderVehicles();
            });
        }

        if (document.getElementById('settingsBtn')) {
            document.getElementById('settingsBtn').addEventListener('click', () => {
                settings.renderSettingsPanel();
            });
        }

        document.getElementById('logoutBtn').addEventListener('click', async () => {
            await this.magic.user.logout();
            this.user = null;
            this.renderLoginForm();
        });

        document.getElementById('changeEmailBtn').addEventListener('click', () => {
            const newEmail = prompt(settings.t('enterNewEmailPrompt'));
            if (newEmail && newEmail.includes('@')) {
                const users = storage.get('users', []);
                const userIndex = users.findIndex(u => u.email === this.user.email);
                if (userIndex !== -1) {
                    const oldEmail = this.user.email;
                    users[userIndex].email = newEmail;
                    storage.set('users', users);
                    this.user.email = newEmail;
                    permissions.updatePermissions(oldEmail, permissions.getPermissions(oldEmail));
                    this.renderUserDashboard();
                }
            } else {
                alert(settings.t('invalidEmailMessage'));
            }
        });

        if (userPermissions.includes('dashboard')) {
            new Dashboard(userPermissions);
        }

        settings.updateLanguage();
    }

    getUserPermissions() {
        return permissions.getPermissions(this.user.email);
    }
}

const magicLogin = new MagicLogin();