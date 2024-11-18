class RootService {
    constructor(page) {
        this.page = page;
    }

    show() {
        let scene = new Scene(this.page);
        scene.addClassName("mainScene");

        this._addBadHearingExampleService(scene);
        this._addMoreOpportunitiesBtn(scene);

        scene.show();
    }

    _addBadHearingExampleService(scene){
        let service = new BadHearingExampleService(this.page);
        service.install(scene);
    }

    _addMoreOpportunitiesBtn(scene){
        let b = scene.createBox();

        // Создание ссылки
        let menuBtn = document.createElement("button");
        menuBtn.classList.add("myBtn");
        menuBtn.classList.add("menuBtn");
        menuBtn.innerHTML = htmlTSTR("MoreOpportunitiesHere");
        menuBtn.onclick = () => {
            this._showMenu(); // Обработчик события на клик
        };

        // Добавляем описание в созданный блок
        b.addElement(menuBtn);        
    }

    _showMenu(){
        let menuScene = new Scene(this.page);
        menuScene.addClassName("menuScene");

        let menuBox = menuScene.createBox();
        menuBox.addClassName("menuBox");

        this._addRealtimeFileService(menuBox);
        this._addListenYourselfService(menuBox);
        this._addLiveChatService(menuBox);
        this._addAudiogramHearingService(menuBox);

        menuScene.show();
    }

    _addRealtimeFileService(menuBox) {
        // Создание контейнера для сервиса
        let serviceDiv = document.createElement("div");
        serviceDiv.classList.add("serviceDiv");
    
        // Создание элемента для иконки (иконку можно задать через класс)
        let iconDiv = document.createElement("div");
        iconDiv.classList.add("icon");  // Здесь будет ваш класс для иконки
        iconDiv.classList.add("listen-your-file");
        
        // Создание подписи
        let textDiv = document.createElement("p");
        textDiv.classList.add("service-text");
        textDiv.innerHTML = htmlTSTR("ListenYourFile");
    
        // Добавляем иконку и подпись в контейнер
        serviceDiv.appendChild(iconDiv);
        serviceDiv.appendChild(textDiv);
    
        serviceDiv.onclick = () => {
            this.page.runRealtimeFileService(); // Обработчик события на клик
        };
    
        // Добавляем сервис в меню
        menuBox.addElement(serviceDiv);
    }
    
    _addListenYourselfService(menuBox) {
        // Создание контейнера для сервиса
        let serviceDiv = document.createElement("div");
        serviceDiv.classList.add("serviceDiv");
    
        // Создание элемента для иконки (иконку можно задать через класс)
        let iconDiv = document.createElement("div");
        iconDiv.classList.add("icon");  // Здесь будет ваш класс для иконки
        iconDiv.classList.add("listen-yourself");
        
        // Создание подписи
        let textDiv = document.createElement("p");
        textDiv.classList.add("service-text");
        textDiv.innerHTML = htmlTSTR("ListenYourself");
    
        // Добавляем иконку и подпись в контейнер
        serviceDiv.appendChild(iconDiv);
        serviceDiv.appendChild(textDiv);
    
        serviceDiv.onclick = () => {
            this.page.runListenYourselfService(); // Обработчик события на клик
        };
    
        // Добавляем сервис в меню
        menuBox.addElement(serviceDiv);
    }
    
    _addAudiogramHearingService(menuBox) {
        // Создание контейнера для сервиса
        let serviceDiv = document.createElement("div");
        serviceDiv.classList.add("serviceDiv");
    
        // Создание элемента для иконки (иконку можно задать через класс)
        let iconDiv = document.createElement("div");
        iconDiv.classList.add("icon");  // Здесь будет ваш класс для иконки
        iconDiv.classList.add("audiogram-mode");
        
        // Создание подписи
        let textDiv = document.createElement("p");
        textDiv.classList.add("service-text");
        textDiv.innerHTML = htmlTSTR("audiogramMode");
    
        // Добавляем иконку и подпись в контейнер
        serviceDiv.appendChild(iconDiv);
        serviceDiv.appendChild(textDiv);
    
        serviceDiv.onclick = () => {
            this.page.runExactlyHearingService();
        }
    
        menuBox.addElement(serviceDiv);
    }
    
    _addLiveChatService(menuBox) {
        // Создание контейнера для сервиса
        let serviceDiv = document.createElement("div");
        serviceDiv.classList.add("serviceDiv");
    
        // Создание элемента для иконки (иконку можно задать через класс)
        let iconDiv = document.createElement("div");
        iconDiv.classList.add("icon");  // Здесь будет ваш класс для иконки
        iconDiv.classList.add("live-chat");
        
        // Создание подписи
        let textDiv = document.createElement("p");
        textDiv.classList.add("service-text");
        textDiv.innerHTML = htmlTSTR("LiveChatMode");
    
        // Добавляем иконку и подпись в контейнер
        serviceDiv.appendChild(iconDiv);
        serviceDiv.appendChild(textDiv);
    
        serviceDiv.onclick = () => {
            this.page.runLiveConversationService(); // Обработчик события на клик
        };
    
        menuBox.addElement(serviceDiv);
    }
    
}