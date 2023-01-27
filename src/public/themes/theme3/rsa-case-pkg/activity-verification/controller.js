app.component('activityVerificationList', {
    templateUrl: activity_verification_list_template_url,
    controller: function($http, $window, HelperService, $scope, $rootScope, $route, $location, $mdSelect) {
        $scope.loading = true;
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        if (!self.hasPermission('activity-verification')) {
            window.location = "#!/page-permission-denied";
            return false;
        }
        self.filter_img_url = filter_img_url;
        self.export_activities = export_activities;
        self.canExportActivity = canExportActivity;
        self.csrf = token;
        $http.get(
            getApprovalActivityStatusFilterData
        ).then(function(response) {
            self.extras = response.data.extras;
            $(".for-below40").show();
            $(".for-above40").hide();
            self.extras = response.data.extras;
            self.isAspRole = response.data.isAspRole;
            self.auth_user_details = response.data.auth_user_details;
            // response.data.extras.status_list.splice(0, 1);
            self.status_list = response.data.extras.portal_status_list;
            self.client_list = response.data.extras.export_client_list;
            self.asp_list = response.data.extras.asp_list;
            // self.status_list.splice(0, 1);
            self.modal_close = modal_close;
            self.status_ids = response.data.status_ids;

            var cols1 = [
                { data: 'action', searchable: false },
                { data: 'case_date', searchable: false },
                { data: 'number', name: 'cases.number', searchable: true },
                { data: 'vehicle_registration_number', name: 'cases.vehicle_registration_number', searchable: true },
                { data: 'asp', name: 'asp', searchable: true },
                // { data: 'asp_code', name: 'asps.asp_code', searchable: true },
                { data: 'crm_activity_id', searchable: false },
                // { data: 'source', name: 'configs.name', searchable: true },
                { data: 'boKmTravelled', searchable: false },
                // { data: 'activity_number', name: 'activities.number', searchable: true },
                { data: 'sub_service', name: 'service_types.name', searchable: true },
                { data: 'finance_status', name: 'activity_finance_statuses.name', searchable: true },
                // { data: 'asp_status', name: 'activity_asp_statuses.name', searchable: true },
                { data: 'status', name: 'activity_portal_statuses.name', searchable: true },
                { data: 'activity_status', name: 'activity_statuses.name', searchable: true },
                { data: 'client', name: 'clients.name', searchable: true },
                // { data: 'call_center', name: 'call_centers.name', searchable: true },
                { data: 'boPayoutAmount', searchable: false },
            ];

            var activities_verification_below_40_dt_config = JSON.parse(JSON.stringify(dt_config));

            $('#below40-table').DataTable(
                $.extend(activities_verification_below_40_dt_config, {
                    columns: cols1,
                    ordering: true,
                    "columnDefs": [{
                        "orderable": false,
                        "targets": [0, 5, 6, 12]
                    }],
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
                            $('.for-below40 .filterTable').val(state_save_val.search.search);
                        }
                        return JSON.parse(localStorage.getItem('SIDataTables_' + settings.sInstance));
                    },
                    ajax: {
                        url: activity_verification_bulk_get_list_url,
                        data: function(d) {
                            d.ticket_date = $('.for-below40 #ticket_date').val();
                            d.call_center_id = $('.for-below40 #call_center_id').val();
                            d.case_number = $('.for-below40 #case_number').val();
                            d.asp_code = $('.for-below40 #asp_code').val();
                            d.service_type_id = $('.for-below40 #service_type_id').val();
                            d.finance_status_id = $('.for-below40 #finance_status_id').val();
                            d.status_id = $('.for-below40 #status_id').val();
                            d.activity_status_id = $('.for-below40 #activity_status_id').val();
                            d.client_id = $('.for-below40 #client_id').val();
                        }
                    },
                    infoCallback: function(settings, start, end, max, total, pre) {
                        $('.below40_count').html(total + ' / ' + max + ' listings')
                        if (!total) {
                            $('#submit').hide();
                        } else {
                            $('#submit').show();
                        }
                    },
                    initComplete: function() {},
                }));
            $('.dataTables_length select').select2();

            var belowDataTable = $('#below40-table').dataTable();

            $(".for-below40 .filterTable").keyup(function() {
                belowDataTable.fnFilter(this.value);
            });

            $('.for-below40 #ticket_date').on('change', function() {
                belowDataTable.fnFilter();
            });

            $('.for-below40 #case_number, .for-below40 #asp_code').on('keyup', function() {
                belowDataTable.fnFilter();
            });

            $scope.changeCommonFilterBelow = function(val, id) {
                $('.for-below40 #' + id).val(val);
                belowDataTable.fnFilter();
            };

            $scope.resetFilterBelow40 = function() {
                self.ticket_filter_below40 = [];
                $('.for-below40 #call_center_id').val('');
                $('.for-below40 #service_type_id').val('');
                $('.for-below40 #finance_status_id').val('');
                $('.for-below40 #status_id').val('');
                $('.for-below40 #activity_status_id').val('');
                $('.for-below40 #client_id').val('');

                setTimeout(function() {
                    belowDataTable.fnFilter();
                    $('#below40-table').DataTable().ajax.reload();
                }, 1000);
            };

            $scope.belowRefresh = function() {
                $('#below40-table').DataTable().ajax.reload();
            };

            $('.for-below40 .filterToggle').click(function() {
                $('.for-below40 #filterticket').toggleClass('open');
            });

            var form_id = form_ids = '#bulk_verification';
            var v = jQuery(form_ids).validate({
                ignore: '',
                rules: {
                    // 'invoice_ids[]': {
                    //     required: true,// },
                },
                submitHandler: function(form) {
                    let formData = new FormData($(form_id)[0]);
                    $('#submit').button('loading');
                    if ($(".loader-type-2").hasClass("loader-hide")) {
                        $(".loader-type-2").removeClass("loader-hide");
                    }
                    $.ajax({
                            url: laravel_routes['bulkApproveActivity'],
                            method: "POST",
                            data: formData,
                            processData: false,
                            contentType: false,
                        })
                        .done(function(res) {
                            // console.log(res);
                            $(".loader-type-2").addClass("loader-hide");
                            $('#submit').button('reset');
                            if (!res.success) {
                                custom_noty('error', res.error);
                            } else {
                                custom_noty('success', res.message);
                                $('#below40-table').DataTable().ajax.reload();
                            }
                        })
                        .fail(function(xhr) {
                            $(".loader-type-2").addClass("loader-hide");
                            $('#submit').button('reset');
                            custom_noty('error', "Something went wrong at server");
                        });
                },
            });


            var cols2 = [
                { data: 'case_date', searchable: false },
                { data: 'number', name: 'cases.number', searchable: true },
                { data: 'vehicle_registration_number', name: 'cases.vehicle_registration_number', searchable: true },
                { data: 'asp', name: 'asp', searchable: true },
                // { data: 'asp_code', name: 'asps.asp_code', searchable: true },
                { data: 'crm_activity_id', searchable: false },
                // { data: 'source', name: 'configs.name', searchable: true },
                { data: 'boKmTravelled', searchable: false },
                // { data: 'activity_number', name: 'activities.number', searchable: true },
                { data: 'sub_service', name: 'service_types.name', searchable: true },
                { data: 'finance_status', name: 'activity_finance_statuses.name', searchable: true },
                // { data: 'asp_status', name: 'activity_asp_statuses.name', searchable: true },
                { data: 'status', name: 'activity_portal_statuses.name', searchable: true },
                { data: 'activity_status', name: 'activity_statuses.name', searchable: true },
                { data: 'client', name: 'clients.name', searchable: true },
                // { data: 'call_center', name: 'call_centers.name', searchable: true },
                { data: 'boPayoutAmount', searchable: false },
            ];

            var activities_verification_above_40_dt_config = JSON.parse(JSON.stringify(dt_config));

            $('#above40-table').DataTable(
                $.extend(activities_verification_above_40_dt_config, {
                    columns: cols2,
                    ordering: true,
                    "columnDefs": [{
                        "orderable": false,
                        "targets": [4, 5, 11]
                    }],
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
                            $('.for-above40 .filterTable').val(state_save_val.search.search);
                        }
                        return JSON.parse(localStorage.getItem('SIDataTables_' + settings.sInstance));
                    },
                    ajax: {
                        url: activity_verification_individual_get_list_url,
                        data: function(d) {
                            d.ticket_date = $('.for-above40 #ticket_date').val();
                            d.call_center_id = $('.for-above40 #call_center_id').val();
                            d.case_number = $('.for-above40 #case_number').val();
                            d.asp_code = $('.for-above40 #asp_code').val();
                            d.service_type_id = $('.for-above40 #service_type_id').val();
                            d.finance_status_id = $('.for-above40 #finance_status_id').val();
                            d.status_id = $('.for-above40 #status_id').val();
                            d.activity_status_id = $('.for-above40 #activity_status_id').val();
                            d.client_id = $('.for-above40 #client_id').val();
                        }
                    },
                    infoCallback: function(settings, start, end, max, total, pre) {
                        $('.above40_count').html(total + ' / ' + max + ' listings')
                    },
                    initComplete: function() {},
                }));
            $('.dataTables_length select').select2();

            var aboveDataTable = $('#above40-table').dataTable();

            $(".for-above40 .filterTable").keyup(function() {
                aboveDataTable.fnFilter(this.value);
            });

            $('.for-above40 #ticket_date').on('change', function() {
                aboveDataTable.fnFilter();
            });

            $('.for-above40 #case_number, .for-above40 #asp_code').on('keyup', function() {
                aboveDataTable.fnFilter();
            });

            $scope.changeCommonFilterAbove = function(val, id) {
                $('.for-above40 #' + id).val(val);
                aboveDataTable.fnFilter();
            };

            $scope.resetFilterAbove40 = function() {
                self.ticket_filter_above40 = [];
                $('.for-above40 #call_center_id').val('');
                $('.for-above40 #service_type_id').val('');
                $('.for-above40 #finance_status_id').val('');
                $('.for-above40 #status_id').val('');
                $('.for-above40 #activity_status_id').val('');
                $('.for-above40 #client_id').val('');

                setTimeout(function() {
                    aboveDataTable.fnFilter();
                    $('#above40-table').DataTable().ajax.reload();
                }, 1000);
            };

            $scope.aboveRefresh = function() {
                $('#above40-table').DataTable().ajax.reload();
            };

            $('.for-above40 .filterToggle').click(function() {
                $('.for-above40 #filterticket').toggleClass('open');
            });

            $('.close-filter, .filter-overlay').click(function() {
                $(this).parents('.filter-wrapper').removeClass('open');
            });

            $('.date-picker').datepicker({
                format: 'dd-mm-yyyy',
                autoclose: true,
            });

            $('.filter-content').bind('click', function(event) {

                if ($('.md-select-menu-container').hasClass('md-active')) {
                    $mdSelect.hide();
                }
            });

            $('#select_all_checkbox').click(function() {
                if ($(this).prop("checked")) {
                    $(".child_select_all").prop("checked", true);
                } else {
                    $(".child_select_all").prop("checked", false);
                }
            });


            $(".for-empty-return").hide();
            $(".below40-tab").click(function() {
                $(".for-below40").show();
                $(".for-above40,.for-empty-return").hide();
            });
            $(".above40-tab").click(function() {
                $(".for-above40").show();
                $(".for-below40,.for-empty-return").hide();
            });
            $(".empty-return-tab").click(function() {
                $(".for-empty-return").show();
                $(".for-below40,.for-above40").hide();
            });
            $scope.tabChange = function(add_id, remove_id) {
                $('#' + add_id + '-table').DataTable().ajax.reload();
                $('#' + add_id).addClass('active in');
                $('#' + remove_id).removeClass('active in');
            }

            $('input[name="period"]').daterangepicker({
                startDate: moment().startOf('month'),
                endDate: moment().endOf('month'),
            });

            $('.daterange').on('apply.daterangepicker', function(ev, picker) {
                $(this).val(picker.startDate.format('DD-MM-YYYY') + ' - ' + picker.endDate.format('DD-MM-YYYY'));
                 dataTable.fnFilter();
            });

            $('.daterange').on('cancel.daterangepicker', function(ev, picker) {
                $(this).val('');
                 dataTable.fnFilter();
            });
            self.searchAsps = function(query) {
                if (query) {
                    return new Promise(function(resolve, reject) {
                        $http
                            .post(
                                laravel_routes['activityStatusSearchAsps'], {
                                    key: query,
                                }
                            )
                            .then(function(response) {
                                resolve(response.data);
                            });
                    });
                } else {
                    return [];
                }
            }

            self.searchClients = function(query) {
                if (query) {
                    return new Promise(function(resolve, reject) {
                        $http
                            .post(
                                laravel_routes['activityStatusSearchClients'], {
                                    key: query,
                                }
                            )
                            .then(function(response) {
                                resolve(response.data);
                            });
                    });
                } else {
                    return [];
                }
            }

            self.pc_all = false;
            $rootScope.loading = false;
            window.mdSelectOnKeyDownOverride = function(event) {
                event.stopPropagation();
            };
            $('.filter-content, .modal-dialog, #asp_activity_verification_excel_export').bind('click', function(event) {
                if ($('.md-select-menu-container').hasClass('md-active')) {
                    $mdSelect.hide();
                }
            });
            $scope.changeStatus = function(ids) {
                console.log(ids);
                if (ids) {
                    $size_rids = ids.length;
                    if ($size_rids > 0) {
                        $('#pc_sel_all').addClass('pc_sel_all');
                    }
                } else {
                    $('#pc_sel_all').removeClass('pc_sel_all');
                }
            }
            $scope.selectAll = function(val) {
                self.pc_all = (!self.pc_all);
                if (!val) {
                    r_list = [];
                    angular.forEach(self.extras.status_list, function(value, key) {
                        r_list.push(value.id);
                    });

                    $('#pc_sel_all').addClass('pc_sel_all');
                } else {
                    r_list = [];
                    $('#pc_sel_all').removeClass('pc_sel_all');
                }
                self.status_ids = r_list;
            }
            $scope.enableExportModal = function(type){
                $("#approval_type").val(type)
                if(type == "Individual") {
                    $("#status_ids").val(self.status_ids.individual)
                } else if(type == "Bulk") {
                    $("#status_ids").val(self.status_ids.bulk)
                }
                $("#asp_activity_verification_excel_export").modal('toggle');
            }

            $("form[name='export_excel_form']").validate({
                ignore: '',
                rules: {
                    status_ids: {
                        required: true,
                    },
                    period: {
                        required: true,
                    },
                    filter_by: {
                        required: true,
                    }
                },
                messages: {
                    period: "Please Select Period",
                    status_ids: "Please Select Activity Status",
                    filter_by: "Please Select Filter By",
                },

                submitHandler: function(form) {
                    form.submit();
                }
            });

            $rootScope.loading = false;
        });
    }
});
//------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------

