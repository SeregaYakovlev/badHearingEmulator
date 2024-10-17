class RealTimePlayer {
    constructor(page, hearingFrequency) {
        this.page = page;
        this.hearingFrequency = hearingFrequency;
        this.realtimeFilter = new RealTimeFilter();
        this.player = new MyPlayer(page, this);
        this._currentOffset = 0;

    }

    getAudioContext(){
        return this.realtimeFilter.getAudioContext();
    }

    getSoundSource(){
        return this.realtimeFilter.getSoundSource();
    }

    getRealTimeFilter(){
        return this.realtimeFilter;
    }

    isPlaying() {
        return this.player.isPlaying();
    }

    setHearingFrequency(frequency) {
        this.hearingFrequency = frequency;
        this.realtimeFilter.setHearingFrequency(frequency);
    }

    async loadFile(file) {
        this.player.loadFile(file);
        this.file = file;
        await this.realtimeFilter.loadFile(file);
    }

    onStop() {
        this.realtimeFilter.stopProcessing();
    }

    onPlay(position) {
        this.realtimeFilter.startProcessingFromFile(position);
    }

    onSeek(position) {
        this.realtimeFilter.stopProcessing();

        if (this.isPlaying()) {
            this.realtimeFilter.startProcessingFromFile(position);
        }
    }

    onEnded() {
        this.realtimeFilter.stopProcessing();
    }

    async install(scene) {
        this.player.install(scene);
    }

    show(){
        this.player.show();
    }

    hide(){
        this.player.hide();
    }
}
