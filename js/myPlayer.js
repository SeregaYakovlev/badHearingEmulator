class MyPlayer {
    constructor(scene, callback) {
        this.scene = scene;
        this.callback = callback;
        this.speaker = new MySpeaker(scene);
    }

    addClassName(className) {
        this.mediaPlayerBox.addClassName(className);
    }

    getAudioContext() {
        return this.speaker.getAudioContext();
    }

    getSpeaker() {
        return this.speaker;
    }

    getSoundSource() {
        return this.speaker.getSoundSource();
    }

    setCustomAudioBuffer(audioBuffer) {
        this.customAudioSource = true;
        this.audioBuffer = audioBuffer;
    }

    setFullVolume() {
        this.setVolume(1.0);
    }

    setZeroVolume() {
        this.setVolume(0.0);
    }

    setVolume(volume) {
        this.videoPlayer.volume(volume);
    }

    isPlaying() {
        let paused = this.videoPlayer.paused();
        return !paused;
    }

    setFile(file) {
        this.file = file;
    }

    setFileLink(fileLink) {
        this.fileLink = fileLink;
    }

    setFileType(fileType) {
        this.fileType = fileType;
    }

    setCallback(callback) {
        this.callback = callback;
    }

    _onStop() {
        console.log("player onStop");
        if (this.callback && typeof this.callback.onStop === 'function') {
            this.callback.onStop();
        }
        if (this.customAudioSource) {
            this._stopCustomSound();
        }
    }
    
    _onPlay(position) {
        console.log("player onPlay");
    
        if (this.callback && typeof this.callback.onPlay === 'function') {
            this.callback.onPlay(position);
        }
        if (this.customAudioSource) {
            this._playCustomSound(position);
        }
    }
    
    _onSeek(position) {
        console.log("player onSeek");
    
        if (this.callback && typeof this.callback.onSeek === 'function') {
            this.callback.onSeek(position, this.isPlaying());
        }
        if (this.isPlaying() && this.customAudioSource) {
            this._stopCustomSound();
            this._playCustomSound(position);
        }
    }
    
    _onEnded() {
        console.log("player onEnded");
    
        if (this.callback && typeof this.callback.onEnded === 'function') {
            this.callback.onEnded();
        }
        if (this.customAudioSource) {
            this._stopCustomSound();
        }
    }

    _onVideoLoaded(){
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
            fill: false,
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

        this.setVolume(0);

        this._connectPlayerToSRC();

        videoPlayer.addClass("vjs-big-play-centered");

        // Подписываемся на события play, pause, seeked и ended
        videoPlayer.on('play', () => {
            let position = videoPlayer.currentTime(); // Получаем текущую позицию для воспроизведения
            this._onPlay(position);
        });

        videoPlayer.on('pause', () => {
            this._onStop();
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

        return videoElem;
    }

    /*_connectPlayerToSRC(){
        if (this.file) {
            videoPlayer.src({
                type: (this.fileType) ? this.fileType : "video/mp4",
                src: URL.createObjectURL(this.file)
            });
        }

        if (this.fileLink) {
            videoPlayer.src({
                type: (this.fileType) ? this.fileType : "video/mp4",
                src: this.fileLink
            });
        }
    }*/

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
            this.videoPlayer.tech().el().crossOrigin = "anonymous";

            let proxyUrl = 'https://corsproxy.io/?';  // Новый прокси-сервер

            // Используем прокси-сервер для загрузки файла по ссылке
            let proxiedUrl = proxyUrl + encodeURIComponent(this.fileLink);

            // Устанавливаем файл как источник для видео
            videoPlayer.src({
                type: this.fileType ? this.fileType : "video/mp4",
                src: proxiedUrl
            });
        }
    }

    connectFilter(filter) {
        filter.connectPlayer(this.videoPlayer.tech().el());
    }

    replaceVideo() {
        this._connectPlayerToSRC();
    }

    _playCustomSound(position) {
        this.speaker.playBuffer(this.audioBuffer, position);
    }

    _stopCustomSound() {
        this.speaker.stop();
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