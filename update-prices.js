const fs = require('fs');
const path = require('path');

const PRICES_FILE = path.join(__dirname, 'prices.json');

if (!fs.existsSync(PRICES_FILE)) {
  console.log('Файл prices.json не найден, пропускаем.');
  process.exit(0);
}

const rawData = fs.readFileSync(PRICES_FILE, 'utf8');
const pricesData = JSON.parse(rawData);

const targetKeys = Object.keys(pricesData);

targetKeys.forEach(key => {
  const cleanKey = key.replace('.html', '');
  const filename = `${cleanKey}.html`;
  const filePath = path.join(__dirname, filename);

  if (!fs.existsSync(filePath)) {
    console.warn(`Файл ${filename} не найден.`);
    return;
  }

  let html = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  const itemData = pricesData[key];

  // Извлекаем цену
  const rawPrice = itemData.price !== undefined ? itemData.price : (itemData.withVAT || "0");
  const numericPriceVal = parseFloat(String(rawPrice).replace(/\s+/g, '')) || 0;

  // --- 1. ОБРАБОТКА ДВУХ РЕЖИМОВ (ДОГОВОРНАЯ / ЦЕНА В ЦИФРАХ) ---

  if (numericPriceVal === 0) {
    // === РЕЖИМ: ДОГОВОРНАЯ ЦЕНА ===
    
    // 1. Очищаем префикс "от"
    html = html.replace(/(<span[^>]*id="product-price-prefix"[^>]*>)(.*?)(<\/span>)/i, '$1$3');

    // 2. Ставим слово "договорная" и меняем шрифт на semibold (как у "ОПТОВАЯ ЦЕНА")
    const priceValRegex = /(<span[^>]*id="product-price-val"[^>]*class=")[^"]*("[^>]*>)(.*?)(<\/span>)/i;
    if (priceValRegex.test(html)) {
      html = html.replace(
        priceValRegex,
        `$1text-2xl sm:text-3xl font-semibold text-white tracking-tight$2договорная$4`
      );
    }

    // 3. Очищаем суффикс "руб/т"
    html = html.replace(/(<span[^>]*id="product-price-suffix"[^>]*>)(.*?)(<\/span>)/i, '$1$3');

    // 4. Скрываем кнопку НДС
    if (html.includes('id="vat-toggle-btn"')) {
      html = html.replace(/id="vat-toggle-btn"(\s+style="[^"]*")?/i, 'id="vat-toggle-btn" style="display: none !important;"');
    }

    modified = true;

  } else {
    // === РЕЖИМ: ОБЫЧНАЯ ЦЕНА (> 0) ===
    
    const formattedPrice = String(numericPriceVal).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    // 1. Возвращаем префикс "от"
    html = html.replace(/(<span[^>]*id="product-price-prefix"[^>]*>)(.*?)(<\/span>)/i, '$1от$3');

    // 2. Вставляем число и возвращаем оригинальные шрифты (font-extrabold font-mono)
    const priceValRegex = /(<span[^>]*id="product-price-val"[^>]*class=")[^"]*("[^>]*>)(.*?)(<\/span>)/i;
    if (priceValRegex.test(html)) {
      html = html.replace(
        priceValRegex,
        `$1text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight$2${formattedPrice}$4`
      );
    }

    // 3. Возвращаем суффикс "руб/т"
    html = html.replace(/(<span[^>]*id="product-price-suffix"[^>]*>)(.*?)(<\/span>)/i, '$1руб/т$3');

    // 4. Показываем кнопку НДС
    html = html.replace(/id="vat-toggle-btn"\s+style="display:\s*none\s*!important;"/gi, 'id="vat-toggle-btn"');

    // 5. Обновляем статус НДС (с НДС / без НДС)
    if (typeof itemData.vatIncluded !== 'undefined') {
      const vatText = Boolean(itemData.vatIncluded) ? 'с НДС' : 'без НДС';
      const vatBadgeRegex = /(<span[^>]*id="product-vat-badge"[^>]*>)(.*?)(<\/span>)/i;
      if (vatBadgeRegex.test(html)) {
        html = html.replace(vatBadgeRegex, `$1${vatText}$3`);
      }
    }

    modified = true;
  }

  // --- 2. ОБНОВЛЕНИЕ МИКРОРАЗМЕТКИ SCHEMA.ORG ---
  const priceForSchema = numericPriceVal === 0 ? "0" : String(numericPriceVal);
  html = html.replace(/("price":\s*")[^"]*(")/gi, `$1${priceForSchema}$2`);

  if (typeof itemData.vatIncluded !== 'undefined') {
    const isVatIncluded = Boolean(itemData.vatIncluded);
    html = html.replace(/("valueAddedTaxIncluded":\s*)(true|false)/gi, `$1${isVatIncluded}`);
  }

  if (modified) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`Обновлен: ${filename} -> ${numericPriceVal === 0 ? 'договорная' : formattedPrice + ' руб/т'}`);
  }
});