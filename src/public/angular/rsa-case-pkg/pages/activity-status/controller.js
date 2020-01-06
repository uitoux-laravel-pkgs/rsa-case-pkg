app.component('activityStatusList', {
    templateUrl: activity_status_list_template_url,
    controller: function($http, $window, HelperService, $scope, $rootScope) {
        $scope.loading = true;
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        self.filter_img_url = filter_img_url;
        self.export_activities = export_activities;
        self.csrf = token;
        $http.get(
            activity_status_filter_url
        ).then(function(response) {
            self.extras = response.data.extras;
            console.log(response.data.extras.status_list);
            self.status_list = response.data.extras.status_list;
            self.modal_close = modal_close;
            var cols = [
                { data: 'action', searchable: false },
                { data: 'case_date', searchable: false },
                { data: 'number', name: 'cases.number', searchable: true },
                { data: 'asp_code', name: 'asps.asp_code', searchable: true },
                { data: 'crm_activity_id', searchable: false },
                // { data: 'activity_number', name: 'activities.number', searchable: true },
                { data: 'sub_service', name: 'service_types.name', searchable: true },
                { data: 'finance_status', name: 'activity_finance_statuses.name', searchable: true },
                // { data: 'asp_status', name: 'activity_asp_statuses.name', searchable: true },
                { data: 'status', name: 'activity_portal_statuses.name', searchable: true },
                { data: 'activity_status', name: 'activity_statuses.name', searchable: true },
                { data: 'client', name: 'clients.name', searchable: true },
                { data: 'call_center', name: 'call_centers.name', searchable: true },
            ];

            var activities_status_dt_config = JSON.parse(JSON.stringify(dt_config));

            $('#activities_status_table').DataTable(
                $.extend(activities_status_dt_config, {
                    columns: cols,
                    ordering: false,
                    processing: true,
                    serverSide: true,
                    "scrollX": true,
                    stateSave: true,
                    stateSaveCallback: function(settings, data) {
                        localStorage.setItem('SIDataTables_' + settings.sInstance, JSON.stringify(data));
                    },
                    stateLoadCallback: function(settings) {
                        var state_save_val = JSON.parse(localStorage.getItem('SIDataTables_' + settings.sInstance));
                        if (state_save_val) {
                            $('.filterTable').val(state_save_val.search.search);
                        }
                        return JSON.parse(localStorage.getItem('SIDataTables_' + settings.sInstance));
                    },
                    ajax: {
                        url: activity_status_get_list_url,
                        data: function(d) {
                            d.ticket_date = $('#ticket_date').val();
                            d.call_center_id = $('#call_center_id').val();
                            d.case_number = $('#case_number').val();
                            d.asp_code = $('#asp_code').val();
                            d.service_type_id = $('#service_type_id').val();
                            d.finance_status_id = $('#finance_status_id').val();
                            d.status_id = $('#status_id').val();
                            d.activity_status_id = $('#activity_status_id').val();
                            d.client_id = $('#client_id').val();
                        }
                    },
                    infoCallback: function(settings, start, end, max, total, pre) {
                        $('.count').html(total + ' / ' + max + ' listings')
                    },
                    initComplete: function() {},
                }));
            $('.dataTables_length select').select2();

            var dataTable = $('#activities_status_table').dataTable();

            $(".filterTable").keyup(function() {
                dataTable.fnFilter(this.value);
            });

            $('#ticket_date').on('change', function() {
                dataTable.fnFilter();
            });

            $('#case_number,#asp_code').on('keyup', function() {
                dataTable.fnFilter();
            });

            $scope.changeCommonFilter = function(val, id) {
                $('#' + id).val(val);
                dataTable.fnFilter();
            };

            $scope.refresh = function() {
                $('#activities_status_table').DataTable().ajax.reload();
            };

            $scope.deleteConfirm = function($id) {
                bootbox.confirm({
                    message: 'Do you want to delete this activity?',
                    className: 'action-confirm-modal',
                    buttons: {
                        confirm: {
                            label: 'Yes',
                            className: 'btn-success'
                        },
                        cancel: {
                            label: 'No',
                            className: 'btn-danger'
                        }
                    },
                    callback: function(result) {
                        if (result) {
                            $window.location.href = activity_status_delete_url + '/' + $id;
                        }
                    }
                });
            }
            $('.filterToggle').click(function() {
                $('#filterticket').toggleClass('open');
            });

            $('.close-filter, .filter-overlay').click(function() {
                $(this).parents('.filter-wrapper').removeClass('open');
            });

            $('.date-picker').datepicker({
                format: 'dd-mm-yyyy',
                autoclose: true,
            });
            $('input[name="period"]').daterangepicker({
                startDate: moment().startOf('month'),
                endDate: moment().endOf('month'),
            });
            $(function() {

            });
            self.pc_all = false;
            $rootScope.loading = false;
            window.mdSelectOnKeyDownOverride = function(event) {
                event.stopPropagation();
            };
            $scope.changeStatus = function(ids) {
                console.log(ids);
                if (ids) {
                    $size_rids = ids.length;
                    if ($size_rids > 0) {
                        $('#pc_sel_all').addClass('checked');
                    }
                } else {
                    $('#pc_sel_all').removeClass('checked');
                }
            }
            $scope.selectAll = function(val) {
                self.pc_all = (!self.pc_all);
                if (!val) {
                    r_list = [];
                    angular.forEach(self.extras.status_list, function(value, key) {
                        r_list.push(value.id);
                    });

                    $('#pc_sel_all').addClass('checked');
                } else {
                    r_list = [];
                    $('#pc_sel_all').removeClass('checked');
                }
                self.status_ids = r_list;
            }

            /*$scope.exportActivities = function(){
                if($scope.export_excel_form.$valid){
                    alert(self.period);
                    $http({
                        method: 'POST',
                        url: laravel_routes['exportActivities'],
                        data: { status_ids: self.status_ids, period: self.period },
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).success(function(data) {
                            console.log(data)

                           $noty = new Noty({
                                type: 'error',
                                layout: 'topRight',
                                text: 'Export',
                                animation: {
                                    speed: 500
                                }
                            }).show();
                            setTimeout(function() {
                                $noty.close();
                            }, 1000);
                        }).error(function(data) {
                            console.log(data)
                            $noty = new Noty({
                                type: 'error',
                                layout: 'topRight',
                                text: 'Export',
                                animation: {
                                    speed: 500
                                }
                            }).show();
                            setTimeout(function() {
                                $noty.close();
                            }, 1000);
                    });
                }else{
                     $noty = new Noty({
                                type: 'error',
                                layout: 'topRight',
                                text: 'Please Fill all required Field',
                                animation: {
                                    speed: 500
                                }
                            }).show();
                            setTimeout(function() {
                                $noty.close();
                            }, 1000);
                }
            }*/
            /*$scope.exportActivities = function(){
                if($scope.export_excel_form.$valid){
                    //$('.approve-btn').button('loading');
                    $http.post(
                        laravel_routes['exportActivities'], {
                            period: self.period,
                            status_ids: self.status_ids,
                        }
                    ).then(function(response) {
                        $('.approve-btn').button('reset');
                        $("#export_excel_form").modal("hide");
                        if (!response.data.success) {
                            console.log(response.data.errors);
                            var errors = '';
                            for (var i in response.data.errors) {
                                errors += '<li>' + response.data.errors[i] + '</li>';
                            }
                            $noty = new Noty({
                                type: 'error',
                                layout: 'topRight',
                                text: errors,
                                animation: {
                                    speed: 500 // unavailable - no need
                                },
                            }).show();
                            setTimeout(function() {
                                $noty.close();
                            }, 1000);
                            return;
                        } else {
                            $noty = new Noty({
                                type: 'success',
                                layout: 'topRight',
                                text: response.data.message,
                                animation: {
                                    speed: 500
                                }
                            }).show();
                            setTimeout(function() {
                                $noty.close();
                            }, 1000);
                        }
                        }); 
                    }else{
                        $noty = new Noty({
                        type: 'error',
                        layout: 'topRight',
                        text: "Please check all mandatory fields are filled!!",
                        animation: {
                            speed: 500
                        }
                    }).show();
                    setTimeout(function() {
                        $noty.close();
                    }, 1000);
                    }
            }*/
            //Jquery Validation

            var form_id = '#export_excel_form';
            var v = jQuery(form_id).validate({
                /*invalidHandler: function(event, validator) {
                    var errors = validator.numberOfInvalids();
                    $(".alert-danger").show();
                    var errors = validator.numberOfInvalids();
                    if (errors) {
                        var message = errors == 1 ?
                            'Please correct the following error:\n' :
                            'Please correct the following ' + errors + ' errors.\n';
                        var errors = "";
                        if (validator.errorList.length > 0) {
                            for (x = 0; x < validator.errorList.length; x++) {
                                errors += "\n\u25CF " + validator.errorList[x].message;
                            }
                        }
                        $(".alert-danger").html(message + errors);
                    }
                    validator.focusInvalid();

                    $("html, body").animate({ scrollTop: 0 });
                },*/
                // errorContainer: '.grouped-error',
                rules: {
                    'period': {
                        required: true,
                    },
                    'status_ids': {
                        required: true,
                    },

                $("html, body").animate({ scrollTop: 0 });
            },
           // errorContainer: '.grouped-error',
            rules: {
                'period': {
                    required: true,
                },
                'status_ids[]': {
                    required: true,

                },
                messages: {
                    'period': {
                        required: "Please Select Period",
                    },
                    'status_ids': {
                        required: "Please Selecet Statuses",
                    },
                },
                errorPlacement: function(error, element) {
                    if (element.attr("type") == "checkbox") {
                        error.insertBefore($(element).parents('.checkboxList'));
                    } else {
                        error.insertAfter($(element));
                    }
                },
                submitHandler: function(form) {
                    $('#export_excel_form').submit();
                }

            });
        });
    }
});
//------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------

app.component('activityStatusDelete', {
    controller: function($http, $window, HelperService, $scope, $routeParams) {
        $.ajax({
            url: activity_status_delete_row + '/' + $routeParams.id,
            type: 'get',
            success: function(response) {
                // console.log(response);
                if (response.success == true) {
                    new Noty({
                        type: 'success',
                        layout: 'topRight',
                        text: 'Activity deleted successfully',
                    }).show();
                    $window.location.href = activity_status_list_url;
                }
            }
        });
    }
});
//------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------

app.component('activityStatusView', {
    templateUrl: activity_status_view_template_url,
    controller: function($http, $location, $window, HelperService, $scope, $routeParams, $rootScope, $location) {
        $scope.loading = true;
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        self.filter_img_url = filter_img_url;
        // self.style_dot_image_url = style_dot_image_url;
        get_view_data_url = typeof($routeParams.id) == 'undefined' ? activity_status_view_data_url + '/' : activity_status_view_data_url + '/' + $routeParams.view_type_id + '/view/' + $routeParams.id;
        $http.get(
            get_view_data_url
        ).then(function(response) {
            console.log(response);
            if (!response.data.success) {
                var errors = '';
                for (var i in response.data.errors) {
                    errors += '<li>' + response.data.errors[i] + '</li>';
                }
                $noty = new Noty({
                    type: 'error',
                    layout: 'topRight',
                    text: errors,
                    animation: {
                        speed: 500 // unavailable - no need
                    },

                }).show();
                setTimeout(function() {
                    $noty.close();
                }, 1000);
                $location.path('/rsa-case-pkg/activity-status/list');
                $scope.$apply();
                return;
            }
            self.data = response.data.data.activities;
            self.data.style_dot_image_url = style_dot_image_url;
            self.data.style_service_type_image_url = style_service_type_image_url;
            self.data.style_car_image_url = style_car_image_url;
            self.data.style_location_image_url = style_location_image_url;
            self.data.style_profile_image_url = style_profile_image_url;
            self.data.style_phone_image_url = style_car_image_url;
            self.data.verification = 0;

            console.log(self.data);
            $('.viewData-toggle--inner.noToggle .viewData-threeColumn--wrapper').slideDown();
            $('.viewData-toggle--btn').click(function() {
                $(this).toggleClass('viewData-toggle--btn_reverse');
                $('.viewData-toggle--inner .viewData-threeColumn--wrapper').slideToggle();
            });
            $rootScope.loading = false;
        });

    }
});