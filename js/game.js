/**
 * ملف منطق اللعبة الرئيسي - النسخة المعدلة بنظام اللاعبين
 */

// كائن حالة اللعبة العالمية
let gameState = {
    category: '',               // مجال اللعبة المختار
    timeLimit: 30,              // الوقت المحدد لكل دور (بالثواني)
    questionsPerPlayer: 10,     // عدد الأسئلة لكل لاعب
    currentQuestion: 1,         // رقم السؤال الحالي
    totalQuestions: 0,          // سيتم حسابه تلقائياً (عدد اللاعبين × عدد الأسئلة لكل لاعب)
    currentPlayerIndex: 0,      // مؤشر اللاعب الحالي في المصفوفة
    players: [],                // مصفوفة اللاعبين: [{name: "اسم اللاعب", score: 0}, ...]
    timerInterval: null,        // مرجع مؤقت العد التنازلي
    charactersUsed: [],         // الشخصيات التي تم استخدامها بالفعل
    characters: [],             // قائمة الشخصيات المختارة للعبة الحالية
    currentCharacterIndex: 0,   // مؤشر الشخصية الحالية
    isGameOver: false,          // هل انتهت اللعبة؟
    answerShown: false,         // هل تم إظهار الإجابة؟
    isDataLoaded: false         // هل تم تحميل البيانات؟
};

// الحد الأقصى لعدد اللاعبين
const MAX_PLAYERS = 5;

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
    
    // إعداد اللاعب الأول افتراضياً
    initializeFirstPlayer();
});

