/**
 * ملف وظائف واجهة المستخدم
 */

// دالة للتبديل بين الشاشات
function switchScreen(screenId) {
    // إخفاء جميع الشاشات
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('waiting-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'none';
    
    // إظهار الشاشة المطلوبة
    document.getElementById(screenId).style.display = 'block';
}

// دالة لتحديث واجهة المستخدم بناءً على حالة اللعبة
function updateUI() {
    // تحديث شاشة الإعداد
    updateSetupScreen();
    
    // تحديث شاشة الانتظار
    updateWaitingScreen();
    
    // تحديث شاشة اللعبة
    updateGameScreen();
    
    // تحديث شاشة النتيجة
    updateResultScreen();
}

// دالة لتحديث شاشة الإعداد
function updateSetupScreen() {
    document.getElementById('time-limit').value = gameState.timeLimit;
    document.getElementById('questions-per-team').value = gameState.questionsPerTeam;
    
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
    
    // تحديث وضع اللعب (أونلاين/محلي)
    if (gameState.isOfflineMode) {
        toggleGameMode('offline');
        document.getElementById('team1-name').value = gameState.teamNames.team1;
        document.getElementById('team2-name').value = gameState.teamNames.team2;
    } else {
        toggleGameMode('online');
    }
}

// دالة لتحديث شاشة الانتظار
function updateWaitingScreen() {
    // تحديث معلومات اللعبة
    const categoryDisplayName = DataManager.getCategoryDisplayName(gameState.category);
    document.getElementById('selected-category-display').textContent = categoryDisplayName;
    document.getElementById('time-limit-display').textContent = gameState.timeLimit;
    document.getElementById('questions-per-team-display').textContent = gameState.questionsPerTeam;
    document.getElementById('game-code-display').textContent = gameState.gameCode;
    
    // إخفاء قسم رمز اللعبة إذا كنا في وضع اللعب المحلي
    document.getElementById('online-waiting').style.display = gameState.isOfflineMode ? 'none' : 'block';
    
    // تحديث أسماء الفرق
    document.getElementById('waiting-team1-name').textContent = gameState.teamNames.team1;
    document.getElementById('waiting-team2-name').textContent = gameState.teamNames.team2;
    
    // تحديث أسماء اللاعبين
    updatePlayerNames();
    
    // تمكين زر بدء اللعبة إذا كان هناك لاعب واحد على الأقل في كل فريق أو كنا في وضع اللعب المحلي
    const canStartGame = gameState.isOfflineMode || (gameState.players.team1.length > 0 && gameState.players.team2.length > 0);
    document.getElementById('start-game').disabled = !canStartGame;
}

// دالة لتحديث أسماء اللاعبين
function updatePlayerNames() {
    // تحديث أسماء الفريق الأول
    const team1PlayersElement = document.getElementById('team1-players');
    team1PlayersElement.innerHTML = '';
    
    if (gameState.isOfflineMode) {
        const playerElement = document.createElement('div');
        playerElement.textContent = 'لعب محلي';
        team1PlayersElement.appendChild(playerElement);
    } else {
        gameState.players.team1.forEach((player, index) => {
            const playerElement = document.createElement('div');
            playerElement.textContent = `لاعب ${index + 1}: ${player}`;
            team1PlayersElement.appendChild(playerElement);
        });
    }
    
    // تحديث أسماء الفريق الثاني
    const team2PlayersElement = document.getElementById('team2-players');
    team2PlayersElement.innerHTML = '';
    
    if (gameState.isOfflineMode) {
        const playerElement = document.createElement('div');
        playerElement.textContent = 'لعب محلي';
        team2PlayersElement.appendChild(playerElement);
    } else {
        gameState.players.team2.forEach((player, index) => {
            const playerElement = document.createElement('div');
            playerElement.textContent = `لاعب ${index + 1}: ${player}`;
            team2PlayersElement.appendChild(playerElement);
        });
    }
}

// دالة لتحديث شاشة اللعبة
function updateGameScreen() {
    // تحديث معلومات اللعبة
    document.getElementById('current-question').textContent = gameState.currentQuestion;
    document.getElementById('total-questions').textContent = gameState.totalQuestions;
    document.getElementById('current-team').textContent = gameState.currentTeam === 1 ? 
        gameState.teamNames.team1 : gameState.teamNames.team2;
    document.getElementById('timer').textContent = gameState.timeLimit;
    
    // تحديث أسماء الفرق
    document.getElementById('game-team1-name').textContent = gameState.teamNames.team1;
    document.getElementById('game-team2-name').textContent = gameState.teamNames.team2;
    document.getElementById('award-team1-name').textContent = gameState.teamNames.team1;
    document.getElementById('award-team2-name').textContent = gameState.teamNames.team2;
    
    // تحديث النقاط
    updateScores();
    
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

// دالة لتحديث النقاط
function updateScores() {
    document.getElementById('team1-score').textContent = gameState.scores.team1;
    document.getElementById('team2-score').textContent = gameState.scores.team2;
}

// دالة لتحديث شاشة النتيجة
function updateResultScreen() {
    // تحديث أسماء الفرق
    document.getElementById('result-team1-name').textContent = gameState.teamNames.team1;
    document.getElementById('result-team2-name').textContent = gameState.teamNames.team2;
    
    // تحديث النقاط النهائية
    document.getElementById('team1-final-score').textContent = gameState.scores.team1;
    document.getElementById('team2-final-score').textContent = gameState.scores.team2;
    
    // تحديد الفائز
    updateWinnerText();
}

// إضافة مستمعي الأحداث لقسم التواصل
function setupContactListeners() {
    // زر فتح قسم التواصل
    document.getElementById('contact-btn').addEventListener('click', showContactScreen);
    
    // زر إغلاق قسم التواصل
    document.getElementById('close-contact').addEventListener('click', hideContactScreen);
    
    // زر إرسال الرسالة
    document.getElementById('send-message').addEventListener('click', sendContactMessage);
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

// دالة لعرض رسالة للمستخدم
function showMessage(message) {
    alert(message);
}

// إضافة استدعاء لإعداد مستمعي التواصل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    setupContactListeners();
});