// 1. Зашифрованные данные (XOR ^ 7 + Hex)
const contactData = {
    phone: "2c303e313e3234363534353e",
    phoneComDir: "2c303e34303f32323e323736", 
	email: "6e6a77726b746229646f626a47606a666e6b2964686a",
    whatsapp: "6f737377743d28287066296a62282c353635313e3336303736303e",
    telegram: "6f737377743d282873296a622873636e6a77726b7462",
    max: "6f737377743d28286a667f297572287228613e4b4f6863433764484e4a5653327557714b664a304c4835695876624164646860756d6e487235633f69614a307e66304c3264772a495663316c"
};

let callModalStartTime = 0; // Переменная для таймера
let qrStartTime = 0;        // Время начала просмотра QR-кода
let currentQrPlatform = ''; // Текущая активная платформа QR-кода


// 2. Функция мгновенной и точной расшифровки
function getContact(type) {
    const hex = contactData[type];
    if (!hex) return '';

    let result = '';
    for (let i = 0; i < hex.length; i += 2) {
        // Извлекаем байт и применяем XOR обратно
        const charCode = parseInt(hex.substr(i, 2), 16) ^ 7;
        result += String.fromCharCode(charCode);
    }
    return result;
}

// 2. Инициализация ссылок на мессенджеры при загрузке страницы
document.addEventListener("DOMContentLoaded", function() {
	// Если это главная страница, логируем короткое название
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
        logEvent('۰ Главная');
    } else {
        // Иначе ищем хлебные крошки для страниц товаров
        const breadcrumbTitle = document.querySelector('nav[aria-label="breadcrumb"] span.text-white.font-medium');
        if (breadcrumbTitle) {
            logEvent('۰ ' + breadcrumbTitle.textContent.trim());
        }
    }
	
    // --- WhatsApp (десктоп и мобильный) ---
    [document.getElementById('waLink'), document.getElementById('mWaLink')].forEach(el => {
        if (el) {
            el.href = getContact('whatsapp');
            el.addEventListener('click', () => logEvent('[🗨 WhatsApp]'));
        }
    });

    // --- Telegram (десктоп и мобильный) ---
    [document.getElementById('tgLink'), document.getElementById('mTgLink')].forEach(el => {
        if (el) {
            el.href = getContact('telegram');
            el.addEventListener('click', () => logEvent('[🗨 Telegram]'));
        }
    });

    // --- Max / Другой мессенджер (десктоп и мобильный) ---
    [document.getElementById('maxLink'), document.getElementById('mMaxLink')].forEach(el => {
        if (el) {
            el.href = getContact('max');
            el.addEventListener('click', () => logEvent('[🗨 Max]'));
        }
    });
	
	// --- E-mail ---
	const emailTd = document.getElementById('email');
    if (emailTd) {
        emailTd.textContent = getContact('email');
    }
	
	const mEmailEl = document.getElementById('mEmailLink');
	if (mEmailEl) {
		mEmailEl.href = "mailto:" + getContact('email');
        mEmailEl.addEventListener('click', () => logEvent('[📧 Email]'));
	}
	
	const phoneComDirTd = document.getElementById('phoneComDir');
    if (phoneComDirTd) {
        phoneComDirTd.textContent = getContact('phoneComDir');
    }
		
	const phone = document.getElementById('phone');
    if (phone) {
        phone.textContent = getContact('phone');
    }
	
	
	    // Логика появления и исчезновения плавающей кнопки при прокрутке
    let timer = null;
    const mainButton = document.querySelector('button[onclick*="handleCall"]') || document.querySelector('button');
    const floatingBtn = document.getElementById('floatingConsultant');

    if (floatingBtn) {
        window.addEventListener('scroll', () => {
            if (!mainButton) return;
            const rect = mainButton.getBoundingClientRect();
            const isScrolledPast = rect.bottom < 0;

            if (isScrolledPast) {
                if (!timer && floatingBtn.classList.contains('opacity-0')) {
                    timer = setTimeout(() => {
                        floatingBtn.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');
                        floatingBtn.classList.add('translate-y-0', 'opacity-100');
                    }, 4000); 
                }
            } else {
                clearTimeout(timer);
                timer = null;
                floatingBtn.classList.remove('translate-y-0', 'opacity-100');
                floatingBtn.classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
            }
        });
    }
});


function goBack(event) {
    if (document.referrer && document.referrer.includes(window.location.hostname)) {
        if (event) event.preventDefault();
        history.back();
    } else if (!event) {
        window.location.href = 'catalog.html';
    }
}

// Функция при клике на иконки слева
function handleCallIcons() {
    logEvent('[☎✉️]');
    openCallModalWindow();
}

// Функция при клике на текст справа
function handleCallText() {
    logEvent('[Заказать продукт]');
    openCallModalWindow();
}

