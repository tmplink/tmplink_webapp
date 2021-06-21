class tools_file_manager {

    items_name = 'items_box'
    parent_op = null
    pre_op_list = null
    move_place = 'workspace'

    init(parent_op) {
        this.parent_op = parent_op;
    }

    checkbox_onclick_by_list(node) {
        let n = node.childNodes[1].childNodes[1];
        if (n.checked !== true) {
            this.checkbox_select_on(n);
        } else {
            this.checkbox_select_off(n);
        }
    }

    checkbox_onclick(node) {
        if (node.checked !== true) {
            this.checkbox_select_on(node);
        } else {
            this.checkbox_select_off(node);
        }
    }

    checkbox_select_on(node) {
        let inode = node.parentNode.parentNode.attributes.id.nodeValue;
        $('#' + inode).css('background-color', '#3a3b3c36');
        node.checked = true;
    }

    checkbox_select_off(node) {
        let inode = node.parentNode.parentNode.attributes.id.nodeValue;
        $('#' + inode).css('background-color', '');
        node.checked = false;
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
            if (inode.checked == true) {
                //do something
                ukeys.push({
                    'ukey': inode.parentNode.parentNode.attributes.tldata.nodeValue,
                    'title': inode.parentNode.parentNode.attributes.tltitle.nodeValue
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
            if (inode.checked == true) {
                //do something
                let ukey = inode.parentNode.parentNode.attributes.tldata.nodeValue;
                this.parent_op.workspace_del(ukey);
            }
        }
    }

    checkbox_download() {
        var node = document.getElementsByName(this.items_name);
        for (let i = 0; i < node.length; i++) {
            var inode = node[i];
            if (inode.checked == true) {
                //do something
                let ukey = inode.parentNode.parentNode.attributes.tldata.nodeValue;
                this.parent_op.download_file_btn(ukey);
            }
        }
    }

    checkbox_move_to_model(type) {
        var node = document.getElementsByName(this.items_name);
        this.move_place = type;
        for (let i = 0; i < node.length; i++) {
            var inode = node[i];
            if (inode.checked == true) {
                this.parent_op.dir_tree_display(0);
                $('#movefileModal').modal('show');
                return true;
            }
        }

        alert(this.parent_op.language_data.status_error_12);
        return false;
    }

    checkbox_move_to_dir() {
        var node = document.getElementsByName(this.items_name);
        let ukeys = [];
        for (let i = 0; i < node.length; i++) {
            var inode = node[i];
            if (inode.checked == true) {
                //do something
                ukeys.push(inode.parentNode.parentNode.attributes.tldata.nodeValue);

            }
        }
        this.parent_op.move_to_dir(ukeys,this.move_place);
    }

}