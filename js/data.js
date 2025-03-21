/**
 * ملف إدارة البيانات - يتعامل مع ملفات JSON لتحميل البيانات
 */

// كائن إدارة البيانات
const DataManager = {
    // تخزين البيانات المحملة
    data: {
        anime: null,
        celebrities: null,
        athletes: null
    },
    
    // دالة تهيئة مدير البيانات
    init: async function() {
        try {
            // تحميل بيانات المجالات الثلاثة
            console.log("بدء تحميل بيانات المجالات...");
            
            try {
                await this.loadCategoryData('anime');
                console.log("تم تحميل بيانات الأنمي بنجاح");
            } catch (error) {
                console.error("خطأ في تحميل بيانات الأنمي:", error);
                this.useBackupData('anime');
            }
            
            try {
                await this.loadCategoryData('celebrities');
                console.log("تم تحميل بيانات المشاهير بنجاح");
            } catch (error) {
                console.error("خطأ في تحميل بيانات المشاهير:", error);
                this.useBackupData('celebrities');
            }
            
            try {
                await this.loadCategoryData('athletes');
                console.log("تم تحميل بيانات الرياضيين بنجاح");
            } catch (error) {
                console.error("خطأ في تحميل بيانات الرياضيين:", error);
                this.useBackupData('athletes');
            }
            
            // طباعة عدد الشخصيات المحملة للتصحيح
            console.log("عدد شخصيات الأنمي:", this.data.anime ? this.data.anime.length : 0);
            console.log("عدد المشاهير:", this.data.celebrities ? this.data.celebrities.length : 0);
            console.log("عدد الرياضيين:", this.data.athletes ? this.data.athletes.length : 0);
            
            console.log("تم تهيئة مدير البيانات بنجاح");
            return true;
        } catch (error) {
            console.error("خطأ في تهيئة مدير البيانات:", error);
            // في حالة حدوث خطأ، نستخدم البيانات الاحتياطية المضمنة لجميع المجالات
            this.useBackupData('all');
            return false;
        }
    },
    
    // تحميل بيانات مجال محدد
    loadCategoryData: async function(category) {
        try {
            console.log(`محاولة تحميل بيانات ${category}...`);
            const response = await fetch(`data/${category}.json`);
            
            if (!response.ok) {
                throw new Error(`فشل تحميل بيانات ${category} (${response.status} ${response.statusText})`);
            }
            
            const jsonData = await response.json();
            console.log(`تم تحميل بيانات ${category} بنجاح`);
            
            if (jsonData && jsonData.characters && Array.isArray(jsonData.characters)) {
                this.data[category] = jsonData.characters;
                console.log(`تم تحميل ${this.data[category].length} شخصية من ${category}`);
            } else {
                throw new Error(`بنية بيانات ${category} غير صحيحة`);
            }
        } catch (error) {
            console.error(`خطأ في تحميل بيانات ${category}:`, error);
            throw error;
        }
    },
    
    // استخدام البيانات الاحتياطية المضمنة في حالة فشل التحميل من JSON
    useBackupData: function(category) {
        console.log(`استخدام البيانات الاحتياطية للمجال ${category}`);
        
      
        
        // بيانات احتياطية للمشاهير
       
        // بيانات احتياطية للرياضيين
        
        // تطبيق البيانات الاحتياطية على المجال المطلوب أو جميع المجالات
        if (category === 'all' || category === 'anime') {
            this.data.anime = animeBackup;
        }
        
        if (category === 'all' || category === 'celebrities') {
            this.data.celebrities = celebritiesBackup;
        }
        
        if (category === 'all' || category === 'athletes') {
            this.data.athletes = athletesBackup;
        }
    },
    
    // الحصول على صورة افتراضية
    getPlaceholderImage: function() {
        return 'images/ui/placeholder.jpg';
    },
    
    // دالة للحصول على قائمة الشخصيات حسب المجال
    getCharacters: function(category) {
        if (!this.data[category] || !Array.isArray(this.data[category])) {
            console.error(`لا توجد بيانات صالحة للمجال ${category}`);
            return [];
        }
        return this.data[category];
    },
    
    // دالة للحصول على شخصية عشوائية من المجال المحدد
    getRandomCharacter: function(category, usedIds = []) {
        const characters = this.getCharacters(category);
        
        if (!characters || characters.length === 0) {
            console.error(`لا توجد شخصيات في المجال ${category}`);
            return null;
        }
        
        // تصفية الشخصيات التي لم تستخدم بعد
        const availableCharacters = characters.filter(
            character => !usedIds.includes(character.id)
        );
        
        // إذا لم تتبق شخصيات، نعيد null
        if (availableCharacters.length === 0) {
            console.warn(`لا توجد شخصيات متبقية في المجال ${category}`);
            return null;
        }
        
        // اختيار شخصية عشوائية
        const randomIndex = Math.floor(Math.random() * availableCharacters.length);
        return availableCharacters[randomIndex];
    },
    
    // دالة للحصول على مجموعة من الشخصيات العشوائية من المجال المحدد
    getRandomCharacters: function(category, count) {
        const characters = [];
        const usedIds = [];
        
        const allCharacters = this.getCharacters(category);
        
        if (!allCharacters || allCharacters.length === 0) {
            console.error(`لا توجد شخصيات في المجال ${category} لاختيار منها`);
            return characters;
        }
        
        // الحد الأقصى للشخصيات هو عدد الشخصيات المتاحة في المجال
        const maxCount = Math.min(count, allCharacters.length);
        console.log(`محاولة اختيار ${maxCount} شخصيات من ${allCharacters.length} متاحة في المجال ${category}`);
        
        for (let i = 0; i < maxCount; i++) {
            const character = this.getRandomCharacter(category, usedIds);
            if (character) {
                characters.push(character);
                usedIds.push(character.id);
            } else {
                console.warn(`لم يمكن العثور على شخصية جديدة في الدورة ${i}`);
                break;
            }
        }
        
        console.log(`تم اختيار ${characters.length} شخصية عشوائية من المجال ${category}`);
        return characters;
    },
    
    // الحصول على اسم العرض للمجال
    getCategoryDisplayName: function(category) {
        const displayNames = {
            'anime': 'شخصيات أنمي',
            'celebrities': 'مشاهير',
            'athletes': 'لاعبين كرة'
        };
        
        return displayNames[category] || category;
    }
};

// تهيئة فورية باستخدام بيانات مضمنة (للاستخدام إذا فشلت طريقة ملفات JSON)
// يمكنك إزالة هذا الجزء إذا كانت ملفات JSON تعمل بشكل صحيح
