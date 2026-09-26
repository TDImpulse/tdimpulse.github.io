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

  // Очищаем имя файла до чистого slug (например: polielektrolit-vpk-402)
  const cleanKey = filename.replace('_TEST.html', '').replace('.html', '');
  
  // Ищем совпадение по любому из возможных вариантов ключа
  const itemData = pricesData[cleanKey] || pricesData[`${cleanKey}.html`] || pricesData[filename];

  if (!itemData) {
    console.warn(`Нет данных в prices.json для ключа: ${cleanKey}`);
    return;
  }

  // Красиво форматируем цену с пробелами для HTML (например: 178 350)
  const rawPrice = itemData.price || itemData.withVAT || "26000";
  const numericPrice = String(rawPrice).replace(/\s+/g, '');
  const formattedPrice = numericPrice.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  // 1. Обновляем цену в неоновом HTML-блоке
  const priceValRegex = /(<span id="product-price-val"[^>]*>)(.*?)(<\/span>)/i;
  if (priceValRegex.test(html)) {
    html = html.replace(priceValRegex, `$1${formattedPrice}$3`);
    modified = true;
  }

  // 2. Обновляем цену в Schema.org (offers -> price)
  const schemaPriceRegex = /("price":\s*")[^"]*(")/i;
  if (schemaPriceRegex.test(html)) {
    html = html.replace(schemaPriceRegex, `$1${numericPrice}$2`);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`Успешно обновлен: ${filename} -> новая цена: ${formattedPrice}`);
  }
});