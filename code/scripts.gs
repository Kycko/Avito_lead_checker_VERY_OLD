function MM_script_evening_call_center() {
    // get the data
    const cur_sheet = SpreadsheetApp.getActiveSheet();
    var       table = SH_get_values(cur_sheet.getName(), SH_get_all_sheets_list());

    // modify the data
    table           = ARR_rm_RC    (table, 'columns', 0,  1);
    table           = ARR_rm_RC    (table, 'columns', 4,  2);
    table           = ARR_rm_RC    (table, 'columns', 12, 3);
    table           = ARR_crop     (table, 0, 0, table.length, 14);

    // write the final data
    SH_set_values(table, cur_sheet);
}
