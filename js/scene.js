class Scene {
    constructor(page) {
        this.page = page;
        this.scene = document.createElement("div");
        this.scene.classList.add("scene");
        this.boxes = [];
        this.storage = new VariableStorage();
    }

    setVariable(variableName, variableValue) {
        this.storage.setVariable(variableName, variableValue);
    }

    getVariable(variableName) {
        return this.storage.getVariable(variableName);
    }

    addClassName(className) {
        this.scene.classList.add(className);
    }

    getBoxes() {
        return this.boxes;
    }

    show() {
        for (let box of this.boxes) {
            box.displayAt(this.scene);
        }

        this.page.showScene(this);
    }

    update() {
        this.show();
    }

    close() {
        this.scene.remove();
    }

    displayAt(htmlElement) {
        htmlElement.appendChild(this.scene);
    }

    createBox() {
        let newBox = new Box(this);
        this.boxes.push(newBox);
        return newBox;
    }

    getBox(boxName) {
        let box = this.boxes.find(box => box.getName() === boxName);
        if(box){
            return box;
        }
        else {
            throw new Error(`No such box ${boxName}`);
        }
    }

    replaceBoxWithBox(oldBoxName, newBoxName){
        let oldBox = this.getBox(oldBoxName);
        let newBox = this.getBox(newBoxName);

        oldBox.hide();
        newBox.reveal();
    }
}