class Page {
    constructor() {
    }

    showRoot(){
        this._runRootService();
    }

    async init() {
        // Загружаем JSON-файл с переводами
        let response = await fetch('/languages/translations.json');

        // Проверяем, что ответ был успешным
        if (!response.ok) {
            throw new Error('Response was not ok');
        }

        // Преобразуем ответ в формат JSON
        let data = await response.json();

        // Сохраняем переводы в глобальной области window
        window.translations = data.translations;

        let response2 = await fetch('/languages/supported_languages.json');
        if (!response2.ok) {
            throw new Error('Response was not ok');
        }
        let data2 = await response2.json();
        window.languages = data2.languages;

        document.title = getTSTR("siteTitle");

        this._initTheme();
        this._addLanguageSwitcher();
        this._addDayNightSwitcher();
        this._addGithub();

        this._runRootService(this);
    }

    _addGithub() {
        // Создаем новый div элемент для кнопки GitHub
        let githubDiv = document.createElement("div");
    
        // Добавляем классы стилей
        githubDiv.classList.add("github-toggle");
    
        // Создаем элемент ссылки <a>
        let githubLink = document.createElement("a");
    
        // Устанавливаем ссылку на репозиторий GitHub
        githubLink.href = "https://github.com/SeregaYakovlev/badHearingEmulator"; // Замените ссылку на свою
    
        // Открывать в новой вкладке
        githubLink.target = "_blank";
    
        // Добавляем иконку GitHub
        let githubIcon = document.createElement("div");
        githubIcon.classList.add("github-icon");
        
        // Вкладываем иконку в ссылку, а ссылку в див
        githubLink.appendChild(githubIcon);
        githubDiv.appendChild(githubLink);
    
        // Добавляем на страницу (например, в body)
        document.body.appendChild(githubDiv);
    }
    

    getCurrentLanguage() {
        let languageCode = localStorage.getItem("language");

        if (!languageCode) {
            return new Language("eng");
        }

        return new Language(languageCode);
    }

    async _addLanguageSwitcher() {
        // Создаем переключатель языков
        let switchWrapper = document.createElement('div');
        switchWrapper.className = 'language-toggle';

        // Создаем круг с кодом языка
        let languageCircle = document.createElement('div');
        languageCircle.className = 'language-circle';

        // Создаем элемент для отображения кода языка
        let languageCode = document.createElement('span');
        languageCode.className = 'language-code';

        let currentLanguage = this.getCurrentLanguage();
        languageCode.textContent = currentLanguage.getCode(); // Устанавливаем текущий язык

        this.languageCodeElem = languageCode;

        languageCircle.appendChild(languageCode);
        switchWrapper.appendChild(languageCircle);

        // Создаем выпадающий список языков
        let languageListDiv = document.createElement('div');
        languageListDiv.className = 'language-list';
        languageListDiv.style.display = 'none'; // Скрываем список по умолчанию

        let languageList = window.languages;

        // Добавляем языки в список
        languageList.forEach(lang => {
            let listItem = document.createElement('div');
            listItem.className = 'language-item';
            listItem.textContent = lang.name;
            listItem.onclick = () => {
                let l = new Language(lang.code);
                this._setLanguage(l);
            }
            languageListDiv.appendChild(listItem);
        });

        switchWrapper.appendChild(languageListDiv);
        document.body.appendChild(switchWrapper);

        // Обработчик события для отображения/скрытия списка языков
        switchWrapper.addEventListener('click', () => {
            if (languageListDiv.style.display === 'none') {
                languageListDiv.style.display = 'block'; // Показываем список
            } else {
                languageListDiv.style.display = 'none'; // Скрываем список
            }
        });

        // Закрытие списка при клике вне переключателя
        document.addEventListener('click', (event) => {
            if (!switchWrapper.contains(event.target)) {
                languageListDiv.style.display = 'none'; // Скрываем список, если клик вне переключателя
            }
        });
    }

    _addDayNightSwitcher() {
        // Создаем переключатель тем
        let switchWrapper = document.createElement('div');
        switchWrapper.className = 'theme-toggle';

        let sunIcon = document.createElement('div');
        sunIcon.className = 'theme-icon sun';

        let moonIcon = document.createElement('div');
        moonIcon.className = 'theme-icon moon';

        switchWrapper.appendChild(sunIcon);
        switchWrapper.appendChild(moonIcon);
        document.body.appendChild(switchWrapper);

        // Обработчик события для переключения тем
        switchWrapper.addEventListener('click', () => {
            let currentTheme = localStorage.getItem('theme');
            if (currentTheme === "day") {
                this._setTheme('night');
            } else {
                this._setTheme('day');
            }
        });
    }

    _initTheme() {
        // Устанавливаем текущую тему
        let currentTheme = localStorage.getItem('theme') || 'day';
        document.body.setAttribute('theme', currentTheme);
        return currentTheme;
    }

    _setTheme(theme) {
        document.body.setAttribute('theme', theme);
        localStorage.setItem("theme", theme);
    }

    _setLanguage(language) {
        localStorage.setItem("language", language.getCode());

        let translatedElements = document.querySelectorAll("translated-string");

        for (let translatedElement of translatedElements) {
            let stringName = translatedElement.getAttribute("string-name");
            translatedElement.textContent = language.getTranslation(stringName);
        }

        document.title = getTSTR("siteTitle");

        this._onLanguageChanged(language);
    }

    _onLanguageChanged(language) {
        let currentLanguage = language;
        this.languageCodeElem.textContent = currentLanguage.getCode(); // Устанавливаем текущий язык
    }

    runExactlyHearingService() {
        let exactlyHearingService = new ExactlyHearingService(this);
        exactlyHearingService.show();
    }

    runLiveConversationService() {
        let liveConversationService = new LiveConversation(this);
        liveConversationService.show();
    }

    runRealtimeFileService(){
        let realtimeFileService = new RealtimeFileService(this);
        realtimeFileService.run();
    }

    _runRootService(){
        let rootService = new RootService(this);
        rootService.show();
    }

    showScene(scene) {
        this._closeSceneIfExists();
        this.currentScene = scene;
        scene.displayAt(document.body);
    }

    _closeSceneIfExists() {
        if (this.currentScene) {
            this.currentScene.close();
            this.currentScene = null;
        }
    }

}