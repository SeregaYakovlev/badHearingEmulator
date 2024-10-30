class RealTimePlayer {
    constructor(scene, hearingFrequency) {
        this.scene = scene;
        this.hearingFrequency = hearingFrequency;
        this.realtimeFilter = new RealTimeFilter(scene);
        this.player = new MyPlayer(this.scene, this);
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
        this.player.setFile(file);
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

    onDestroyed(){
        this.realtimeFilter.stopProcessing();
    }

    async installInBox(box){
        await this.player.installInBox(box);
    }

    async install(scene) {
        await this.player.install(scene);
    }

    show(){
        this.player.show();
    }

    hide(){
        this.player.hide();
    }
}
