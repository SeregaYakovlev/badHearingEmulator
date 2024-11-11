class FileWarning {
    constructor(page, myFile) {
        this.page = page;
        this.myFile = myFile;
        this.scene = new Scene(this.page);
        this.scene.addClassName("fileWarningScene");
    }

    _createAgreeBtn(text) {
        let agreeBtn = document.createElement("button");
        agreeBtn.classList.add("myBtn");
        agreeBtn.innerHTML = setTSTR(text);

        agreeBtn.addEventListener("click", () => {
            this.callback.userAgreed();
            this.scene.close();
        });

        return agreeBtn;
    }

    _createNonAgreeBtn(text) {
        let nonAgreeBtn = document.createElement("button");
        nonAgreeBtn.classList.add("myBtn");
        nonAgreeBtn.innerHTML = setTSTR(text);

        nonAgreeBtn.addEventListener("click", () => {
            this.callback.userNotAgreed();
        });

        return nonAgreeBtn;
    }

    async waitForResult() {
        let userAgreed;

        // Создаем промис
        let promise = new Promise((resolve) => {
            this.callback = {
                userAgreed: () => {
                    userAgreed = true;
                    resolve(); // Разрешаем промис
                },
                userNotAgreed: () => {
                    userAgreed = false;
                    resolve(); // Разрешаем промис
                }
            }
        });

        // Ожидаем разрешения промиса
        await promise;

        // Возвращаем объект с методами
        let result = {
            userAgreed: () => {
                return userAgreed;
            },
            userNotAgreed: () => {
                return !userAgreed;
            }
        };

        return result;
    }

    show() {
        let validationResult = this.myFile.getValidationResult();

        if (!validationResult.isAudioOrVideoFile()) {
            this._displayFileTypeWarning();
        }
        else if (validationResult.isLimitExceeded()) {
            this._displayFileSizeWarning();
        }
        else {
            throw new Error("Algorithm error");
        }
    }

    _displayFileTypeWarning() {
        let fileExtension = this.myFile.getFileExtension();

        let box = this.scene.createBox();

        let p = document.createElement("p");
        p.innerHTML = "";
        p.innerHTML += setTSTR("FileDownloadedWithExtension", [fileExtension]);
        p.innerHTML += setTSTR("IsThisDefinitelyAudioVideoFile?");

        let nonAgreeBtn = this._createNonAgreeBtn("NoLoadAnotherFile");

        let agreeBtn = this._createAgreeBtn("YesItIsAudioVideo");

        let btnContainer = document.createElement("div");
        btnContainer.classList.add("fileWarningBtnContainer");

        btnContainer.appendChild(nonAgreeBtn);
        btnContainer.appendChild(agreeBtn);

        box.addElement(p);
        box.addElement(btnContainer);
        this.scene.show();
    }

    _displayFileSizeWarning() {
        let fileSizeInMegaBytes = this.myFile.getFileSize(MyFile.FileSizeUnits.MEGABYTES);
        let fileSizeLimitInMegabytes = this.myFile.getFileSizeLimit(MyFile.FileSizeUnits.MEGABYTES);

        fileSizeInMegaBytes = Math.round(fileSizeInMegaBytes);
        fileSizeLimitInMegabytes = Math.round(fileSizeLimitInMegabytes);

        let box = this.scene.createBox();

        let p = document.createElement("p");
        p.innerHTML = setTSTR("FileSizeWarning", [fileSizeInMegaBytes, fileSizeLimitInMegabytes]);

        let nonAgreeBtn = this._createNonAgreeBtn("anotherFile");

        let agreeBtn = this._createAgreeBtn("ContinueAnyway");

        let btnContainer = document.createElement("div");
        btnContainer.classList.add("fileWarningBtnContainer");

        btnContainer.appendChild(nonAgreeBtn);
        btnContainer.appendChild(agreeBtn);

        box.addElement(p);
        box.addElement(btnContainer);
        this.scene.show();
    }
}