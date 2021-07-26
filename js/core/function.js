//倒计时函数，将剩余的时间格式化成时分秒并写入到指定的 html 中
function countDown(id, time) {
    let now = time-1;
    let left_time = now;

    let d = '';
    let h = '';
    let m = '';
    let s = '';

    if(now==0){
        return false;
    }
    
    if(now>86400){
        d = Math.floor(now / 86400);
        d = d + ':';
        left_time = left_time % 86400;
    }

    if(left_time>3600){
        h = Math.floor(left_time / 3600);
        h = h < 10 ? "0" + h : h;
        h = h === "0" ? "00" : h;
        h = h + ':';
        left_time = left_time % 3600;
    }

    if(left_time>60){
        m = Math.floor(left_time / 60);
        m = m < 10 ? "0" + m : m;
        m = m === "0" ? "00" : m;
        m = m + ':';
        left_time = left_time % 60;
    }

    if(left_time>0){
        s = left_time; 
        s = s < 10 ? "0" + s : s;
        s = s === "0" ? "00" : s;
    }
    if(left_time===0&&m!==''){
        s = "00";
    }

    let dom =  document.getElementById(id);
    if(dom===null){
        return false;
    }else{
        dom.innerHTML = d + h + m + s;
    }

    if (now > 0) {
        setTimeout(()=>{
            countDown(id, now);
        }, 1000);
    }
}