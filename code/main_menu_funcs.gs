// wrapper means different functions have the same starting & ending processes
// task = what function have been launched
function MM_wrapper(task) {
    const cur_sheet = SpreadsheetApp.getActiveSheet();
    var data = SH_get_values(cur_sheet);

    var check = ARR_search_in_list(['all', 'sheet_text_formatting'], task, 'bool');
    if (check) {
        var req_sheet = SH_check_availability(Greq_sheets().columns, 'Некоторые проверки не будут выполнены');
        if (req_sheet) {
            var col_reqs = SH_get_values(req_sheet);    // col_reqs = column requirements
        }
    }

    check = ARR_search_in_list(['all', 'rm_empty_RC'], task, 'bool');
    if (check) {
        data = ARR_rm_empty_RC(data, true);             // RC = rows & columns; ARR = array
    }

    check = ARR_search_in_list(['all', 'rm_empty_RC'], task, 'bool');
    if (check) {
        SH_set_values(data, cur_sheet);
    }

    const cond1 = Boolean(req_sheet);
    const cond2 = ARR_search_in_list(['all', 'sheet_text_formatting'], task, 'bool');
    if (cond1 && cond2) {
        SH_text_formatting(cur_sheet, col_reqs, data);
    }
}

function MM_launch_all() {
    MM_wrapper('all');
}
function MM_rm_empty_RC() {
    MM_wrapper('rm_empty_RC');
}
function MM_sheet_text_formatting() {
    MM_wrapper('sheet_text_formatting');
}
