function MM_launch_all() {
    var data = SH_get_all_sheets_data();

    data.cur = ARR_rm_empty_RC(data.cur, true); // RC = rows & columns; ARR = array
    SH_set_values(data.cur, data.cur_sheet);
    if (data.col_reqs) {
        SH_text_formatting(data);
    }
}
function MM_rm_empty_RC() {
    var data = SH_get_all_sheets_data();
    data.cur = ARR_rm_empty_RC(data.cur, true); // RC = rows & columns; ARR = array
    SH_set_values(data.cur, data.cur_sheet);
}
function MM_sheet_text_formatting() {
    var data = SH_get_all_sheets_data();
    if (data.col_reqs) {
        SH_text_formatting(data);
    }
}
