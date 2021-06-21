$(document).ready(function(){
    $.get('/v1/model.html',function(html){
        $('body').append(html);
    },'html');
});
function alertModel(title,body){
    
}