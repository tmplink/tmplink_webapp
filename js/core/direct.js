class direct {
    
    parent_op = null
    domain = null
    total_transfer = 0
    total_downlaods = 0
    quota = 0

    init(parent_op) {
        this.parent_op = parent_op;
    }

    /**
     * 初始化模块信息
     */
    prepare() {
        if (this.parent_op.logined == 0) {
            return false;
        }
        $.post(this.parent_op.api_direct, {
            'action': 'details',
            'token': this.parent_op.api_token
        }, (rsp) => {
            this.domain = rsp.data.domain;
            this.quota = rsp.data.quota;
            this.total_downlaods = rsp.data.total_downlaods;
            this.total_transfer = rsp.data.total_transfer;
        }, 'json');
    }

    /**
     * 设置域名
     */
    setDomain() {
        let domain = $('#direct_domain').val();
        $.post(this.parent_op.api_file, {
            'action': 'direct_set_domain',
            'domain': domain,
            'token': this.parent_op.api_token
        }, (rsp) => {
            if (rsp.status == 1) {
                alert('ok');
            } else {
                alert('fail');
            }
        }), 'json';
    }
}
