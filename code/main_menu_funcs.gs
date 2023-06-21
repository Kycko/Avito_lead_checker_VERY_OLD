function launch_all() {
    rm_empty_rows_columns();
//    check_column_names();
//    pin_first_row();
//    add_filter();
//    sheet_text_formatting();
}
function rm_empty_rows_columns() {
    const cur_sheet = SpreadsheetApp.getActiveSheet();
    var data = get_sheet_values(cur_sheet);
    data = rm_empty_RC_ARR(data, true); // RC = rows & columns; ARR = array
    set_sheet_values(data, cur_sheet);
}
