// ============================================
// API Service - Manejo de peticiones HTTP
// ============================================

const API_BASE_URL = 'http://localhost:3000';

class ApiService {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    // Obtener token del localStorage
    getToken() {
        return localStorage.getItem('token');
    }

    // Guardar token en localStorage
    setToken(token) {
        localStorage.setItem('token', token);
    }

    // Eliminar token
    removeToken() {
        localStorage.removeItem('token');
    }

    // Guardar datos de usuario
    setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    // Obtener datos de usuario
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    // Eliminar datos de usuario
    removeUser() {
        localStorage.removeItem('user');
    }

    // Verificar si está autenticado
    isAuthenticated() {
        return !!this.getToken();
    }

    // Headers por defecto
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (includeAuth && this.getToken()) {
            headers['Authorization'] = `Bearer ${this.getToken()}`;
        }

        return headers;
    }

    // Método genérico para hacer peticiones
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            ...options,
            headers: this.getHeaders(options.auth !== false)
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                // Manejar token expirado
                if (response.status === 401) {
                    this.removeToken();
                    this.removeUser();
                    window.location.href = 'login.html';
                }
                throw new Error(data.message || 'Error en la petición');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ============================================
    // AUTENTICACIÓN
    // ============================================

    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            auth: false,
            body: JSON.stringify({ email, password })
        });

        if (data.token) {
            this.setToken(data.token);
            this.setUser(data.user);
        }

        return data;
    }

    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.removeToken();
            this.removeUser();
        }
    }

    // ============================================
    // INVENTARIO - MATERIAS PRIMAS
    // ============================================

    async getMateriasPrimas(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/inventory/materias-primas${queryString ? '?' + queryString : ''}`;
        return await this.request(endpoint);
    }

    async getMateriaPrima(id) {
        return await this.request(`/inventory/materias-primas/${id}`);
    }

    async createMateriaPrima(data) {
        return await this.request('/inventory/materias-primas', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateMateriaPrima(id, data) {
        return await this.request(`/inventory/materias-primas/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async reabastecerMateriaPrima(id, data) {
        return await this.request(`/inventory/materias-primas/reabastecer/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteMateriaPrima(id) {
        return await this.request(`/inventory/materias-primas/${id}`, {
            method: 'DELETE'
        });
    }

    // ============================================
    // INVENTARIO - MOVIMIENTOS
    // ============================================

    async registrarMovimiento(data) {
        return await this.request('/inventory/movimientos', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getMovimientos(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/inventory/movimientos${queryString ? '?' + queryString : ''}`;
        return await this.request(endpoint);
    }

    async getMateriasCriticas() {
        return await this.request('/inventory/criticas');
    }

    // ============================================
    // DASHBOARD
    // ============================================

    async getDashboardSummary() {
        return await this.request('/dashboard/summary');
    }

    async getReporteVentas(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/dashboard/ventas${queryString ? '?' + queryString : ''}`;
        return await this.request(endpoint);
    }

    async getReporteCostos(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/dashboard/costos${queryString ? '?' + queryString : ''}`;
        return await this.request(endpoint);
    }

    async getReporteMermas() {
        return await this.request('/dashboard/mermas');
    }

    async getInsumosUsados(limit = 10) {
        return await this.request(`/dashboard/insumos-usados?limit=${limit}`);
    }

    async getMargenGanancia() {
        return await this.request('/dashboard/margen-ganancia');
    }
}

// Crear instancia global
const api = new ApiService();

// ============================================
// UTILIDADES UI
// ============================================

// Mostrar mensaje de error
function showError(message, duration = 3000) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'notification error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #B00020;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => errorDiv.remove(), 300);
    }, duration);
}

// Mostrar mensaje de éxito
function showSuccess(message, duration = 3000) {
    const successDiv = document.createElement('div');
    successDiv.className = 'notification success';
    successDiv.textContent = message;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #00C853;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(successDiv);

    setTimeout(() => {
        successDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => successDiv.remove(), 300);
    }, duration);
}

// Mostrar loading
function showLoading(element) {
    const originalContent = element.innerHTML;
    element.innerHTML = '<span class="spinner"></span> Cargando...';
    element.disabled = true;
    return () => {
        element.innerHTML = originalContent;
        element.disabled = false;
    };
}

// Formatear dinero
const formatMoney = (amount) => new Intl.NumberFormat('es-MX', { 
    style: 'currency', 
    currency: 'MXN' 
}).format(amount);

// Formatear fecha
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX');
};

// Verificar autenticación en páginas protegidas
function requireAuth() {
    if (!api.isAuthenticated()) {
        window.location.href = 'login.html';
    }
}

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .spinner {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
