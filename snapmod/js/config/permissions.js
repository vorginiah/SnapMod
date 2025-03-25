// js/config/permissions.js
class Permissions {
    constructor() {
        this.defaultPermissions = {
            admin: ['dashboard', 'settings', 'manageUsers', 'employees', 'vehicles'],
            user: []
        };
        this.init();
    }

    init() {
        const users = storage.get('users', []);
        if (!users.length) {
            storage.set('users', []);
        }
    }

    getPermissions(email) {
        const users = storage.get('users', []);
        const user = users.find(u => u.email === email);
        if (!user) return this.defaultPermissions.user;
        return user.permissions || this.defaultPermissions.user;
    }

    getAdminPermissions() {
        return this.defaultPermissions.admin;
    }

    updatePermissions(email, newPermissions) {
        const users = storage.get('users', []);
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex !== -1) {
            users[userIndex].permissions = newPermissions;
            storage.set('users', users);
            eventBus.emit('permissionsUpdated', { email, permissions: newPermissions });
        }
    }

    hasPermission(email, permission) {
        const permissions = this.getPermissions(email);
        return permissions.includes(permission);
    }

    hasAdminPermission(permission) {
        return this.defaultPermissions.admin.includes(permission);
    }
}

const permissions = new Permissions();