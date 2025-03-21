/**
 * ملف إدارة البيانات - يتعامل مع ملفات JSON لتحميل بيانات الشخصيات
 */

// كائن إدارة البيانات
const DataManager = {
    // تخزين البيانات المحملة
    data: {
        config: null,
        anime: null,
        celebrities: null,
        athletes: null
    },
    
    // دالة تهيئة مدير البيانات
    init: async function() {
        try {
            // تحميل ملف الإعدادات
            this.data.config = await this.loadJSON('data/config.json');
            
            // سنقوم بتحميل بيانات المجالات فقط عند الحاجة لتحسين الأداء
            console.log("تم تهيئة مدير البيانات بنجاح");
        } catch (error) {
            console.error("خطأ في تهيئة مدير البيانات:", error);
        }
        
        return this;
    },
    
    // دالة تحميل ملف JSON
    loadJSON: async function(url) {
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`فشل تحميل الملف ${url} (${response.status} ${response.statusText})`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`خطأ في تحميل الملف ${url}:`, error);
            throw error;
        }
    },
    
    // الحصول على ملف التكوين
    getConfig: function() {
        return this.data.config;
    },
    
    // الحصول على صورة افتراضية
    getPlaceholderImage: function() {
        return this.data.config ? this.data.config.placeholderImage : 'images/ui/placeholder.jpg';
    },
    
    // دالة للحصول على قائمة الشخصيات حسب المجال
    getCharacters: async function(category) {
        // التحقق من وجود بيانات المجال في الذاكرة
        if (!this.data[category]) {
            try {
                // تحميل ملف البيانات للمجال المطلوب
                this.data[category] = await this.loadJSON(`data/${category}.json`);
            } catch (error) {
                console.error(`فشل تحميل بيانات المجال ${category}:`, error);
                return [];
            }
        }
        
        // إعادة قائمة الشخصيات
        return this.data[category].characters || [];
    },
    
    // دالة للحصول على شخصية عشوائية من المجال المحدد
    getRandomCharacter: async function(category, usedIds = []) {
        // الحصول على قائمة الشخصيات
        const characters = await this.getCharacters(category);
        
        if (!characters || characters.length === 0) {
            return null;
        }
        
        // تصفية الشخصيات التي لم تستخدم بعد
        const availableCharacters = characters.filter(
            character => !usedIds.includes(character.id)
        );
        
        // إذا لم تتبق شخصيات، نعيد null
        if (availableCharacters.length === 0) {
            return null;
        }
        
        // اختيار شخصية عشوائية
        const randomIndex = Math.floor(Math.random() * availableCharacters.length);
        return availableCharacters[randomIndex];
    },
    
    // دالة للحصول على مجموعة من الشخصيات العشوائية من المجال المحدد
    getRandomCharacters: async function(category, count) {
        const characters = [];
        const usedIds = [];
        
        // الحصول على قائمة الشخصيات
        const allCharacters = await this.getCharacters(category);
        
        if (!allCharacters || allCharacters.length === 0) {
            return characters;
        }
        
        // الحد الأقصى للشخصيات هو عدد الشخصيات المتاحة في المجال
        const maxCount = Math.min(count, allCharacters.length);
        
        for (let i = 0; i < maxCount; i++) {
            const character = await this.getRandomCharacter(category, usedIds);
            if (character) {
                characters.push(character);
                usedIds.push(character.id);
            }
        }
        
        return characters;
    },
    
    // الحصول على اسم العرض للمجال
    getCategoryDisplayName: function(category) {
        if (!this.data.config) {
            return '';
        }
        
        const categoryObj = this.data.config.categories.find(c => c.id === category);
        return categoryObj ? categoryObj.name : '';
    }
};