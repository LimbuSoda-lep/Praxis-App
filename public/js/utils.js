// Toast notification system
let toastContainer = null;

// Initialize toast container
function initToasts() {
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
}

// Show toast
function showToast(message, type = 'info', duration = 3000) {
    initToasts();

    const toast = document.createElement('div');
    toast.className = `toast ${type} fade-in`;

    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

    toast.innerHTML = `
    <span style="font-size: 1.2rem;">${icon}</span>
    <div class="toast-message">${message}</div>
  `;

    toastContainer.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

// Loading state
function setLoading(element, isLoading) {
    if (isLoading) {
        element.disabled = true;
        element.dataset.originalText = element.textContent;
        element.innerHTML = '<span class="spinner spinner-sm"></span>';
    } else {
        element.disabled = false;
        element.textContent = element.dataset.originalText || 'Submit';
    }
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export utilities
window.utils = {
    showToast,
    formatDate,
    formatTime,
    getTodayString,
    setLoading,
    debounce,
};
