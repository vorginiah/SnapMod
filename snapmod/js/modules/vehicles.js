// js/modules/vehicles.js
class Vehicles {
    constructor() {
        this.init();
    }

    init() {
        const userPermissions = magicLogin.user ? permissions.getPermissions(magicLogin.user.email) : [];
        if (permissions.hasPermission(magicLogin.user?.email, 'vehicles') || (adminLogin.isAdminLoggedIn && permissions.hasAdminPermission('vehicles'))) {
            this.renderVehicles();
        } else {
            this.renderNoPermission();
        }
    }

    // Carica i mezzi da storage
    loadVehicles() {
        return storage.get('vehicles', []);
    }

    // Salva i mezzi in storage
    saveVehicles(vehicles) {
        storage.set('vehicles', vehicles);
        eventBus.emit('vehiclesUpdated', vehicles);
    }

    // Mostra la lista dei mezzi
    renderVehicles() {
        const appDiv = document.getElementById('app');
        const vehicles = this.loadVehicles();

        appDiv.innerHTML = `
            <div class="card p-4">
                <h3 data-i18n="vehiclesTitle">Vehicles</h3>
                <button class="btn btn-primary mb-3" id="addVehicleBtn" data-i18n="addVehicleButton">Add Vehicle</button>
                <table class="table">
                    <thead>
                        <tr>
                            <th data-i18n="photoColumn">Photo</th>
                            <th data-i18n="nameColumn">Name</th>
                            <th data-i18n="licensePlateColumn">License Plate</th>
                            <th data-i18n="insuranceExpiryColumn">Insurance Expiry</th>
                            <th data-i18n="revisionExpiryColumn">Revision Expiry</th>
                            <th data-i18n="actionsColumn">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="vehiclesTable">
                        ${vehicles.map((vehicle, index) => `
                            <tr>
                                <td><img src="${vehicle.photo || 'assets/icons/default-vehicle.png'}" alt="${vehicle.name}" style="width: 50px; height: 50px; object-fit: cover;"></td>
                                <td>${vehicle.name}</td>
                                <td>${vehicle.licensePlate}</td>
                                <td>${vehicle.insuranceExpiry}</td>
                                <td>${vehicle.revisionExpiry}</td>
                                <td>
                                    <button class="btn btn-sm btn-primary edit-vehicle" data-index="${index}" data-i18n="editButton">Edit</button>
                                    <button class="btn btn-sm btn-danger delete-vehicle" data-index="${index}" data-i18n="deleteButton">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <button class="btn btn-secondary" id="backBtn" data-i18n="backButton">Back</button>
            </div>
        `;

        document.getElementById('addVehicleBtn').addEventListener('click', () => {
            this.renderVehicleForm();
        });

        document.querySelectorAll('.edit-vehicle').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                this.renderVehicleForm(vehicles[index], index);
            });
        });

        document.querySelectorAll('.delete-vehicle').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                if (confirm(settings.t('confirmDeleteVehicle'))) {
                    vehicles.splice(index, 1);
                    this.saveVehicles(vehicles);
                    this.renderVehicles();
                }
            });
        });

        document.getElementById('backBtn').addEventListener('click', () => {
            if (adminLogin.isAdminLoggedIn) {
                adminLogin.renderAdminPanel();
            } else {
                magicLogin.renderUserDashboard();
            }
        });

        settings.updateLanguage();
    }

    // Mostra il form per aggiungere/modificare un mezzo
    renderVehicleForm(vehicle = null, index = null) {
        const appDiv = document.getElementById('app');
        const isEdit = vehicle !== null;

        appDiv.innerHTML = `
            <div class="card p-4 mx-auto" style="max-width: 500px;">
                <h3 data-i18n="${isEdit ? 'editVehicleTitle' : 'addVehicleTitle'}">${isEdit ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
                <form id="vehicleForm">
                    <div class="mb-3">
                        <label for="vehicleName" class="form-label" data-i18n="nameLabel">Name</label>
                        <input type="text" class="form-control" id="vehicleName" value="${vehicle ? vehicle.name : ''}" required>
                    </div>
                    <div class="mb-3">
                        <label for="vehiclePhoto" class="form-label" data-i18n="photoLabel">Photo</label>
                        <input type="file" class="form-control" id="vehiclePhoto" accept="image/*">
                        ${vehicle && vehicle.photo ? `<img src="${vehicle.photo}" alt="Current Photo" style="width: 100px; height: 100px; object-fit: cover; margin-top: 10px;">` : ''}
                    </div>
                    <div class="mb-3">
                        <label for="licensePlate" class="form-label" data-i18n="licensePlateLabel">License Plate</label>
                        <input type="text" class="form-control" id="licensePlate" value="${vehicle ? vehicle.licensePlate : ''}" required>
                    </div>
                    <div class="mb-3">
                        <label for="insuranceExpiry" class="form-label" data-i18n="insuranceExpiryLabel">Insurance Expiry</label>
                        <input type="date" class="form-control" id="insuranceExpiry" value="${vehicle ? vehicle.insuranceExpiry : ''}" required>
                    </div>
                    <div class="mb-3">
                        <label for="revisionExpiry" class="form-label" data-i18n="revisionExpiryLabel">Revision Expiry</label>
                        <input type="date" class="form-control" id="revisionExpiry" value="${vehicle ? vehicle.revisionExpiry : ''}" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-100" data-i18n="saveButton">Save</button>
                    <button type="button" class="btn btn-secondary w-100 mt-2" id="cancelBtn" data-i18n="cancelButton">Cancel</button>
                </form>
            </div>
        `;

        document.getElementById('vehicleForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('vehicleName').value;
            const licensePlate = document.getElementById('licensePlate').value;
            const insuranceExpiry = document.getElementById('insuranceExpiry').value;
            const revisionExpiry = document.getElementById('revisionExpiry').value;
            const photoInput = document.getElementById('vehiclePhoto');
            let photo = vehicle ? vehicle.photo : null;

            if (photoInput.files.length > 0) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    photo = event.target.result;
                    this.saveVehicle({ name, licensePlate, insuranceExpiry, revisionExpiry, photo }, index);
                };
                reader.readAsDataURL(photoInput.files[0]);
            } else {
                this.saveVehicle({ name, licensePlate, insuranceExpiry, revisionExpiry, photo }, index);
            }
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.renderVehicles();
        });

        settings.updateLanguage();
    }

    // Salva un mezzo
    saveVehicle(vehicleData, index) {
        const vehicles = this.loadVehicles();
        if (index !== null) {
            vehicles[index] = vehicleData;
        } else {
            vehicles.push(vehicleData);
        }
        this.saveVehicles(vehicles);
        this.renderVehicles();
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

const vehiclesModule = new Vehicles();