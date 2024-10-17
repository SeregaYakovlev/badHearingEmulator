class Language {
    constructor(code) {
        this.code = code;
    }

    getCode() {
        return this.code;
    }

    getName() {
        // Получаем список языков из глобального объекта window
        let languageList = window.languages;

        // Находим язык по имени
        let language = languageList.find(lang => lang.name.toLowerCase() === this.code.toLowerCase());

        // Возвращаем код языка, если найден
        return language.name;
    }

    getTranslation(stringName) {
        // Получаем перевод для текущего языка
        let translation = window.translations[stringName];
        return translation ? translation[this.getCode()] : "null";
    }
}