class Scene {
    constructor(page) {
        this.page = page;
        this.scene = document.createElement("div");
        this.scene.classList.add("scene");
        this.boxes = [];
        this.storage = new VariableStorage();

        this.sceneClosingListeners = [];
    }

    getPage() {
        return this.page;
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
        this.page.showScene(this);
    }

    close() {
        this.scene.remove();

        for (let sceneClosingListener of this.sceneClosingListeners) {
            sceneClosingListener.onSceneClosed();
        }
    }

    displayAt(htmlElement) {
        htmlElement.appendChild(this.scene);
    }

    createBox(display = true) {
        let newBox = new Box(this);
        newBox.displayAt(this.scene);
        if (!display) {
            newBox.hide();
        }
        this.boxes.push(newBox);
        return newBox;
    }

    onBoxRemoved(box) {
        let index = this.boxes.indexOf(box);
        this.boxes.splice(index, 1);
    }

    getBox(boxName) {
        let box = this.boxes.find(box => box.getName() === boxName);
        if (box) {
            return box;
        }
        else {
            throw new Error(`No such box ${boxName}`);
        }
    }

    replaceBoxWithBox(oldBoxName, newBoxName) {
        let oldBox = this.getBox(oldBoxName);
        let newBox = this.getBox(newBoxName);

        oldBox.hide();
        newBox.reveal();
    }

    subscribeToSceneClosing(obj) {
        this.sceneClosingListeners.push(obj);
    }
}