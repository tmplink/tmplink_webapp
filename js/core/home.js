/**
 * ワークスペース、ルーム、ダイレクトモジュールの内容を扱うプログラムです。
 * @author CC2655
 * @version 1.0
 * @date 2022/12/17
 */

class home {

    current = null

    active(title) {
        $('.navbar-collapse').collapse('hide');
        // if(this.current!==title){
        //     $('#nav_'+this.current).removeClass('active');
        //     $('#nav_'+title).addClass('active');
        //     this.current=title;
        // }

        //ページスクロール時の自動読み込みをオフにする
        TL.dir_list_autoload_disabled();

        app.linkRebind();
    }

    workspace() {
        $('#home_view').html(app.getFile('/tpl/listview/workspace.html'));
        this.active('workspace');
        INIT_workspace();
        TL.navbar.model_workspace();
    }

    room() {
        $('#home_view').html(app.getFile('/tpl/listview/room.html'));
        this.active('room');
        INIT_room();
        TL.navbar.model_desktop();
    }

    direct() {
        $('#home_view').html(app.getFile('/tpl/listview/direct.html'));
        this.active('direct');
        INIT_direct();
        TL.navbar.model_direct();
    }
}