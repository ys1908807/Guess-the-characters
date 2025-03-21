/**
 * ملف منطق اللعبة الرئيسي
 */

// كائن حالة اللعبة العالمية
let gameState = {
    gameCode: '',               // رمز الغرفة
    category: '',               // مجال اللعبة المختار
    timeLimit: 30,              // الوقت المحدد لكل دور (بالثواني)
    questionsPerTeam: 10,       // عدد الأسئلة لكل فريق
    currentQuestion: 1,         // رقم السؤال الحالي
    totalQuestions: 20,         // إجمالي عدد الأسئلة (10 لكل فريق)
    currentTeam: 1,             // الفريق الحالي (1 أو 2)
    scores: { team1: 0, team2: 0 }, // نقاط الفريقين
    players: { team1: [], team2: [] }, // أسماء اللاعبين في كل فريق
    teamNames: { team1: 'الفريق الأول', team2: 'الفريق الثاني' }, // أسماء الفرق
    timerInterval: null,        // مرجع مؤقت العد التنازلي
    charactersUsed: [],         // الشخصيات التي تم استخدامها بالفعل
    characters: [],             // قائمة الشخصيات المختارة للعبة الحالية
    currentCharacterIndex: 0,   // مؤشر الشخصية الحالية
    isGameOver: false,          // هل انتهت اللعبة؟
    inSameRoom: false,          // هل نلعب في نفس الغرفة؟
    answerShown: false,         // هل تم إظهار الإجابة؟
    isOfflineMode: false,       // هل نحن في وضع اللعب المحلي (بدون إنترنت)؟
    isDataLoaded: false         // هل تم تحميل البيانات؟
};

// تهيئة مدير البيانات عند تحميل المستند
document.addEventListener('DOMContentLoaded', async function() {
    // تهيئة مدير البيانات
    const dataLoaded = await DataManager.init();
    gameState.isDataLoaded = dataLoaded;
    
    if (!dataLoaded) {
        showMessage('لم يتم تحميل بيانات اللعبة بشكل صحيح. سيتم استخدام البيانات الاحتياطية.');
    }
    
    // إعداد مستمعي الأحداث
    setupEventListeners();
});

// دالة لإعداد مستمعي الأحداث
function setupEventListeners() {
    // أزرار وضع اللعب
    document.getElementById('online-mode').addEventListener('click', () => toggleGameMode('online'));
    document.getElementById('offline-mode').addEventListener('click', () => toggleGameMode('offline'));
    
    // أزرار التحكم
    document.getElementById('show-answer').addEventListener('click', showAnswer);
    document.getElementById('award-team1').addEventListener('click', awardTeam1);
    document.getElementById('award-team2').addEventListener('click', awardTeam2);
    document.getElementById('no-award').addEventListener('click', noAward);
    document.getElementById('next-question').addEventListener('click', nextQuestion);
    
    // أزرار أخرى
    document.getElementById('new-game-same-room').addEventListener('click', newGameSameRoom);
    document.getElementById('play-again-same-room').addEventListener('click', playAgainSameRoom);
    document.getElementById('play-again').addEventListener('click', playAgain);
    document.getElementById('end-game').addEventListener('click', endGame);
    document.getElementById('cancel-game').addEventListener('click', cancelGame);
    
    // أزرار إنشاء والانضمام إلى اللعبة
    document.getElementById('create-game').addEventListener('click', createNewGame);
    document.getElementById('join-game-btn').addEventListener('click', function() {
        document.getElementById('join-game-form').style.display = 'block';
    });
    document.getElementById('join-game-submit').addEventListener('click', joinGame);
    document.getElementById('start-game').addEventListener('click', startGame);
    document.getElementById('start-offline-game').addEventListener('click', startOfflineGame);
    
    // تفعيل اختيار المجالات
    const categoryItems = document.querySelectorAll('.category');
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            categoryItems.forEach(cat => cat.classList.remove('selected'));
            item.classList.add('selected');
            gameState.category = item.getAttribute('data-category');
        });
    });
}

