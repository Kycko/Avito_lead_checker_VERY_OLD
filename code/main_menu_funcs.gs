function MM_launch_all() {
    // get all the data
    var data = SH_get_all_sheets_data();
    CRS('launch_all', data);

    // change the data (only in memory, not in the sheets)
    data = ARR_rm_empty_RC(data, true); // RC = rows & columns; ARR = array
    if (CRS('check_column_names', data, show_msg=false)) {data = ARR_check_column_names(data)}
    data = ARR_check_user_data(data);

    // write all the changed data in the sheets
    SH_set_values(data.cur, data.cur_sheet);

    // sheet formatting
    SH_pin_first_row();
    SH_add_main_filter(data.cur_sheet);
    if (CRS('sheet_text_formatting', data, show_msg=false)) {SH_text_formatting(data)}
    if (CRS('hl_bad_titles', data, show_msg=false)) {data = SH_hl_bad_titles(data)}
    SH_hl_cells(data);
}
function MM_check_column_names() {
    var data = SH_get_all_sheets_data();
    if (CRS('check_column_names', data)) {
        data = ARR_check_column_names(data);
        SH_set_values(data.cur, data.cur_sheet);
        data = SH_hl_bad_titles(data);
        SH_hl_cells(data);
    }
}
function MM_check_emails() {
    var data  = SH_get_all_sheets_data();
    var range = data.cur_sheet.getActiveRange();
    data  = ARR_check_emails(data, range.getRow()-1, range.getColumn()-1, range.getHeight(), range.getWidth());
    SH_set_range_values(data.cur, range);
    SH_hl_cells(data);
}
function MM_rm_empty_RC() {
    var data = SH_get_all_sheets_data();
    data = ARR_rm_empty_RC(data, true);     // RC = rows & columns; ARR = array
    SH_set_values(data.cur, data.cur_sheet);
    SH_hl_cells(data);
}
function MM_sheet_text_formatting() {
    var data = SH_get_all_sheets_data();
    if (CRS('sheet_text_formatting', data)) {SH_text_formatting(data)}
}
