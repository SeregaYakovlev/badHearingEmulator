class Preloader {
    constructor(page){
        this.page = page;

        this.scene = new Scene(this.page);
        this.scene.addClassName("preloaderScene");

        let preloaderBox = this.scene.createBox();
        preloaderBox.addClassName("preloaderBox");

        let preloader = document.createElement("div");
        preloader.classList.add("preloader");

        this.caption = document.createElement("span");
        this.caption.classList.add("preloaderCaption");

        preloaderBox.addElement(preloader); // Добавляем крутящийся элемент
        preloaderBox.addElement(this.caption); // Добавляем надпись под ним
    }

    show(){
        this.scene.show();
    }

    setCaption(caption){
        this.caption.innerHTML = caption;
    }

    write(logMessage){
        this.setCaption(logMessage);
    }
    
    close(){
        this.scene.close();
    }
}