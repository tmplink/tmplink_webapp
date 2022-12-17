/**
 * このファイルは、ページが読み込まれたときに、対象のビュー情報を取得し、対応するページを読み込む役割を担っています。
 * @author CC2655
 * @version 1.0
 * @date 2022/12/17
 */
var homeView = new home();
app.ready(() => {
    let params = app.getUrlVars(window.location.href);
    switch (params.listview) {
        case 'workspace':
            homeView.workspace();
            break;
        case 'room':
            homeView.room();
            break;
        case 'direct':
            homeView.direct();
            break;
        default:
            homeView.workspace();
    }
});