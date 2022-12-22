//从 URL 获取 mrid ，然后重定向
let searchParams = new URLSearchParams(window.location.search);
let mrid = searchParams.get('mrid');
window.location.href = `/?tmpui_page=/&listview=room&mrid=${mrid}`;