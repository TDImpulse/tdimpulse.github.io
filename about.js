// 1. Зашифрованные данные (XOR ^ 7 + Hex)
const contactData = {
    phone: "2c303e313e3234363534353e",
    phoneComDir: "2c303e34303f32323e323736", 
    whatsapp: "6f737377743d28287066296a62282c353635313e3336303736303e",
    telegram: "6f737377743d282873296a622873636e6a77726b7462",
    max: "6f737377743d28286a667f297572287228613e4b4f6863433764484e4a5653327557714b664a304c4835695876624164646860756d6e487235633f69614a307e66304c3264772a495663316c"
};

// 2. Функция расшифровки
function getContact(type) {
    const hex = contactData[type];
    if (!hex) return '';

    let result = '';
    for (let i = 0; i < hex.length; i += 2) {
        const charCode = parseInt(hex.substr(i, 2), 16) ^ 7;
        result += String.fromCharCode(charCode);
    }
    return result;
}

// 3. Логика защиты по событиям мыши, скролла и задержкой 200 мс
document.addEventListener("DOMContentLoaded", function() {
    const targetElement = document.getElementById('contactsTableWrapper');
    if (!targetElement) return;

    let decrypted = false;
    let isVisibleInViewport = false;
    let actionTriggered = false;

    // Проверяем видимость таблицы на экране
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isVisibleInViewport = entry.isIntersecting;
            checkAndReveal();
        });
    }, {
        root: null,
        threshold: 0.1
    });

    observer.observe(targetElement);

    function checkAndReveal() {
        if (decrypted) return;
        if (isVisibleInViewport && actionTriggered) {
            decrypted = true;
            
            // Задержка 200 мс перед подстановкой реальных данных
            setTimeout(() => {
                const phoneEl = document.getElementById('phone');
                if (phoneEl) phoneEl.textContent = getContact('phone');

                const phoneComDirEl = document.getElementById('phoneComDir');
                if (phoneComDirEl) phoneComDirEl.textContent = getContact('phoneComDir');

                const phoneComDirMAXEl = document.getElementById('phoneComDirMAX');
                if (phoneComDirMAXEl) phoneComDirMAXEl.textContent = getContact('phoneComDir');
            }, 200);

            removeListeners();
            observer.disconnect();
        }
    }

    // Добавляем события мыши, касаний, скролла и клавиатуры
    const interactionEvents = ['mousemove', 'wheel', 'keydown', 'touchstart', 'scroll'];

    function handleUserActivity() {
        if (actionTriggered) return;
        actionTriggered = true;
        checkAndReveal();
    }

    function removeListeners() {
        interactionEvents.forEach(event => {
            window.removeEventListener(event, handleUserActivity);
        });
    }

    interactionEvents.forEach(event => {
        window.addEventListener(event, handleUserActivity, { passive: true, once: true });
    });
});