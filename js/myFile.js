class MyFile {
    static FileSizeUnits = {
        BYTES: 0,
        KILOBYTES: 1,
        MEGABYTES: 2,
        GIGABYTES: 3
    };

    constructor(page) {
        this.page = page;
        this.file = null;
        this.fileSizeLimit = null;
    }

    // Метод для получения наибольшего размера файла в разных единицах
    getLargestFileSize() {
        if (!this.file) {
            throw new Error("No file");
        }

        let fileSizeInBytes = this.file.size;
        let size, units;

        if (fileSizeInBytes >= 1024 * 1024 * 1024) {
            size = fileSizeInBytes / (1024 * 1024 * 1024);
            units = MyFile.FileSizeUnits.GIGABYTES;
        } else if (fileSizeInBytes >= 1024 * 1024) {
            size = fileSizeInBytes / (1024 * 1024);
            units = MyFile.FileSizeUnits.MEGABYTES;
        } else if (fileSizeInBytes >= 1024) {
            size = fileSizeInBytes / 1024;
            units = MyFile.FileSizeUnits.KILOBYTES;
        } else {
            size = fileSizeInBytes;
            units = MyFile.FileSizeUnits.BYTES;
        }

        return { size, units };
    }

    // Метод для получения наибольшего лимита размера файла в разных единицах
    getLargestFileSizeLimit() {
        if (!this.fileSizeLimit) {
            throw new Error("No fileSizeLimit");
        }

        let fileSizeLimitInBytes = this.fileSizeLimit;
        let size, units, unit_tstr;

        if (fileSizeLimitInBytes >= 1024 * 1024 * 1024) {
            size = fileSizeLimitInBytes / (1024 * 1024 * 1024);
            units = MyFile.FileSizeUnits.GIGABYTES;
            unit_tstr = "GIGABYTE_short";
        } else if (fileSizeLimitInBytes >= 1024 * 1024) {
            size = fileSizeLimitInBytes / (1024 * 1024);
            units = MyFile.FileSizeUnits.MEGABYTES;
            unit_tstr = "MEGABYTE_short";
        } else if (fileSizeLimitInBytes >= 1024) {
            size = fileSizeLimitInBytes / 1024;
            units = MyFile.FileSizeUnits.KILOBYTES;
            unit_tstr = "KILOBYTE_short";
        } else {
            size = fileSizeLimitInBytes;
            units = MyFile.FileSizeUnits.BYTES;
            unit_tstr = "BYTE_short";
        }

        return { size, units, unit_tstr };
    }


    // Метод для получения размера файла в разных единицах
    getFileSize(fileSizeUnits = MyFile.FileSizeUnits.BYTES) {
        if (!this.file) {
            throw new Error("No file");
        }

        let fileSizeInBytes = this.file.size;

        switch (fileSizeUnits) {
            case MyFile.FileSizeUnits.BYTES:
                return fileSizeInBytes;
            case MyFile.FileSizeUnits.KILOBYTES:
                return (fileSizeInBytes / 1024);
            case MyFile.FileSizeUnits.MEGABYTES:
                return (fileSizeInBytes / (1024 * 1024));
            case MyFile.FileSizeUnits.GIGABYTES:
                return (fileSizeInBytes / (1024 * 1024 * 1024));
            default:
                throw new Error("Algorithm error");
        }
    }

    // Метод для получения лимита размера файла в разных единицах
    getFileSizeLimit(fileSizeUnits = MyFile.FileSizeUnits.BYTES) {
        if (!this.fileSizeLimit) {
            throw new Error("No fileSizeLimit");
        }

        let fileSizeLimitInBytes = this.fileSizeLimit;

        switch (fileSizeUnits) {
            case MyFile.FileSizeUnits.BYTES:
                return fileSizeLimitInBytes;
            case MyFile.FileSizeUnits.KILOBYTES:
                return (fileSizeLimitInBytes / 1024);
            case MyFile.FileSizeUnits.MEGABYTES:
                return (fileSizeLimitInBytes / (1024 * 1024));
            case MyFile.FileSizeUnits.GIGABYTES:
                return (fileSizeLimitInBytes / (1024 * 1024 * 1024));
            default:
                throw new Error("Algorithm error");
        }
    }

    // Метод для установки лимита размера файла в различных единицах
    setFileSizeLimit(fileSize, fileSizeUnits = MyFile.FileSizeUnits.BYTES) {
        let fileSizeInBytes;

        switch (fileSizeUnits) {
            case MyFile.FileSizeUnits.BYTES:
                fileSizeInBytes = fileSize;
                break;
            case MyFile.FileSizeUnits.KILOBYTES:
                fileSizeInBytes = fileSize * 1024;
                break;
            case MyFile.FileSizeUnits.MEGABYTES:
                fileSizeInBytes = fileSize * 1024 * 1024;
                break;
            case MyFile.FileSizeUnits.GIGABYTES:
                fileSizeInBytes = fileSize * 1024 * 1024 * 1024;
                break;
            default:
                throw new Error("Algorithm error");
        }

        this.fileSizeLimit = fileSizeInBytes;
    }

    isLimitExceeded() {
        if (this.fileSizeLimit) {
            let fileSize = this.file.size;
            return fileSize > this.fileSizeLimit;
        }
        else {
            return false;
        }
    }

    async downloadSelectedFile() {
        return new Promise((resolve) => {
            resolve(this.file)
        });
    }

    async downloadFileFromDesktop() {
        let file = await this._downloadFileFromDesktop();

        this.file = file;

        if (!this.isUserAgreed()) {
            this.validationResult = this._validateFile();
            if (!this.validationResult.isOk()) {
                throw new FileValidationError(this.validationResult);  // Бросаем ошибку с результатом валидации
            }
        }

        return this.file;
    }

    getValidationResult() {
        return this.validationResult;
    }

    _validateFile() {
        let obj = {};

        // Преобразуем это в метод с использованием стрелочной функции
        obj.isAudioOrVideoFile = () => {
            return this._isAudioOrVideoFile();
        };

        // Преобразуем isLimitExceeded в метод с использованием стрелочной функции
        obj.isLimitExceeded = () => {
            return this.isLimitExceeded();
        };

        obj.isOk = () => {
            return obj.isAudioOrVideoFile() && !obj.isLimitExceeded();
        };

        obj.toJson = () => {
            return JSON.stringify(obj);
        };

        return obj;
    }


    isUserAgreed() {
        return this.userIsAgreed;
    }

    setUserAgreement(userAgreement) {
        this.userIsAgreed = userAgreement;
    }

    async _downloadFileFromDesktop() {
        return new Promise((resolve, reject) => {
            // Создаем скрытый input элемент
            let hiddenInput = document.createElement("input");
            hiddenInput.type = "file";
            hiddenInput.style.display = "none"; // Скрываем элемент

            // Ограничиваем выбор файлов только аудио и видео
            hiddenInput.accept = ""; // Инициализация

            hiddenInput.accept += "audio/*,";
            hiddenInput.accept += "video/*";


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

    getFileExtension() {
        if (!this.file || !this.file.name) {
            throw new Error("No file or file name");
        }
        return this.file.name.split('.').pop().toLowerCase();
    }

    getFileName() {
        if (!this.file || !this.file.name) {
            throw new Error("No file or file name");
        }
        return this.file.name;
    }

    // Метод для проверки, является ли файл аудио или видео
    _isAudioOrVideoFile() {
        if (!this.file) return false;
        let fileType = this.file.type;
        return fileType.startsWith("audio/") || fileType.startsWith("video/");
    }
}

class FileValidationError extends Error {
    constructor(validationResult) {
        super("File validation failed.");
        this.name = "FileValidationError";
        this.validationResult = validationResult;  // Храним результат валидации
    }
}
