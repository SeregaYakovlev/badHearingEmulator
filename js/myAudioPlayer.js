class MyAudioPlayer {
    constructor(scene) {
        this.scene = scene;
        this.audioPlayer = document.createElement("audio");
        this._addUI();
        this._addEventListeners();
    }

    _addUI() {
        this.ui = document.createElement("div");
        this.ui.classList.add("myAudioPlayer");

        // Создаем кнопку воспроизведения
        let playBtn = document.createElement("audio-ui-button");
        playBtn.classList.add("playButton");
        playBtn.addEventListener("click", () => {
            this.audioPlayer.play();
        });

        // Создаем кнопку паузы
        let pauseBtn = document.createElement("audio-ui-button");
        pauseBtn.classList.add("pauseButton");
        pauseBtn.addEventListener("click", () => {
            this.audioPlayer.pause();
        });

        this.ui.appendChild(playBtn);
        this.ui.appendChild(pauseBtn);
    }

    _addEventListeners() {
        // Обработчики событий
        this.audioPlayer.addEventListener('play', () => {
            this._onPlay(); // Передаем текущую позицию
        });

        this.audioPlayer.addEventListener('pause', () => {
            this._onStop();
        });

        this.audioPlayer.addEventListener('seeked', () => {
            this._onSeek(); // Передаем новую позицию
        });

        this.audioPlayer.addEventListener('ended', () => {
            this._onEnded();
        });
    }

    clear() {
        this.audioPlayer.src = '';
        this.audioPlayer.load();

        this.ui.removeAttribute("fileIsLoaded");
    }

    setCallback(callback) {
        this.callback = callback;
    }

    muteSound() {
        this.audioPlayer.volume = 0.0;
    }

    setVolume(volume) {
        this.audioPlayer.volume = volume;
    }

    loadFile(file) {
        this.audioPlayer.src = URL.createObjectURL(file); // Создаем URL для аудиофайла
        this.audioPlayer.load(); // Загружаем новый источник

        this.ui.setAttribute("fileIsLoaded", true);
    }

    installInBox(box) {
        box.addElement(this.ui);
    }

    isPlaying() {
        return !this.audioPlayer.paused;
    }    

    _onPlay() {
        let position = this.audioPlayer.currentTime;
        if (this.callback) {
            this.callback.onPlay(position);
        }

        this.ui.setAttribute("playing", true);
    }

    _onStop() {
        if (this.callback) {
            this.callback.onStop();
        }

        this.ui.removeAttribute("playing");
    }

    _onSeek() {
        let position = this.audioPlayer.currentTime;
        if (this.callback) {
            this.callback.onSeek(position);
        }
    }

    _onEnded() {
        if (this.callback) {
            this.callback.onEnded();
        }

        this.ui.removeAttribute("playing");
    }
}