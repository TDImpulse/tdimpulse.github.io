const fs = require('fs');
const path = require('path');

const PRICES_FILE = path.join(__dirname, 'prices.json');

if (!fs.existsSync(PRICES_FILE)) {
  console.log('Файл prices.json не найден, пропускаем.');
  process.exit(0);
}

const rawData = fs.readFileSync(PRICES_FILE, 'utf8');
const pricesData = JSON.parse(rawData);

// Получаем список файлов прямо из ключей JSON
const targetKeys = Object.keys(pricesData);

targetKeys.forEach(key => {
  // Формируем имя рабочей страницы: например "soda-pishchevaya.html"
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

  // 1. Форматируем и обновляем ЦЕНУ
  const rawPrice = itemData.price || itemData.withVAT || "20450";
  const numericPrice = String(rawPrice).replace(/\s+/g, '');
  const formattedPrice = numericPrice.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  // Визуальный блок цены
  const priceValRegex = /(<span id="product-price-val"[^>]*>)(.*?)(<\/span>)/i;
  if (priceValRegex.test(html)) {
    html = html.replace(priceValRegex, `$1${formattedPrice}$3`);
    modified = true;
  }

  // Schema.org цена
  const schemaPriceRegex = /("price":\s*")[^"]*(")/i;
  if (schemaPriceRegex.test(html)) {
    html = html.replace(schemaPriceRegex, `$1${numericPrice}$2`);
    modified = true;
  }

  // 2. Обновляем статус НДС
  if (typeof itemData.vatIncluded !== 'undefined') {
    const isVatIncluded = Boolean(itemData.vatIncluded);
    const vatText = isVatIncluded ? 'с НДС' : 'без НДС';

    const vatBadgeRegex = /(<div[^>]*id="product-vat-badge"[^>]*>)(.*?)(<\/div>)/i;
    const vatBadgeAltRegex = /(<span[^>]*id="product-vat-badge"[^>]*>)(.*?)(<\/span>)/i;

    if (vatBadgeRegex.test(html)) {
      html = html.replace(vatBadgeRegex, `$1${vatText}$3`);
      modified = true;
    } else if (vatBadgeAltRegex.test(html)) {
      html = html.replace(vatBadgeAltRegex, `$1${vatText}$3`);
      modified = true;
    }

    const schemaVatRegex = /("valueAddedTaxIncluded":\s*)(true|false)/i;
    if (schemaVatRegex.test(html)) {
      html = html.replace(schemaVatRegex, `$1${isVatIncluded}`);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`Успешно обновлен файл: ${filename} -> цена: ${formattedPrice}, НДС: ${itemData.vatIncluded}`);
  }
});