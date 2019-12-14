app.component('activityStatusList', {
    templateUrl: activity_status_list_template_url,
    controller: function($http, $location, $window, HelperService, $scope, $routeParams, $rootScope, $location) {
        $scope.loading = true;
        var self = this;
        self.hasPermission = HelperService.hasPermission;

        var cols = [
            { data: 'action', searchable: false },
            { data: 'case_date', searchable: false },
            { data: 'number', name: 'cases.number', searchable: true },
            { data: 'asp_code', name: 'asps.asp_code', searchable: true },
            { data: 'sub_service', name: 'service_types.name', searchable: true },
            { data: 'asp_status', name: 'activity_asp_statuses.name', searchable: true },
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
                    data: function(d) {}
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

        $rootScope.loading = false;
    }
});
//------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------

app.component('activityStatusDelete', {
    controller: function($http, $location, $window, HelperService, $scope, $routeParams) {
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