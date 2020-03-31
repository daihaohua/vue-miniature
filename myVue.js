class MyVue {
    constructor(options){
        //挂载对象
        this.$options = options;

        //挂载data对象
        let data = this.$data = options.data;

        //挂载节点(可以穿id和class也可以直接传节点)
        this.$el = this.isNodes(options.el);

        //数据代理
        this.proxyData(data);
        // console.log(this);

        //数据劫持
        new Observe(this);

        //编译文本
        new Compiler( this);
    }
    //属性代理
    proxyData(data){
        // console.log(data);
        for(let key in data){
            // console.log(key);
            Object.defineProperty(this,key,{
                get(){ 
                    return this.$data[key];
                },
                set(newValue){
                    if(newValue !== data[key]){
                        this.$data[key] =  newValue;
                    }
                   
                }
            })

        }
    }

    //转化为元素节点
    isNodes(el){
        return el.nodeType === 1 ? el:document.querySelector(el);
    }
}