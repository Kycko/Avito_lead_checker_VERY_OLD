function SCR_evening_СС(type='common') {
    // get the data
    const cur_sheet = SpreadsheetApp.getActiveSheet();
    var       table = SH_get_values(cur_sheet.getName(), SH_get_all_sheets_list());

    // modify the data
    table = ARR_filter_rows_by_cell(table, ARR_search_in_list(table[0], 'Конечная категория'), 'Согласие');

    // only for goods, not for services
    var indx_autosrv = ARR_search_in_list(table[0], 'Автосервис. Как я могу к вам обращаться?');
    if (indx_autosrv >= 0) {
        for (var r=0; r < table.length; r+=1) {
            table[r][indx_autosrv] = table[r][indx_autosrv].toString();
            if (table[r][indx_autosrv].length) {
                table[r][indx_autosrv] = table[r][indx_autosrv].replace('Поле ввода не заполнено', '');
                for (var i=indx_autosrv+1; i < table[r].length; i+=1) {
                    var dont_add = ['Поле ввода не заполнено',
                                    'Ответ не сохранен'];
                    if (table[r][i].length && !ARR_search_in_list(dont_add, table[r][i], type='bool')) {
                        if (table[r][indx_autosrv].length) {table[r][indx_autosrv] += ' | '}
                        table[r][indx_autosrv] += table[r][i];
                    }
                }
            }
        }
        var indx_srv         = ARR_search_in_list(table[0], 'Услуги');
        table                = ARR_move_RC       (table,    'columns', indx_autosrv, indx_srv+1);
        table[0][indx_srv+1] = 'Автосервис';
    }
    // -----------------------------

    var rm_list = ['TAM id',
                   'Статус звонка',
                   'Статус телефона',
                   'Сколько позиций в ассортименте',
                   'Конечная категория',
                   'ЗФ',
                   'Проект',
                   'Предполагаемая часовая зона'];
    table = ARR_rm_table_columns_by_titles(table, rm_list);

    table = ARR_crop                 (table, 0, 0, table.length, 13); // сколько столбцов останется, столько и указываем
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
function SCR_redash_TAM() {
    // confirmation dialog
    if (UI_show_msg('Перед запуском этого скрипта необходимо:', Gtext().SCR_redash_TAM_confirm, true)) {
        // get the data
        const cur_sheet = SpreadsheetApp.getActiveSheet();
        var       table = SH_get_values(cur_sheet.getName(), SH_get_all_sheets_list());

        // modify the data
        // --- search the columns & change the titles
        var options = {comment  : ['Comment__c', 'tags',    'comment'],
                       id_tam   : ['IDTAM_c',    'lead_id', 'tam_lead_id'],
                       exclude  : ['has_phone',  'tam_lead_phone_source']}
        var columns = {address  : {search: 'address',       index: null, final: true,  multiple: false, title: null},
                       avito_id : {search: 'avito_id',      index: null, final: true,  multiple: false, title: null},
                       category : {search: 'Категория',     index: null, final: true,  multiple: false, title: null},
                       city     : {search: 'city',          index: null, final: true,  multiple: false, title: null},
                       comment  : {search: options.comment, index: null, final: true,  multiple: false, title: 'Комментарий'},
                       company  : {search: 'company',       index: null, final: true,  multiple: false, title: 'Название компании'},
                       email    : {search: 'email',         index: null, final: true,  multiple: true,  title: null},
                       id_tam   : {search: options.id_tam,  index: null, final: true,  multiple: false, title: null},
                       inn      : {search: 'INN',           index: null, final: true,  multiple: false, title: null},
                       phone    : {search: 'phone',         index: null, final: true,  multiple: true,  title: 'Основной телефон'},
                       region   : {search: 'region',        index: null, final: false, multiple: false, title: null},
                       site     : {search: 'website',       index: null, final: true,  multiple: true,  title: 'Корпоративный сайт'}}
        Object.keys(options).forEach(key => {
            var index = ARR_search_any_in_list(table[0], options[key]);
            if (index >= 0) {
                if (key === 'exclude') {table[0][index]     = 'exclude_this_column'}
                else                   {columns[key].search = table[0][index]}
            }
        });

        var final_columns = []; // список номеров столбцов, которые останутся в самом конце
        Object.keys(columns).forEach(key => {
            var ind_list = ARR_list_all_found_indexes(table[0], columns[key].search, false);
            if (ind_list.length) {
                if (columns[key].final) {final_columns.push(ind_list[0])}
                columns[key].index = ind_list[0];
                if (columns[key].multiple) {
                    ind_list.slice(1).forEach((item) => {
                        table = ARR_join_two_columns(table, item, columns[key].index, 1, null, ',');
                    });
                }
                if (columns[key].title && columns[key].index >= 0) {table[0][columns[key].index] = columns[key].title}
            }
        });

        // --- join user data for blank cities
        table.forEach((row, index) => {
            if (index > 0) {
                if (!row[columns.city.index].length) {table[index][columns.city.index] = row[columns.region.index]}
            }
        });

        // --- make the final table from the columns list
        for (var c = table[0].length-1; c >= 0 ; c--) {
            if (!final_columns.includes(c)) {table = ARR_rm_RC(table, 'columns', c)}
        }

        // write the final data
        SH_set_values(table, cur_sheet);

        // launch the basic checker
        // MM_launch_all(false, false);
    }
}

function SCR_Big_Data_Technology() {
    // get the data
    const cur_sheet = SpreadsheetApp.getActiveSheet();
    var       table = SH_get_values(cur_sheet.getName(), SH_get_all_sheets_list());

    // modify the data
    var rm_lists = ARR_find_empty_RC(table, true);
    if (rm_lists.rows) {
        for (var i = rm_lists.rows.length-1; i >= 0; i-=1) {table = ARR_rm_RC(table, 'rows', rm_lists.rows[i])}
    }

    table        = ARR_rm_RC        (table, 'columns', ARR_search_in_list(table[0], 'Время звонка'));
    table        = ARR_rm_RC        (table, 'columns', ARR_search_in_list(table[0], 'Продолжительность звонка (sec)'));
    table        = ARR_rm_RC        (table, 'columns', ARR_search_in_list(table[0], 'Регион (из базы)'), 1);
    table        = ARR_rm_RC        (table, 'columns', ARR_search_in_list(table[0], 'Категория'),        1);
    table        = ARR_add_RC       (table, 'columns', 0, 5);
    table[0][0]  = 'Вертикаль';
    table[0][1]  = 'Источник';
    table[0][2]  = 'Название лида';
    table[0][3]  = 'Наименование проекта';
    table[0][4]  = 'Отчество';

    var columns = {comm : ARR_search_in_list(table[0], 'Комментарий'),
                   1    : ARR_search_in_list(table[0], 'ФИО (из базы)'),
                   2    : ARR_search_in_list(table[0], 'Категория (из базы)'),
                   3    : ARR_search_in_list(table[0], 'Количество в ассортименте (из базы)'),
                   4    : ARR_search_in_list(table[0], 'Категория (из диалога)'),
                   5    : ARR_search_in_list(table[0], 'Количество в ассортименте (из диалога)'),
                   6    : ARR_search_in_list(table[0], 'Количество в наличии (из диалога)'),
                   7    : ARR_search_in_list(table[0], 'Постоянная продажа'),
                   8    : ARR_search_in_list(table[0], 'Регионы доставки услуг (из диалога)'),
                   9    : ARR_search_in_list(table[0], 'Время для звонка'),
                   name : ARR_search_in_list(table[0], 'ФИО (из диалога)'),
                   cat  : ARR_search_in_list(table[0], 'Подкатегория ')}
    table[0][columns.name] = 'Имя';
    table[0][columns.cat ] = 'Категория';
    for (var r=1; r < table.length; r+=1) {
        table[r][0] = table[r][columns.comm];
        table[r][1] = 'Big Data Technolodgy';
        table[r][2] = 'КЦ Big Data Technolodgy';
        table[r][3] = 'КЦ Big Data Technolodgy';

        var    temp = table[r][columns.name].split(' ');
        if (temp.length) {
            table[r][columns.name] = temp[0];
            temp.splice(0, 1);
            if (temp.length) {table[r][4] = temp.join(' ')}
        }

        for (var i=1; i<10; i+=1) {
            var title = table[0][columns[i.toString()]];
            var   txt = table[r][columns[i.toString()]];
            if (txt.length) {table[r][columns.comm] += ' | ' + title + ': ' + txt}
        }
    }

    var rm_list = [];
    for (var i=1; i<10; i+=1) {rm_list.push(columns[i.toString()])}
    rm_list.sort(function(a, b){return b-a});   // сортировка чисел по убыванию
    for (var i=0; i < rm_list.length; i+=1) {table = ARR_rm_RC(table, 'columns', rm_list[i])}

    const from = ['Контактный телефон (из базы)',
                  'Город (из базы)',
                  'Подкатег'];
    const to   = ['Основной телефон',
                  'Регион и город',
                  'Категория'];
    for (var i=0; i < from.length; i+=1) {
        const index = ARR_search_in_list(table[0], from[i]);
        if (index >= 0) {table[0][index] = to[i]}
    }

    // write the final data
    SH_set_values(table, cur_sheet);

    // launch the basic checker
    MM_launch_all(false, false);
}
function SCR_retention_ASD() {
    // get the data
    const cur_sheet = SpreadsheetApp.getActiveSheet();
    var       table = SH_get_values(cur_sheet.getName(), SH_get_all_sheets_list());

    // modify the data
    while (STR_find_sub(table[0][0], 'Result_ishod', 'bool')) {table = ARR_rm_RC(table, 'rows', 0, 1)}
    if    (STR_find_sub(table[1][0], 'товары',       'bool')) {var vert = 'GE'}
    else                                                      {var vert = 'Service'}

    table       = ARR_rm_RC (table, 'columns', 0, 1);
    table       = ARR_rm_RC (table, 'columns', ARR_search_in_list(table[0], 'Результат звонка'), 2);
    table       = ARR_add_RC(table, 'columns', 0, 3);
    table[0][0] = 'Источник';
    table[0][1] = 'Название лида';
    table[0][2] = 'Наименование проекта';

    const  from = ['Город',          'Phone',            'Phone1',           'Phone2'];
    const  to   = ['Регион и город', 'Основной телефон', 'Основной телефон', 'Другой телефон'];
    for (var i=0; i < from.length; i+=1) {
        const index = ARR_search_in_list(table[0], from[i]);
        if (index >= 0) {table[0][index] = to[i]}
    }

    const ind = {
        date         : ARR_search_in_list(table[0], 'Дата и время последнего звонка'),
        source       : ARR_search_in_list(table[0], 'Источник'),
        category     : ARR_search_in_list(table[0], 'Категория'),
        comment      : ARR_search_in_list(table[0], 'Комментарий'),
        lead_name    : ARR_search_in_list(table[0], 'Название лида'),
        project_name : ARR_search_in_list(table[0], 'Наименование проекта')
    }
    for (var r=1; r < table.length; r+=1) {
        if (table[r][ind.date] !== '') {
            if (table[r][ind.comment].length) {table[r][ind.comment] += ' | '}              // добавляем звонок в комментарий
            table[r][ind.comment]     += table[0][ind.date] + ': ' + table[r][ind.date];    // добавляем звонок в комментарий
            table[r][ind.source]       = 'Retention ASD';                                   // добавляем источник
            table[r][ind.lead_name]    =   'VERT Retention ASD'.replace('VERT', vert);      // добавляем название лида
            table[r][ind.project_name] = 'VERT | Retention ASD'.replace('VERT', vert);      // добавляем наименование проекта

            // автоисправление категорий
            if (table[r][ind.category] == 'Lifestyle') {table[r][ind.category] = 'Личные вещи'}
        }
    }

    table = ARR_crop (table, 0, 0, table.length, 9);    // сколько столбцов останется, столько и указываем

    // write the final data
    SH_set_values(table, cur_sheet);
    cur_sheet.getRange(1, 1, table.length, table[0].length).setBackground(null);

    // launch the basic checker
    MM_launch_all(false, true);
}

function SCR_CRMmrkg_grey()  {SCR_CRMmrkg_WG('B2C Grey')}
function SCR_CRMmrkg_white() {SCR_CRMmrkg_WG('NWL')}
function SCR_CRMmrkg_WG(type) {
    // get the data
    const all_sheets_list = SH_get_all_sheets_list();
    var data              = {}
    data.cur_sheet        = SpreadsheetApp.getActiveSheet()
    data.cur              = SH_get_values(data.cur_sheet.getName(), all_sheets_list);
    data.log_cat          = SH_get_values(Greq_sheets().log_cat,    all_sheets_list, true);
    data.autocorr         = SH_get_values(Greq_sheets().autocorr,   all_sheets_list, true);

    // modify the data
    // old code to delete e-mail & phone hashes
    // var index  = ARR_search_in_list(data.cur[0], 'email');
    // if (index >= 0) {data.cur = ARR_rm_RC(data.cur, 'columns', index)}
    // index      = ARR_search_in_list(data.cur[0], 'phone');
    // if (index >= 0) {data.cur = ARR_rm_RC(data.cur, 'columns', index)}

    const ind = {avito_ID : ARR_search_in_list(data.cur[0], 'external_user_id'),
                 cat      : ARR_search_in_list(data.cur[0], 'logical_category'),
                 email    : ARR_search_in_list(data.cur[0], 'email'),
                 company  : ARR_search_in_list(data.cur[0], 'name'),
                 phone    : ARR_search_in_list(data.cur[0], 'phone'),
                 region   : ARR_search_in_list(data.cur[0], 'region')}

    if (ind.avito_ID >= 0) {data.cur[0][ind.avito_ID] = 'Авито-аккаунт'}
    if (ind.email    >= 0) {data.cur[0][ind.email]    = 'Рабочий e-mail'}
    if (ind.company  >= 0) {data.cur[0][ind.company]  = 'Название компании'}
    if (ind.phone    >= 0) {data.cur[0][ind.phone]    = 'Основной телефон'}
    if (ind.region   >= 0) {data.cur[0][ind.region]   = 'Регион и город'}
    if (ind.cat      >= 0 && CRS('check_log_cat', data)) {
        data.cur[0][ind.cat] = 'Категория';
        for (var r=1; r < data.cur.length; r+=1) {
            index = ARR_search_in_list(data.log_cat[0], data.cur[r][ind.cat]);
            if (index >= 0) {data.cur[r][ind.cat] = data.log_cat[1][index]}
        }
    }

    data.cur       = ARR_add_RC(data.cur, 'columns', 0);
    data.cur[0][0] = 'Комментарий';
    var exclude = [ARR_search_in_list(data.cur[0], 'Авито-аккаунт'),
                   ARR_search_in_list(data.cur[0], 'Категория'),
                   ARR_search_in_list(data.cur[0], 'Комментарий'),  // чтобы потом этот столбец не удалялся
                   ARR_search_in_list(data.cur[0], 'Название компании'),
                   ARR_search_in_list(data.cur[0], 'Основной телефон'),
                   ARR_search_in_list(data.cur[0], 'Рабочий e-mail'),
                   ARR_search_in_list(data.cur[0], 'Регион и город')]
    for (var i = exclude.length-1; i>=0; i--) {
        if (exclude[i] >= 0) {Logger.log('exclude OK')}
        else                 {exclude.splice(i, 1)}
    }
    for (var r=1; r < data.cur.length; r++) {
        for (var c=1; c < data.cur[r].length; c++) {
            if (data.cur[r][c].toString() === 'None') {
                if      (data.cur[0][c] === 'Основной телефон') {data.cur[r][c] = '79999999999'}
                else if (data.cur[0][c] === 'Рабочий e-mail')   {data.cur[r][c] = ''}
            }
            else if (data.cur[0][c] === 'Регион и город' && data.cur[r][c].toString() === 'другой регион') {
                data.cur[r][c] = 'Другие регионы России';
            }

            if (data.cur[r][c].toString().length && !ARR_search_in_list(exclude, c, 'bool')) {
                if (data.cur[r][0].length) {data.cur[r][0] += ', '}
                data.cur[r][0] += data.cur[0][c] + ' ' + data.cur[r][c].toString();
            }
        }
        if (data.cur[r][0].length) {data.cur[r][0] += '.'}
    }

    for (var c = data.cur[0].length-1; c >= 0; c-=1) {
        if (!ARR_search_in_list(exclude, c, 'bool')) {data.cur = ARR_rm_RC(data.cur, 'columns', c)}
    }

    data.cur       = ARR_add_RC(data.cur, 'columns', 0, 3);
    data.cur[0][0] = 'Источник';
    data.cur[0][1] = 'Название лида';
    data.cur[0][2] = 'Наименование проекта';
    for (var r=1; r < data.cur.length; r+=1) {
        if (data.cur[r][3] !== '') {
            data.cur[r][0] = 'CRM маркетинг';
            data.cur[r][1] = 'GE CRMmrkg '     + type + ' Hunter ' + Utilities.formatDate(new Date(), 'GMT+3', 'dd.MM.yyyy');
            data.cur[r][2] = 'GE | CRMmrkg | ' + type + ' | Hunter';
        }
    }

    // write the final data
    SH_set_values(data.cur, data.cur_sheet);

    // launch the basic checker
    MM_launch_all(false, true);
}
