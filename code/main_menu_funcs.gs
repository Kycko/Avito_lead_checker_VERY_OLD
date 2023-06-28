function MM_launch_all() {
    // get all the data
    var data = SH_get_all_sheets_data();
    CRS('launch_all', data);

    // change the data (only in memory, not in the sheets)
    data.cur = ARR_rm_empty_RC(data.cur, true); // RC = rows & columns; ARR = array
    if (CRS('check_column_names', data, show_msg=false)) {data = ARR_check_column_names(data)}

    // write all the changed data in the sheets + set formatting
    SH_set_values(data.cur, data.cur_sheet);
    if (CRS('sheet_text_formatting', data, show_msg=false)) {SH_text_formatting(data, true)}
    if (CRS('hl_bad_titles', data, show_msg=false)) {SH_hl_bad_titles(data)}
}
function MM_check_column_names() {
    var data = SH_get_all_sheets_data();
    if (CRS('check_column_names', data)) {
        data = ARR_check_column_names(data);
        SH_set_values(data.cur, data.cur_sheet);
        SH_hl_bad_titles(data);
    }
}
function MM_rm_empty_RC() {
    var data = SH_get_all_sheets_data();
    data.cur = ARR_rm_empty_RC(data.cur, true); // RC = rows & columns; ARR = array
    SH_set_values(data.cur, data.cur_sheet);
}
function MM_sheet_text_formatting() {
    var data = SH_get_all_sheets_data();
    if (CRS('sheet_text_formatting', data)) {SH_text_formatting(data)}
}
