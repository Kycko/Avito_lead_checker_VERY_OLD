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
    table = ARR_crop                 (table, 0, 0, table.length, 13);   // сколько столбцов останется, столько и указываем
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
function SCR_retention_ASD_goods() {SCR_retention_ASD('goods')}
function SCR_retention_ASD(type='common') {
    // get the data
    const cur_sheet = SpreadsheetApp.getActiveSheet();
    var       table = SH_get_values(cur_sheet.getName(), SH_get_all_sheets_list());

    // modify the data
    if (type === 'common') {table = ARR_rm_RC(table, 'rows', 0, 1)}
    table = ARR_rm_RC (table, 'columns', 0, 1);
    table = ARR_rm_RC (table, 'columns', 5 + Number(type === 'goods'), 2);
    table = ARR_add_RC(table, 'columns', 0, 3);

    table[0][0] = 'Источник';
    table[0][1] = 'Название лида';
    table[0][2] = 'Наименование проекта';

    const from      = ['Город',          'Phone',            'Phone1',           'Phone2'];
    const to        = ['Регион и город', 'Основной телефон', 'Основной телефон', 'Другой телефон'];
    for (var i=0; i < from.length; i+=1) {
        const index = ARR_search_in_list(table[0], from[i]);
        if (index >= 0) {table[0][index] = to[i]}
    }

    const ind = {
        date         : ARR_search_in_list(table[0], 'Дата и время последнего звонка'),
        source       : ARR_search_in_list(table[0], 'Источник'),
        comment      : ARR_search_in_list(table[0], 'Комментарий'),
        lead_name    : ARR_search_in_list(table[0], 'Название лида'),
        project_name : ARR_search_in_list(table[0], 'Наименование проекта')
    }
    for (var r=1; r < table.length; r+=1) {
        if (table[r][ind.date] !== '') {
            if (table[r][ind.comment].length) {table[r][ind.comment] += ' | '}              // добавляем звонок в комментарий
            table[r][ind.comment]     += table[0][ind.date] + ': ' + table[r][ind.date];    // добавляем звонок в комментарий
            table[r][ind.source]       = 'Retention ASD';                                   // добавляем источник

            if (type === 'goods') {const vert = 'GE'}
            else                  {const vert = 'Service'}
            table[r][ind.lead_name]    =   'VERT Retention ASD'.replace('VERT', vert);      // добавляем название лида
            table[r][ind.project_name] = 'VERT | Retention ASD'.replace('VERT', vert);      // добавляем наименование проекта
        }
    }

    table = ARR_crop (table, 0, 0, table.length, 9);    // сколько столбцов останется, столько и указываем

    // write the final data
    SH_set_values(table, cur_sheet);
    cur_sheet.getRange(1, 1, table.length, table[0].length).setBackground(null);

    // launch the basic checker
    MM_launch_all(false, false);
}
