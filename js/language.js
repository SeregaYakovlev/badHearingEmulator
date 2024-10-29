class Language {
    constructor(code) {
        this.code = code;
    }

    getCode() {
        return this.code;
    }

    getName() {
        let language = Language._getLanguageFromList(this.code);

        // Возвращаем код языка, если найден
        return language.name;
    }

    getSelfCode(){
        let language = Language._getLanguageFromList(this.code);

        // Возвращаем код языка, если найден
        return language.self_code;
    }

    static _getLanguageFromList(languageCode){
        // Получаем список языков из глобального объекта window
        let languageList = window.languages;

        // Находим язык по имени
        let language = languageList.find(lang => lang.code.toLowerCase() === languageCode.toLowerCase());

        return language;
    }

    getTranslation(stringName) {
        // Получаем перевод для текущего языка
        let translation = window.translations[stringName];
        return translation ? translation[this.code] : "null";
    }
}