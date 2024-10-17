class MyPlayer {
    constructor(page, callback) {
        this.page = page;
        this.callback = callback;
    }

    getAudioContext() {
        return this.audioContext;
    }

    getSoundSource() {
        if (this.currentBufferSource) {
            return this.currentBufferSource;
        }
        else {
            throw new Error("No sound source");
        }
    }

    setCustomAudioBuffer(audioBuffer) {
        this.customAudioSource = true;
        this.audioBuffer = audioBuffer;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
        return !this.videoPlayer.paused();
    }

    loadFile(file) {
        this.file = file;
    }

    setCallback(callback) {
        this.callback = callback;
    }

    _onStop() {
        if (this.callback) {
            this.callback.onStop();
        }
        if (this.customAudioSource) {
            this._stopAudioBuffer();
        }
    }

    _onPlay(position) {
        if (this.callback) {
            this.callback.onPlay(position);
        }
        if (this.customAudioSource) {
            this._playAudioBuffer(position);
        }
    }

    _onSeek(position) {
        if (this.callback) {
            this.callback.onSeek(position);
        }
        if (this.isPlaying() && this.customAudioSource) {
            this._stopAudioBuffer();
            this._playAudioBuffer(position);
        }
    }

    _onEnded() {
        if (this.callback) {
            this.callback.onEnded();
        }
        if (this.customAudioSource) {
            this._stopAudioBuffer();
        }
    }

    async install(scene) {
        if (!this.file) {
            throw new Error("File is not loaded");
        }

        let mediaPlayerBox = scene.createBox();
        mediaPlayerBox.setName("mediaPlayerBox");
        mediaPlayerBox.addClassName("mediaPlayerBox");

        this.mediaPlayerBox = mediaPlayerBox;

        // Создаем элемент <video> с использованием Video.js
        let videoElem = document.createElement('video-js');
        mediaPlayerBox.addElement(videoElem);

        let videoPlayer = videojs(videoElem, {
            fill: true,
            controls: true,
            controlBar: {
                volumePanel: false,
                remainingTimeDisplay: false
            },
            autoplay: false,
            preload: 'auto',
        });
        this.videoPlayer = videoPlayer;

        this.setVolume(0);

        videoPlayer.src({
            type: "video/mp4",
            src: URL.createObjectURL(this.file)
        });

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
    }

    _playAudioBuffer(positionInSeconds) {
        if (!this.audioBuffer) {
            throw new Error("AudioBuffer is not set.");
        }

        // Получаем частоту дискретизации
        let sampleRate = this.audioBuffer.sampleRate;

        // Вычисляем смещение в аудиобуфере, соответствующее позиции видео
        let startOffset = positionInSeconds * sampleRate;

        this.currentBufferSource = this.audioContext.createBufferSource();
        this.currentBufferSource.buffer = this.audioBuffer;
        this.currentBufferSource.connect(this.audioContext.destination);

        // Устанавливаем начальное положение в аудиобуфере
        this.currentBufferSource.start(0, startOffset / sampleRate);
    }

    _stopAudioBuffer() {
        if (this.currentBufferSource) {
            this.currentBufferSource.stop(); // Останавливаем текущий источник
            this.currentBufferSource = null;
        }
    }

    show(){
        this.mediaPlayerBox.reveal();
    }

    hide(){
        this.mediaPlayerBox.hide();
    }
}