class MyPlayer {
    constructor(scene, callback) {
        this.scene = scene;
        this.callback = callback;
        this.speaker = new MySpeaker(scene);
    }

    enableAudioAndVideoSyncing(){
        window.setInterval(() => this._syncSpeakerAndVideo(), 1000);
    }

    replaceSpeaker(speaker) {
        this.speaker = speaker;

        this.enableAudioAndVideoSyncing();
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

        this.enableAudioAndVideoSyncing();
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
        if (this.callback) {
            this.callback.onStop();
        }
        if (this.customAudioSource) {
            this._stopCustomSound();
        }
    }

    _onPlay(position) {
        if (this.callback) {
            this.callback.onPlay(position);
        }
        if (this.customAudioSource) {
            this._playCustomSound(position);
        }
    }

    _onSeek(position) {
        if (this.callback) {
            this.callback.onSeek(position, this.isPlaying());
        }
        if (this.isPlaying() && this.customAudioSource) {
            this._stopCustomSound();
            this._playCustomSound(position);
        }
    }

    _onEnded() {
        if (this.callback) {
            this.callback.onEnded();
        }
        if (this.customAudioSource) {
            this._stopCustomSound();
        }
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
            loop: true,
        });
        this.videoPlayer = videoPlayer;

        this.setVolume(0);

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

    _syncSpeakerAndVideo() {
        let isPlaying = this.isPlaying();
        if(!isPlaying){
            return;
        }

        try {
            // Получаем текущее время воспроизведения аудио
            let speakerPlaybackTime = this.speaker.getPlaybackTime();

            if (speakerPlaybackTime <= this.videoPlayer.duration) {
                // Устанавливаем это время для элемента видео
                this.videoPlayer.currentTime = speakerPlaybackTime;
            }
        } catch (e) {

        }
    }

    replaceVideo() {
        if (this.file) {
            this.videoPlayer.src({
                type: (this.fileType) ? this.fileType : "video/mp4",
                src: URL.createObjectURL(this.file)
            });
        }

        if (this.fileLink) {
            this.videoPlayer.src({
                type: (this.fileType) ? this.fileType : "video/mp4",
                src: this.fileLink
            });
        }
    }

    _playCustomSound(position) {
        this.speaker.playBuffer(this.audioBuffer, position);
    }

    _stopCustomSound() {
        this.speaker.stop();
    }

    show() {
        this.mediaPlayerBox.reveal();
    }

    hide() {
        this.mediaPlayerBox.hide();
    }
}