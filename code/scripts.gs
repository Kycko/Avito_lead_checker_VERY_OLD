function SCR_evening_СС_goods() {SCR_evening_СС('goods')}
function SCR_evening_СС(type='common') {
    // get the data
    const cur_sheet = SpreadsheetApp.getActiveSheet();
    var       table = SH_get_values(cur_sheet.getName(), SH_get_all_sheets_list());

    // modify the data
    table = ARR_filter_rows_by_cell  (table, ARR_search_in_list(table[0], 'Конечная категория'), 'Согласие')

    if (type === 'goods') {
        for (var r=0; r < table.length; r+=1) {
            if (table[r][21].length) {
                for (var i=22; i < table[r].length-2; i+=1) {
                    table[r][21] += ' | ' + table[r][i];
                }
            }
        }
        table        = ARR_move_RC(table, 'columns', 21, 12);
        table[0][12] = 'Автосервис';
    }

    table = ARR_rm_RC                (table, 'columns',  0,  1);
    table = ARR_rm_RC                (table, 'columns',  4,  2);
    table = ARR_rm_RC                (table, 'columns', 10,  1);
    table = ARR_rm_RC                (table, 'columns', 11,  3);
    table = ARR_crop                 (table, 0, 0, table.length, 13);
    table = ARR_move_RC              (table, 'columns',  3,  5);
    table = ARR_move_RC              (table, 'columns',  7,  5);
    table = ARR_move_RC              (table, 'columns',  8,  9);
    table = ARR_rm_cells_by_full_text(table, 'Ответ не сохранен');

    // write the final data
    SH_set_values(table, cur_sheet);

    // sheet formatting
    cur_sheet.getRange(1, 1, table.length, table[0].length).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    cur_sheet.getRange(1, 1,            1, table[0].length).setBackground  (Gcolors().hl_light_orange);
    SH_pin_first_rows(cur_sheet);
}
