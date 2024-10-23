class RootService {
    constructor(page) {
        this.page = page;
    }

    show() {
        let scene = new Scene(this.page);
        scene.addClassName("mainScene");

        this._addExampleService(scene);
        this._addRealtimeFileService(scene);
        this._addListenYourselfService(scene);
        this._addLiveChatService(scene);
        this._addAudiogramHearingService(scene);
        scene.show();
    }

    _addExampleService(scene){
        let service = new BadHearingExampleService(this.page);
        service.install(scene);
    }

    _addRealtimeFileService(scene) {
        let serviceBox = scene.createBox();
        serviceBox.addClassName("tipBox");

        let serviceDescription = document.createElement("p");

        // Создание ссылки
        let serviceLink = document.createElement("a");
        serviceLink.innerHTML = setTSTR("ListenYourFile");
        serviceLink.href = "#"; // Добавляем href, чтобы это была ссылка
        serviceLink.onclick = () => {
            this.page.runRealtimeFileService(); // Обработчик события на клик
        };

        serviceDescription.appendChild(serviceLink); // Добавляем ссылку в описание

        // Добавляем описание в созданный блок
        serviceBox.addElement(serviceDescription);
    }

    _addListenYourselfService(scene){
        let serviceBox = scene.createBox();
        serviceBox.addClassName("tipBox");

        let serviceDescription = document.createElement("p");

        // Создание ссылки
        let serviceLink = document.createElement("a");
        serviceLink.innerHTML = setTSTR("ListenYourself");
        serviceLink.href = "#"; // Добавляем href, чтобы это была ссылка
        serviceLink.onclick = () => {
            this.page.runListenYourselfService(); // Обработчик события на клик
        };

        serviceDescription.appendChild(serviceLink); // Добавляем ссылку в описание

        // Добавляем описание в созданный блок
        serviceBox.addElement(serviceDescription);
    }

    _addAudiogramHearingService(scene) {
        let serviceBox = scene.createBox();
        serviceBox.addClassName("tipBox");

        let serviceDescription = document.createElement("p");

        // создание ссылки
        let serviceLink = document.createElement("a");
        serviceLink.innerHTML = setTSTR("audiogramMode");
        serviceLink.href = "#";
        serviceLink.onclick = () => {
            this.page.runExactlyHearingService();
        }

        serviceDescription.appendChild(serviceLink); // Добавляем ссылку в описание

        serviceBox.addElement(serviceDescription);
    }

    _addLiveChatService(scene) {
        let serviceBox = scene.createBox();
        serviceBox.addClassName("tipBox");

        let serviceDescription = document.createElement("p");

        // Создание ссылки
        let serviceLink = document.createElement("a");
        serviceLink.innerHTML = setTSTR("LiveChatMode");
        serviceLink.href = "#"; // Добавляем href, чтобы это была ссылка
        serviceLink.onclick = () => {
            this.page.runLiveConversationService(); // Обработчик события на клик
        };

        serviceDescription.appendChild(serviceLink); // Добавляем ссылку в описание

        // Добавляем описание в созданный блок
        serviceBox.addElement(serviceDescription);
    }
}