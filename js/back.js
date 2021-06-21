"use strict";

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var tmplink =
/*#__PURE__*/
function () {
  function tmplink() {
    var _this = this;

    _classCallCheck(this, tmplink);

    _defineProperty(this, "api_url", 'https://connect.tmp.link/api_v2');

    _defineProperty(this, "api_file", this.api_url + '/file');

    _defineProperty(this, "api_user", this.api_url + '/user');

    _defineProperty(this, "api_mr", this.api_url + '/meetingroom');

    _defineProperty(this, "api_token", null);

    _defineProperty(this, "upload_queue_id", 0);

    _defineProperty(this, "upload_queue_file", []);

    _defineProperty(this, "upload_processing", 0);

    _defineProperty(this, "logined", 0);

    _defineProperty(this, "uid", 0);

    _defineProperty(this, "email", null);

    _defineProperty(this, "api_language", null);

    _defineProperty(this, "mr_data", []);

    _defineProperty(this, "room_data", []);

    _defineProperty(this, "recaptcha", '6LfqxcsUAAAAABAABxf4sIs8CnHLWZO4XDvRJyN5');

    var token = $.cookie('app_token');
    var login = $.cookie('app_login');

    if (token === undefined) {
      $.post(this.api_user, {
        'action': 'token'
      }, function (rsp) {
        _this.api_token = rsp.data;
        $.cookie('app_token', rsp.data);
      });
      $('.workspace-navbar').hide();
    } else {
      this.api_token = token;

      if (login != undefined && login != 0) {
        this.logined = 1;
      }
    }
  }

  _createClass(tmplink, [{
    key: "recaptcha_do",
    value: function recaptcha_do(type, cb) {
      var _this2 = this;

      if ((typeof grecaptcha === "undefined" ? "undefined" : _typeof(grecaptcha)) === 'object' && this.api_token !== null) {
        grecaptcha.ready(function () {
          grecaptcha.execute(_this2.recaptcha, {
            action: type
          }).then(function (token) {
            cb(token);
          });
        });
      } else {
        setTimeout(function () {
          _this2.recaptcha_do(type, cb);
        }, 500);
      }
    }
  }, {
    key: "head_set",
    value: function head_set() {
      var login = $.cookie('app_login');

      if (login != undefined && login != 0) {
        this.logined = 1;
        $('.workspace-navbar').show();
        $('.workspace-nologin').hide();
      } else {
        $('.workspace-navbar').hide();
        $('.workspace-nologin').show();
      }
    }
  }, {
    key: "get_details",
    value: function get_details(cb) {
      $.post(this.api_user, {
        action: 'get_detail',
        token: this.api_token
      }, function (rsp) {
        if (rsp.status === 1) {
          $.cookie('app_login', 1);
          $.cookie('app_lang', rsp.data.lang);
          $('[i18n]').i18n({
            lang: rsp.data.lang
          });
        } else {
          $.cookie('app_login', 0);
        }

        cb();
      });
    }
  }, {
    key: "password_reset_confim",
    value: function password_reset_confim() {
      var password = $('#modal_password_reset').val();
      var rpassword = $('#modal_password_reset_re').val();
      $("#notice_resetpassword").html(language.model_resetpassword_msg_processing);
      $("#modal_password_reset_btn").attr('disabled', true);
      $.post(this.api_user, {
        action: 'passwordreset',
        password: password,
        rpassword: rpassword,
        token: this.api_token
      }, function (rsp) {
        if (rsp.status === 1) {
          $("#notice_resetpassword").html(language.model_resetpassword_msg_processed);
          $("#modal_password_reset_btn").html(language.model_resetpassword_msg_processed);
        } else {
          $("#notice_resetpassword").html(rsp.data);
          $("#modal_password_reset_btn").removeAttr('disabled');
        }
      });
    }
  }, {
    key: "email_change_confim",
    value: function email_change_confim() {
      var email = $('#email').val();
      var code = $('#checkcode').val();
      $("#notice_emailchange").html(language.model_email_change_msg_processing);
      $("#email_change_confim_btn").attr('disabled', true);
      $.post(this.api_user, {
        action: 'email_change',
        email: email,
        code: code,
        token: this.api_token
      }, function (rsp) {
        if (rsp.status === 1) {
          $("#notice_emailchange").html(language.model_email_change_msg_processed);
          $("#email_change_confim_btn").html(language.model_email_change_msg_processed);
        } else {
          $("#notice_emailchange").html(rsp.data);
          $("#email_change_confim_btn").removeAttr('disabled');
        }
      });
    }
  }, {
    key: "password_found",
    value: function password_found() {
      var email = $('#email').val();

      if (email === '') {
        return false;
      }

      $('#submit').attr('disabled', true);
      $('#msg_notice').fadeIn();
      $('#msg_notice').html(language.form_btn_processing);
      $.post(this.api_user, {
        action: 'passwordfound',
        token: this.api_token,
        email: email
      }, function (rsp) {
        if (rsp.status === 1) {
          $('#msg_notice').fadeOut();
          $('#submit').html(language.form_btn_processed);
        } else {
          $('#submit').removeAttr('disabled');
          $('#msg_notice').html(rsp.data);
        }
      }, 'json');
    }
  }, {
    key: "workspace_navbar",
    value: function workspace_navbar() {
      $('.workspace-navbar').show();
    }
  }, {
    key: "workspace_add",
    value: function workspace_add(ukey) {
      $('#btn_add_to_workspace').addClass('disabled');
      $.post(this.api_file, {
        action: 'add_to_workspace',
        token: this.api_token,
        ukey: ukey
      }, function (rsp) {
        $('#btn_add_to_workspace').html('<i class="fas fa-check-circle" aria-hidden="true"></i>');
      }, 'json');
    }
  }, {
    key: "workspace_del",
    value: function workspace_del(ukey) {
      var _this3 = this;

      $('#btn-rm-file_' + ukey).addClass('disabled');
      $.post(this.api_file, {
        action: 'remove_from_workspace',
        token: this.api_token,
        ukey: ukey
      }, function (rsp) {
        // $('#btn_add_to_workspace').html('<i class="fas fa-check-circle" aria-hidden="true"></i>');
        _this3.workspace_filelist();
      }, 'json');
    }
  }, {
    key: "workspace_filelist",
    value: function workspace_filelist() {
      var _this4 = this;

      if (typeof language === 'undefined') {
        setTimeout(function () {
          _this4.workspace_filelist();
        }, 500);
      }

      if ($.cookie('app_login') != 1) {
        app.open('/login');
        return;
      }

      $('#filelist_model_0').hide();
      $('#filelist_model_1').hide();
      $('#filelist_model_2').hide();
      $('#filelist_model_3').hide();
      $('#filelist_model_0_list').html('');
      $('#filelist_model_1_list').html('');
      $('#filelist_model_2_list').html('');
      $('#filelist_model_3_list').html('');
      $('#filelist_refresh').html('<i class="fas fa-spinner fa-spin"></i>');
      $('#filelist_refresh').attr('disabled', true);
      $.post(this.api_file, {
        action: 'workspace_filelist',
        token: this.api_token
      }, function (rsp) {
        var html = '';
        var filelist = rsp.data;

        for (var x in filelist) {
          html = '';
          html += '<div class="col-6 col-md-3 col-lg-2 p-2 text-center">';
          html += '<i class="' + _this4.fileicon(filelist[x].ftype) + ' fa-4x mx-auto mb-2 fa-fw"></i>';
          html += '<div class="progress progress-sm mb-2 mx-auto"  style="height: 2px;max-width:50%"><div class="progress-bar bg-blue" style="width: ' + filelist[x].hp_percent + '%"></div></div>';
          html += '<div class="text-truncate" alt="' + filelist[x].fname + '">' + filelist[x].fname + '</div>';
          html += '<div>' + filelist[x].fsize_formated + '</div>';
          html += '<div>';
          html += '<a href="/file?ukey=' + filelist[x].ukey + '" tmpui-app="true" class="btn btn-outline-success  btn-sm mr-1 mt-1" target="_blank"><i class="fa-fw fas fa-arrow-alt-to-bottom"></i></a>';
          html += '<a href="javascript:void(0)" id="btn-rm-file_' + filelist[x].ukey + '" class="btn btn-outline-danger btn-sm  mt-1 mr-1" onclick="TL.workspace_del(\'' + filelist[x].ukey + '\')"><i class="fa-fw fad fa-trash"></i></a>';
          html += '<a href="javascript:void(0)" data-clipboard-text="http://tmp.link/f/' + filelist[x].ukey + '" class="btn btn-outline-dark btn-sm mt-1 btn_copy_in_workspace"><i class="fa-fw fad fa-copy"></i></a>';
          html += '</div>';
          html += '</div>';
          $('#filelist_model_' + filelist[x].model + '_list').append(html);
          $('#filelist_model_' + filelist[x].model).fadeIn();
        }

        var clipboard = new Clipboard('.btn_copy_in_workspace');
        clipboard.on('success', function (e) {
          $(e.trigger).html('<i class="fas fa-check-circle fa-fw"></i>');
          setTimeout(function () {
            $(e.trigger).html('<i class="fad fa-copy"></i>');
          }, 5000);
        });
        $('#filelist_refresh').html('<i class="fas fa-sync-alt"></i>');
        $('#filelist_refresh').removeAttr('disabled');
        app.linkRebind();
      });
    }
  }, {
    key: "details_file",
    value: function details_file() {
      var _this5 = this;

      this.recaptcha_do('file', function (recaptcha) {
        var params = _this5.get_url_params();

        if (params.ukey !== undefined) {
          $.post(_this5.api_file, {
            action: 'details',
            ukey: params.ukey,
            captcha: recaptcha,
            token: _this5.api_token
          }, function (rsp) {
            $('#file_loading').fadeOut();

            if (rsp.status === 1) {
              $('#file_info').fadeIn();
              $('#filename').html(rsp.data.name);
              $('#filesize').html(rsp.data.size);
              $('#btn_add_to_workspace').on('click', function () {
                if (_this5.logined == 1) {
                  _this5.workspace_add(params.ukey);
                } else {
                  app.open('/login');
                }
              });
              $('#btn_download').attr('href', 'https://tmplinkapp-connect.vx-cdn.com/connect-' + _this5.api_token + '-' + params.ukey);

              _this5.download_file();

              $('#btn_copy').attr('data-clipboard-text', 'http://tmp.link/f/' + params.ukey);
              $('#qr_code_url').attr('src', _this5.api_url + '/qr?code=' + params.ukey);
              $('#report_ukey').html(params.ukey);

              if (_this5.logined) {
                $('.user-nologin').hide();
                $('.user-login').show();
              } else {
                $('.user-nologin').show();
                $('.user-login').hide();
              }

              var clipboard = new Clipboard('#btn_copy');
              clipboard.on('success', function (e) {
                $(e.trigger).html('<i class="fas fa-check-circle" aria-hidden="true"></i>');
                setTimeout(function () {
                  $(e.trigger).html(language.file_btn_copy);
                }, 5000);
              });
            } else {
              $('#file_unavailable').fadeIn();
            }
          }, 'json');
        } else {
          $('#file_loading').fadeOut();
          $('#file_unavailable').fadeIn();
        }
      });
    }
  }, {
    key: "download_file",
    value: function download_file() {
      var _this6 = this;

      $('#btn_download').addClass('disabled');
      $('#btn_download').html(language.file_btn_download_status0);
      $.post(this.api_file, {
        action: 'download_check',
        token: this.api_token
      }, function (rsp) {
        if (rsp.status == 1) {
          $('#btn_download').removeClass('disabled');
          $('#btn_download').html(language.file_btn_download);
        } else {
          $('#btn_download').html(language.file_btn_download_status1);
          setTimeout(function () {
            _this6.download_file();
          }, 10000);
        }
      }, 'json');
    }
  }, {
    key: "mr_file_addlist",
    value: function mr_file_addlist() {
      var _this7 = this;

      var params = this.get_url_params();
      $('#mrfile_add_list').html('<div class="text-center display-3">' + language.model_title_room_mrfile_loading + '</div>');
      this.recaptcha_do('mr_addlist', function (recaptcha) {
        $.post(_this7.api_mr, {
          action: 'file_addlist',
          token: _this7.api_token,
          captcha: recaptcha,
          mr_id: params.mrid
        }, function (rsp) {
          if (rsp.status == 0) {
            $('#mrfile_add_list').html('<div class="text-center display-3">' + language.model_title_room_mrfile_nofiles + '</div>');
          } else {
            $('#mrfile_add_list').html('<div id="mrfile_add_list_grid" class="row"></div>');
            var html = '';
            var filelist = rsp.data;

            for (var x in filelist) {
              html = '';
              html += '<div class="col-6 col-md-3 p-2 text-center" id="mraddlist-' + filelist[x].ukey + '">';
              html += '<i class="' + _this7.fileicon(filelist[x].ftype) + ' fa-4x mx-auto mb-2 fa-fw"></i>';
              html += '<div class="text-truncate" alt="' + filelist[x].fname + '">' + filelist[x].fname + '</div>';
              html += '<div>';
              html += '<button href="javascript:void(0)" id="btn-mraddlist-' + filelist[x].ukey + '" class="btn btn-azure btn-sm  mt-1 mr-1" onclick="TL.mr_file_add(\'' + filelist[x].ukey + '\')"><i class="fa-fw far fa-plus"></i></button>';
              html += '</div>';
              html += '</div>';
              $('#mrfile_add_list_grid').append(html);
            }
          }
        });
      });
    }
  }, {
    key: "mr_file_add",
    value: function mr_file_add(ukey) {
      var _this8 = this;

      var params = this.get_url_params();
      $('#btn-mraddlist-' + ukey).fadeOut(300);
      this.recaptcha_do('mr_add', function (recaptcha) {
        $.post(_this8.api_mr, {
          action: 'file_add',
          token: _this8.api_token,
          captcha: recaptcha,
          mr_id: params.mrid,
          ukey: ukey
        }, function (rsp) {
          $('#mraddlist-' + ukey).fadeOut(500);
        });
      });
    }
  }, {
    key: "mr_file_list",
    value: function mr_file_list() {
      var _this9 = this;

      $('#meetroom_filelist_data').html('<i class="fa-fw fas fa-spinner fa-spin fa-4x mx-auto"></i>');
      $('#mr_filelist_refresh_icon').html('<i class="fa-fw fas fa-spinner fa-spin"></i>');
      $('#mr_filelist_refresh_icon').attr('disabled', true);
      var params = this.get_url_params();
      this.recaptcha_do('mr_addlist', function (recaptcha) {
        $.post(_this9.api_mr, {
          action: 'file_list',
          token: _this9.api_token,
          captcha: recaptcha,
          mr_id: params.mrid
        }, function (rsp) {
          $('#meetroom_filelist_data').html('<i class="fa-fw fad fa-folder-open fa-4x mx-auto"></i>');
          $('#mr_filelist_refresh_icon').html('<i class="fa-fw fas fa-sync-alt"></i>');
          $('#mr_filelist_refresh_icon').removeAttr('disabled');

          if (rsp.status == 0) {
            $('#meetroom_filelist_data').html('<i class="fa-4x fad fa-folder-open mx-auto"></i>');
          } else {
            $('#meetroom_filelist_data').html('');
            var html = '';
            var filelist = rsp.data;

            for (var x in filelist) {
              html = '';
              html += '<div class="col-6 col-md-4 col-lg-3 p-2 text-center" id="mrfile-' + filelist[x].ukey + '">';
              html += '<i class="' + _this9.fileicon(filelist[x].type) + ' fa-4x mx-auto mb-2 fa-fw mx-auto"></i>';
              html += '<div class="text-truncate" alt="' + filelist[x].name + '">' + filelist[x].name + '</div>';
              html += '<div>' + filelist[x].fsize_formated + '</div>';
              html += '<div>';
              html += '<a href="//tmp.link/f/' + filelist[x].ukey + '" class="btn btn-success btn-sm  mt-1 mr-1"><i class="fa-fw fas fa-arrow-alt-to-bottom"></i></a>';

              if (_this9.room_data.file == 1) {
                html += '<a href="javascript:void(0);" class="btn btn-danger btn-sm mt-1 mr-1" onclick="TL.mr_file_del(\'' + filelist[x].ukey + '\')" id="btn-mrdel-' + filelist[x].ukey + '"><i class="fa-fw fad fa-trash""></i></a>';
              }

              html += '</div>';
              html += '</div>';
              $('#meetroom_filelist_data').append(html);
            }
          }
        });
      });
    }
  }, {
    key: "mr_file_del",
    value: function mr_file_del(ukey) {
      var _this10 = this;

      var params = this.get_url_params();
      $('#mrfile-' + ukey).fadeOut(300);
      this.recaptcha_do('mr_del', function (recaptcha) {
        $.post(_this10.api_mr, {
          action: 'file_del',
          token: _this10.api_token,
          captcha: recaptcha,
          mr_id: params.mrid,
          ukey: ukey
        }, function (rsp) {
          $('#mrfile-' + ukey).fadeOut(500);
        });
      });
    }
  }, {
    key: "mr_user_add",
    value: function mr_user_add() {
      var _this11 = this;

      var params = this.get_url_params();
      var email = $('#modal_add_user').val();

      if (email == '') {
        return false;
      }

      $('#modal_add_user_btn').fadeOut(300);
      this.recaptcha_do('mr_add', function (recaptcha) {
        $.post(_this11.api_mr, {
          action: 'user_add',
          token: _this11.api_token,
          captcha: recaptcha,
          mr_id: params.mrid,
          email: email
        }, function (rsp) {
          $('#notice_add_user').addClass('alert-danger');
          $('#notice_add_user').html(language.form_btn_processed);

          _this11.mr_user_list();

          setTimeout(function () {
            $('#notice_add_user').removeClass('alert-danger');
            $('#notice_add_user').html(language.model_add_user_notice);
            $('#modal_add_user_btn').fadeIn(300);
          }, 2000);
        });
      });
    }
  }, {
    key: "mr_user_list",
    value: function mr_user_list() {
      var _this12 = this;

      $('#meetroom_userlist_data').html('<i class="fa-fw fas fa-spinner fa-spin fa-4x mx-auto"></i>');
      $('#mr_userlist_refresh_icon').html('<i class="fa-fw fas fa-spinner fa-spin"></i>');
      $('#mr_userlist_refresh_icon').attr('disabled', true);
      var params = this.get_url_params();
      this.recaptcha_do('mr_addlist', function (recaptcha) {
        $.post(_this12.api_mr, {
          action: 'user_list',
          token: _this12.api_token,
          captcha: recaptcha,
          mr_id: params.mrid
        }, function (rsp) {
          $('#meetroom_userlist_data').html('<i class="fa-fw fad fa-folder-open fa-4x mx-auto"></i>');
          $('#mr_userlist_refresh_icon').html('<i class="fa-fw fas fa-sync-alt"></i>');
          $('#mr_userlist_refresh_icon').removeAttr('disabled');

          if (rsp.status == 0) {
            $('#meetroom_userlist_data').html('<i class="fa-4x fad fa-user-alt-slash mx-auto"></i>');
          } else {
            $('#meetroom_userlist_data').html('');
            var html = '';
            var userist = rsp.data;

            for (var x in userist) {
              html = '';
              html += '<div class="col-6 col-md-4 col-lg-3 p-2 text-center" id="mr-user-' + userist[x].id + '">';
              html += '<i class="fa-4x fa-fw fas fa-user-tie"></i>';
              html += '<div class="text-truncate">' + userist[x].email + '</div>';
              html += '<div>';
              html += '<a href="javascript:void(0);" class="btn btn-danger btn-sm mt-1 mr-1" onclick="TL.mr_user_del(\'' + userist[x].id + '\')" id="btn-mrdel-user-' + userist[x].id + '"><i class="fa-fw fad fa-trash""></i></a>';
              html += '</div>';
              html += '</div>';
              $('#meetroom_userlist_data').append(html);
            }
          }
        });
      });
    }
  }, {
    key: "mr_user_del",
    value: function mr_user_del(id) {
      var _this13 = this;

      var params = this.get_url_params();
      $('#btn-mrdel-user-' + id).fadeOut(300);
      this.recaptcha_do('mr_add', function (recaptcha) {
        $.post(_this13.api_mr, {
          action: 'user_del',
          token: _this13.api_token,
          captcha: recaptcha,
          mr_id: params.mrid,
          delete: id
        }, function (rsp) {
          $('#mr-user-' + id).fadeOut(500);
        });
      });
    }
  }, {
    key: "mr_add",
    value: function mr_add() {
      var _this14 = this;

      var name = $('#modal_meetingroom_create_name').val();
      var model = $('#modal_meetingroom_create_type').val();

      if (model == '' && name == '') {
        $('#notice_meetingroom_create').html(language.notice_meetingroom_status_mrcreat_fail);
        return false;
      }

      $('#modal_meetingroom_create_btn').attr('disabled', true);
      $('#notice_meetingroom_create').html(language.notice_meetingroom_status_proccessing);
      this.recaptcha_do('mr_add', function (recaptcha) {
        $.post(_this14.api_mr, {
          action: 'create',
          token: _this14.api_token,
          captcha: recaptcha,
          name: name,
          model: model
        }, function (rsp) {
          if (rsp.status == 1) {
            $('#notice_meetingroom_create').html(language.notice_meetingroom_status_mrcreated);

            _this14.mr_list();

            $('#mrCreaterModal').modal('hide');
          } else {
            $('#notice_meetingroom_create').html(language.notice_meetingroom_status_mrcreat_fail);
          }

          setTimeout(function () {
            $('#modal_meetingroom_create_btn').removeAttr('disabled');
          }, 2000);
        });
      });
    }
  }, {
    key: "mr_del",
    value: function mr_del(mrid) {
      var _this15 = this;

      $('#meetingroom_id_' + mrid).hide();
      this.recaptcha_do('mr_del', function (recaptcha) {
        $.post(_this15.api_mr, {
          action: 'delete',
          token: _this15.api_token,
          captcha: recaptcha,
          mr_id: mrid
        });
      });
    }
  }, {
    key: "mr_exit",
    value: function mr_exit(mrid) {
      var _this16 = this;

      $('#meetingroom_id_' + mrid).hide();
      this.recaptcha_do('mr_del', function (recaptcha) {
        $.post(_this16.api_mr, {
          action: 'exit',
          token: _this16.api_token,
          captcha: recaptcha,
          mr_id: mrid
        });
      });
    }
  }, {
    key: "mr_newname",
    value: function mr_newname(mrid) {
      var _this17 = this;

      var newname = prompt(language.modal_meetingroom_newname, "none");
      this.recaptcha_do('mr_newname', function (recaptcha) {
        $.post(_this17.api_mr, {
          action: 'rename',
          token: _this17.api_token,
          captcha: recaptcha,
          name: newname,
          mr_id: mrid
        }, function (rsp) {
          _this17.mr_list();
        });
      });
    }
  }, {
    key: "mr_list",
    value: function mr_list() {
      var _this18 = this;

      if (typeof language === 'undefined') {
        setTimeout(function () {
          _this18.mr_list();
        }, 500);
      }

      if ($.cookie('app_login') != 1) {
        app.open('/login');
        return;
      }

      $('#meetroom_list_data').html('<i class="fa-fw fas fa-spinner fa-spin fa-4x mx-auto"></i>');
      $('#mr_list_refresh_icon').html('<i class="fa-fw fas fa-spinner fa-spin"></i>');
      $('#mr_list_refresh_icon').attr('disabled', true);
      this.recaptcha_do('mr_add', function (recaptcha) {
        $.post(_this18.api_mr, {
          action: 'list',
          token: _this18.api_token,
          captcha: recaptcha
        }, function (rsp) {
          if (rsp.status == 0) {
            $('#meetroom_list_data').html('<i class="fa-fw fad fa-folder-open fa-4x mx-auto"></i>');
            $('#mr_list_refresh_icon').html('<i class="fa-fw fas fa-sync-alt"></i>');
            $('#mr_list_refresh_icon').removeAttr('disabled');
            return false;
          }

          var html = '';
          _this18.mr_data = rsp.data;
          var mrd = rsp.data;

          for (var x in mrd) {
            html += '<div class="col-6 col-md-3 col-lg-2 p-2 text-center" id="meetingroom_id_' + mrd[x].mr_id + '">';
            html += '<i class="fas fa-clipboard-list-check fa-4x mx-auto mb-2 fa-fw"></i>';
            html += '<div class="text-truncate" alt="' + mrd[x].name + '">' + mrd[x].name + '</div>';
            html += '<div class="mt-1">';
            html += '<a href="/room?mrid=' + mrd[x].mr_id + '" tmpui-app="true" class="btn btn-outline-success  btn-sm mr-1 mt-1" target="_blank"><i class="fa-fw fas fa-sign-in-alt"></i></a>';

            if (mrd[x].type === 'owner') {
              html += '<a href="javascript:void(0)" id="btn-rm-file_' + mrd[x].mr_id + '" class="btn btn-outline-danger btn-sm mr-1 mt-1" onclick="TL.mr_del(\'' + mrd[x].mr_id + '\')"><i class="fa-fw fad fa-trash"></i></a>';
              html += '<a href="javascript:void(0)" onclick="TL.mr_newname(\'' + mrd[x].mr_id + '\')" class="btn btn-outline-dark btn-sm mr-1 mt-1"><i class="fad fa-edit"></i></a>';
            } else {
              html += '<a href="javascript:void(0)" id="btn-rm-file_' + mrd[x].mr_id + '" class="btn btn-outline-danger btn-sm mr-1 mt-1" onclick="TL.mr_exit(\'' + mrd[x].mr_id + '\')"><i class="fa-fw fad fa-trash"></i></a>';
            }

            html += '<a href="javascript:void(0)" data-clipboard-text="http://tmp.link/room/' + mrd[x].mr_id + '" class="btn btn-outline-dark btn-sm  mr-1 mt-1 btn_copy_in_mr"><i class="fa-fw fad fa-copy"></i></a>';
            html += '</div>';
            html += '</div>';
          }

          $('#meetroom_list_data').html(html);
          var clipboard = new Clipboard('.btn_copy_in_mr');
          clipboard.on('success', function (e) {
            $(e.trigger).html('<i class="fas fa-check-circle fa-fw"></i>');
            setTimeout(function () {
              $(e.trigger).html('<i class="fad fa-copy"></i>');
            }, 5000);
          });
          $('#mr_list_refresh_icon').html('<i class="fa-fw fas fa-sync-alt"></i>');
          $('#mr_list_refresh_icon').removeAttr('disabled');
          app.linkRebind();
        });
      });
    }
  }, {
    key: "room_list",
    value: function room_list() {
      var _this19 = this;

      var params = this.get_url_params();

      if (typeof language === 'undefined') {
        setTimeout(function () {
          _this19.room_list();
        }, 500);
      } //初始化


      $('#room_filelist').hide();
      $('#room_userlist').hide();
      $('.permission-room-file').hide();
      $('.permission-room-user').hide(); //获取基本信息

      this.recaptcha_do('room_list', function (recaptcha) {
        $.post(_this19.api_mr, {
          action: 'details',
          captcha: recaptcha,
          token: _this19.api_token,
          mr_id: params.mrid
        }, function (rsp) {
          _this19.room_data = rsp.data;

          if (rsp.status === 0) {
            //会议室不存在了
            $('#room_title').html(language.room_status_fail);
            return false;
          } else {
            $('#room_title').html(rsp.data.name);
            $('#room_filelist').show();
            TL.mr_file_list(); //设置权限

            if (rsp.data.file == 1) {
              $('.permission-room-file').show();
            }

            if (rsp.data.user == 1) {
              $('#room_userlist').show();
              $('.permission-room-user').show();
              TL.mr_user_list();
            }
          }
        });
      });
    }
  }, {
    key: "login",
    value: function login() {
      var _this20 = this;

      var email = $('#email').val();
      var password = $('#password').val();
      $('#submit').attr('disabled', true);
      $('#msg_notice').fadeIn();
      $('#submit').html(language.form_btn_processing);
      $('#msg_notice').html(language.form_btn_processing);
      this.recaptcha_do('login', function (recaptcha) {
        if (email !== '' && password !== '') {
          $.post(_this20.api_user, {
            action: 'login',
            token: _this20.api_token,
            captcha: recaptcha,
            email: email,
            password: password
          }, function (rsp) {
            if (rsp.status == 1) {
              $('#msg_notice').html(language.login_ok);
              _this20.logined = 1;

              _this20.get_details(function () {
                $.cookie('app_login', 1);
                window.history.back(); //app.open('/workspace');
              });
            } else {
              $('#msg_notice').html(language.login_fail);
              $('#submit').html(language.form_btn_login);
              $('#submit').removeAttr('disabled');
            }
          });
        }
      });
    }
  }, {
    key: "language",
    value: function language(lang) {
      if (this.logined === 1) {
        $.post(this.api_user, {
          action: 'language',
          token: this.api_token,
          lang: lang
        });
      }

      $('[i18n]').i18n({
        lang: lang
      });
    }
  }, {
    key: "logout",
    value: function logout() {
      $.post(this.api_user, {
        action: 'logout',
        token: this.api_token
      }, function () {
        app.open('/login');
        $.cookie('app_login', 0);
      });
    }
  }, {
    key: "register",
    value: function register() {
      var _this21 = this;

      var email = $('#email').val();
      var password = $('#password').val();
      var rpassword = $('#rpassword').val();
      var code = $('#checkcode').val();
      $('#msg_notice').fadeIn();
      $('#msg_notice').html(language.form_btn_processing);
      $('#submit').html(language.form_btn_login);
      $('#submit').attr('disabled', true);
      this.recaptcha_do('reg', function (recaptcha) {
        $.post(_this21.api_user, {
          action: 'register',
          token: _this21.api_token,
          email: email,
          password: password,
          captcha: recaptcha,
          rpassword: rpassword,
          code: code
        }, function (rsp) {
          if (rsp.status === 1) {
            $('#msg_notice').html(language.reg_finish);
            $('#submit').html(language.reg_finish);

            _this21.get_details(function () {
              gtag('event', 'conversion', {
                'send_to': 'AW-977119233/7Pa-CNH4qbkBEIHQ9tED'
              });
              app.open('/workspace');
            });
          } else {
            $('#msg_notice').html(rsp.data);
            $('#submit').html(language.form_btn_login);
            $('#submit').removeAttr('disabled');
          }
        });
      });
    }
  }, {
    key: "cc_send",
    value: function cc_send() {
      var _this22 = this;

      var email = $('#email').val();
      $('#msg_notice').fadeIn();
      $('#msg_notice').html(language.form_btn_processing);
      $('#button-reg-checkcode').html(language.form_btn_processing);
      $('#button-reg-checkcode').attr('disabled', true);
      this.recaptcha_do('checkcode', function (recaptcha) {
        if (email !== '') {
          $.post(_this22.api_user, {
            action: 'checkcode_send',
            token: _this22.api_token,
            captcha: recaptcha,
            email: email
          }, function (rsp) {
            if (rsp.status == 1) {
              $('#msg_notice').html(language.form_checkcode_msg_sended);
              $('#button-reg-checkcode').html(language.form_checkcode_sended);
            } else {
              $('#msg_notice').html(language.form_checkcode_sendfail);
              $('#button-reg-checkcode').html(language.form_getcode);
              $('#button-reg-checkcode').removeAttr('disabled');
            }
          });
        }
      });
    }
  }, {
    key: "upload_start",
    value: function upload_start() {
      $('#uploaderbtn2').fadeOut();

      if (this.upload_queue_file.length > 0) {
        this.upload_processing = 1;

        for (var x in this.upload_queue_file) {
          if (_typeof(this.upload_queue_file[x]) === 'object') {
            this.upload_core(x);
            break;
          }
        }

        this.upload_btn_reset();
        this.upload_processing = 0;
      }
    }
  }, {
    key: "upload_queue_remove",
    value: function upload_queue_remove(id) {
      delete this.upload_queue_file[id];
      $('#uq_' + id).hide();
      this.upload_btn_reset();
    }
  }, {
    key: "upload_model_get",
    value: function upload_model_get() {
      return $("#upload_model").val();
    }
  }, {
    key: "upload_core",
    value: function upload_core(id) {
      var _this23 = this;

      var file = this.upload_queue_file[id];

      if (file.size > 5 * 1024 * 1024 * 1024) {
        alert(language.upload_limit_size);
        return false;
      }

      $('#uq_delete_' + id).hide();
      $('#uq_status_' + id).html(language.upload_upload_prepare);
      this.upload_prepare(file, id, function (f, sha1, id) {
        //如果sha1不等于0，则调用另外的接口直接发送文件名信息。
        if (sha1 !== 0) {
          $.post(_this23.api_file, {
            'sha1': sha1,
            'filename': file.name,
            'model': _this23.upload_model_get(),
            'action': 'prepare',
            'token': _this23.api_token
          }, function (rsp) {
            if (rsp.status === 1) {
              _this23.upload_final(rsp, file, id);
            } else {
              _this23.upload_worker(f, id);
            }
          }, 'json');
        } else {
          _this23.upload_worker(f, id);
        }
      });
    }
  }, {
    key: "upload_prepare",
    value: function upload_prepare(file, id, callback) {
      //不支持FileReader，直接下一步。
      if (!window.FileReader) {
        callback(file, 0);
        return;
      } //支持FileReader，计算sha1再进行下一步


      var reader = new FileReader();

      reader.onload = function (event) {
        var file_sha1 = sha1(event.target.result);
        callback(file, file_sha1, id);
      };

      reader.readAsArrayBuffer(file.slice(0, 1024 * 1024 * 32));
    }
  }, {
    key: "upload_worker",
    value: function upload_worker(file, id) {
      var _this24 = this;

      var fd = new FormData();
      fd.append("file", file);
      fd.append("action", 'upload');
      fd.append("model", this.upload_model_get());
      fd.append("token", this.api_token);
      var xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", function (evt) {
        _this24.upload_progress(evt, id);
      }, false);
      xhr.addEventListener("load", function (evt) {
        _this24.upload_complete(evt, file, id);
      }, false);
      xhr.addEventListener("error", function (evt) {
        _this24.upload_failed(evt, id);
      }, false);
      xhr.addEventListener("abort", function (evt) {
        _this24.upload_canceled(evt, id);
      }, false);
      xhr.open("POST", this.api_file);
      xhr.send(fd);
    }
  }, {
    key: "upload_selected",
    value: function upload_selected() {
      var file = document.getElementById('fileToUpload').files[0];

      if (file) {
        for (var x in document.getElementById('fileToUpload').files) {
          if (document.getElementById('fileToUpload').files[x].size !== 0 && _typeof(document.getElementById('fileToUpload').files[x]) === 'object') {
            this.upload_queue_add(document.getElementById('fileToUpload').files[x]);
          }
        }
      }

      this.upload_btn_reset();
    }
  }, {
    key: "upload_queue_add",
    value: function upload_queue_add(file) {
      this.upload_queue_file[this.upload_queue_id] = file;
      var html = '';
      html += '<div class="card" id="uq_' + this.upload_queue_id + '">';
      html += '<div class="card-header">';
      html += '<h3 class="card-title text-truncate">' + file.name + '</h3>';
      html += '<div class="card-options"><button class="btn btn-pill btn-sm btn-danger" onclick="TL.upload_queue_remove(' + this.upload_queue_id + ')" id="uq_delete_' + this.upload_queue_id + '">' + language.workspace_table_op_remove_from_workspace + '</button></div>';
      html += '</div>';
      html += '<div class="card-body">'; //html += '<div class="h5 text-truncate">' + language.file_name + ' <span>: ' + file.name + '</span></div>';

      html += '<div>' + language.file_size + ' <span>: ' + this.bytetoconver(file.size, true) + '</span></div>';
      html += '<div id="uq_status_' + this.upload_queue_id + '">' + language.upload_ready + ' </div>'; //html += '<button class="btn btn-sm btn-danger btn_copy mt-2" onclick="TL.upload_queue_remove('+this.upload_queue_id+')" id="uq_delete_'+this.upload_queue_id+'">移除</button>';

      html += '<div class="progress progress-sm mt-2"><div class="progress-bar bg-green" style="width: 0%" id="uqp_' + this.upload_queue_id + '"></div>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
      $('#uploaded_file_box').append(html);
      $('#uploaded_file_box').fadeIn();
      this.upload_queue_id++;
    }
  }, {
    key: "upload_progress",
    value: function upload_progress(evt, id) {
      if (evt.lengthComputable) {
        if (evt.total === evt.loaded) {
          $('#uq_status_' + id).html(language.upload_sync);
        } else {
          $('#uq_status_' + id).html(this.bytetoconver(evt.loaded, true) + ' / ' + this.bytetoconver(evt.total, true));
          var percentComplete = Math.round(evt.loaded * 100 / evt.total);
          $('#uqp_' + id).css('width', percentComplete + '%');
        }
      }
    }
  }, {
    key: "upload_complete",
    value: function upload_complete(evt, file, id) {
      var data = JSON.parse(evt.target.responseText);
      this.upload_final(data, file, id);
    }
  }, {
    key: "upload_failed",
    value: function upload_failed(evt, id) {
      alert(language.upload_fail);
      this.upload_btn_reset();
    }
  }, {
    key: "upload_canceled",
    value: function upload_canceled(evt, id) {
      alert(language.upload_cancel);
      this.upload_btn_reset();
    }
  }, {
    key: "upload_final",
    value: function upload_final(rsp, file, id) {
      $('#uq_' + id).fadeOut();
      delete this.upload_queue_file[id];

      if (rsp.status === 1) {
        //alert('上传完成');
        //window.location.href = 'http://tmp.link/f/' + rsp.data.ukey;
        var html = '<div class="font-weight-light p-2 mb-2 card card-app-icon">';
        html += '<div>';
        html += '<div>' + language.file_name + ' <span>: ' + file.name + '</span></div>';
        html += '<div>' + language.file_size + ' <span>: ' + this.bytetoconver(file.size, true) + '</span></div>';
        html += '<div class="mt-2 mb-2">';
        html += '<a href="http://tmp.link/f/' + rsp.data.ukey + '" class="btn btn-sm btn-success mr-2" target="_blank">下载文件</a>';
        html += '<a href="javascript:void(0)" data-clipboard-text="http://tmp.link/f/' + rsp.data.ukey + '" class="btn btn-sm btn-info btn_copy">复制地址</a>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        $('#uploaded_file_box').append(html);
        var clipboard = new Clipboard('.btn_copy');
        clipboard.on('success', function (e) {
          $(e.trigger).html('<i class="fas fa-check-circle" aria-hidden="true"></i>');
          setTimeout(function () {
            $(e.trigger).html(language.file_btn_copy2);
          }, 5000);
        });
      } else {
        alert(language.upload_fail); // window.location.reload();
      }

      this.upload_start();
    }
  }, {
    key: "upload_btn_reset",
    value: function upload_btn_reset() {
      if (this.upload_queue_file.length > 0 && this.upload_processing === 0) {
        $('#uploaderbtn2').fadeIn();
      } else {
        $('#uploaderbtn2').fadeOut();
      }
    }
  }, {
    key: "report",
    value: function report() {
      var ukey = $('#report_ukey').html();
      var reason = $('#report_model').val();
      $('#reportbtn').attr('disabled', true);
      $('#reportbtn').html(language.form_btn_processed);
      $.post(this.api_file, {
        'action': 'report',
        'token': this.api_token,
        'reason': reason,
        'ukey': ukey
      }, function (rsp) {
        $('#reportbtn').html(language.form_btn_processed);
      }, 'json');
    }
  }, {
    key: "find_file",
    value: function find_file() {
      var ukey = $('#ukey').val();

      if (ukey !== '') {
        window.open('http://tmp.link/f/' + ukey);
      }
    }
  }, {
    key: "get_url_params",
    value: function get_url_params() {
      var vars = [],
          hash;
      var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

      for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
      }

      return vars;
    }
  }, {
    key: "bytetoconver",
    value: function bytetoconver(val, label) {
      if (val == 0) return '0';
      var s = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
      var e = Math.floor(Math.log(val) / Math.log(1024));
      var value = (val / Math.pow(1024, Math.floor(e))).toFixed(2);
      e = e < 0 ? -e : e;
      if (label) value += ' ' + s[e];
      return value;
    }
  }, {
    key: "fileicon",
    value: function fileicon(type) {
      var r = 'fad fa-file';

      switch (type) {
        case 'pdf':
          r = 'fad fa-file-pdf';
          break;

        case 'zip':
          r = 'fad fa-file-archive';
          break;

        case 'rar':
          r = 'fad fa-file-archive';
          break;

        case '7z':
          r = 'fad fa-file-archive';
          break;

        case 'gz':
          r = 'fad fa-file-archive';
          break;

        case 'tar':
          r = 'fad fa-file-archive';
          break;

        case 'doc':
          r = 'fad fa-file-word';
          break;

        case 'wps':
          r = 'fad fa-file-word';
          break;

        case 'docx':
          r = 'fad fa-file-word';
          break;

        case 'c':
          r = 'fad fa-file-code';
          break;

        case 'cpp':
          r = 'fad fa-file-code';
          break;

        case 'php':
          r = 'fad fa-file-code';
          break;

        case 'java':
          r = 'fad fa-file-code';
          break;

        case 'js':
          r = 'fad fa-file-code';
          break;

        case 'vb':
          r = 'fad fa-file-code';
          break;

        case 'py':
          r = 'fad fa-file-code';
          break;

        case 'css':
          r = 'fad fa-file-code';
          break;

        case 'html':
          r = 'fad fa-file-code';
          break;

        case 'tar':
          r = 'fad fa-file-code';
          break;

        case 'sh':
          r = 'fad fa-file-code';
          break;

        case 'asm':
          r = 'fad fa-file-code';
          break;

        case 'ogg':
          r = 'fad fa-file-music';
          break;

        case 'm4a':
          r = 'fad fa-file-music';
          break;

        case 'mp3':
          r = 'fad fa-file-music';
          break;

        case 'wav':
          r = 'fad fa-file-music';
          break;

        case 'weba':
          r = 'fad fa-file-music';
          break;

        case 'mp4':
          r = 'fad fa-file-video';
          break;

        case 'rm':
          r = 'fad fa-file-video';
          break;

        case 'rmvb':
          r = 'fad fa-file-video';
          break;

        case 'avi':
          r = 'fad fa-file-video';
          break;

        case 'mkv':
          r = 'fad fa-file-video';
          break;

        case 'webm':
          r = 'fad fa-file-video';
          break;

        case 'wmv':
          r = 'fad fa-file-video';
          break;

        case 'flv':
          r = 'fad fa-file-video';
          break;

        case 'mpg':
          r = 'fad fa-file-video';
          break;

        case 'mpeg':
          r = 'fad fa-file-video';
          break;

        case 'ts':
          r = 'fad fa-file-video';
          break;

        case 'mov':
          r = 'fad fa-file-video';
          break;

        case 'vob':
          r = 'fad fa-file-video';
          break;

        case 'png':
          r = 'fad fa-file-image';
          break;

        case 'gif':
          r = 'fad fa-file-image';
          break;

        case 'bmp':
          r = 'fad fa-file-image';
          break;

        case 'jpg':
          r = 'fad fa-file-image';
          break;

        case 'jpeg':
          r = 'fad fa-file-image';
          break;

        case 'webp':
          r = 'fad fa-file-image';
          break;

        case 'ppt':
          r = 'fad fa-file-powerpoint';
          break;

        case 'pptx':
          r = 'fad fa-file-powerpoint';
          break;

        case 'xls':
          r = 'fad fa-file-excel';
          break;

        case 'xlsx':
          r = 'fad fa-file-excel';
          break;

        case 'xlsm':
          r = 'fad fa-file-excel';
          break;

        case 'exe':
          r = 'fad fa-cube';
          break;

        case 'bin':
          r = 'fad fa-cube';
          break;

        case 'rpm':
          r = 'fad fa-box-full';
          break;

        case 'deb':
          r = 'fad fa-box-full';
          break;

        case 'msi':
          r = 'fad fa-box-full';
          break;

        case 'dmg':
          r = 'fad fa-box-full';
          break;

        case 'apk':
          r = 'fab fa-android';
          break;

        case 'torrent':
          r = 'fad fa-acorn';
          break;
      }

      return r;
    }
  }]);

  return tmplink;
}();

var TL = new tmplink();