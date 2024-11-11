class FileWarningService {
    constructor(page, myFile) {
        this.page = page;
        this.myFile = myFile;
        this.scene = new Scene(this.page);
        this.scene.addClassName("fileWarningScene");
    }

    _createAgreeBtn(text) {
        let agreeBtn = document.createElement("button");
        agreeBtn.classList.add("myBtn");
        agreeBtn.innerHTML = htmlTSTR(text);

        agreeBtn.addEventListener("click", () => {
            this.callback.userAgreed();
            this.scene.close();
        });

        return agreeBtn;
    }

    _createNonAgreeBtn(text) {
        let nonAgreeBtn = document.createElement("button");
        nonAgreeBtn.classList.add("myBtn");
        nonAgreeBtn.innerHTML = htmlTSTR(text);

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
            this._addFileTypeWarning();
        }

        if (validationResult.isLimitExceeded()) {
            this._addFileSizeWarning();
        }

        this._addAgreementContainer();
        this.scene.show();
    }

    _addFileTypeWarning() {
        let fileName = this.myFile.getFileName();
        let fileExtension = this.myFile.getFileExtension();

        let box = this._createWarningBox();

        let pContainer = document.createElement("div");
        pContainer.classList.add("div");

        let p1 = document.createElement("p");

        p1.innerHTML = htmlTSTR("FileDownloadedWithNameAndExtension",
            [
                SA(fileName, false),
                SA(fileExtension, false)
            ]);

        let p2 = document.createElement("p");
        p2.innerHTML = htmlTSTR("IsThisDefinitelyAudioVideoFile?");

        pContainer.appendChild(p1);
        pContainer.appendChild(p2);

        box.addElement(pContainer);
    }

    _addFileSizeWarning() {
        let fileSizeObj = this.myFile.getLargestFileSize();
        let fileSizeLimitObj = this.myFile.getLargestFileSizeLimit();

        let box = this._createWarningBox();

        let pContainer = document.createElement("div");
        pContainer.classList.add("div");

        let p1 = document.createElement("p");
        p1.innerHTML = htmlTSTR("FileWarningSize",
            [
                SA(Math.round(fileSizeObj.size), false),
                SA(this._getUnitTSTR(fileSizeObj.units), true)
            ]);

        let p2 = document.createElement("p");
        p2.innerHTML = htmlTSTR("FileWarningRecommendation",
            [
                SA(Math.round(fileSizeLimitObj.size), false),
                SA(this._getUnitTSTR(fileSizeLimitObj.units), true)
            ]
        )
        pContainer.appendChild(p1);
        pContainer.appendChild(p2);

        box.addElement(pContainer);
    }

    _addAgreementContainer() {
        let box = this.scene.createBox();

        let nonAgreeBtn = this._createNonAgreeBtn("anotherFile");

        let agreeBtn = this._createAgreeBtn("ContinueAnyway");

        let btnContainer = document.createElement("div");
        btnContainer.classList.add("fileWarningBtnContainer");

        btnContainer.appendChild(nonAgreeBtn);
        btnContainer.appendChild(agreeBtn);

        box.addElement(btnContainer);
    }

    _createWarningBox() {
        let box = this.scene.createBox();
        box.addClassName("warningBox");

        // Создаем иконку предупреждения
        let warningIcon = document.createElement("div");
        warningIcon.classList.add("warningIcon");

        // Добавляем иконку в box
        box.addElement(warningIcon);

        return box;
    }

    _getUnitTSTR(fileSizeUnit) {
        if (fileSizeUnit === MyFile.FileSizeUnits.BYTES) {
            return "BYTE_short";
        } else if (fileSizeUnit === MyFile.FileSizeUnits.KILOBYTES) {
            return "KILOBYTE_short";
        } else if (fileSizeUnit === MyFile.FileSizeUnits.MEGABYTES) {
            return "MEGABYTE_short";
        } else if (fileSizeUnit === MyFile.FileSizeUnits.GIGABYTES) {
            return "GIGABYTE_short";
        } else {
            throw new Error("Unknown file size unit");
        }
    }
}