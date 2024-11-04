class Preloader {
    constructor(page){
        this.page = page;

        this.scene = new Scene(this.page);
        this.scene.addClassName("preloaderScene");

        let preloaderBox = this.scene.createBox();
        preloaderBox.addClassName("preloaderBox");

        this.preloaderBox = preloaderBox;

        let preloader = document.createElement("div");
        preloader.classList.add("preloader");

        preloaderBox.addElement(preloader); // Добавляем крутящийся элемент
    }

    show(){
        this.scene.show();
    }

    createCaptionArea(){
        let caption = document.createElement("span");
        caption.classList.add("preloaderCaption");
        
        this.preloaderBox.addElement(caption);

        caption.setMessage = (message) => {
            caption.innerHTML = message;
        }

        return caption;
    }
    
    close(){
        this.scene.close();
    }
}