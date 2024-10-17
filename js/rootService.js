class RootService{
    constructor(page){
        this.page = page;
    }

    show() {
        let scene = new Scene(this.page);
        scene.addClassName("mainScene");
        let b = scene.createBox();

        let welcomElem = document.createElement("div");
        welcomElem.innerHTML = `<p>${setTSTR("mainScene_mainBox_0")}</p>
<p>${setTSTR("mainScene_mainBox_1")}</p>
`;

        let videoDownloadingBtn = document.createElement("button");
        videoDownloadingBtn.innerHTML = setTSTR("downloadFile")
        videoDownloadingBtn.addEventListener("click", async () => {
            this.page.runRealtimeFileService();
        })

        b.addElement(welcomElem);

        let div = document.createElement("div");
        div.classList.add("mainSceneBtnContainer");

        div.appendChild(videoDownloadingBtn);

        b.addElement(div);

        let service_0_Box = scene.createBox();
        service_0_Box.addClassName("tipBox");

        let service_0_Description = document.createElement("p");

        // создание ссылки
        let service_0_link = document.createElement("a");
        service_0_link.innerHTML = setTSTR("audiogramMode");
        service_0_link.href = "#";
        service_0_link.onclick = () => {
            this.page.runExactlyHearingService();
            return false; // Предотвращаем переход по ссылке
        }

        service_0_Description.appendChild(service_0_link); // Добавляем ссылку в описание

        service_0_Box.addElement(service_0_Description);

        let service_1_Box = scene.createBox();
        service_1_Box.addClassName("tipBox");

        let service_1_Description = document.createElement("p");

        // Создание ссылки
        let service_1_link = document.createElement("a");
        service_1_link.innerHTML = setTSTR("LiveChatMode");
        service_1_link.href = "#"; // Добавляем href, чтобы это была ссылка
        service_1_link.onclick = () => {
            this.page.runLiveConversationService(); // Обработчик события на клик
            return false; // Предотвращаем переход по ссылке
        };
        
        service_1_Description.appendChild(service_1_link); // Добавляем ссылку в описание

        // Добавляем описание в созданный блок
        service_1_Box.addElement(service_1_Description);

        scene.show();
    }
}