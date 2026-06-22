import puppeteer from 'puppeteer';

// 1. THAY ĐỔI ĐƯỜNG LINK TRANG WEB CỦA BẠN VÀO ĐÂY (Link Vercel)
const TARGET_URL = 'https://edtech-openday-2026.vercel.app'; 

// 2. Cấu hình số lượt truy cập và thời gian
const TOTAL_VISITS = 200;
const DAYS = 2;
const TOTAL_MINUTES = DAYS * 24 * 60;
const INTERVAL_MINUTES = TOTAL_MINUTES / TOTAL_VISITS; // Khoảng 14.4 phút / 1 lượt

console.log(`Bot bắt đầu chạy...`);
console.log(`Mục tiêu: ${TOTAL_VISITS} lượt truy cập trong ${DAYS} ngày.`);
console.log(`Trung bình mỗi ${INTERVAL_MINUTES.toFixed(1)} phút sẽ có 1 lượt truy cập mới (dao động ngẫu nhiên để tự nhiên nhất).`);
console.log('-----------------------------------');

async function visitPage() {
    try {
        console.log(`[${new Date().toLocaleString()}] Đang mở trình duyệt...`);
        
        // Mở trình duyệt ẩn (headless)
        const browser = await puppeteer.launch({ 
            headless: true, // Chạy ngầm không hiện cửa sổ
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        // Fake User Agent để Vercel không nhận ra là bot
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
        
        // Truy cập trang web
        await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });
        
        // Đợi 10 giây để Vercel Analytics kịp load Javascript và gửi báo cáo lượt xem
        await new Promise(r => setTimeout(r, 10000));
        
        await browser.close();
        console.log(`[${new Date().toLocaleString()}] Truy cập thành công! Đã gửi dữ liệu cho Vercel.`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString()}] Lỗi khi truy cập:`, error.message);
    }
}

// Hàm chạy vòng lặp
async function startBot() {
    let visits = 0;
    
    // Chạy ngay lượt đầu tiên
    await visitPage();
    visits++;
    
    while (visits < TOTAL_VISITS) {
        // Tính toán thời gian đợi ngẫu nhiên (+/- 30% để nhìn giống người thật truy cập rải rác)
        const randomVariation = (Math.random() * 0.6 - 0.3); 
        const waitTimeMs = (INTERVAL_MINUTES + INTERVAL_MINUTES * randomVariation) * 60 * 1000;
        
        console.log(`Đã hoàn thành ${visits}/${TOTAL_VISITS} lượt.`);
        console.log(`Chờ khoảng ${(waitTimeMs/60000).toFixed(1)} phút cho lượt tiếp theo...`);
        console.log('-----------------------------------');
        
        await new Promise(r => setTimeout(r, waitTimeMs));
        
        await visitPage();
        visits++;
    }
    
    console.log("Đã hoàn thành toàn bộ mục tiêu cày view! Bạn có thể xem trên Dashboard của Vercel.");
}

startBot();
