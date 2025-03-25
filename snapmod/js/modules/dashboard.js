// js/modules/dashboard.js
class Dashboard {
    constructor(permissions) {
        this.permissions = permissions;
        this.data = this.loadData();
        if (permissions.hasPermission(magicLogin.user?.email, 'dashboard') || (adminLogin.isAdminLoggedIn && permissions.hasAdminPermission('dashboard'))) {
            this.renderDashboard();
        } else {
            this.renderNoPermission();
        }
    }

    loadData() {
        const savedData = storage.get('dashboardData');
        if (!savedData) {
            const defaultData = {
                sales: [
                    { month: 'Jan', value: 1200 },
                    { month: 'Feb', value: 1500 },
                    { month: 'Mar', value: 1800 },
                    { month: 'Apr', value: 2000 },
                    { month: 'May', value: 2200 },
                    { month: 'Jun', value: 2500 }
                ],
                customers: 150,
                revenue: 11200,
                growthRate: 0.15
            };
            storage.set('dashboardData', defaultData);
            return defaultData;
        }
        return savedData;
    }

    calculateForecast() {
        const lastSale = this.data.sales[this.data.sales.length - 1].value;
        const growthRate = this.data.growthRate;
        const forecast = [];
        const months = ['Jul', 'Aug', 'Sep'];
        let lastValue = lastSale;

        months.forEach(month => {
            lastValue = Math.round(lastValue * (1 + growthRate));
            forecast.push({ month, value: lastValue });
        });

        return forecast;
    }

    renderDashboard() {
        const dashboardContent = document.getElementById('dashboardContent');
        if (!dashboardContent) return;

        const forecast = this.calculateForecast();
        const allSales = [...this.data.sales, ...forecast];

        dashboardContent.innerHTML = `
            <div class="row">
                <div class="col-md-4 mb-4">
                    <div class="card p-3">
                        <h5 data-i18n="totalCustomers">Total Customers</h5>
                        <p class="display-6">${this.data.customers}</p>
                    </div>
                </div>
                <div class="col-md-4 mb-4">
                    <div class="card p-3">
                        <h5 data-i18n="totalRevenue">Total Revenue</h5>
                        <p class="display-6">$${this.data.revenue}</p>
                    </div>
                </div>
                <div class="col-md-4 mb-4">
                    <div class="card p-3">
                        <h5 data-i18n="growthRate">Growth Rate</h5>
                        <p class="display-6">${(this.data.growthRate * 100).toFixed(1)}%</p>
                    </div>
                </div>
            </div>
            <div class="card p-3 mb-4">
                <h5 data-i18n="salesTrend">Sales Trend (with Forecast)</h5>
                <canvas id="salesChart" height="100"></canvas>
            </div>
            <button class="btn btn-primary" id="settingsBtn" data-i18n="settingsTitle">Settings</button>
        `;

        const ctx = document.getElementById('salesChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: allSales.map(s => s.month),
                datasets: [
                    {
                        label: 'Sales ($)',
                        data: allSales.map(s => s.value),
                        borderColor: '#ff9500',
                        backgroundColor: 'rgba(255, 149, 0, 0.2)',
                        fill: true,
                        tension: 0.3
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Sales ($)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true
                    }
                }
            }
        });

        document.getElementById('settingsBtn').addEventListener('click', () => {
            settings.renderSettingsPanel();
        });

        settings.updateLanguage();
    }

    renderNoPermission() {
        const dashboardContent = document.getElementById('dashboardContent');
        if (!dashboardContent) return;

        dashboardContent.innerHTML = `
            <div class="card p-3">
                <p data-i18n="noPermissionMessage">You do not have permission to access the dashboard.</p>
            </div>
        `;

        settings.updateLanguage();
    }
}