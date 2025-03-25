// js/modules/employees.js
class Employees {
    constructor() {
        this.init();
    }

    init() {
        // Controlla i permessi
        const userPermissions = magicLogin.user ? permissions.getPermissions(magicLogin.user.email) : [];
        if (permissions.hasPermission(magicLogin.user?.email, 'employees') || (adminLogin.isAdminLoggedIn && permissions.hasAdminPermission('employees'))) {
            this.renderEmployees();
        } else {
            this.renderNoPermission();
        }
    }

    // Carica i dipendenti da storage
    loadEmployees() {
        return storage.get('employees', []);
    }

    // Salva i dipendenti in storage
    saveEmployees(employees) {
        storage.set('employees', employees);
        eventBus.emit('employeesUpdated', employees);
    }

    // Mostra la lista dei dipendenti
    renderEmployees() {
        const appDiv = document.getElementById('app');
        const employees = this.loadEmployees();

        appDiv.innerHTML = `
            <div class="card p-4">
                <h3 data-i18n="employeesTitle">Employees</h3>
                <button class="btn btn-primary mb-3" id="addEmployeeBtn" data-i18n="addEmployeeButton">Add Employee</button>
                <table class="table">
                    <thead>
                        <tr>
                            <th data-i18n="photoColumn">Photo</th>
                            <th data-i18n="nameColumn">Name</th>
                            <th data-i18n="hireDateColumn">Hire Date</th>
                            <th data-i18n="contractEndColumn">Contract End</th>
                            <th data-i18n="actionsColumn">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="employeesTable">
                        ${employees.map((employee, index) => `
                            <tr>
                                <td><img src="${employee.photo || 'assets/icons/default-user.png'}" alt="${employee.name}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;"></td>
                                <td>${employee.name}</td>
                                <td>${employee.hireDate}</td>
                                <td>${employee.contractEnd || settings.t('indeterminate')}</td>
                                <td>
                                    <button class="btn btn-sm btn-primary edit-employee" data-index="${index}" data-i18n="editButton">Edit</button>
                                    <button class="btn btn-sm btn-danger delete-employee" data-index="${index}" data-i18n="deleteButton">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <button class="btn btn-secondary" id="backBtn" data-i18n="backButton">Back</button>
            </div>
        `;

        // Pulsante per aggiungere un dipendente
        document.getElementById('addEmployeeBtn').addEventListener('click', () => {
            this.renderEmployeeForm();
        });

        // Pulsanti per modificare un dipendente
        document.querySelectorAll('.edit-employee').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                this.renderEmployeeForm(employees[index], index);
            });
        });

        // Pulsanti per eliminare un dipendente
        document.querySelectorAll('.delete-employee').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                if (confirm(settings.t('confirmDeleteEmployee'))) {
                    employees.splice(index, 1);
                    this.saveEmployees(employees);
                    this.renderEmployees();
                }
            });
        });

        // Pulsante "Back"
        document.getElementById('backBtn').addEventListener('click', () => {
            if (adminLogin.isAdminLoggedIn) {
                adminLogin.renderAdminPanel();
            } else {
                magicLogin.renderUserDashboard();
            }
        });

        settings.updateLanguage();
    }

    // Mostra il form per aggiungere/modificare un dipendente
    renderEmployeeForm(employee = null, index = null) {
        const appDiv = document.getElementById('app');
        const isEdit = employee !== null;

        appDiv.innerHTML = `
            <div class="card p-4 mx-auto" style="max-width: 500px;">
                <h3 data-i18n="${isEdit ? 'editEmployeeTitle' : 'addEmployeeTitle'}">${isEdit ? 'Edit Employee' : 'Add Employee'}</h3>
                <form id="employeeForm">
                    <div class="mb-3">
                        <label for="employeeName" class="form-label" data-i18n="nameLabel">Name</label>
                        <input type="text" class="form-control" id="employeeName" value="${employee ? employee.name : ''}" required>
                    </div>
                    <div class="mb-3">
                        <label for="employeePhoto" class="form-label" data-i18n="photoLabel">Photo</label>
                        <input type="file" class="form-control" id="employeePhoto" accept="image/*">
                        ${employee && employee.photo ? `<img src="${employee.photo}" alt="Current Photo" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-top: 10px;">` : ''}
                    </div>
                    <div class="mb-3">
                        <label for="hireDate" class="form-label" data-i18n="hireDateLabel">Hire Date</label>
                        <input type="date" class="form-control" id="hireDate" value="${employee ? employee.hireDate : ''}" required>
                    </div>
                    <div class="mb-3">
                        <label for="contractEnd" class="form-label" data-i18n="contractEndLabel">Contract End (leave blank for indeterminate)</label>
                        <input type="date" class="form-control" id="contractEnd" value="${employee ? employee.contractEnd || '' : ''}">
                    </div>
                    <button type="submit" class="btn btn-primary w-100" data-i18n="saveButton">Save</button>
                    <button type="button" class="btn btn-secondary w-100 mt-2" id="cancelBtn" data-i18n="cancelButton">Cancel</button>
                </form>
            </div>
        `;

        document.getElementById('employeeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('employeeName').value;
            const hireDate = document.getElementById('hireDate').value;
            const contractEnd = document.getElementById('contractEnd').value || null;
            const photoInput = document.getElementById('employeePhoto');
            let photo = employee ? employee.photo : null;

            if (photoInput.files.length > 0) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    photo = event.target.result;
                    this.saveEmployee({ name, hireDate, contractEnd, photo }, index);
                };
                reader.readAsDataURL(photoInput.files[0]);
            } else {
                this.saveEmployee({ name, hireDate, contractEnd, photo }, index);
            }
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.renderEmployees();
        });

        settings.updateLanguage();
    }

    // Salva un dipendente
    saveEmployee(employeeData, index) {
        const employees = this.loadEmployees();
        if (index !== null) {
            employees[index] = employeeData;
        } else {
            employees.push(employeeData);
        }
        this.saveEmployees(employees);
        this.renderEmployees();
    }

    // Mostra un messaggio se l'utente non ha il permesso
    renderNoPermission() {
        const appDiv = document.getElementById('app');
        appDiv.innerHTML = `
            <div class="card p-3">
                <p data-i18n="noPermissionMessage">You do not have permission to access this section.</p>
                <button class="btn btn-secondary" id="backBtn" data-i18n="backButton">Back</button>
            </div>
        `;

        document.getElementById('backBtn').addEventListener('click', () => {
            if (adminLogin.isAdminLoggedIn) {
                adminLogin.renderAdminPanel();
            } else {
                magicLogin.renderUserDashboard();
            }
        });

        settings.updateLanguage();
    }
}

const employeesModule = new Employees();