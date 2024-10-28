class RealtimeFileService {
    constructor(page) {
        this.page = page;
    }

    async run() {
        let file = await this._downloadFileFromDesktop();
        this._showMediaPlayer(file);
    }

    async _downloadFileFromDesktop() {
        return new Promise((resolve, reject) => {
            // Создаем скрытый input элемент
            let hiddenInput = document.createElement("input");
            hiddenInput.type = "file";
            hiddenInput.style.display = "none"; // Скрываем элемент

            // Ограничиваем выбор файлов только аудио и видео
            hiddenInput.accept = "audio/*,video/*"; // Выбираем все аудио и видео файлы

            // Обработчик события выбора файла
            hiddenInput.addEventListener('change', () => {
                let file = hiddenInput.files[0]; // Получаем первый выбранный файл
                if (file) {
                    resolve(file); // Разрешаем промис с выбранным файлом
                } else {
                    reject(new Error("No file selected")); // Отклоняем промис, если файл не выбран
                }
            });

            hiddenInput.click();
        });
    }

    async _showMediaPlayer(originalFile) {
        let preloader = new Preloader(this.page);
        preloader.setCaption(setTSTR("FewSeconds..."));
        preloader.show();

        let hearingFrequency = 500;

        let scene = new Scene(this.page);
        scene.addClassName("mediaPlayerScene");

        let realtimePlayer = new RealTimePlayer(scene, hearingFrequency);
        realtimePlayer.setHearingFrequency(hearingFrequency);
        await realtimePlayer.loadFile(originalFile);
        realtimePlayer.install(scene);

        let frequencySlider = new FrequencySlider(scene, hearingFrequency, 0, 8_000, realtimePlayer.getRealTimeFilter());
        frequencySlider.setFrequencyCallback((frequency) => {
            realtimePlayer.setHearingFrequency(frequency);
        });

        let actionsBox = scene.createBox();
        actionsBox.addClassName("actionsBox");

        let btnContainer = document.createElement("div");
        btnContainer.classList.add("mediaPlayerBtnContainer");
        actionsBox.addElement(btnContainer);

        let mainSceneBtn = document.createElement("button");
        mainSceneBtn.innerHTML = setTSTR("homePage");
        mainSceneBtn.addEventListener("click", () => {
            this.page.showRoot();
        });

        let anotherFileBtn = document.createElement("button");
        anotherFileBtn.innerHTML = setTSTR("anotherFile");
        anotherFileBtn.addEventListener("click", async () => {
            let anotherFile = await this._downloadFileFromDesktop();
            this._showMediaPlayer(anotherFile);
        });

        let soundVisualizationBtn = new MyBinaryButton();
        let soundVisualization = new SoundVisualization(scene, realtimePlayer);

        soundVisualizationBtn.setState1("FrequencySpectrum", async () => {
            realtimePlayer.hide();
            await soundVisualization.show();
            soundVisualization.startProcessing();
        });

        soundVisualizationBtn.setState2("ShowVideo", () => {
            realtimePlayer.show();
            soundVisualization.hide();
            soundVisualization.stopProcessing();
        });

        soundVisualizationBtn.applyFirstState();

        btnContainer.appendChild(anotherFileBtn);
        btnContainer.appendChild(soundVisualizationBtn.asHTMLElement());
        btnContainer.appendChild(mainSceneBtn);

        preloader.close();

        scene.show();
    }
}