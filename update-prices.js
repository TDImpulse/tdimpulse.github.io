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

  // Получаем ключ товара (например, "natr-edkiy-zhidkiy-RD.html")
  const productKey = filename.replace('_TEST.html', '.html');
  const itemData = pricesData[productKey] || pricesData[filename];

  if (!itemData) {
    console.warn(`Нет данных в prices.json для ${filename}`);
    return;
  }

  const newPrice = itemData.price || itemData.withVAT || "26 000";
  const numericPrice = String(newPrice).replace(/\s+/g, '');

  // 1. Обновляем цену в неоновом HTML-блоке
  const priceValRegex = /(<span id="product-price-val"[^>]*>)(.*?)(<\/span>)/i;
  if (priceValRegex.test(html)) {
    html = html.replace(priceValRegex, `$1${newPrice}$3`);
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
    console.log(`Успешно обновлен: ${filename}`);
  }
});