app.component('activityVerificationView', {
    templateUrl: activity_status_view_template_url,
    controller: function($http, $location, $window, HelperService, $scope, $routeParams, $rootScope, $location) {
        $scope.loading = true;
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        self.filter_img_url = filter_img_url;
        self.style_dot_image_url = style_dot_image_url;
        self.csrf = $('#csrf').val();
        get_view_data_url = typeof($routeParams.id) == 'undefined' ? activity_verification_view_data_url + '/' + 2 : activity_verification_view_data_url + '/' + $routeParams.view_type_id + '/view/' + $routeParams.id;
        $http.get(
            get_view_data_url
        ).then(function(response) {
            if (!response.data.success) {
                var errors = '';
                for (var i in response.data.errors) {
                    errors += '<li>' + response.data.errors[i] + '</li>';
                }
                custom_noty('error', errors);
                $location.path('/rsa-case-pkg/activity-verification/list');
                $scope.$apply();
                return;
            }
            self.data = response.data.data.activities;
            self.data.view_cc_details = view_cc_details;
            if (view_cc_details == 1) {
                self.data.span_value = 3;
            } else {
                self.data.span_value = 2;
            }
            self.data.style_dot_image_url = style_dot_image_url;
            self.data.style_service_type_image_url = style_service_type_image_url;
            self.data.style_car_image_url = style_car_image_url;
            self.data.style_location_image_url = style_location_image_url;
            self.data.style_profile_image_url = style_profile_image_url;
            self.data.style_phone_image_url = style_car_image_url;
            self.data.style_modal_close_image_url = style_modal_close_image_url;
            self.data.style_question_image_url = style_question_image_url;
            self.data.style_checked_image_url = style_checked_image_url;
            self.data.verification = 1;
            self.data.page_title = "Approval";
            if (self.data.verification == 1 && (self.data.activityApprovalLevel == 1 || self.data.activityApprovalLevel == 3)) {
                $('.waiting_time_entry').show();
                $('.bo_waiting_time').datetimepicker({
                    format: 'HH:mm',
                    ignoreReadonly: true
                });
            }
            $rootScope.loading = false;
            self.data.cc_net_amount = self.data.cc_po_amount - self.data.bo_not_collected;
            $scope.differ = function() {
                $http.post(
                    laravel_routes['saveActivityDiffer'], {
                        activity_id: self.data.id,
                        bo_km_travelled: self.data.bo_km_travelled,
                        raw_bo_collected: self.data.raw_bo_collected,
                        raw_bo_not_collected: self.data.raw_bo_not_collected,
                        bo_deduction: self.data.bo_deduction,
                        bo_po_amount: self.data.bo_po_amount,
                        bo_net_amount: self.data.bo_net_amount,
                        bo_amount: self.data.bo_amount,

                    }
                ).then(function(response) {
                    $('.save').button('reset');
                    $("#reject-modal").modal("hide");
                    // console.log(response.data.data);
                    if (!response.data.data.success) {
                        var errors = '';
                        for (var i in response.data.data.errors) {
                            errors += '<li>' + response.data.errors[i] + '</li>';
                        }
                        custom_noty('error', errors);
                        return;
                    }
                    custom_noty('success', response.data.data.message);
                    item.selected = false;
                });
            }
            $('.viewData-toggle--inner.noToggle .viewData-threeColumn--wrapper').slideDown();
            $('#viewData-toggle--btn1').click(function() {
                $(this).toggleClass('viewData-toggle--btn_reverse');
                $('#viewData-threeColumn--wrapper1').slideToggle();
            });
            $('#viewData-toggle--btnasp').click(function() {
                $(this).toggleClass('viewData-toggle--btn_reverse');
                $('#viewData-threeColumn--wrapperasp').slideToggle();
            });
        });
    }

});