class BoxSelecter {

    items_name = 'items_box'
    parent_op = null
    pre_op_list = null
    move_place = 'workspace'
    dir_tree_init = false
    site_domain = null

    init(parent_op) {
        this.parent_op = parent_op;
        this.site_domain = this.parent_op.site_domain;
    }

    mobileHeadShow() {
        if (isMobileScreen()) {
            //如果有被选中的项目，则显示
            if ($(`[data-check="true"]`).length > 0) {
                $('.mobile-head-selector').show();
            } else {
                $('.mobile-head-selector').hide();
            }
        }
    }

    onclickByList(node) {
        let n = node.getAttribute('data-check');
        if (n !== 'true') {
            this.setOn(node);
        } else {
            this.selectOff(node);
        }
        this.mobileHeadShow();
    }

    boxOnclick(node) {
        let n = node.getAttribute('data-check');
        if (n !== 'true') {
            this.setOn(node);
        } else {
            this.selectOff(node);
        }
    }

    setOn(node) {
        //获取是否处于深色模式
        let dark_mode = this.parent_op.matchNightModel();
        //如果是深色模式，使用不同的配色
        let color = '';
        if (dark_mode) {
            color = '#6d6c6c';
        } else {
            color = 'rgb(220, 236, 245)';
        }

        let inode = node.getAttribute('tldata');
        let itype = node.getAttribute('tltype');
        if (itype === 'photo_card') {
            $(`.file_unit_${inode} .card`).css('background-color', color);
        } else {
            // $(`.file_unit_${inode}`).css('border-radius', '5px');
            $(`.file_unit_${inode}`).css('border-width', '1px');
            $(`.file_unit_${inode}`).css('background-color', color);
        }
        node.setAttribute('data-check', 'true');
    }

    selectOff(node) {
        let inode = node.getAttribute('tldata');
        let itype = node.getAttribute('tltype');
        if (itype === 'photo_card') {
            $(`.file_unit_${inode} .card`).css('background-color', '');
        } else {
            $(`.file_unit_${inode}`).css('border-radius', '');
            $(`.file_unit_${inode}`).css('border-width', '');
            $(`.file_unit_${inode}`).css('background-color', '');
        }
        node.setAttribute('data-check', 'false');
    }

    setAll() {
        var node = document.getElementsByName(this.items_name);
        for (let i = 0; i < node.length; i++) {
            this.setOn(node[i]);
        }
    }

    setNone() {
        var node = document.getElementsByName(this.items_name);
        for (let i = 0; i < node.length; i++) {
            this.selectOff(node[i]);
        }
    }

    fileOnCheck() {
        var node = document.getElementsByName(this.items_name);
        for (let i = 0; i < node.length; i++) {
            if (inode.checked == true) {
                //do something
                return;
            }
        }
        //do something
    }

    share() {
        var node = document.getElementsByName(this.items_name);
        let ukeys = [];
        for (let i = 0; i < node.length; i++) {
            var inode = node[i];
            let check = inode.getAttribute('data-check');
            if (check === 'true') {
                //do something
                ukeys.push({
                    'ukey': inode.getAttribute('tldata'),
                    'title': inode.getAttribute('tltitle')
                });
            }
        }
        this.toClicpboard(ukeys);
    }

    toClicpboard(data) {
        let ctext = '';
        for (let x in data) {
            ctext = ctext + '[' + data[x].title + '] https://' + this.site_domain + '/f/' + data[x].ukey + "\r";
        }
        this.parent_op.copyToClip(ctext);
    }

    delete() {
        if (this.parent_op.profile_confirm_delete_get()) {
            if (!confirm(app.languageData.confirm_delete)) {
                return false;
            }
        }
        let ukey = [];
        var node = document.getElementsByName(this.items_name);
        if (node.length > 0) {
            for (let i = 0; i < node.length; i++) {
                var inode = node[i];
                let check = inode.getAttribute('data-check');
                if (check === 'true') {
                    //do something
                    ukey.push(inode.getAttribute('tldata'));
                }
            }
            this.parent_op.workspace_del(ukey, true);
        }
    }

    download() {
        var node = document.getElementsByName(this.items_name);
        for (let i = 0; i < node.length; i++) {
            var inode = node[i];
            let check = inode.getAttribute('data-check');
            if (check === 'true') {
                //do something
                let ukey = inode.getAttribute('tldata');
                this.parent_op.download_file_btn(ukey);
            }
        }
    }

