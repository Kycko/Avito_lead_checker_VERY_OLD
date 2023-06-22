// wrapper means different functions have the same starting & ending processes
// task = what function have been launched
function MM_wrapper(task) {
    const cur_sheet = SpreadsheetApp.getActiveSheet();
    var data = get_sheet_values(cur_sheet);
    if (task === 'all' || task === 'rm_empty_RC') {
        data = rm_empty_RC_ARR(data, true); // RC = rows & columns; ARR = array
    }
    set_sheet_values(data, cur_sheet);
}

function MM_launch_all() {
    MM_wrapper('all');
}
function MM_rm_empty_RC() {
    MM_wrapper('rm_empty_RC');
}
