class BadHearingExample{
    static NO_SUCH_EXAMPLE = 345;

    constructor(localizedConfig, exampleIndex){
        this.localizedConfig = localizedConfig;
        this.exampleIndex = exampleIndex;
        this.object = this.localizedConfig[this.exampleIndex];
        if(!this.object){
            let error = new Error("Invalid object");
            error.customId = BadHearingExample.NO_SUCH_EXAMPLE;
            throw error;
        }
    }

    getFirst(){
        return new BadHearingExample(this.localizedConfig, 0);
    }

    getLast(){
        return new BadHearingExample(this.localizedConfig, this.localizedConfig.length - 1);
    }

    getPrevious(){
        try{
            return new BadHearingExample(this.localizedConfig, this.exampleIndex - 1);
        } catch(e){
            if(e.customId && e.customId === BadHearingExample.NO_SUCH_EXAMPLE){
                return this.getLast();
            }
            else {
                throw e;
            }
        }
    }

    getNext(){
        try {
            return new BadHearingExample(this.localizedConfig, this.exampleIndex + 1);
        } catch(e){
            if(e.customId && e.customId === BadHearingExample.NO_SUCH_EXAMPLE){
                return this.getFirst();
            }
            else {
                throw e;
            }
        }
    }

    getExampleIndex(){
        return this.exampleIndex;
    }

    getLink(){
        return this.localizedConfig[this.exampleIndex].url;
    }
}