//用来解析节点和指令
class Compiler{
    constructor(vm){
        this.vm = vm;
        this.fragment = this.node2Fragment(vm.$el);

        this.compile(this.fragment);

        // 丢到dom树中
        this.vm.$el.appendChild( this.fragment );
    }
     //把挂载点的dom移到文档碎片中
     node2Fragment(el){
        let fragment = document.createDocumentFragment()
        let child =  null
        while(child = el.firstChild){
            fragment.appendChild(child)
        }
        return fragment
    }

    compile(node){
        //获取所有节点
        let nodes = node.childNodes;
        nodes.forEach(item=>{
            let reg = /\{\{(.+?)\}\}/g;//匹配插值符号;
            if(this.isTextType(item)&&reg.test(item.nodeValue)){ //如果是文本节点
                this.compileText(item,this.vm);
            }else if(this.isNodeType(item)){ //如果是元素节点
                this.compileNode(item);
            }

            //再次编译
            this.compile(item);
        })
    }
    compileNode(nodes){
        // console.log("元素编译",nodes);
        //拿到属性集合
        let attes = [...nodes.attributes];
        attes.forEach(atts=>{
            //判断是不是以v-开头的
            let {nodeName,nodeValue} = atts;
            if(this.isAtts(nodeName)){//是vue指令;
                let [,dir] =  nodeName.split("-");
                // console.log(dir)
                if(this.isOn(dir)){//基本指令
                    let eventName =  dir.split(":")[1];
                    // console.log("事件指令",event);
                    CompileUtil.on(eventName,nodes,nodeValue,this.vm);
                }else{//事件指令
                    // console.log("基本指令",dir);
                    CompileUtil[dir](nodes,nodeValue,this.vm);
                }

                //编译完成之后删除指令
                nodes.removeAttribute(nodeName);
            }
        })
        
    }
    //判断是否是vue指令
    isAtts(nodeName){
        return nodeName.startsWith("v-");//是不是以v-开头的
    }
    //判断是否是事件
    isOn(dir){
        return dir.includes("on:");//是不是以v-开头的 
    }
    //编译文本
    compileText(textNode,vm){
        // console.log("文档编译1");
        // textNode.nodeValue ="文档编译"
        let reg = /\{\{(.+?)\}\}/g;
        // 把修改的数据赋值到元素节点的nodeValue上就可以了
        textNode.nodeValue =  textNode.nodeValue.replace(reg,($,exp)=>{
            //$是匹配到的值;
            //$1是第一个子集;
	      //添加监听器(Watcher)监听msg的变化,
	     new Watcher(vm,exp,function(newValue,oldValue){
	     		 // console.log("修改值的时候触发这个函数修改页面的msg",newValue)
			  textNode.nodeValue =  textNode.nodeValue.replace(oldValue,()=>newValue);
	     		 // textNode.nodeValue.replace
			 console.log(newValue,oldValue)
	     });
	     
	      //寻找data数据
            return CompileUtil.getValue(exp,this.vm);

        })
        
    }
    //判断是不是元素节点
    isNodeType(node){
        return node.nodeType === 1;
    }
    //判断是不是文档节点
    isTextType(node){
        return node.nodeType === 3;
    }
}

//获取相同的指令设置对应的内容;
CompileUtil = {
    html(node,nodeValue,vm){
        // console.log("html",node,data);
        node.innerHTML = this.getValue(nodeValue,vm);
	 
	 //添加监听器(Watcher)监听msg的变化,
	 new Watcher(vm,nodeValue,function(newValue){
	 		 // console.log("修改值的时候触发这个函数修改页面的msg",newValue)
	 		 node.innerHTML = newValue;
	 });
    },
    text(node,nodeValue,vm){
        // console.log("text",node,data);
        node.innerText = this.getValue(nodeValue,vm);
	 
	 //添加监听器(Watcher)监听msg的变化,
	 new Watcher(vm,nodeValue,function(newValue){
		 // console.log("修改值的时候触发这个函数修改页面的msg",newValue)
		 node.innerText = newValue;
	 });
    },
    model(node,nodeValue,vm){
        // 初始化数据
        node.value = this.getValue(nodeValue,vm);
	 
	 //添加监听器(Watcher)监听msg的变化,
	 new Watcher(vm,nodeValue,function(newValue){
	 		 // console.log("修改值的时候触发这个函数修改页面的msg",newValue)
	 		node.value = newValue;
	 });
	 
	 //绑定input事件
	 node.addEventListener("input",function(e){
		 vm[nodeValue] = e.target.value;
	 })
    },
    class(node,nodeValue,vm){
        let data = this.getValue(nodeValue,vm);
        // console.log("class",node,data);
        if(!node.classList.contains(data)){//有没有这个类名
            node.classList.add(data)
        }
	 
	 //添加监听器(Watcher)监听msg的变化,
	 new Watcher(vm,nodeValue,function(newValue){
	 		if(!node.classList.contains(newValue)){//有没有这个类名
	 		    node.classList.add(newValue)
	 		}
	 });
    },
    on(eventName,node,nodeValue,vm){
        // //找到事件对象
        let event  = this.getEvent(nodeValue,vm);
        node.addEventListener(eventName,event.bind(vm));
    },
    getValue(data,vm){//找属性值;
        return data.split(".").reduce((data,key)=>data[key],vm.$data);
    },
    getEvent(eventName,vm){//找函数
        return vm.$options.methods[eventName];
    }
}