// دالة لإنشاء رمز لعبة عشوائي
function generateGameCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// دالة لإعادة ضبط حالة اللعبة
function resetGame() {
    clearInterval(gameState.timerInterval);
    
    // احتفظ ببعض الإعدادات إذا كنا نلعب في نفس الغرفة
    const keepRoomData = gameState.inSameRoom;
    const oldGameCode = gameState.gameCode;
    const oldPlayers = { ...gameState.players };
    const oldCategory = gameState.category;
    const oldTimeLimit = gameState.timeLimit;
    const oldQuestionsPerTeam = gameState.questionsPerTeam;
    const oldTeamNames = { ...gameState.teamNames };
    const oldIsOfflineMode = gameState.isOfflineMode;
    const oldIsDataLoaded = gameState.isDataLoaded;
    
    // إعادة تعيين كل البيانات
    gameState = {
        gameCode: keepRoomData ? oldGameCode : '',
        category: keepRoomData ? oldCategory : '',
        timeLimit: keepRoomData ? oldTimeLimit : 30,
        questionsPerTeam: keepRoomData ? oldQuestionsPerTeam : 10,
        totalQuestions: keepRoomData ? oldQuestionsPerTeam * 2 : 20,
        currentQuestion: 1,
        currentTeam: 1,
        scores: { team1: 0, team2: 0 },
        players: keepRoomData ? oldPlayers : { team1: [], team2: [] },
        teamNames: keepRoomData ? oldTeamNames : { team1: 'الفريق الأول', team2: 'الفريق الثاني' },
        timerInterval: null,
        charactersUsed: [],
        characters: [],
        currentCharacterIndex: 0,
        isGameOver: false,
        inSameRoom: keepRoomData,
        answerShown: false,
        isOfflineMode: keepRoomData ? oldIsOfflineMode : false,
        isDataLoaded: oldIsDataLoaded
    };
    
    // تحديث واجهة المستخدم
    updateUI();
}

// دالة لإنشاء لعبة جديدة أونلاين
function createNewGame() {
    const playerName = document.getElementById('player-name').value.trim();
    if (!playerName) {
        showMessage('الرجاء إدخال اسم اللاعب');
        return;
    }
    
    if (!gameState.category) {
        showMessage('الرجاء اختيار مجال اللعبة');
        return;
    }
    
    // تعيين معلومات اللعبة
    gameState.timeLimit = parseInt(document.getElementById('time-limit').value);
    gameState.questionsPerTeam = parseInt(document.getElementById('questions-per-team').value) || 10;
    gameState.totalQuestions = gameState.questionsPerTeam * 2;
    gameState.gameCode = generateGameCode();
    gameState.players.team1.push(playerName);
    gameState.isOfflineMode = false;
    
    // اختيار الشخصيات العشوائية للعبة
    gameState.characters = DataManager.getRandomCharacters(gameState.category, gameState.totalQuestions);
    
    // طباعة عدد الشخصيات المختارة للتصحيح
    console.log(`تم اختيار ${gameState.characters.length} شخصية للعبة`);
    
    // تحديث شاشة الانتظار
    updateWaitingScreen();
    
    // الانتقال إلى شاشة الانتظار
    switchScreen('waiting-screen');
    
    // محاكاة انضمام لاعب آخر بعد فترة (للعرض فقط)
    simulateJoinPlayer();
}

// دالة لبدء لعبة محلية (بدون إنترنت)
function startOfflineGame() {
    if (!gameState.category) {
        showMessage('الرجاء اختيار مجال اللعبة');
        return;
    }
    
    // تعيين معلومات اللعبة
    gameState.timeLimit = parseInt(document.getElementById('time-limit').value);
    gameState.questionsPerTeam = parseInt(document.getElementById('questions-per-team').value) || 10;
    gameState.totalQuestions = gameState.questionsPerTeam * 2;
    gameState.isOfflineMode = true;
    
    // تعيين أسماء الفرق المخصصة
    gameState.teamNames.team1 = document.getElementById('team1-name').value.trim() || 'الفريق الأول';
    gameState.teamNames.team2 = document.getElementById('team2-name').value.trim() || 'الفريق الثاني';
    
    // اختيار الشخصيات العشوائية للعبة
    gameState.characters = DataManager.getRandomCharacters(gameState.category, gameState.totalQuestions);
    
    // طباعة عدد الشخصيات المختارة للتصحيح
    console.log(`تم اختيار ${gameState.characters.length} شخصية للعبة المحلية`);
    
    // تحديث أسماء الفرق في جميع شاشات اللعبة
    updateTeamNames();
    
    // بدء اللعبة مباشرة
    startGame();
}

