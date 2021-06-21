var $openapi = 'https://tmp.link/openapi/v1';
var $upload_model = null;

$(document).ready(function(){
    $("[i18n]").i18n();
    uploadModelInit();
    uploadModelSelect();

    if (typeof (Worker) !== "undefined") {
        // 浏览器支持HTML5
        $(function () {
            //阻止浏览器默认行。
            $(document).on({
                dragleave: function (e) {
                    e.preventDefault();
                },
                drop: function (e) {
                    e.preventDefault();
                },
                dragenter: function (e) {
                    e.preventDefault();
                },
                dragover: function (e) {
                    e.preventDefault();
                }
            });
            $(function () {
                var box = document.body;
                box.addEventListener("drop", uploadFileByDrop, false);
            });
        });
    }
});

function prepare(file, callback) {
    //不支持FileReader，直接下一步。
    if (!window.FileReader) {
        callback(file, 0);
        return;
    }
    //支持FileReader，计算sha1再进行下一步
    var reader = new FileReader();
    reader.onload = function (event) {
        var file_sha1 = sha1(event.target.result);
        callback(file, file_sha1);
    };
    reader.readAsArrayBuffer(file.slice(0,(1024*1024*32)));
}

function uploadCore(file) {
    if (file.size > (5 * 1024 * 1024 * 1024)) {
        alert('目前只能上传小于5GB的文件。');
        return false;
    }
    $('#upload_btn').addClass('disabled');
    $('#uploadmodelbtn').fadeOut();
    $('#fileToUpload').attr('disabled', 'true');
    $('#uploaderbtn').html('<i class="fa fa-circle-o-notch fa-spin fa-fw"></i> Preparing：' + file.name);
    prepare(file, function (f, sha1) {
        //如果sha1不等于0，则调用另外的接口直接发送文件名信息。
        if (sha1 !== 0) {
            $.post($openapi, {'sha1': sha1, 'filename': file.name, 'model': uploadModelGet(), 'action': 'prepare'}, function (rsp) {
                if (rsp.status === 0) {
                    uploadFinal(rsp);
                } else {
                    $('.progress').fadeIn();
                    FileSelected(f);
                    FileUploadWorker(f);
                }
            }, 'json');
        } else {
            $('.progress').fadeIn();
            FileSelected(f);
            FileUploadWorker(f);
        }
    });
}

function uploadFileBybtn() {
    var file = document.getElementById('fileToUpload').files[0];
    uploadCore(file);
}

function FileUploadWorker(file) {
    var fd = new FormData();
    fd.append("file", file);
    fd.append("action", 'upload');
    fd.append("model", uploadModelGet());
    var xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", uploadProgress, false);
    xhr.addEventListener("load", uploadComplete, false);
    xhr.addEventListener("error", uploadFailed, false);
    xhr.addEventListener("abort", uploadCanceled, false);
    xhr.open("POST", $openapi);
    xhr.send(fd);
}

function FileSelected(file) {
    if (file) {
        var fileSize = 0;
        if (file.size > 1024 * 1024) {
            fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
        } else {
            fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';
        }
        $('#uploaderbtn').html('<i class="fa fa-circle-o-notch fa-spin fa-fw"></i> Uploading：' + file.name + '(' + fileSize + ')');
    }
}

function uploadFileByDrop(e) {
    e.preventDefault();
    var fileList = e.dataTransfer.files;
    if (fileList.length == 0 || fileList.length > 1) {
        alert('目前只能支持拖拽一个文件进行上传。');
        return false;
    }
    uploadCore(fileList[0]);
}

function uploadProgress(evt) {
    if (evt.lengthComputable) {
        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
        $('.progress-bar').css('width', percentComplete + '%');
    }
}

function uploadComplete(evt) {
    var data = JSON.parse(evt.target.responseText);
    uploadFinal(data);
}

function uploadFailed(evt) {
    alert("上传文件发生了错误，请重新上传。");
}

function uploadCanceled(evt) {
    alert("上传被用户取消或者浏览器断开连接。");
}

function uploadFinal(rsp) {
    $('.progress').fadeOut();
    if (rsp.status === 0) {
        window.location.href = '/f/' + rsp.data.ukey;
    } else {
        alert("上传文件发生了错误，请重新上传。");
        window.location.reload();
    }
}


function uploadModelInit() {
    $upload_model = uploadModelGet();
    if ($upload_model !== 0 && $upload_model !== 1) {
        $upload_model = 1;
        localStorage.setItem('upload_model', 1);
    }
}
function uploadModelSelect() {
    if ($upload_model === 0) {
        $("input[type='radio'][name='Radios'][value='0']").attr("checked", "checked");
    } else {
        $("input[type='radio'][name='Radios'][value='1']").attr("checked", "checked");
    }
}
function uploadModelSave() {
    localStorage.setItem('upload_model', $('input[type="radio"][name="Radios"]:checked').val());
    $('#uploadmodelModal').modal('hide');
}
function uploadModelGet() {
    return localStorage.getItem('upload_model');
}