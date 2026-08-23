// ===== 1. ПОДСТАНОВКА ДАННЫХ ИЗ product.js ПРИ ЗАГРУЗКЕ =====
document.addEventListener("DOMContentLoaded", function() {
    if (typeof getContact !== 'function') return;

    const salesPhone = getContact('phone');
    const comDirPhone = getContact('phoneComDir');
    const emailAddr = getContact('email');

    // Заполняем Отдел продаж
    const salesEl = document.getElementById('headerSalesPhone');
    if (salesEl && salesPhone) {
        salesEl.textContent = salesPhone;
        salesEl.onclick = function() { processPhoneClick(salesPhone, '[☎ Отдел продаж]'); };
    }

    // Заполняем Коммерческого директора
    const comDirEl = document.getElementById('headerComDirPhone');
    if (comDirEl && comDirPhone) {
        comDirEl.textContent = comDirPhone;
        comDirEl.onclick = function() { processPhoneClick(comDirPhone, '[☎ Ком.директор]'); };
    }

    // Заполняем E-mail
    const emailEl = document.getElementById('headerEmail');
    if (emailEl && emailAddr) {
        emailEl.textContent = emailAddr;
        emailEl.onclick = function() { processEmailClick(emailAddr); };
    }
});

// ===== 2. ЛОГИКА ВЫПАДАЮЩЕГО МЕНЮ КОНТАКТОВ И ЕГО ТАЙМЕРА =====
// ===== 2. ЛОГИКА ВЫПАДАЮЩЕГО МЕНЮ КОНТАКТОВ И ЕГО ТАЙМЕРА =====
const dropdown = document.querySelector('.contacts-dropdown');
const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
let menuOpenTime = 0; 

if (!isMobileDevice && dropdown) {
    dropdown.addEventListener('mouseenter', function() {
        if (!this.classList.contains('closed-by-click')) {
            if (!this.classList.contains('is-open')) {
                this.classList.add('is-open');
                menuOpenTime = Date.now();
                if (typeof logEvent === 'function') logEvent('[☎☎📧]'); // Факт появления
            }
        }
    });

    dropdown.addEventListener('mouseleave', function() {
        // Проверяем таймер прямо здесь перед закрытием
        if (menuOpenTime > 0) {
            const duration = Math.round((Date.now() - menuOpenTime) / 1000);
            if (duration >= 9 && typeof logEvent === 'function') {
                logEvent('timer' + duration);
            }
            menuOpenTime = 0;
        }
        this.classList.remove('is-open');
        this.classList.remove('closed-by-click');
    });
}

function toggleContactsMenu(event) {
    event.stopPropagation();
    if (!dropdown) return;

    if (!isMobileDevice) {
        if (dropdown.classList.contains('is-open')) {
            const timePassed = Date.now() - menuOpenTime;
            if (timePassed < 1000) return;

            if (menuOpenTime > 0) {
                const duration = Math.round((Date.now() - menuOpenTime) / 1000);
                if (duration >= 9 && typeof logEvent === 'function') {
                    logEvent('timer' + duration);
                }
                menuOpenTime = 0;
            }
            dropdown.classList.remove('is-open');
            dropdown.classList.add('closed-by-click');
        } else {
            dropdown.classList.add('is-open');
            dropdown.classList.remove('closed-by-click');
            menuOpenTime = Date.now();
            if (typeof logEvent === 'function') logEvent('[☎☎📧]');
        }
    } else {
        // Для мобильных
        if (dropdown.classList.contains('is-open')) {
            if (menuOpenTime > 0) {
                const duration = Math.round((Date.now() - menuOpenTime) / 1000);
                if (duration >= 9 && typeof logEvent === 'function') {
                    logEvent('timer' + duration);
                }
                menuOpenTime = 0;
            }
            dropdown.classList.remove('is-open');
        } else {
            dropdown.classList.add('is-open');
            menuOpenTime = Date.now();
            if (typeof logEvent === 'function') logEvent('[☎☎📧]');
        }
    }
}

// Клик вне меню
document.addEventListener('click', function(event) {
    if (dropdown && !dropdown.contains(event.target)) {
        if (dropdown.classList.contains('is-open')) {
            if (menuOpenTime > 0) {
                const duration = Math.round((Date.now() - menuOpenTime) / 1000);
                if (duration >= 9 && typeof logEvent === 'function') {
                    logEvent('timer' + duration);
                }
                menuOpenTime = 0;
            }
        }
        dropdown.classList.remove('is-open');
        dropdown.classList.remove('closed-by-click');
    }
});
// ===== 3. КЛИКИ ПО КОНТАКТАМ И ОБЫЧНЫЕ МОДАЛКИ (БЕЗ ТАЙМЕРОВ) =====
function processPhoneClick(phoneNumber, label = '[☎ Телефон]') {
    if (typeof logEvent === 'function') {
        logEvent(label); 
    }

    if (isMobileDevice) {
        window.location.href = "tel:" + phoneNumber;
    } else {
        const modal = document.getElementById('contactsCallModal');
        const phoneVal = document.getElementById('modalPhoneValue');

        if (modal && phoneVal) {
            phoneVal.innerText = phoneNumber;
            modal.classList.remove('hidden');
        }

        if (navigator.clipboard) {
            navigator.clipboard.writeText(phoneNumber);
        }
    }
}

function closeContactsModal() {
    const modal = document.getElementById('contactsCallModal');
    if (modal) {
        modal.classList.add('hidden'); // Просто закрываем без таймеров
    }
}

function processEmailClick(emailAddress) {
    if (typeof logEvent === 'function') {
        logEvent('[📧 Email]');
    }

    if (isMobileDevice) {
        window.location.href = "mailto:" + emailAddress;
    } else {
        const modal = document.getElementById('contactsEmailModal');
        const emailVal = document.getElementById('modalEmailValue');

        if (modal && emailVal) {
            emailVal.innerText = emailAddress;
            modal.classList.remove('hidden');
        }

        if (navigator.clipboard) {
            navigator.clipboard.writeText(emailAddress);
        }
    }
}

function closeContactsEmailModal() {
    const modal = document.getElementById('contactsEmailModal');
    if (modal) {
        modal.classList.add('hidden'); // Просто закрываем без таймеров
	}
}

// ===== 4. СТАБИЛЬНОЕ ЛОГИРОВАНИЕ КОПИРОВАНИЯ =====
document.addEventListener('copy', function(event) {
    const selectedText = window.getSelection().toString().trim();
    
    if (selectedText.length > 0 && typeof logEvent === 'function') {
        logEvent('📋 Скопировано: ' + selectedText);
    }
});