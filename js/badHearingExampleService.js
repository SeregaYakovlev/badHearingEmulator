class BadHearingExampleService{
    constructor(page){
        this.page = page;

        this.page.subscribeOnLanguageChangingEvent(this);
    }

    install(scene){
        let captionBox = scene.createBox();
        captionBox.addClassName("tipBox");
        let caption = document.createElement("p");
        caption.innerHTML = htmlTSTR("InVideoExampleBadHearing");
        captionBox.addElement(caption);

        let videoBox = scene.createBox();
        videoBox.addClassName("bad_hearing_example_video");

        let fileLink =this._getFileLink();

        let player = new MyPlayer(scene, null);
        player.setFileLink(fileLink);
        player.setFileType("video/webm");
        player.installInBox(videoBox);
        player.setFullVolume();

        this.player = player;
    }

    _getFileLink(){
        let currentLanguage = this.page.getCurrentLanguage();
        let languageCode = currentLanguage.getCode();

        return `bad_hearing_examples/${languageCode}/video.webm`;
    }

    _reloadService(){
        let fileLink = this._getFileLink();
        this.player.setFileLink(fileLink);
        this.player.replaceVideo();
    }

    onLanguageChanged(){
        this._reloadService();
    }
}