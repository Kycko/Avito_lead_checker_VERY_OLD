function MM_launch_all() {
    var data = SH_get_all_sheets_data();
    data.cur = ARR_rm_empty_RC(data.cur, true); // RC = rows & columns; ARR = array
    SH_set_values(data.cur, data.cur_sheet);
    if (data.col_reqs) {SH_text_formatting(data);}
    else {
        UI_show_msg('Невозможно выполнить некоторые проверки', 'Отсутствует лист:\n' + Greq_sheets().col_reqs);
    }
}
function MM_check_column_names() {
    var data = SH_get_all_sheets_data();
    if (data.col_reqs && data.autocorr) {data = ARR_check_column_names(data)}
    else {
        UI_show_msg('Невозможно проверить названия столбцов',
                    'Отсутствуе(ю)т лист(ы):\n' +
                    Greq_sheets().col_reqs + '\n' +
                    Greq_sheets().autocorr);
    }
    SH_set_values(data.cur, data.cur_sheet);
}
function MM_rm_empty_RC() {
    var data = SH_get_all_sheets_data();
    data.cur = ARR_rm_empty_RC(data.cur, true); // RC = rows & columns; ARR = array
    SH_set_values(data.cur, data.cur_sheet);
}
function MM_sheet_text_formatting() {
    var data = SH_get_all_sheets_data();
    if (data.col_reqs) {SH_text_formatting(data);}
    else {
        UI_show_msg('Невозможно выполнить форматирование ячеек', 'Отсутствует лист:\n' + Greq_sheets().col_reqs);
    }
}