    downloadURL() {
        //未登录无法使用此功能
        if (!this.parent_op.isLogin()) {
            this.parent_op.alert(app.languageData.status_need_login);
            return false;
        }
        var node = document.getElementsByName(this.items_name);
        let check_count = 0;
        for (let i = 0; i < node.length; i++) {
            let inode = node[i];
            let check = inode.getAttribute('data-check');
            if (check === 'true') {
                //do something
                check_count++;
                let ukey = inode.getAttribute('tldata');
                this.parent_op.download_file_url(ukey, (downloadURL) => {
                    $('#copy-modal-body').html($('#copy-modal-body').html() + `${downloadURL}\n`);
                });
            }
        }
        if (check_count === 0) {
            this.parent_op.alert(app.languageData.status_error_12);
            return false;
        }
        // //打开复制窗口
        // let base64_text = window.btoa($('#copy-modal-body').html());
        // $('#copy-modal-body').attr('base64',base64_text);
        $('#copyModal').modal('show');
    }

    moveToModel(type) {
        var node = document.getElementsByName(this.items_name);
        this.move_place = type;
        for (let i = 0; i < node.length; i++) {
            var inode = node[i];
            let check = inode.getAttribute('data-check');
            if (this.dir_tree_init === false) {
                this.parent_op.dir_tree_display(0);
                this.dir_tree_init = true;
            }
            if (check === 'true') {
                $('#movefileModal').modal('show');
                return true;
            }
        }

        alert(app.languageData.status_error_12);
        return false;
    }

    moveToDir() {
        var node = document.getElementsByName(this.items_name);
        let ukeys = [];
        for (let i = 0; i < node.length; i++) {
            var inode = node[i];
            let check = inode.getAttribute('data-check');
            if (check === 'true') {
                //do something
                ukeys.push(inode.getAttribute('tldata'));

            }
        }
        this.parent_op.move_to_dir(ukeys, this.move_place);
    }

    directCopy(type) {
        var node = document.getElementsByName(this.items_name);
        let copyText = '';
        for (let i = 0; i < node.length; i++) {
            var inode = node[i];
            let check = inode.getAttribute('data-check');
            if (check === 'true') {
                //do something
                let dkey = inode.getAttribute('tldata');
                let fname = inode.getAttribute('tltitle');
                let did = inode.getAttribute('tldid');
                let dir_key = this.parent_op.direct.dir_key;
                let direct_link_domain = this.parent_op.direct.domain;
                let direct_link_protocol = this.parent_op.direct.protocol;
                //get file url
                let urldata = this.parent_op.direct.genLinkDirect(dkey, fname);
                //create copy text
                switch (type) {
                    case 'staticDirLink':
                        copyText += `${direct_link_protocol}${direct_link_domain}/dir/${dir_key}/${did}/${fname}\n`;
                        break;
                    case 'downloadURLForText':
                        copyText += `${fname}\n${urldata.download}\n`;
                        break;
                    case 'downloadURLForHTML':
                        copyText += `<a href="${urldata.download}" target="_blank">${fname}</a>\n`;
                        break;
                    case 'streamURLForText':
                        if (this.parent_op.direct.is_allow_play(fname)) {
                            copyText += `${fname}\n${urldata.play}\n`;
                        }
                        break;
                    case 'streamURLForHTML':
                        if (this.parent_op.direct.is_allow_play(fname)) {
                            copyText += `<a href="${urldata.play}" target="_blank">${fname}</a>\n`;
                        }
                        break;
                    case 'resURLForText':
                        copyText += `${urldata.download}\n`;
                        break;
                    case 'resURLForHTML':
                        copyText += `<a href="${urldata.download}" target="_blank">${fname}</a>\n`;
                        break;
                }
            }
        }

        //打开复制窗口
        if (copyText !== '') {
            $('#copy-modal-body').html(copyText);
            $('#copyModal').modal('show');
        }
    }

    copyModelCP() {
        let copyText = $('#copy-modal-body').text();
        var aux = document.createElement("textarea");
        aux.value = copyText;
        document.body.appendChild(aux);
        aux.select();
        document.execCommand("copy");
        document.body.removeChild(aux);

        let tmp = $('#copy-modal-btn').html();
        $('#copy-modal-btn').html(app.languageData.copied);
        setTimeout(() => {
            $('#copy-modal-btn').html(tmp);
        }
            , 2000);
    }

    directAddlinks() {
        var node = document.getElementsByName(this.items_name);
        let ukeys = [];
        for (let i = 0; i < node.length; i++) {
            var inode = node[i];
            let check = inode.getAttribute('data-check');
            if (check === 'true') {
                //do something
                let ukey = inode.getAttribute('tldata');
                ukeys.push(ukey);
            }
        }

        //打开复制窗口
        if (ukeys.length > 0) {
            this.parent_op.direct.addLinks(ukeys);
        }
    }

    directDelete() {
        var node = document.getElementsByName(this.items_name);
        let ukeys = [];
        for (let i = 0; i < node.length; i++) {
            var inode = node[i];
            let check = inode.getAttribute('data-check');
            if (check === 'true') {
                //do something
                let ukey = inode.getAttribute('tldata');
                ukeys.push(ukey);
            }
        }

        //打开复制窗口
        if (ukeys.length > 0) {
            this.parent_op.direct.delLinks(ukeys);
        }
    }
}