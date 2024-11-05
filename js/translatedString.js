class TranslatedString {
    constructor(stringName) {
        this.stringName = stringName; // Имя строки для перевода
        window.page.translatedStrings.push(this);
    }

    toHTMLFormat(language) {
        let htmlElem = document.createElement("translated-string");
        htmlElem.innerHTML = this._getTranslation(language);
        htmlElem.setAttribute("string-name", this.stringName);

        return htmlElem.outerHTML;
    }

    toTextFormat(language) {
        return this._getTranslation(language);
    }

    _getTranslation(language) {
        let translation = language.getTranslation(this.stringName); // Получаем перевод для нового языка

        // Если перевод найден, обновляем элемент
        if (translation) {
            let translatedText = this._replaceArgs(translation, this.args);
            return translatedText;
        }

        return "null";
    }

    applyArgs(args) {
        this.args = args;
    }

    // Метод для смены языка
    changeLanguageTo(language) {
        let translatedText = this._getTranslation(language);
        this._findOurElementsAndUpdate(translatedText);
    }

    // Метод для замены аргументов в переводе
    _replaceArgs(translation, args) {
        if (!args || args.length === 0) {
            return translation;
        }

        let a = [...args];
        // Используем регулярное выражение для поиска { }
        return translation.replace(/{}/g, () => {
            // Если есть доступные аргументы, подставляем следующее значение
            return a.length > 0 ? a.shift() : "{}"; // Заменяем на значение или оставляем {} если аргументов не осталось
        });
    }

    // Метод для обновления элемента с новым переводом
    _findOurElementsAndUpdate(translatedText) {
        // Находим все элементы <translated-string> с атрибутом string-name, равным this.stringName
        let ourElements = document.querySelectorAll(`translated-string[string-name="${this.stringName}"]`);

        // Обновляем текст в каждом найденном элементе
        ourElements.forEach(element => {
            element.innerHTML = translatedText; // Устанавливаем новый перевод
        });
    }

}
