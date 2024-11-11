class RootService {
    constructor(page) {
        this.page = page;
    }

    show() {
        let scene = new Scene(this.page);
        scene.addClassName("mainScene");

        this._addIntroductionService(scene);
        this._addExampleService(scene);
        this._addRealtimeFileService(scene);
        this._addListenYourselfService(scene);
        this._addLiveChatService(scene);
        this._addAudiogramHearingService(scene);
        scene.show();
    }

    _addIntroductionService(scene){
        let serviceBox = scene.createBox();

        // Создание ссылки
        let serviceBtn = document.createElement("button");
        serviceBtn.classList.add("myBtn");
        serviceBtn.innerHTML = htmlTSTR("What_is_it?");
        serviceBtn.onclick = () => {
            this.page.runIntroductionService(); // Обработчик события на клик
        };

        // Добавляем описание в созданный блок
        serviceBox.addElement(serviceBtn);
    }

    _addExampleService(scene){
        let service = new BadHearingExampleService(this.page);
        service.install(scene);
    }

    _addRealtimeFileService(scene) {
        let serviceBox = scene.createBox();

        // Создание ссылки
        let serviceBtn = document.createElement("button");
        serviceBtn.classList.add("myBtn");
        serviceBtn.innerHTML = htmlTSTR("ListenYourFile");
        serviceBtn.onclick = () => {
            this.page.runRealtimeFileService(); // Обработчик события на клик
        };

        // Добавляем описание в созданный блок
        serviceBox.addElement(serviceBtn);
    }

    _addListenYourselfService(scene){
        let serviceBox = scene.createBox();

        // Создание ссылки
        let serviceBtn = document.createElement("button");
        serviceBtn.classList.add("myBtn");
        serviceBtn.innerHTML = htmlTSTR("ListenYourself");
        serviceBtn.onclick = () => {
            this.page.runListenYourselfService(); // Обработчик события на клик
        };

        // Добавляем описание в созданный блок
        serviceBox.addElement(serviceBtn);
    }

    _addAudiogramHearingService(scene) {
        let serviceBox = scene.createBox();

        // создание ссылки
        let serviceBtn = document.createElement("button");
        serviceBtn.classList.add("myBtn");
        serviceBtn.innerHTML = htmlTSTR("audiogramMode");
        serviceBtn.onclick = () => {
            this.page.runExactlyHearingService();
        }

        serviceBox.addElement(serviceBtn);
    }

    _addLiveChatService(scene) {
        let serviceBox = scene.createBox();

        // Создание ссылки
        let serviceBtn = document.createElement("button");
        serviceBtn.classList.add("myBtn");
        serviceBtn.innerHTML = htmlTSTR("LiveChatMode");
        serviceBtn.onclick = () => {
            this.page.runLiveConversationService(); // Обработчик события на клик
        };

        // Добавляем описание в созданный блок
        serviceBox.addElement(serviceBtn);
    }
}