class Watcher{   //观察者
	constructor(vm,nodeValue,cd) {
	    this.vm = vm;
	    this.exp = nodeValue;
	    this.cd = cd;
	    this.value = this.getValue(this.exp,this.vm);//获取旧值;
	}
	getValue(exp,vm){
		Dep.target = this;//把观察期对象放到Dep中保存
		let value = CompileUtil.getValue(exp,vm);
		Dep.target = null;//一定清除否侧会多生成;
		return value
	}
	
	update(){
		//获取最新的值
		let newValue = CompileUtil.getValue(this.exp,this.vm);
		if(newValue !==  this.value){//两次值不一样就修改
			this.cd(newValue,this.value);
			this.value = newValue //保存最新的值;
		}
	}
}


//订阅者
class Dep{
	constructor() {
	    this.subs=[];//存放所有观察值函数
	}
	addSub(watch){//添加观察者
		this.subs.push(watch);
	}
	//当修改data数据的时候就会执行set函数,执行每个watcher上的update函数
	execute(){
		 this.subs.forEach(w=>w.update());
	}
}