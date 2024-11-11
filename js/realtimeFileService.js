class RealtimeFileService {
    constructor(page) {
        this.page = page;
    }

    async run() {
        this._download_process_and_display_file_from_desktop();
    }

    async _download_process_and_display_file_from_desktop() {
        let myFile = new MyFile(this.page);
        myFile.setFileSizeLimit(100, MyFile.FileSizeUnits.BYTES);

        let file;
        while (!file) {
            try {
                file = await myFile.downloadFileFromDesktop();
            } catch (e) {
                if (!(e instanceof FileValidationError)) {
                    throw e;  // Если ошибка не является FileValidationError, выбрасываем её дальше
                }

                let fileWarning = new FileWarningService(this.page, myFile);
                fileWarning.show();

                // Ждем решения пользователя
                let result = await fileWarning.waitForResult();

                // Проверяем, согласился ли пользователь
                if (result.userAgreed()) {
                    myFile.setUserAgreement(true);
                    file = await myFile.downloadSelectedFile();
                } else if (result.userNotAgreed()) {
                    continue;
                }
                else {
                    throw new Error("Algorithm error");
                }
            }
        }

        this._showMediaPlayer(file);
    }

    async _showMediaPlayer(originalFile) {
        let preloader = new Preloader(this.page);
        let preloaderCaption = preloader.createCaptionArea();
        preloaderCaption.setMessage(htmlTSTR("OneMinute..."));
        preloader.show();

        let hearingFrequency = 500;

        let scene = new Scene(this.page);
        scene.addClassName("mediaPlayerScene");

        let realtimeFilter = new RealTimeFilter(scene);
        realtimeFilter.setHearingFrequency(hearingFrequency);
        await realtimeFilter.loadFile(originalFile);

        let player = new MyPlayer(scene, realtimeFilter);
        player.setFile(originalFile);
        player.install(scene);

        let frequencySlider = new FrequencySlider(scene, hearingFrequency, 0, 8_000, realtimeFilter);
        frequencySlider.setFrequencyCallback((frequency) => {
            realtimeFilter.setHearingFrequency(frequency);
        });

        let actionsBox = scene.createBox();
        actionsBox.addClassName("actionsBox");

        let btnContainer = document.createElement("div");
        btnContainer.classList.add("mediaPlayerBtnContainer");
        actionsBox.addElement(btnContainer);

        let anotherFileBtn = document.createElement("button");
        anotherFileBtn.classList.add("myBtn");
        anotherFileBtn.innerHTML = htmlTSTR("anotherFile");
        anotherFileBtn.addEventListener("click", async () => {
            this._download_process_and_display_file_from_desktop();
        });

        let soundVisualizationBtn = new MyBinaryButton();
        let soundVisualization = new SoundVisualization(scene, realtimeFilter.getSpeaker());

        soundVisualizationBtn.setState1("FrequencySpectrum", async () => {
            player.hide();
            soundVisualization.show();
        });

        soundVisualizationBtn.setState2("ShowVideo", () => {
            player.show();
            soundVisualization.hide();
        });

        soundVisualizationBtn.applyFirstState();

        btnContainer.appendChild(anotherFileBtn);
        btnContainer.appendChild(soundVisualizationBtn.asHTMLElement());

        preloader.close();

        scene.show();
    }
}