// دالة لتحديث أسماء الفرق في جميع شاشات اللعبة
function updateTeamNames() {
    // شاشة الانتظار
    document.getElementById('waiting-team1-name').textContent = gameState.teamNames.team1;
    document.getElementById('waiting-team2-name').textContent = gameState.teamNames.team2;
    
    // شاشة اللعبة
    document.getElementById('game-team1-name').textContent = gameState.teamNames.team1;
    document.getElementById('game-team2-name').textContent = gameState.teamNames.team2;
    document.getElementById('award-team1-name').textContent = gameState.teamNames.team1;
    document.getElementById('award-team2-name').textContent = gameState.teamNames.team2;
    
    // شاشة النتيجة
    document.getElementById('result-team1-name').textContent = gameState.teamNames.team1;
    document.getElementById('result-team2-name').textContent = gameState.teamNames.team2;
    
    // تحديث اسم الفريق الحالي
    document.getElementById('current-team').textContent = gameState.currentTeam === 1 ? 
        gameState.teamNames.team1 : gameState.teamNames.team2;
}

// دالة لانضمام لاعب إلى لعبة موجودة
function joinGame() {
    const playerName = document.getElementById('player-name').value.trim();
    const gameCode = document.getElementById('game-code-input').value.trim().toUpperCase();
    
    if (!playerName) {
        showMessage('الرجاء إدخال اسم اللاعب');
        return;
    }
    
    if (!gameCode) {
        showMessage('الرجاء إدخال رمز اللعبة');
        return;
    }
    
    // في تطبيق حقيقي، هنا سنتحقق من وجود اللعبة بالرمز المدخل
    // محاكاة الانضمام إلى لعبة موجودة
    gameState.gameCode = gameCode;
    gameState.category = 'anime'; // افتراضي للعرض
    gameState.timeLimit = 30;
    gameState.questionsPerTeam = 10;
    gameState.totalQuestions = 20;
    gameState.players.team1.push('منشئ اللعبة');
    gameState.players.team2.push(playerName);
    gameState.isOfflineMode = false;
    
    // اختيار الشخصيات العشوائية للعبة
    gameState.characters = DataManager.getRandomCharacters(gameState.category, gameState.totalQuestions);
    
    // تحديث شاشة الانتظار
    updateWaitingScreen();
    
    // الانتقال إلى شاشة الانتظار
    switchScreen('waiting-screen');
    
    // تمكين زر بدء اللعبة
    document.getElementById('start-game').disabled = false;
}

// دالة لبدء اللعبة
function startGame() {
    // تحديث أسماء الفرق
    updateTeamNames();
    
    // تحديث شاشة اللعبة
    updateGameScreen();
    
    // الانتقال إلى شاشة اللعبة
    switchScreen('game-screen');
    
    // عرض الشخصية الأولى
    showCurrentCharacter();
    
    // بدء العد التنازلي
    startTimer();
}

