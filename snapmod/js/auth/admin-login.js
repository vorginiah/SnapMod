// js/auth/admin-login.js
class AdminLogin {
    constructor() {
        this.initAdminCredentials();
        this.isAdminLoggedIn = false;
        this.renderAdminLoginForm();
    }

    initAdminCredentials() {
        const adminCredentials = storage.get('adminCredentials');
        if (!adminCredentials) {
            storage.set('adminCredentials', {
                username: 'admin',
                password: 'snapmod2025'
            });
        }
    }

    renderAdminLoginForm() {
        const appDiv = document.getElementById('app');
        appDiv.innerHTML = `
            <div class="card p-4 mx-auto" style="max-width: 400px;">
                <h3 class="text-center mb-4" data-i18n="adminLoginTitle">Admin Login</h3>
                <div class="mb-3">
                    <label for="adminUsername" class="form-label" data-i18n="usernameLabel">Username</label>
                    <input type="text" class="form-control" id="adminUsername" placeholder="${settings.t('usernamePlaceholder')}">
                </div>
                <div class="mb-3">
                    <label for="adminPassword" class="form-label" data-i18n="passwordLabel">Password</label>
                    <input type="password" class="form-control" id="adminPassword" placeholder="${settings.t('passwordPlaceholder')}">
                </div>
                <button class="btn btn-primary w-100" id="adminLoginBtn" data-i18n="adminLoginButton">Login as Admin</button>
            </div>
        `;

        document.getElementById('adminLoginBtn').addEventListener('click', () => {
            const username = document.getElementById('adminUsername').value;
            const password = document.getElementById('adminPassword').value;
            const adminCredentials = storage.get('adminCredentials');

            if (username === adminCredentials.username && password === adminCredentials.password) {
                this.isAdminLoggedIn = true;
                this.renderAdminPanel();
            } else {
                alert(settings.t('invalidCredentialsMessage'));
            }
        });

        settings.updateLanguage();
    }

    renderAdminPanel() {
        const appDiv = document.getElementById('app');
        const users = storage.get('users', []);

        appDiv.innerHTML = `
            <div class="card p-4">
                <h3 data-i18n="adminPanelTitle">Admin Panel</h3>
                <div class="mb-3">
                    <button class="btn btn-primary me-2" id="dashboardBtn" data-i18n="dashboardTitle">Dashboard</button>
                    <button class="btn btn-primary me-2" id="employeesBtn" data-i18n="employeesTitle">Employees</button>
                    <button class="btn btn-primary me-2" id="vehiclesBtn" data-i18n="vehiclesTitle">Vehicles</button>
                    <button class="btn btn-primary me-2" id="settingsBtn" data-i18n="settingsTitle">Settings</button>
                </div>
                <button class="btn btn-danger mb-3" id="adminLogoutBtn" data-i18n="adminLogoutButton">Logout</button>
                <h4 data-i18n="manageUsers">Manage Users</h4>
                <table class="table">
                    <thead>
                        <tr>
                            <th data-i18n="emailColumn">Email</th>
                            <th data-i18n="permissionsColumn">Permissions</th>
                            <th data-i18n="actionsColumn">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="usersTable">
                        ${users.map(user => `
                            <tr>
                                <td>${user.email}</td>
                                <td>${user.permissions.join(', ') || settings.t('none')}</td>
                                <td>
                                    <button class="btn btn-sm btn-primary edit-permissions" data-email="${user.email}" data-i18n="editPermissionsButton">Edit Permissions</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        document.getElementById('dashboardBtn').addEventListener('click', () => {
            new Dashboard(permissions.getAdminPermissions());
        });

        document.getElementById('employeesBtn').addEventListener('click', () => {
            employeesModule.renderEmployees();
        });

        document.getElementById('vehiclesBtn').addEventListener('click', () => {
            vehiclesModule.renderVehicles();
        });

        document.getElementById('settingsBtn').addEventListener('click', () => {
            settings.renderSettingsPanel();
        });

        document.getElementById('adminLogoutBtn').addEventListener('click', () => {
            this.isAdminLoggedIn = false;
            this.renderAdminLoginForm();
        });

        document.querySelectorAll('.edit-permissions').forEach(button => {
            button.addEventListener('click', (e) => {
                const email = e.target.dataset.email;
                const newPermissions = prompt(settings.t('enterPermissionsPrompt'));
                if (newPermissions) {
                    const permissionsArray = newPermissions.split(',').map(p => p.trim());
                    permissions.updatePermissions(email, permissionsArray);
                    this.renderAdminPanel();
                }
            });
        });

        settings.updateLanguage();
    }
}

const adminLogin = new AdminLogin();