// دالة لإعداد مستمعي الأحداث
function setupEventListeners() {
    // أزرار إدارة اللاعبين
    document.getElementById('add-player').addEventListener('click', addPlayer);
    document.getElementById('remove-player').addEventListener('click', removePlayer);
    
    // أزرار التحكم
    document.getElementById('show-answer').addEventListener('click', showAnswer);
    document.getElementById('no-award').addEventListener('click', noAward);
    document.getElementById('next-question').addEventListener('click', nextQuestion);
    document.getElementById('start-game-btn').addEventListener('click', startGame);
    
    // أزرار إنهاء اللعبة والعودة للإعدادات
    document.getElementById('play-again').addEventListener('click', playAgain);
    document.getElementById('end-game').addEventListener('click', endGame);
    
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

// دالة لإعداد اللاعب الأول افتراضياً
function initializeFirstPlayer() {
    gameState.players = [{name: '', score: 0}];
}

// دالة لإضافة لاعب جديد
function addPlayer() {
    if (gameState.players.length >= MAX_PLAYERS) {
        showMessage(`لا يمكن إضافة أكثر من ${MAX_PLAYERS} لاعبين`);
        return;
    }
    
    // إضافة لاعب جديد إلى مصفوفة اللاعبين
    gameState.players.push({name: '', score: 0});
    
    // إضافة عنصر HTML للاعب الجديد
    const playersListElement = document.getElementById('players-list');
    const playerIndex = gameState.players.length;
    
    const playerItem = document.createElement('div');
    playerItem.className = 'player-item';
    playerItem.innerHTML = `
        <span class="player-number">لاعب ${playerIndex}:</span>
        <input type="text" class="player-name-input" placeholder="أدخل اسم اللاعب">
    `;
    
    playersListElement.appendChild(playerItem);
    
    // تمكين زر حذف اللاعب
    document.getElementById('remove-player').disabled = false;
}

// دالة لحذف آخر لاعب مضاف
function removePlayer() {
    if (gameState.players.length <= 1) {
        showMessage('يجب أن يكون هناك لاعب واحد على الأقل');
        return;
    }
    
    // حذف آخر لاعب من مصفوفة اللاعبين
    gameState.players.pop();
    
    // حذف آخر عنصر HTML من قائمة اللاعبين
    const playersListElement = document.getElementById('players-list');
    playersListElement.removeChild(playersListElement.lastChild);
    
    // تعطيل زر حذف اللاعب إذا تبقى لاعب واحد فقط
    if (gameState.players.length <= 1) {
        document.getElementById('remove-player').disabled = true;
    }
}

// دالة لجمع أسماء اللاعبين من حقول الإدخال
function collectPlayerNames() {
    const playerInputs = document.querySelectorAll('.player-name-input');
    
    playerInputs.forEach((input, index) => {
        // استخدام الاسم المدخل أو تعيين اسم افتراضي
        const playerName = input.value.trim() || `لاعب ${index + 1}`;
        gameState.players[index].name = playerName;
    });
}

// دالة لإعادة ضبط حالة اللعبة
function resetGame() {
    clearInterval(gameState.timerInterval);
    
    // حفظ بيانات المجال المحدد
    const oldCategory = gameState.category;
    const oldTimeLimit = gameState.timeLimit;
    const oldQuestionsPerPlayer = gameState.questionsPerPlayer;
    const oldIsDataLoaded = gameState.isDataLoaded;
    
    // إعادة تعيين كل البيانات
    gameState = {
        category: oldCategory,
        timeLimit: oldTimeLimit,
        questionsPerPlayer: oldQuestionsPerPlayer,
        currentQuestion: 1,
        totalQuestions: 0, // سيتم حسابه عند بدء اللعبة
        currentPlayerIndex: 0,
        players: [{name: '', score: 0}], // إعادة تعيين اللاعبين
        timerInterval: null,
        charactersUsed: [],
        characters: [],
        currentCharacterIndex: 0,
        isGameOver: false,
        answerShown: false,
        isDataLoaded: oldIsDataLoaded
    };
    
    // إعادة تعيين واجهة المستخدم
    const playersListElement = document.getElementById('players-list');
    playersListElement.innerHTML = `
        <div class="player-item">
            <span class="player-number">لاعب 1:</span>
            <input type="text" class="player-name-input" placeholder="أدخل اسم اللاعب">
        </div>
    `;
    
    // تعطيل زر حذف اللاعب
    document.getElementById('remove-player').disabled = true;
    
    // تحديث واجهة المستخدم
    switchScreen('setup-screen');
}

// دالة لبدء اللعبة
function startGame() {
    if (!gameState.category) {
        showMessage('الرجاء اختيار مجال اللعبة');
        return;
    }
    
    // جمع أسماء اللاعبين من حقول الإدخال
    collectPlayerNames();
    
    // التحقق من وجود أسماء فارغة
    if (gameState.players.some(player => !player.name)) {
        showMessage('الرجاء إدخال اسم لكل لاعب');
        return;
    }
    
    // تعيين معلومات اللعبة
    gameState.timeLimit = parseInt(document.getElementById('time-limit').value);
    gameState.questionsPerPlayer = parseInt(document.getElementById('questions-per-player').value) || 10;
    gameState.totalQuestions = gameState.players.length * gameState.questionsPerPlayer;
    
    // اختيار الشخصيات العشوائية للعبة
    gameState.characters = DataManager.getRandomCharacters(gameState.category, gameState.totalQuestions);
    
    // طباعة عدد الشخصيات المختارة للتصحيح
    console.log(`تم اختيار ${gameState.characters.length} شخصية للعبة`);
    
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
    const characterContainer = document.querySelector('.character-image-container');
    
    // إعادة ضبط تأثير القلب
    characterContainer.classList.remove('card-flip');
    
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
    const blurredImage = document.getElementById('blurred-image');
    blurredImage.classList.remove('hide-image');
    
    const originalImage = document.getElementById('original-image');
    originalImage.classList.remove('show-image');
    originalImage.style.display = 'none';
    
    // إخفاء اسم الشخصية
    document.getElementById('character-name').style.display = 'none';
    
    // إعادة تعيين حالة الإجابة
    gameState.answerShown = false;
    
    // تحديث اسم اللاعب الحالي
    document.getElementById('current-player').textContent = gameState.players[gameState.currentPlayerIndex].name;
    
    // تحديث بطاقات نقاط اللاعبين لإظهار اللاعب الحالي
    updatePlayerScoresUI();
    
    // إخفاء أزرار منح النقطة وإظهار زر إظهار الإجابة
    document.getElementById('score-controls').style.display = 'none';
    document.getElementById('show-answer').style.display = 'inline-block';
    document.getElementById('next-question').style.display = 'none';
}

// دالة لإظهار اسم الشخصية
function showAnswer() {
    const character = gameState.characters[gameState.currentCharacterIndex];
    const characterNameElement = document.getElementById('character-name');
    const characterContainer = document.querySelector('.character-image-container');
    const blurredImage = document.getElementById('blurred-image');
    const originalImage = document.getElementById('original-image');
    
    if (character) {
        characterNameElement.textContent = character.name;
    } else {
        characterNameElement.textContent = 'غير معروف';
    }
    
    // إضافة تأثير قلب الكرت
    characterContainer.classList.add('card-flip');
    
    // إعداد الصورة الأصلية قبل التأثير
    originalImage.style.opacity = '0';
    originalImage.style.display = 'block';
    
    // تنفيذ التأثيرات بعد تأخير قصير للتزامن مع حركة القلب
    setTimeout(() => {
        // إخفاء الصورة المبهمة
        blurredImage.classList.add('hide-image');
        
        // إظهار الصورة الأصلية
        originalImage.classList.add('show-image');
        
        // إظهار اسم الشخصية
        characterNameElement.style.display = 'block';
    }, 350); // نصف مدة التأثير تقريباً
    
    // تعيين أن الإجابة قد تم إظهارها
    gameState.answerShown = true;
    
    // إخفاء زر إظهار الإجابة وإظهار أزرار منح النقطة
    document.getElementById('show-answer').style.display = 'none';
    
    // إظهار أزرار منح النقطة بعد اكتمال التأثير
    setTimeout(() => {
        document.getElementById('score-controls').style.display = 'block';
    }, 700);
    
    // إيقاف المؤقت
    clearInterval(gameState.timerInterval);
}

// دالة لمنح نقطة للاعب
function awardPlayer(playerIndex) {
    // إضافة نقطة للاعب
    gameState.players[playerIndex].score++;
    
    // تحديث النقاط في واجهة المستخدم
    updatePlayerScoresUI();
    
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
    
    // الانتقال إلى اللاعب التالي
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    
    // التحقق من انتهاء اللعبة
    if (gameState.currentQuestion > gameState.totalQuestions || gameState.currentCharacterIndex >= gameState.characters.length) {
        endGame();
        return;
    }
    
    // تحديث واجهة المستخدم
    document.getElementById('current-question').textContent = gameState.currentQuestion;
    document.getElementById('current-player').textContent = gameState.players[gameState.currentPlayerIndex].name;
    
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
    
    // تحديث شاشة النتيجة
    updateResultScreen();
    
    // الانتقال إلى شاشة النتيجة
    switchScreen('result-screen');
}

// دالة لتحديث نص الفائز
function updateWinnerText() {
    // البحث عن اللاعب صاحب أعلى نقاط
    let maxScore = -1;
    let winnersIndices = [];
    
    // البحث عن أعلى نقاط
    gameState.players.forEach((player, index) => {
        if (player.score > maxScore) {
            maxScore = player.score;
            winnersIndices = [index];
        } else if (player.score === maxScore) {
            winnersIndices.push(index);
        }
    });
    
    // تحديد نص الفائز
    let winnerText = '';
    if (winnersIndices.length === 1) {
        // فائز واحد
        winnerText = `الفائز: ${gameState.players[winnersIndices[0]].name}`;
    } else {
        // تعادل بين عدة لاعبين
        const winnerNames = winnersIndices.map(index => gameState.players[index].name).join(' و ');
        winnerText = `النتيجة: تعادل بين ${winnerNames}`;
    }
    
    document.getElementById('winner-display').textContent = winnerText;
}

// دالة لتحديث واجهة نقاط اللاعبين
function updatePlayerScoresUI() {
    const playersScoreContainer = document.getElementById('players-score-container');
    playersScoreContainer.innerHTML = '';
    
    gameState.players.forEach((player, index) => {
        const isCurrentPlayer = index === gameState.currentPlayerIndex;
        
        const playerCard = document.createElement('div');
        playerCard.className = `player-score-card ${isCurrentPlayer ? 'active' : ''}`;
        
        playerCard.innerHTML = `
            <h3>${player.name}</h3>
            <p>النقاط: <span class="score">${player.score}</span></p>
        `;
        
        playersScoreContainer.appendChild(playerCard);
    });
    
    // تحديث أزرار منح النقاط
    updateAwardButtons();
}

// دالة لتحديث أزرار منح النقاط
function updateAwardButtons() {
    const playersAwardContainer = document.getElementById('players-award-container');
    playersAwardContainer.innerHTML = '';
    
    gameState.players.forEach((player, index) => {
        const awardButton = document.createElement('button');
        awardButton.className = 'award-player-btn';
        awardButton.textContent = player.name;
        awardButton.onclick = () => awardPlayer(index);
        
        playersAwardContainer.appendChild(awardButton);
    });
}

// دالة لتحديث شاشة النتيجة
function updateResultScreen() {
    const finalScoresContainer = document.getElementById('final-scores');
    finalScoresContainer.innerHTML = '';
    
    // تحديد أعلى نقاط
    const maxScore = Math.max(...gameState.players.map(player => player.score));
    
    // ترتيب اللاعبين تنازلياً حسب النقاط
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
    
    sortedPlayers.forEach(player => {
        const isWinner = player.score === maxScore;
        
        const scoreItem = document.createElement('div');
        scoreItem.className = `final-score-item ${isWinner ? 'winner' : ''}`;
        
        scoreItem.innerHTML = `
            <span class="player-name">${player.name}</span>
            <span class="final-score">${player.score}</span>
        `;
        
        finalScoresContainer.appendChild(scoreItem);
    });
}

// دالة لبدء لعبة جديدة
function playAgain() {
    resetGame();
}

// دالة لعرض رسالة للمستخدم
function showMessage(message) {
    alert(message);
}