// دالة لإظهار الشخصية الحالية
function showCurrentCharacter() {
    if (gameState.currentCharacterIndex >= gameState.characters.length) {
        endGame();
        return;
    }
    
    const character = gameState.characters[gameState.currentCharacterIndex];
    const characterImg = document.getElementById('character-img');
    const characterHint = document.getElementById('character-hint');
    
    // طباعة معلومات الشخصية للتصحيح
    console.log("الشخصية الحالية:", character);
    
    if (character) {
        // تحميل الصورة الأصلية ولكن إخفاءها
        characterImg.src = character.image;
        characterImg.alt = character.name || 'شخصية غامضة';
        characterHint.textContent = character.hint || 'لا يوجد تلميح';
        
        // إضافة معالج أخطاء للصورة
        characterImg.onerror = function() {
            console.error("فشل تحميل الصورة:", character.image);
            this.src = DataManager.getPlaceholderImage();
        };
    } else {
        console.error("لا توجد شخصية في الموقع:", gameState.currentCharacterIndex);
        characterImg.src = DataManager.getPlaceholderImage();
        characterImg.alt = 'لا توجد شخصية';
        characterHint.textContent = 'لا يوجد تلميح';
    }
    
    // إظهار الصورة المبهمة وإخفاء الصورة الأصلية
    document.getElementById('blurred-image').classList.remove('hide-image');
    document.getElementById('original-image').style.display = 'none';
    
    // إخفاء اسم الشخصية
    document.getElementById('character-name').style.display = 'none';
    
    // إعادة تعيين حالة الإجابة
    gameState.answerShown = false;
    
    // تحديث اسم الفريق الحالي
    document.getElementById('current-team').textContent = gameState.currentTeam === 1 ? 
        gameState.teamNames.team1 : gameState.teamNames.team2;
    
    // إخفاء أزرار منح النقطة وإظهار زر إظهار الإجابة
    document.getElementById('score-controls').style.display = 'none';
    document.getElementById('show-answer').style.display = 'inline-block';
    document.getElementById('next-question').style.display = 'none';
}

// دالة لإظهار اسم الشخصية
function showAnswer() {
    const character = gameState.characters[gameState.currentCharacterIndex];
    const characterNameElement = document.getElementById('character-name');
    
    if (character) {
        characterNameElement.textContent = character.name;
    } else {
        characterNameElement.textContent = 'غير معروف';
    }
    
    // إخفاء الصورة المبهمة وإظهار الصورة الأصلية
    document.getElementById('blurred-image').classList.add('hide-image');
    document.getElementById('original-image').classList.add('show-image');
    document.getElementById('original-image').style.display = 'block';
    
    // إظهار اسم الشخصية
    characterNameElement.style.display = 'block';
    
    // تعيين أن الإجابة قد تم إظهارها
    gameState.answerShown = true;
    
    // إخفاء زر إظهار الإجابة وإظهار أزرار منح النقطة
    document.getElementById('show-answer').style.display = 'none';
    document.getElementById('score-controls').style.display = 'block';
    
    // إيقاف المؤقت
    clearInterval(gameState.timerInterval);
}

// دالة لمنح نقطة للفريق الأول
function awardTeam1() {
    // إضافة نقطة للفريق الأول
    gameState.scores.team1++;
    
    // تحديث النقاط في واجهة المستخدم
    updateScores();
    
    // الانتقال إلى مرحلة السؤال التالي
    prepareNextQuestion();
}

// دالة لمنح نقطة للفريق الثاني
function awardTeam2() {
    // إضافة نقطة للفريق الثاني
    gameState.scores.team2++;
    
    // تحديث النقاط في واجهة المستخدم
    updateScores();
    
    // الانتقال إلى مرحلة السؤال التالي
    prepareNextQuestion();
}

// دالة لعدم منح نقطة
function noAward() {
    // الانتقال إلى مرحلة السؤال التالي مباشرة
    prepareNextQuestion();
}

// دالة للتحضير للسؤال التالي
function prepareNextQuestion() {
    // إخفاء أزرار منح النقطة وإظهار زر السؤال التالي
    document.getElementById('score-controls').style.display = 'none';
    document.getElementById('next-question').style.display = 'inline-block';
}

