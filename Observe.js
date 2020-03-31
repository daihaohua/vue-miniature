class Observe{
    constructor(vm){
        this.vm = vm;
	 let data = vm.$data;
	  
	  //数据劫持
	  this.observe(data);
    }
    
    observe(data){
	    //判断传过来的是不是对象
	    if(typeof data === "object"){
		Object.keys(data).forEach(item=>{
			// 给每个属性设置get和set属性
			this.definReactive(data,item,data[item]);
		})
	    }
    }
    //给data数据绑定get和set
    definReactive(data,key,value){
	//如果属性也是一个对象再次设置get和set;
	this.observe(value);
	const dep = new Dep()//每一个data中的属性多有一个订阅,每个订阅器上多有若干个watch方法;
	Object.defineProperty(data,key,{
		get(){
			if(Dep.target){//只有添加了watch才有用的，其他地方进来的多没有用的；
				dep.addSub(Dep.target)
				console.log(dep);
			}
			return value
		},
		set:newValue=>{
			if(newValue !== value){
				//如果设置的属性是一个对象的话,我们也要给他设置get和set;
				this.observe(newValue);
				value = newValue;
				dep.execute();//通知订阅者执行函数,把所有dep收集到的所有函数执行;
			}
		}
	})
    }
}