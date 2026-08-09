// 1. Зашифрованные данные (XOR ^ 7 + Hex)
const contactData = {
    phone: "2c303e313e3234363534353e",
    phoneComDir: "2c303e34303f32323e323736", 
	email: "6e6a77726b746229646f626a47606a666e6b2964686a",
    whatsapp: "6f737377743d28287066296a62282c353635313e3336303736303e",
    telegram: "6f737377743d282873296a622873636e6a77726b7462",
    max: "6f737377743d28286a667f297572287228613e4b4f6863433764484e4a5653327557714b664a304c4835695876624164646860756d6e487235633f69614a307e66304c3264772a495663316c"
};

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
    const waEl = document.getElementById('waLink');
    if (waEl) waEl.href = getContact('whatsapp');

    const tgEl = document.getElementById('tgLink');
    if (tgEl) tgEl.href = getContact('telegram');

    const maxEl = document.getElementById('maxLink');
    if (maxEl) maxEl.href = getContact('max');

    const mWaEl = document.getElementById('mWaLink');
    if (mWaEl) mWaEl.href = getContact('whatsapp');

    const mTgEl = document.getElementById('mTgLink');
    if (mTgEl) mTgEl.href = getContact('telegram');

    const mMaxEl = document.getElementById('mMaxLink');
    if (mMaxEl) mMaxEl.href = getContact('max');
	
	const emailTd = document.getElementById('email');
    if (emailTd) {
        emailTd.textContent = getContact('email');
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

function handleCall() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const realPhone = getContact('phone');

    const phoneEl = document.getElementById('modalPhoneNumber');
    if (phoneEl) phoneEl.textContent = realPhone;

    const mPhoneEl = document.getElementById('mobileModalPhone');
    if (mPhoneEl) {
        mPhoneEl.textContent = realPhone;
        mPhoneEl.href = "tel:" + realPhone;
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
    if (modal) modal.classList.add('hidden');
}

function closeMobileModal() {
    const mobileModal = document.getElementById('mobileCallModal');
    if (mobileModal) mobileModal.classList.add('hidden');
}

// 4. Безопасные интерактивные QR-коды (защита от XSS)
function showQR(platformName, qrImageSrc) {
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