// Общая логика открытия модального окна (вынесена отдельно, чтобы не дублировать код)
function openCallModalWindow() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const realPhone = getContact('phone');

    const phoneEl = document.getElementById('modalPhoneNumber');
    if (phoneEl) phoneEl.textContent = realPhone;

    const mPhoneEl = document.getElementById('mobileModalPhone');
    if (mPhoneEl) {
        mPhoneEl.textContent = realPhone;
        mPhoneEl.href = "tel:" + realPhone;
		mPhoneEl.addEventListener('click', () => logEvent('[☎️ Звонок с телефона]'));
    }

    if (isMobile) {
        const mobileModal = document.getElementById('mobileCallModal');
        if (mobileModal) mobileModal.classList.remove('hidden');
    } else {
        const modal = document.getElementById('callModal');
        if (modal) modal.classList.remove('hidden');
        
        if (navigator.clipboard && realPhone) {
            navigator.clipboard.writeText(realPhone);
        }
        
        const copyNotif = document.getElementById('copyNotification');
        if (copyNotif) {
            copyNotif.classList.remove('opacity-0');
            copyNotif.classList.add('opacity-100');
        }
    }
callModalStartTime = Date.now();	
}

 //для плавающей кнопки сбоку
function handleCall() {
    logEvent('[💬]');
    openCallModalWindow();
}


function hideCopyNotification() {
    const copyNotif = document.getElementById('copyNotification');
    if (copyNotif) {
        copyNotif.classList.remove('opacity-100');
        copyNotif.classList.add('opacity-0');
    }
}

function closeModal() {
    const modal = document.getElementById('callModal');
    if (modal && !modal.classList.contains('hidden')) { 
        const duration = Math.round((Date.now() - callModalStartTime) / 1000);
        if (duration >= 9) { // Логируем телефон, только если модалка была открыта от 9 секунд
            logEvent('timer' + duration);
        }
        modal.classList.add('hidden');
    }
}

function closeMobileModal() {
    const mobileModal = document.getElementById('mobileCallModal');
    if (mobileModal && !mobileModal.classList.contains('hidden')) { 
        const duration = Math.round((Date.now() - callModalStartTime) / 1000);
        if (duration >= 9) { // То же самое для мобильной модалки
            logEvent('timer' + duration);
        }
        mobileModal.classList.add('hidden');
    }
}


// 4. Безопасные интерактивные QR-коды (защита от XSS)
function showQR(platformName, qrImageSrc) {
    // Если пользователь переключился с одного QR-кода на другой, 
    // сначала фиксируем время просмотра предыдущего
    if (currentQrPlatform && qrStartTime > 0) {
        currentQrPlatform = null;
        qrStartTime = 0;
    }

    // Запоминаем новый мессенджер и запускаем таймер
    currentQrPlatform = platformName;
    qrStartTime = Date.now();

    const container = document.getElementById('qrContainer');
    if (!container) return;

    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col items-center justify-center animate-fadeIn';

    const img = document.createElement('img');
    img.src = qrImageSrc;
    img.alt = `QR ${platformName}`;
    img.className = 'w-[140px] h-[140px] object-contain bg-white p-2 rounded-xl shadow-lg mb-1';

    const text = document.createElement('span');
    text.className = 'text-[14px] text-gray-400';
    text.textContent = `Для перехода в ${platformName} с помощью телефона отсканируйте QR код`;

    wrapper.appendChild(img);
    wrapper.appendChild(text);
    container.appendChild(wrapper);
}

function resetQR() {
    // Когда мышка ушла с иконки и вернулся логотип
    if (currentQrPlatform && qrStartTime > 0) {
        const duration = Math.round((Date.now() - qrStartTime) / 1000);
        if (duration >= 9) { // Отсекаем случайные микро-наведения меньше секунды
            logEvent('📷 QR ' + currentQrPlatform );
        }
    }

    // Сбрасываем значения таймера
    currentQrPlatform = null;
    qrStartTime = 0;

    const container = document.getElementById('qrContainer');
    if (container) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center">
                <img src="images/logo.webp" alt="Логотип ТД Импульс" class="w-[270px] h-[270px] object-contain p-2 rounded-xl mb-1 opacity-90">
            </div>
        `;
    }
}

// 5. Обработка E-mail по клику
function handleEmailClick() {
    logEvent('[📧 Email]');
	const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const emailAddress = getContact('email');

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

    if (footerRect.top < windowHeight - 20) {
        const overlap = (windowHeight - 20) - footerRect.top;
        consultant.style.transform = `translateY(-${overlap}px)`;
        consultant.style.transition = 'transform 0.1s ease-out';
    } else {
        consultant.style.transform = 'translateY(0px)';
    }
});

function logEvent(buttonName) {
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxMZR4b8JjQ_T8ACzViz1oSlvqvUUJD4IuB8KvjmRA7nTxIkTHMmlHqsT6I1U0kKX7-ng/exec';

    const page = window.location.pathname.split('/').pop() || 'index.html';
    const source = document.referrer 
        ? new URL(document.referrer).hostname 
        : 'direct';

    let sessionId = sessionStorage.getItem('anon_session');
    if (!sessionId) {
        sessionId = Math.random().toString(36).substring(2, 9) + '-' + Date.now();
        sessionStorage.setItem('anon_session', sessionId);
    }

    const logData = {
        session_id: sessionId,
        source: source,
        page: page,
        button: buttonName,
        time: new Date().toISOString()
    };

    // Отправляем данные максимально быстро
    fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', 
        body: JSON.stringify(logData)
    });
}

// =====  ЛОГИРОВАНИЕ КОПИРОВАНИЯ =====
document.addEventListener('copy', function(event) {
    const selectedText = window.getSelection().toString().trim();
    
    if (selectedText.length > 0 && typeof logEvent === 'function') {
        logEvent('📋 Скопировано: ' + selectedText);
    }
});