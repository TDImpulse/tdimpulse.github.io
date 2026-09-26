const fs = require('fs');
const path = require('path');

// Список страниц для теста
const TARGET_FILES = [
  'natr-edkiy-zhidkiy-RD_TEST.html',
  'polielektrolit-vpk-402_TEST.html',
  'soda-kalcinirovannaya-tehnicheskaya_TEST.html',
  'soda-pishchevaya_TEST.html'
];

const PRICES_FILE = path.join(__dirname, 'prices.json');

if (!fs.existsSync(PRICES_FILE)) {
  console.log('Файл prices.json не найден, пропускаем.');
  process.exit(0);
}

const rawData = fs.readFileSync(PRICES_FILE, 'utf8');
const pricesData = JSON.parse(rawData);

TARGET_FILES.forEach(filename => {
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`Файл ${filename} не найден.`);
    return;
  }

  let html = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Очищаем имя файла до чистого slug (например: soda-pishchevaya)
  const cleanKey = filename.replace('_TEST.html', '').replace('.html', '');
  
  // Ищем данные по ключу
  const itemData = pricesData[cleanKey] || pricesData[`${cleanKey}.html`] || pricesData[filename];

  if (!itemData) {
    console.warn(`Нет данных в prices.json для ключа: ${cleanKey}`);
    return;
  }

  // 1. Форматируем и обновляем ЦЕНУ
  const rawPrice = itemData.price || itemData.withVAT || "20450";
  const numericPrice = String(rawPrice).replace(/\s+/g, '');
  const formattedPrice = numericPrice.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  // Обновление цены в визуальном блоке
  const priceValRegex = /(<span id="product-price-val"[^>]*>)(.*?)(<\/span>)/i;
  if (priceValRegex.test(html)) {
    html = html.replace(priceValRegex, `$1${formattedPrice}$3`);
    modified = true;
  }

  // Обновление цены в Schema.org
  const schemaPriceRegex = /("price":\s*")[^"]*(")/i;
  if (schemaPriceRegex.test(html)) {
    html = html.replace(schemaPriceRegex, `$1${numericPrice}$2`);
    modified = true;
  }

  // 2. Обновляем статус НДС (vatIncluded: true/false)
  if (typeof itemData.vatIncluded !== 'undefined') {
    const isVatIncluded = Boolean(itemData.vatIncluded);
    const vatText = isVatIncluded ? 'с НДС' : 'без НДС';

    // Обновляем текст на неоновой плашке (кнопке)
    const vatBadgeRegex = /(<div[^>]*id="product-vat-badge"[^>]*>)(.*?)(<\/div>)/i;
    const vatBadgeAltRegex = /(<span[^>]*id="product-vat-badge"[^>]*>)(.*?)(<\/span>)/i;

    if (vatBadgeRegex.test(html)) {
      html = html.replace(vatBadgeRegex, `$1${vatText}$3`);
      modified = true;
    } else if (vatBadgeAltRegex.test(html)) {
      html = html.replace(vatBadgeAltRegex, `$1${vatText}$3`);
      modified = true;
    }

    // Обновляем Schema.org ("valueAddedTaxIncluded": true/false)
    const schemaVatRegex = /("valueAddedTaxIncluded":\s*)(true|false)/i;
    if (schemaVatRegex.test(html)) {
      html = html.replace(schemaVatRegex, `$1${isVatIncluded}`);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`Успешно обновлен: ${filename} -> цена: ${formattedPrice}, НДС: ${itemData.vatIncluded}`);
  }
});