// دالة للانتقال إلى السؤال التالي
function nextQuestion() {
    // الانتقال إلى السؤال التالي
    gameState.currentQuestion++;
    gameState.currentCharacterIndex++;
    
    // تبديل الفريق
    gameState.currentTeam = gameState.currentTeam === 1 ? 2 : 1;
    
    // التحقق من انتهاء اللعبة
    if (gameState.currentQuestion > gameState.totalQuestions || gameState.currentCharacterIndex >= gameState.characters.length) {
        endGame();
        return;
    }
    
    // تحديث واجهة المستخدم
    document.getElementById('current-question').textContent = gameState.currentQuestion;
    document.getElementById('current-team').textContent = gameState.currentTeam === 1 ? 
        gameState.teamNames.team1 : gameState.teamNames.team2;
    
    // عرض الشخصية التالية
    showCurrentCharacter();
    
    // بدء العد التنازلي
    startTimer();
}

// دالة لبدء العد التنازلي
function startTimer() {
    clearInterval(gameState.timerInterval);
    
    let timeLeft = gameState.timeLimit;
    document.getElementById('timer').textContent = timeLeft;
    
    gameState.timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            
            // عند انتهاء الوقت، نعرض الإجابة
            showAnswer();
        }
    }, 1000);
}

// دالة لإنهاء اللعبة
function endGame() {
    clearInterval(gameState.timerInterval);
    gameState.isGameOver = true;
    
    // تحديث النص المعروض للفائز
    updateWinnerText();
    
    // الانتقال إلى شاشة النتيجة
    switchScreen('result-screen');
    updateResultScreen();
}

// دالة لتحديث نص الفائز
function updateWinnerText() {
    let winnerText = '';
    if (gameState.scores.team1 > gameState.scores.team2) {
        winnerText = `الفائز: ${gameState.teamNames.team1}`;
    } else if (gameState.scores.team2 > gameState.scores.team1) {
        winnerText = `الفائز: ${gameState.teamNames.team2}`;
    } else {
        winnerText = 'النتيجة: تعادل';
    }
    
    document.getElementById('winner-display').textContent = winnerText;
}

// دالة لبدء لعبة جديدة بنفس الإعدادات
function newGameSameRoom() {
    // تعيين علامة اللعب في نفس الغرفة
    gameState.inSameRoom = true;
    
    // إنهاء اللعبة الحالية
    endGame();
}

// دالة للعب مرة أخرى بنفس الإعدادات
function playAgainSameRoom() {
    gameState.inSameRoom = true;
    
    // إعادة ضبط اللعبة مع الاحتفاظ بمعلومات الغرفة
    resetGame();
    
    // اختيار شخصيات جديدة
    gameState.characters = DataManager.getRandomCharacters(gameState.category, gameState.totalQuestions);
    
    // إذا كنا في وضع اللعب المحلي، نبدأ اللعبة فوراً
    if (gameState.isOfflineMode) {
        startGame();
    } else {
        // تحديث شاشة الانتظار
        updateWaitingScreen();
        // الانتقال إلى شاشة الانتظار
        switchScreen('waiting-screen');
    }
}

// دالة للعب مرة أخرى
function playAgain() {
    resetGame();
    switchScreen('setup-screen');
}

// دالة لإلغاء اللعبة والعودة للشاشة الرئيسية
function cancelGame() {
    // إعادة ضبط الحالة
    resetGame();
    
    // العودة إلى الشاشة الرئيسية
    switchScreen('setup-screen');
}

// محاكاة انضمام لاعب (للعرض فقط)
function simulateJoinPlayer() {
    setTimeout(() => {
        if (gameState.players.team2.length === 0) {
            gameState.players.team2.push('لاعب منافس');
            updatePlayerNames();
            document.getElementById('start-game').disabled = false;
        }
    }, 3000);
}

// دالة لتبديل وضع اللعب (أونلاين/محلي)
function toggleGameMode(mode) {
    if (mode === 'online') {
        document.getElementById('online-mode').classList.add('selected');
        document.getElementById('offline-mode').classList.remove('selected');
        document.getElementById('online-options').style.display = 'block';
        document.getElementById('offline-options').style.display = 'none';
    } else {
        document.getElementById('online-mode').classList.remove('selected');
        document.getElementById('offline-mode').classList.add('selected');
        document.getElementById('online-options').style.display = 'none';
        document.getElementById('offline-options').style.display = 'block';
    }
}