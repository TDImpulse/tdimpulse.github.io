// 1. Данные для защищенной подстановки
const contactData = {
    phone: "+79695312329",
    whatsapp: "https://wa.me/+212694170179",
    telegram: "https://t.me/tdimpulse",
    max: "https://max.ru/u/f9LHodD0cOIMQT5rPvLaM7KO2n_qeFccogrjiOu2d8nfM7ya7K5cp-NQd6k",
    email: "impulse.chem@gmail.com"
};

// 2. Автоматическая подстановка защищенных данных и инициализация скролла
document.addEventListener("DOMContentLoaded", function() {
    // ПК версия модалки
    const phoneEl = document.getElementById('modalPhoneNumber');
    if (phoneEl) phoneEl.textContent = contactData.phone;

    const waEl = document.getElementById('waLink');
    if (waEl) waEl.href = contactData.whatsapp;

    const tgEl = document.getElementById('tgLink');
    if (tgEl) tgEl.href = contactData.telegram;

    const maxEl = document.getElementById('maxLink');
    if (maxEl) maxEl.href = contactData.max;

    const emailEl = document.getElementById('emailLink');
    if (emailEl) emailEl.href = "mailto:" + contactData.email;

    // Мобильная версия модалки
    const mPhoneEl = document.getElementById('mobileModalPhone');
    if (mPhoneEl) {
        mPhoneEl.textContent = contactData.phone;
        mPhoneEl.href = "tel:" + contactData.phone;
    }

    const mWaEl = document.getElementById('mWaLink');
    if (mWaEl) mWaEl.href = contactData.whatsapp;

    const mTgEl = document.getElementById('mTgLink');
    if (mTgEl) mTgEl.href = contactData.telegram;

    const mMaxEl = document.getElementById('mMaxLink');
    if (mMaxEl) mMaxEl.href = contactData.max;

    const mEmailEl = document.getElementById('mEmailLink');
    if (mEmailEl) mEmailEl.href = "mailto:" + contactData.email;

    // Логика появления и исчезновения плавающей кнопки при прокрутке
    let timer = null;
    const mainButton = document.querySelector('button[onclick*="handleCall"]') || document.querySelector('button');
    const floatingBtn = document.getElementById('floatingConsultant');

    if (floatingBtn) {
        window.addEventListener('scroll', () => {
            if (!mainButton) return;
            const rect = mainButton.getBoundingClientRect();
            
            // Если верхняя кнопка ушла выше верхней границы экрана
            const isScrolledPast = rect.bottom < 0;

            if (isScrolledPast) {
                if (!timer && floatingBtn.classList.contains('opacity-0')) {
                    timer = setTimeout(() => {
                        floatingBtn.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');
                        floatingBtn.classList.add('translate-y-0', 'opacity-100');
                    }, 4000); 
                }
            } else {
                // Возврат к кнопке заказа — мгновенно прячем плавающую кнопку
                clearTimeout(timer);
                timer = null;
                floatingBtn.classList.remove('translate-y-0', 'opacity-100');
                floatingBtn.classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
            }
        });
    }
});

// 3. Управление модальным окном (разделение ПК / Телефон)
function goBack() {
    if (document.referrer && document.referrer.includes(window.location.hostname)) {
        history.back();
    } else {
        window.location.href = 'catalog.html';
    }
}

function handleCall() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
        const mobileModal = document.getElementById('mobileCallModal');
        if (mobileModal) mobileModal.classList.remove('hidden');
    } else {
        const modal = document.getElementById('callModal');
        if (modal) modal.classList.remove('hidden');
        navigator.clipboard.writeText(contactData.phone);
        
        const copyNotif = document.getElementById('copyNotification');
        if (copyNotif) {
            copyNotif.classList.remove('opacity-0');
            copyNotif.classList.add('opacity-100');
        }
    }
}

// Исправлено: убрана рекурсия (вызов самой себя)
function hideCopyNotification() {
    const copyNotif = document.getElementById('copyNotification');
    if (copyNotif) {
        copyNotif.classList.remove('opacity-100');
        copyNotif.classList.add('opacity-0');
    }
}

function closeModal() {
    const modal = document.getElementById('callModal');
    if (modal) modal.classList.add('hidden');
}

function closeMobileModal() {
    const mobileModal = document.getElementById('mobileCallModal');
    if (mobileModal) mobileModal.classList.add('hidden');
}

// 4. Интерактивные QR-коды (только для ПК)
function showQR(platformName, qrImageSrc) {
    const container = document.getElementById('qrContainer');
    if (container) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center animate-fadeIn">
                <img src="${qrImageSrc}" alt="QR ${platformName}" class="w-[140px] h-[140px] object-contain bg-white p-2 rounded-xl shadow-lg mb-1">
                <span class="text-[14px] text-gray-400">Для перехода в ${platformName} с помощью телефона отсканируйте QR код</span>
            </div>
        `;
    }
}

function resetQR() {
    const container = document.getElementById('qrContainer');
    if (container) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center">
                <img src="logo.png" alt="Логотип ТД Импульс" class="w-[270px] h-[270px] object-contain p-2 rounded-xl mb-1 opacity-90">
            </div>
        `;
    }
}

// Функция клика по e-mail для ПК
function handleEmailClick() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const emailAddress = (typeof contactData !== 'undefined' && contactData.email) ? contactData.email : "impulse.chem@gmail.com";

    if (isMobile) {
        window.location.href = "mailto:" + emailAddress;
    } else {
        const emailValEl = document.getElementById('modalEmailValue');
        const emailModal = document.getElementById('emailModal');
        const mailtoBtn = document.getElementById('emailMailtoBtn');
        const warningEl = document.getElementById('emailWarningText');

        if (emailValEl) {
            emailValEl.textContent = emailAddress;
        }
        if (mailtoBtn) {
            mailtoBtn.href = "mailto:" + emailAddress;
            mailtoBtn.onclick = function() {
                if (warningEl) {
                    warningEl.classList.remove('hidden');
                }
            };
        }
        if (warningEl) {
            warningEl.classList.add('hidden');
        }
        if (emailModal) {
            emailModal.classList.remove('hidden');
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(emailAddress).catch(err => {
                console.error('Ошибка копирования: ', err);
            });
        }
    }
}

function closeEmailModal() {
    const modal = document.getElementById('emailModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Динамическое смещение плавающей кнопки при прокрутке до футера
window.addEventListener('scroll', function() {
    const consultant = document.getElementById('floatingConsultant');
    const footer = document.querySelector('footer');
    
    if (!consultant || !footer) return;

    const footerRect = footer.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Если футер появляется в зоне видимости экрана
    if (footerRect.top < windowHeight - 20) {
        const overlap = (windowHeight - 20) - footerRect.top;
        consultant.style.transform = `translateY(-${overlap}px)`;
        consultant.style.transition = 'transform 0.1s ease-out';
    } else {
        consultant.style.transform = 'translateY(0px)';
    }
});