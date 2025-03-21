/**
 * ملف وظائف واجهة المستخدم - النسخة المعدلة
 */

// دالة للتبديل بين الشاشات
function switchScreen(screenId) {
    // إخفاء جميع الشاشات
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'none';
    
    // إظهار الشاشة المطلوبة
    document.getElementById(screenId).style.display = 'block';
}

// دالة لتحديث واجهة المستخدم بناءً على حالة اللعبة
function updateUI() {
    // تحديث شاشة الإعداد
    updateSetupScreen();
    
    // تحديث شاشة اللعبة
    updateGameScreen();
    
    // تحديث شاشة النتيجة
    updateResultScreen();
}

// دالة لتحديث شاشة الإعداد
function updateSetupScreen() {
    document.getElementById('time-limit').value = gameState.timeLimit;
    document.getElementById('questions-per-player').value = gameState.questionsPerPlayer;
    
    // تحديد المجال المختار (إن وجد)
    if (gameState.category) {
        const categories = document.querySelectorAll('.category');
        categories.forEach(category => {
            if (category.getAttribute('data-category') === gameState.category) {
                category.classList.add('selected');
            } else {
                category.classList.remove('selected');
            }
        });
    }
}

// دالة لتحديث شاشة اللعبة
function updateGameScreen() {
    // تحديث معلومات اللعبة
    document.getElementById('current-question').textContent = gameState.currentQuestion;
    document.getElementById('total-questions').textContent = gameState.totalQuestions;
    if (gameState.players.length > 0 && gameState.currentPlayerIndex < gameState.players.length) {
        document.getElementById('current-player').textContent = gameState.players[gameState.currentPlayerIndex].name;
    }
    document.getElementById('timer').textContent = gameState.timeLimit;
    
    // تحديث بطاقات نقاط اللاعبين
    updatePlayerScoresUI();
    
    // تحديث أزرار منح النقاط
    updateAwardButtons();
    
    // تحديث حالة الشاشة بناءً على حالة اللعبة
    if (gameState.answerShown) {
        // إذا كانت الإجابة قد تم إظهارها بالفعل
        document.getElementById('blurred-image').classList.add('hide-image');
        document.getElementById('original-image').classList.add('show-image');
        document.getElementById('original-image').style.display = 'block';
        document.getElementById('character-name').style.display = 'block';
        document.getElementById('show-answer').style.display = 'none';
        document.getElementById('score-controls').style.display = 'block';
    } else {
        // إذا كانت الإجابة لم تظهر بعد
        document.getElementById('blurred-image').classList.remove('hide-image');
        document.getElementById('original-image').style.display = 'none';
        document.getElementById('character-name').style.display = 'none';
        document.getElementById('show-answer').style.display = 'inline-block';
        document.getElementById('score-controls').style.display = 'none';
        document.getElementById('next-question').style.display = 'none';
    }
}

// دالة لتحديث شاشة النتيجة
function updateResultScreen() {
    updateWinnerText();
    updateResultScreen();
}

// إضافة مستمعي الأحداث للأزرار التفاعلية
function setupContactListeners() {
    // زر فتح قسم التواصل
    document.getElementById('contact-btn').addEventListener('click', showContactScreen);
    
    // زر إغلاق قسم التواصل
    document.getElementById('close-contact').addEventListener('click', hideContactScreen);
    
    // زر إرسال الرسالة
    document.getElementById('send-message').addEventListener('click', sendContactMessage);
    
    // زر فتح شاشة الإرشادات
    document.getElementById('help-btn').addEventListener('click', showHelpScreen);
    
    // زر إغلاق شاشة الإرشادات
    document.getElementById('close-help').addEventListener('click', hideHelpScreen);
}

// دالة لإظهار شاشة التواصل
function showContactScreen() {
    // إنشاء طبقة معتمة
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.id = 'contact-overlay';
    document.body.appendChild(overlay);
    
    // إظهار شاشة التواصل
    document.getElementById('contact-screen').style.display = 'block';
    
    // إضافة مستمع لإغلاق الشاشة عند النقر خارجها
    overlay.addEventListener('click', hideContactScreen);
}

// دالة لإخفاء شاشة التواصل
function hideContactScreen() {
    document.getElementById('contact-screen').style.display = 'none';
    
    // إزالة الطبقة المعتمة
    const overlay = document.getElementById('contact-overlay');
    if (overlay) {
        document.body.removeChild(overlay);
    }
}

// دالة لإرسال رسالة التواصل
function sendContactMessage() {
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();
    
    // التحقق من البيانات
    if (!name || !email || !message) {
        showMessage('الرجاء ملء جميع الحقول المطلوبة');
        return;
    }
    
    // في تطبيق حقيقي، هنا ترسل البيانات إلى خادم أو خدمة بريد إلكتروني
    // لأغراض العرض، نعرض رسالة تأكيد
    showMessage('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
    
    // إعادة تعيين النموذج
    document.getElementById('contact-name').value = '';
    document.getElementById('contact-email').value = '';
    document.getElementById('contact-message').value = '';
    
    // إغلاق شاشة التواصل
    hideContactScreen();
}

// دالة لإظهار شاشة الإرشادات
function showHelpScreen() {
    // إنشاء طبقة معتمة
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.id = 'help-overlay';
    document.body.appendChild(overlay);
    
    // إظهار شاشة الإرشادات
    document.getElementById('help-screen').style.display = 'block';
    
    // إضافة مستمع لإغلاق الشاشة عند النقر خارجها
    overlay.addEventListener('click', hideHelpScreen);
}

// دالة لإخفاء شاشة الإرشادات
function hideHelpScreen() {
    document.getElementById('help-screen').style.display = 'none';
    
    // إزالة الطبقة المعتمة
    const overlay = document.getElementById('help-overlay');
    if (overlay) {
        document.body.removeChild(overlay);
    }
}

// إضافة استدعاء لإعداد مستمعي الأحداث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    setupContactListeners();
});