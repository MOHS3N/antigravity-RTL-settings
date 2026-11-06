const fs = require('fs');
const path = require('path');

const ASAR_PATH = path.join(
  process.env.LOCALAPPDATA || 'C:\\Users\\mohse\\AppData\\Local',
  'Programs',
  'antigravity',
  'resources',
  'app.asar'
);

const BACKUP_PATH = ASAR_PATH + '.original';

console.log('=== بازگردانی Antigravity به تنظیمات اولیه (پیش‌فرض) ===');

if (!fs.existsSync(BACKUP_PATH)) {
  console.error('خطا: نسخه پشتیبان اولیه (app.asar.original) یافت نشد!');
  process.exit(1);
}

try {
  fs.copyFileSync(BACKUP_PATH, ASAR_PATH);
  console.log('فایل اصلی با موفقیت بازگردانی شد:', ASAR_PATH);
  console.log('نرم‌افزار را مجدداً باز کنید تا تغییرات به حالت پیش‌فرض بازگردد.');
} catch (err) {
  console.error('خطا در بازگردانی فایل:', err.message);
  process.exit(1);
}
