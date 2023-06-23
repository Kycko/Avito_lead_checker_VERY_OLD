function MM_launch_all() {
    const cur_sheet = SpreadsheetApp.getActiveSheet();
    var   data      = SH_get_values(cur_sheet);
    var   col_reqs  = SH_get_req_values();      // col_reqs = column requirements

    data = ARR_rm_empty_RC(data, true);         // RC = rows & columns; ARR = array
    SH_set_values(data, cur_sheet);

    if (col_reqs) {
        SH_text_formatting(cur_sheet, col_reqs, data);
    }
}
function MM_rm_empty_RC() {
    const cur_sheet = SpreadsheetApp.getActiveSheet();
    var data = SH_get_values(cur_sheet);
    data     = ARR_rm_empty_RC(data, true);     // RC = rows & columns; ARR = array
    SH_set_values(data, cur_sheet);
}
function MM_sheet_text_formatting() {
    const cur_sheet = SpreadsheetApp.getActiveSheet();
    var   data      = SH_get_values(cur_sheet);
    var   col_reqs  = SH_get_req_values();      // col_reqs = column requirements

    if (col_reqs) {
        SH_text_formatting(cur_sheet, col_reqs, data);
    }
}
