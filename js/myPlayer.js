class MyPlayer {
    constructor(scene, callback) {
        this.page = scene.getPage();
        this.scene = scene;
        this.callback = callback;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    getAudioContext() {
        return this.audioContext;
    }

    getSoundSource(connectToOutput = true) {
        let source;

        if (this.audioElement) {
            source = this.audioContext.createMediaElementSource(this.audioElement);
        }

        else {
            source = this.audioContext.createMediaElementSource(this.videoPlayer.tech().el());
        }

        if (connectToOutput) {
            // После получения источника медиаэлемента, он должен быть куда-то подключен
            source.connect(this.audioContext.destination);
        }

        return source;
    }

    addClassName(className) {
        this.mediaPlayerBox.addClassName(className);
    }

    async setCustomAudioFile(file) {
        if (!file || !(file instanceof File)) {
            throw new Error("Invalid file provided");
        }

        // Создаём новый аудио элемент
        this.audioElement = document.createElement("audio");

        // Устанавливаем файл как источник
        this.audioElement.src = URL.createObjectURL(file);

        // заменяем аудио из видеофайла нашим кастомным аудиофайлом
        // отключаем звук из файла, который проигрывает видеоплеер
        this.videoPlayer.volume(0.0);

        // Устанавливаем громкость аудио на 1.0
        this.audioElement.volume = 1.0;
    }

    _onPause() {
        console.log("player onPause");

        if (this.audioElement) {
            this.audioElement.pause(); // Ставим на паузу аудио
        }

        if (this.callback && typeof this.callback.onPause === 'function') {
            this.callback.onPause(); // Вызываем callback onPause
        }
    }

    _onPlay(position) {
        console.log("player onPlay");

        if (this.audioElement) {
            this.audioElement.currentTime = this.videoPlayer.currentTime(); // Синхронизируем время аудио с видео
            this.audioElement.play(); // Запускаем аудио
        }

        if (this.callback && typeof this.callback.onPlay === 'function') {
            this.callback.onPlay(position); // Вызываем callback onPlay
        }
    }

    _onSeek(position) {
        console.log("player onSeek");

        if (this.audioElement) {
            this.audioElement.currentTime = position; // Перемещаем аудио в нужную позицию

            // нужно для режима зацикливания, при котором onPlay не срабатывает
            let isAudioPlaying = !this.audioElement.paused;
            if (this.isPlaying() && !isAudioPlaying) {
                this.audioElement.play();
            }
        }

        if (this.callback && typeof this.callback.onSeek === 'function') {
            this.callback.onSeek(position, this.isPlaying()); // Вызываем callback onSeek
        }
    }

    _onEnded() {
        console.log("player onEnded");

        if (this.audioElement) {
            this.audioElement.pause(); // Останавливаем аудио
            this.audioElement.currentTime = 0; // Сбрасываем время на начало
        }

        if (this.callback && typeof this.callback.onEnded === 'function') {
            this.callback.onEnded(); // Вызываем callback onEnded
        }
    }


    setFullVolume() {
        this.setVolume(1.0);
    }

    setZeroVolume() {
        this.setVolume(0.0);
    }

    setVolume(volume) {
        if (this.audioElement) {
            this.audioElement.volume = volume;
        }
        else {
            this.videoPlayer.volume(volume);
        }
    }

    isPlaying() {
        let paused = this.videoPlayer.paused();
        return !paused;
    }

    setFile(file) {
        if (this.audioElement) {
            throw new Error("Impossible replace wideo with custom audio file");
        }

        this.file = file;
    }

    setFileLink(fileLink) {
        if (this.audioElement) {
            throw new Error("Impossible replace wideo with custom audio file");
        }

        this.fileLink = fileLink;
    }

    setFileType(fileType) {
        if (this.audioElement) {
            throw new Error("Impossible replace wideo with custom audio file");
        }

        this.fileType = fileType;
    }

    setCallback(callback) {
        this.callback = callback;
    }

    _onVideoLoaded() {
        if (this.callback && typeof this.callback.onVideoLoaded === 'function') {
            this.callback.onVideoLoaded();
        }
    }

    setAutoplay(bool) {
        this.videoPlayer.autoplay(bool); // Устанавливает авто воспроизведение
    }

    async install(scene) {
        let box = scene.createBox();
        return this.installInBox(box);
    }

    async installInBox(box) {
        let mediaPlayerBox = box;
        mediaPlayerBox.setName("mediaPlayerBox");
        mediaPlayerBox.addClassName("mediaPlayerBox");

        this.mediaPlayerBox = mediaPlayerBox;

        let videoElem = this._createPlayer();

        mediaPlayerBox.addElement(videoElem);

        this.playerElem = mediaPlayerBox.asHTMLElement();
    }

    async installInDiv(div) {
        div.classList.add("mediaPlayerBox");
        div.classList.add("box");

        let videoElem = this._createPlayer();
        div.appendChild(videoElem);

        this.playerElem = div;
    }

    _createPlayer() {
        let videoElem = document.createElement('video-js');
        let videoPlayer = videojs(videoElem, {
            fill: true,
            controls: true,
            controlBar: {
                volumePanel: false,
                remainingTimeDisplay: false
            },
            autoplay: false,
            preload: 'auto',
            loop: true
        });
        this.videoPlayer = videoPlayer;

        videoPlayer.addClass("vjs-big-play-centered");

        this.videoPlayer.volume(1.0);

        this._connectPlayerToSRC();

        // Подписываемся на события play, pause, seeked и ended
        videoPlayer.on('play', () => {
            let position = videoPlayer.currentTime(); // Получаем текущую позицию для воспроизведения
            this._onPlay(position);
        });

        videoPlayer.on('pause', () => {
            this._onPause();
        });

        videoPlayer.on('seeked', () => {
            let position = videoPlayer.currentTime(); // Получаем текущую позицию после перемотки
            this._onSeek(position);
        });

        videoPlayer.on('ended', () => {
            this._onEnded();
        });

        // Событие onVideoLoaded
        videoPlayer.on('loadeddata', () => {
            this._onVideoLoaded();
        });

        // Отслеживание перехода в полноэкранный режим
        videoPlayer.on('fullscreenchange', () => {
            if (videoPlayer.isFullscreen()) {
                // Видео в полноэкранном режиме — убираем кастомные стили
                videoPlayer.tech().el().classList.add('fullscreen');
            } else {
                // Видео не в полноэкранном режиме — применяем стили
                videoPlayer.tech().el().classList.remove('fullscreen');
            }
        });

        return videoElem;
    }

    async _connectPlayerToSRC() {
        let videoPlayer = this.videoPlayer;  // предполагаем, что videoPlayer уже определен

        // Для локального файла
        if (this.file) {
            videoPlayer.src({
                type: this.fileType ? this.fileType : "video/mp4",
                src: URL.createObjectURL(this.file)
            });
        }

        // Для файла по ссылке
        if (this.fileLink) {
            videoPlayer.tech().el().crossOrigin = "anonymous";

            // Устанавливаем файл как источник для видео
            videoPlayer.src({
                type: this.fileType ? this.fileType : "video/mp4",
                src: this.fileLink
            })
        }
    }

    async connectFilter(filter) {
        if (this.isFilterConnected()) {
            throw new Error("Filter is already connected");
        }

        if (this.filterConnectionLock) {
            throw new Error("Filter is still connecting...");
        }

        this.filterConnectionLock = true;

        if (this.audioElement) {
            await filter.connectPlayer(this.audioElement);
        }
        else {
            await filter.connectPlayer(this.videoPlayer.tech().el());
        }

        this.filterConnectionLock = false;

        this.filter = filter;
    }

    isFilterConnected() {
        return !!this.filter;
    }

    replaceVideo() {
        if (this.audioElement) {
            throw new Error("Impossible replace wideo with custom audio file");
        }

        this._connectPlayerToSRC();
    }

    show() {
        if (this.mediaPlayerBox) {
            this.mediaPlayerBox.reveal();
        }
        else {
            // не реализовано
            this.playerElem.setAttribute("hidden", "true"); // Устанавливаем атрибут для скрытия
        }
    }

    hide() {
        if (this.mediaPlayerBox) {
            this.mediaPlayerBox.hide();
        }
        else {
            // не реализовано
            this.playerElem.removeAttribute("hidden"); // Удаляем атрибут для отображения
        }
    }
}