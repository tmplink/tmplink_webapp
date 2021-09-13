class tools_file_manager {

    items_name = 'items_box'
    parent_op = null
    pre_op_list = null
    move_place = 'workspace'

    init(parent_op) {
        this.parent_op = parent_op;
    }

    checkbox_onclick_by_list(node) {
        let n = node.getAttribute('data-check');
        if (n !== 'true') {
            this.checkbox_select_on(node);
        } else {
            this.checkbox_select_off(node);
        }
    }

    checkbox_onclick(node) {
        let n = node.getAttribute('data-check');
        if (n !== 'true') {
            this.checkbox_select_on(node);
        } else {
            this.checkbox_select_off(node);
        }
    }

    checkbox_select_on(node) {
        let inode = node.getAttribute('tldata');
        $('.file_unit_' + inode).css('border-radius', '3px');
        $('.file_unit_' + inode).css('border-width', '1px');
        $('.file_unit_' + inode).css('border-color', '#45aaf2');
        $('.file_unit_' + inode).css('border-style', 'double');
        node.setAttribute('data-check', 'true');
    }

    checkbox_select_off(node) {
        let inode = node.getAttribute('tldata');
        $('.file_unit_' + inode).css('border-color', '');
        $('.file_unit_' + inode).css('border-style', '');
        $('.file_unit_' + inode).css('border-radius', '');
        $('.file_unit_' + inode).css('border-width', '');
        node.setAttribute('data-check', 'false');
    }

    checkbox_select_all() {
        var node = document.getElementsByName(this.items_name);
        for (let i = 0; i < node.length; i++) {
            this.checkbox_select_on(node[i]);
        }
    }

    checkbox_select_none() {
        var node = document.getElementsByName(this.items_name);
        for (let i = 0; i < node.length; i++) {
            this.checkbox_select_off(node[i]);
        }
    }

    file_on_check() {
        var node = document.getElementsByName(this.items_name);
        for (let i = 0; i < node.length; i++) {
            if (inode.checked == true) {
                //do something
                return;
            }
        }
        //do something
    }

    checkbox_share() {
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
        this.checkbox_share_to_clicpboard(ukeys);
    }

    checkbox_share_to_clicpboard(data) {
        let ctext = '';
        for (let x in data) {
            ctext = ctext + '[' + data[x].title + '] https://tmp.link/f/' + data[x].ukey + "\r";
        }
        this.parent_op.copyToClip(ctext);
    }

    checkbox_delete() {
        var node = document.getElementsByName(this.items_name);
        for (let i = 0; i < node.length; i++) {
            var inode = node[i];
            let check = inode.getAttribute('data-check');
            if (check === 'true') {
                //do something
                let ukey = inode.getAttribute('tldata');
                this.parent_op.workspace_del(ukey);
            }
        }
    }

    checkbox_download() {
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

    checkbox_move_to_model(type) {
        var node = document.getElementsByName(this.items_name);
        this.move_place = type;
        for (let i = 0; i < node.length; i++) {
            var inode = node[i];
            let check = inode.getAttribute('data-check');
            if (check === 'true') {
                this.parent_op.dir_tree_display(0);
                $('#movefileModal').modal('show');
                return true;
            }
        }

        alert(this.parent_op.languageData.status_error_12);
        return false;
    }

    checkbox_move_to_dir() {
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
        this.parent_op.move_to_dir(ukeys,this.move_place);
    }

}