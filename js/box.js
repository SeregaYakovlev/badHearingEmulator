class Box {
    constructor(scene) {
        this.scene = scene;
        this.box = document.createElement("div");
        this.box.classList.add("box");
    }

    setName(boxName) {
        this.boxName = boxName;
    }

    getName() {
        return this.boxName;
    }

    asHTMLElement() {
        return this.box;
    }

    addClassName(className) {
        this.box.classList.add(className);
    }

    addElement(element) {
        this.box.appendChild(element);
    }

    hide() {
        this.box.setAttribute("boxHidden", "true"); // Устанавливаем атрибут для скрытия
    }

    reveal() {
        this.box.removeAttribute("boxHidden"); // Удаляем атрибут для отображения
    }


    displayAt(htmlElement) {
        htmlElement.appendChild(this.box);
    }

    remove() {
        this.box.remove();
    }
}