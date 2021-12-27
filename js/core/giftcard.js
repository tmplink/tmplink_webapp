class giftcard{
    parent = null

    init(parent) {
        this.parent = parent;
    }

    active(){
        let code = prompt('请输入兑换代码');
        if(code){
            $.post(this.parent.api_pay, {
                action: 'giftcard_active',
                token: this.parent.api_token,
                code: code
            }, (rsp) => {
                if (rsp.status == 1) {
                    alert('兑换成功');
                } else {
                    alert('兑换失败');
                }
            }, 'json');
        }
    }
}