class ExactlyHearingService {
    constructor(page) {
        this.page = page;
        this.audiograms = [];
    }

    show() {
        this._showMainScene();
    }

    _showMainScene() {
        let scene = new Scene(this.page);
        scene.addClassName("mainScene");
        let b = scene.createBox();

        let welcomElem = document.createElement("div");

        let p0 = document.createElement("p");
        p0.innerHTML = `${htmlTSTR("audiogramScene_mainBox_P0")}`;
        welcomElem.appendChild(p0);

        let p1 = document.createElement("p");
        p1.innerHTML = `1) ${htmlTSTR("audiogramScene_mainBox_P1")}`;
        welcomElem.appendChild(p1);

        let p2 = document.createElement("p");
        p2.innerHTML = `2) ${htmlTSTR("audiogramScene_mainBox_P2")}`;
        welcomElem.appendChild(p2);

        let separateEarsBtn = document.createElement("button");
        separateEarsBtn.classList.add("myBtn");
        separateEarsBtn.innerHTML = htmlTSTR("onEachEar");
        separateEarsBtn.addEventListener("click", () => {
            this._showAudiogramScene(Audiogram.Types.LEFT_EAR);
        })

        let binauralBtn = document.createElement("button");
        binauralBtn.classList.add("myBtn");
        binauralBtn.innerHTML = htmlTSTR("OnBothEarsOnce");
        binauralBtn.addEventListener("click", () => {
            this._showAudiogramScene(Audiogram.Types.BINAURAL);
        })

        b.addElement(welcomElem);

        let div = document.createElement("div");
        div.classList.add("exactlyServiceBtnContainer");

        div.appendChild(separateEarsBtn);
        div.appendChild(binauralBtn);

        b.addElement(div);

        scene.show();
    }

    async _download_process_display_file_from_desktop() {
        let myFile = new MyFile(this.page);
        myFile.setFileSizeLimit(20, MyFile.FileSizeUnits.MEGABYTES);
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


        let preloader = new Preloader(this.page);
        preloader.show();
        let handledAudioBuffer = await this._handleFile(preloader, file, this.audiograms);
        preloader.close();
        this._showMediaPlayer(handledAudioBuffer, file);
    }

    async onAudiogramSceneInputed(audiogramScene) {
        this.audiograms.push(audiogramScene.getAudiogram());
        if (audiogramScene.isLeftEar()) {
            let rightEarAudiogram = this._getAudiogramScene(Audiogram.Types.RIGHT_EAR);
            rightEarAudiogram.show();
        }
        else if (audiogramScene.isRightEar() || audiogramScene.isBinaural()) {
            this._download_process_display_file_from_desktop();
        }
    }

    _showAudiogramScene(audiogramType) {
        let audiogramScene = this._getAudiogramScene(audiogramType);
        audiogramScene.show();
    }

    _getAudiogramScene(audiogramType) {
        let scene = new AudiogramScene(this.page, this, audiogramType);
        return scene;
    }

    async _handleFile(preloader, originalFile, audiograms) {
        let handledAudioBuffer;

        let myFFT = new MyFFT(originalFile);
        myFFT.setPreloader(preloader);

        // Конвертируем каждый аудиограм в JSON и собираем их в массив
        let audiogramArray = audiograms.map(audiogram => audiogram.toJsonSerializableObj());
        let json = JSON.stringify(audiogramArray);

        let auditoryGraphArray = AuditoryGraph.getAuditoryGraphArrayFromJson(json);

        handledAudioBuffer = await myFFT.processWithAuditoryGraphs(auditoryGraphArray);

        return handledAudioBuffer;
    }

    _showMediaPlayer(handledAudioBuffer, originalFile) {
        let scene = new Scene(this.page);
        scene.addClassName("mediaPlayerScene");

        let player = new MyPlayer(scene, null);
        player.setFile(originalFile);
        player.setCustomAudioBuffer(handledAudioBuffer);
        player.install(scene);

        let actionsBox = scene.createBox();
        actionsBox.addClassName("actionsBox");

        let btnContainer = document.createElement("div");
        btnContainer.classList.add("mediaPlayerBtnContainer");
        actionsBox.addElement(btnContainer);

        let anotherFileBtn = document.createElement("button");
        anotherFileBtn.classList.add("myBtn");
        anotherFileBtn.innerHTML = htmlTSTR("anotherFile");
        anotherFileBtn.addEventListener("click", async () => {
            this._download_process_display_file_from_desktop();
        });

        btnContainer.appendChild(anotherFileBtn);

        let soundVisualizationBtn = new MyBinaryButton();

        let soundVisualization = new SoundVisualization(scene, player.getSpeaker());

        soundVisualizationBtn.setState1("FrequencySpectrum", async () => {
            player.hide();
            soundVisualization.show();
        });

        soundVisualizationBtn.setState2("ShowVideo", () => {
            player.show();
            soundVisualization.hide();
        });

        soundVisualizationBtn.applyFirstState();

        btnContainer.appendChild(soundVisualizationBtn.asHTMLElement());

        scene.show();
    }
}