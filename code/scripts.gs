function SCR_evening_СС() {
    // get the data
    const cur_sheet = SpreadsheetApp.getActiveSheet();
    let       table = SH_get_values(cur_sheet.getName(), SH_get_all_sheets_list());

    // modify the data
    // --- filter & rm bad cells text
    table = ARR_filter_rows_by_cell(table, ARR_search_in_list(table[0], 'Конечная категория'), 'Согласие');
    for (let item of ['Ответ не сохранен', 'Поле ввода не заполнено']) {
        table = ARR_rm_cells_by_full_text(table, item);
    }

    // --- search the columns
    // --- это заголовки для поиска, будут заменены на индексы столбцов
    let columns = {phone    : 'Телефон',
                   comment  : 'Комментарий',
                   goods    : 'Товары',
                   services : 'Услуги',
                   autosrv  : 'Автосервис. Как я могу к вам обращаться?'}
    for (let key of Object.keys(columns)) {columns[key] = ARR_search_in_list(table[0], columns[key])}

    // --- modifying
    for (let r=1; r < table.length; r++) {
        // собираем автосервисы
        if (columns.autosrv >= 0) {
            table[r][columns.autosrv] = table[r][columns.autosrv].toString();
            for (let i=columns.autosrv+1; i < table[r].length; i++) {
                if (table[r][columns.autosrv].length && table[r][i].length) {
                    table[r][columns.autosrv] += ' | ';
                }
                table[r][columns.autosrv] += table[r][i];
            }
        }

        // собираем комментарий
        let parts = ['comment', 'goods', 'services', 'autosrv'];
        let final = 'Дозвонились по номеру ' + table[r][columns.phone];
        for (let key of parts) {
            let item = table[r][columns[key]];
            if (item.length) {final += ' | ' + item}
        }
        table[r][columns.comment] = final;
    }

    let rm_list = ['TAM id',
                   'Статус звонка',
                   'Статус телефона',
                   'Сколько позиций в ассортименте',
                   'Товары',
                   'Услуги',
                   'Конечная категория',
                   'Категория клиента от КЦ (услуги)',
                   'ЗФ',
                   'Проект',
                   'Предполагаемая часовая зона'];
    table = ARR_rm_table_columns_by_titles(table, rm_list);
    table = ARR_crop                      (table, 0, 0, table.length, 9);
    table = ARR_move_RC                   (table, 'columns', 6, 8);
    table = ARR_move_RC                   (table, 'columns', 2, 7);

    // write the final data
    SH_set_values(table, cur_sheet);

    // sheet formatting
    cur_sheet.getRange(1, 1, table.length, table[0].length).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    cur_sheet.getRange(1, 1,            1, table[0].length).setBackground  (Gcolors().hl_light_orange);
    SH_pin_first_rows(cur_sheet);
}
function SCR_redash_TAM() {
    // confirmation dialog
    if (!UI_show_msg('Перед запуском этого скрипта необходимо:', Gtext().SCR_redash_TAM_confirm, true)) {return}
    
    // get the data
    const cur_sheet = SpreadsheetApp.getActiveSheet();
    let       table = SH_get_values(cur_sheet.getName(), SH_get_all_sheets_list());
    if (!ARR_search_in_list(table[0], 'Категория', 'bool', true)) {
        UI_show_msg('Выполнение отменено', 'В таблице отсутствует столбец "Категория".');
        return;
    }

    // modify the data
    // --- rm empty rows to avoid some cells filling
    let  empty = ARR_find_empty_RC    (table,      true);
    empty.rows = ARR_sort_numeric_list(empty.rows, false);
    for (let row of empty.rows) {table = ARR_rm_RC(table, 'rows', row)}

    // --- add mandatory columns (AC = add columns)
    let AC = {source       : 'Источник',
              lead_name    : 'Название лида',
              project_name : 'Наименование проекта'}
    for (let title of Object.values(AC)) {
        table = ARR_add_RC(table, 'columns', table[0].length);
        table[0][table[0].length-1] = title;
    }

    // --- search the columns & change the titles
    let options = {comment      : ['Comment__c',  'tags',        'comment'],
                   id_tam       : ['IDTAM_c',     'lead_id',     'tam_lead_id'],
                   source_tam   : ['lead_source', 'base_source'],
                   exclude      : ['has_phone',   'tam_lead_phone_source']}
    let columns = {address      : {search: 'address',          index: null, final: true,  multiple: false, title: null},
                   avito_id     : {search: 'avito_id',         index: null, final: true,  multiple: false, title: null},
                   category     : {search: 'Категория',        index: null, final: true,  multiple: false, title: null},
                   city         : {search: 'city',             index: null, final: true,  multiple: false, title: 'Регион и город'},
                   comment      : {search: options.comment,    index: null, final: true,  multiple: false, title: 'Комментарий'},
                   company      : {search: 'company',          index: null, final: true,  multiple: false, title: 'Название компании'},
                   email        : {search: 'email',            index: null, final: true,  multiple: true,  title: 'Рабочий e-mail'},
                   id_tam       : {search: options.id_tam,     index: null, final: true,  multiple: false, title: 'ID TAM'},
                   inn          : {search: 'INN',              index: null, final: true,  multiple: false, title: null},
                   lead_name    : {search: AC.lead_name,       index: null, final: true,  multiple: false, title: null},
                   phone        : {search: 'phone',            index: null, final: true,  multiple: true,  title: 'Основной телефон'},
                   population   : {search: 'population',       index: null, final: false, multiple: false, title: null},    // для определения GE/Service + ставить метку Big city
                   project_name : {search: AC.project_name,    index: null, final: true,  multiple: false, title: null},
                   region       : {search: 'region',           index: null, final: false, multiple: false, title: null},
                   site         : {search: 'website',          index: null, final: true,  multiple: true,  title: 'Корпоративный сайт'},
                   source       : {search: AC.source,          index: null, final: true,  multiple: false, title: null},
                   source_tam   : {search: options.source_tam, index: null, final: false, multiple: false, title: null}}    // для правильного названия проекта
    for (let key of Object.keys(options)) {
        let index = ARR_search_any_in_list(table[0], options[key]);
        if (index >= 0) {
            if (key === 'exclude') {table  [0][index]   = 'exclude_this_column'}
            else                   {columns[key].search = table[0][index]}
        }
    }

    let final_columns = []; // список номеров столбцов, которые останутся в самом конце
    for (let key of Object.keys(columns)) {
        let ind_list = ARR_list_all_found_indexes(table[0], columns[key].search, false);
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
        else {columns[key].index = undefined}
    }

    // --- join user data for blank cities
    for (let r=1; r < table.length; r++) {
        let c_city = columns.city.index;
        if (!table[r][c_city].length) {table[r][c_city] = table[r][columns.region.index]}
    }

    // --- fill source + project & lead names (we should know here some column index)
    let    title = 'Это выгрузка Call Center?';
    let      msg = 'Нажмите "Да", чтобы указать "Call Center" в названии проекта.\nИначе будет указано "Hunter".';
    if (UI_show_msg(title, msg, true)) {
        var  CC_or_hunter = 'Call Center';
        var source_filler = 'TAM с подогревом';
    }
    else {
        var  CC_or_hunter = 'Hunter';
        var source_filler = 'TAM';
    }

    for (let key of Object.keys(AC)) {
        let range = {r : 1,
                     c : columns[key].index,
                     h : table.length-1,
                     w : 1}
        if (key === 'source') {table = ARR_fill_cells(table, range, source_filler)}
        else if (ARR_search_in_list(['lead_name', 'project_name'], key, 'bool')) {
            let big_city = '';
            let     date = ' ' + new Date().toLocaleDateString('ru-RU');
            if (columns.population.index >= 0) {
                var vert = 'Service';
                if (!ARR_search_in_column(table, ['100k', '250k', 'not matched'], columns.population.index, 'bool', false)) {
                    big_city = ' Big city';
                }
            }
            else {var vert = 'GE'}
    
            if (key === 'project_name') {
                let txt = vert+' | TAM | '+CC_or_hunter;
                if (big_city.length) {txt += ' |'+big_city}
                table = ARR_fill_cells(table, range, txt);
            }
            else {
                let txt = vert+' TAM '+CC_or_hunter+' base_source'+big_city+date;
                for (let r=range.r; r < range.r+range.h; r++) {
                    if (columns.source_tam.index >= 0) {var temp = table[r][columns.source_tam.index]}
                    else                               {var temp = '2gis'}
                    table[r][columns.lead_name.index] = txt.replace('base_source', temp);
                }
            }
        }
    }

    // --- make the final table from the columns list
    for (let c = table[0].length-1; c >= 0 ; c--) {
        if (!final_columns.includes(c)) {table = ARR_rm_RC(table, 'columns', c)}
    }

    // write the final data
    SH_set_values(table, cur_sheet);
    
    // launch the basic checker
    MM_launch_all(false, false);
    UI_show_msg('Спецслово', 'Не забудьте добавить спец. слово в названия лидов и проекта, если это необходимо.');
}

function SCR_back_to_Job() {
    // get the data
    const cur_sheet = SpreadsheetApp.getActiveSheet();
    var       table = SH_get_values(cur_sheet.getName(), SH_get_all_sheets_list());

    // modify the data
    // --- rm empty rows to avoid some cells filling
    let  empty = ARR_find_empty_RC    (table,      true);
    empty.rows = ARR_sort_numeric_list(empty.rows, false);
    for (let row of empty.rows) {table = ARR_rm_RC(table, 'rows', row)}

    // --- add mandatory columns (AC = add columns)
    let AC = {category     : 'Категория',
              comment      : 'Комментарий',
              lead_name    : 'Название лида',
              project_name : 'Наименование проекта',
              source       : 'Источник'}
    table  = ARR_add_columns_with_titles(table, Object.values(AC), 0);

    // --- search the columns & change the titles
    let temp_man = ARR_search_in_list(table[0], 'ПМ', 'bool', true);
    temp_man = ['менеджер', 'ПМ'][Number(temp_man >= 0)]

    let columns = {avito_id     : {search: 'id',                   index: null, title: 'Авито-аккаунт'},
                   category     : {search: 'Категория',            index: null, title: null},
                   comment      : {search: 'Комментарий',          index: null, title: null},
                   company      : {search: 'Наименование клиента', index: null, title: 'Название компании'},
                   lead_name    : {search: 'Название лида',        index: null, title: null},
                   manager      : {search: temp_man,                   index: null, title: 'Ответственный менеджер в сделке'},
                   project_name : {search: 'Наименование проекта', index: null, title: null},
                   source       : {search: 'Источник',             index: null, title: null}}

    let indexes_left = [];  // здесь сохраним список не найденных столбцов
    for (let i=0; i < table[0].length; i++) {
        if (table[0][i].length) {indexes_left.push(i)}
    }

    for (let key of Object.keys(columns)) {
        let index  = ARR_search_in_list(table[0], columns[key].search, 'index', false);
        if (index >= 0) {
            indexes_left       = ARR_rm_list_items_by_text(indexes_left, index);
            columns[key].index = index;
            if (columns[key].title) {table[0][columns[key].index] = columns[key].title}
        }
        else {columns[key].index = undefined}
    }
    for (let i=0; i < indexes_left.length; i++) {indexes_left[i] = Number(indexes_left[i])}

    // fill AC columns
    for (let key of Object.keys(AC)) {
        if (key === 'comment') {
            if (indexes_left.length === 2) {
                let title1 = table[0][indexes_left[0]];
                let title2 = table[0][indexes_left[1]];
                for (let r=1; r < table.length; r++) {
                    let val1 = table[r][indexes_left[0]];
                    let val2 = table[r][indexes_left[1]];
                    table[r][columns.comment.index] = title1 + ': ' + val1 + ' | ' + title2 + ': ' + val2;
                }
            }
            else {
                UI_show_msg('Скрипт не выполнен', 'В таблице должны быть столбцы с тратами и количеством вакансий.');
                return;
            }
            indexes_left = ARR_sort_numeric_list(indexes_left, false);
            for (let ind of indexes_left) {table = ARR_rm_RC(table, 'columns', ind)}
        }
        else {
            if      (key === 'category')     {var txt = 'Вакансии'}
            else if (key === 'lead_name')    {var txt = 'Job U BTJ (back to job) ' + get_today()}
            else if (key === 'project_name') {var txt = 'Job | U | BTJ (back to job)'}
            else if (key === 'source')       {var txt = 'Активник'}
            let range = {r : 1,
                         c : columns[key].index,
                         h : table.length-1,
                         w : 1}
            table = ARR_fill_cells(table, range, txt)
        }
    }

    // swap names & surnames for managers
    for (let r=1; r < table.length; r++) {
        let temp = table[r][columns.manager.index].toString().split(' ');
        if (temp.length === 2) {table[r][columns.manager.index] = temp[1] + ' ' + temp[0]}
    }

    // write the final data
    SH_set_values(table, cur_sheet);

    // launch the basic checker
    MM_launch_all(false, false);
}
function SCR_Big_Data_Technology() {
    // get the data
    const cur_sheet = SpreadsheetApp.getActiveSheet();
    let       table = SH_get_values(cur_sheet.getName(), SH_get_all_sheets_list());

    // modify the data
    let rm_lists = ARR_find_empty_RC(table, true);
    if (rm_lists.rows) {
        for (let i = rm_lists.rows.length-1; i >= 0; i--) {table = ARR_rm_RC(table, 'rows', rm_lists.rows[i])}
    }

    table        = ARR_rm_RC (table, 'columns', ARR_search_in_list(table[0], 'Время звонка'));
    table        = ARR_rm_RC (table, 'columns', ARR_search_in_list(table[0], 'Продолжительность звонка (sec)'));
    table        = ARR_rm_RC (table, 'columns', ARR_search_in_list(table[0], 'Регион (из базы)'), 1);
    table        = ARR_rm_RC (table, 'columns', ARR_search_in_list(table[0], 'Категория'),        1);
    table        = ARR_add_RC(table, 'columns', 0, 5);
    table[0][0]  = 'Вертикаль';
    table[0][1]  = 'Источник';
    table[0][2]  = 'Название лида';
    table[0][3]  = 'Наименование проекта';
    table[0][4]  = 'Отчество';

    let columns = {comm : ARR_search_in_list(table[0], 'Комментарий'),
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
    for (let r=1; r < table.length; r++) {
        table[r][0] = table[r][columns.comm];
        table[r][1] = 'Big Data Technolodgy';
        table[r][2] = 'КЦ Big Data Technolodgy';
        table[r][3] = 'КЦ Big Data Technolodgy';

        let    temp = table[r][columns.name].split(' ');
        if (temp.length) {
            table[r][columns.name] = temp[0];
            temp.splice(0, 1);
            if (temp.length) {table[r][4] = temp.join(' ')}
        }

        for (let i=1; i<10; i++) {
            var title = table[0][columns[i.toString()]];
            var   txt = table[r][columns[i.toString()]];
            if (txt.length) {table[r][columns.comm] += ' | ' + title + ': ' + txt}
        }
    }

    let rm_list = [];
    for (let i=1; i<10; i++) {rm_list.push(columns[i.toString()])}
    rm_list.sort(function(a, b){return b-a});   // сортировка чисел по убыванию
    for (let i=0; i < rm_list.length; i++) {table = ARR_rm_RC(table, 'columns', rm_list[i])}

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

function SCR_CRMmrkg() {
    // узнаём тип выгрузки
    const       ui = SpreadsheetApp.getUi();
    const    types = {white: 'NWL', grey: 'B2C Grey', 'white/grey': 'особый вариант'};
    const typeKeys = Object.keys(types);
    let   curInput = '';
    while (!(ARR_search_in_list(typeKeys, curInput) >= 0)) {
        const resp = ui.prompt('Выберите проект', Gtext().ask_CRMmrkg_type, ui.ButtonSet.OK_CANCEL);
        if (resp.getSelectedButton() === ui.Button.OK) {curInput = resp.getResponseText()}
        else                                           {return}
    }
    let type = curInput.toLowerCase();

    // get the data
    const all_sheets_list = SH_get_all_sheets_list();
    var data              = {}
    data.cur_sheet        = SpreadsheetApp.getActiveSheet()
    data.cur              = SH_get_values(data.cur_sheet.getName(), all_sheets_list);
    data.log_cat          = SH_get_values(Greq_sheets().log_cat,    all_sheets_list, true);
    data.autocorr         = SH_get_values(Greq_sheets().autocorr,   all_sheets_list, true);

    const ind = {avito_ID : ARR_search_in_list(data.cur[0], 'external_user_id'),
                 avitoID2 : ARR_search_in_list(data.cur[0], 'external_id'),
                 cat      : ARR_search_in_list(data.cur[0], 'category', 'index', false),
                 email    : ARR_search_in_list(data.cur[0], 'email'),
                 company  : ARR_search_in_list(data.cur[0], 'name'),
                 phone    : ARR_search_in_list(data.cur[0], 'phone'),
                 region   : ARR_search_in_list(data.cur[0], 'region'),
                 region2  : ARR_search_in_list(data.cur[0], 'city')}

    if (ind.avito_ID >= 0) {data.cur[0][ind.avito_ID] = 'Авито-аккаунт'}
    if (ind.avitoID2 >= 0) {data.cur[0][ind.avitoID2] = 'Авито-аккаунт'}
    if (ind.email    >= 0) {data.cur[0][ind.email]    = 'Рабочий e-mail'}
    if (ind.company  >= 0) {data.cur[0][ind.company]  = 'Название компании'}
    if (ind.phone    >= 0) {data.cur[0][ind.phone]    = 'Основной телефон'}
    if (ind.region   >= 0) {data.cur[0][ind.region]   = 'Регион и город'}
    if (ind.region2  >= 0) {data.cur[0][ind.region2]  = 'Регион и город'}
    if (ind.cat      >= 0 && CRS('check_log_cat', data)) {
        data.cur[0][ind.cat] = 'Категория';
        for (let r=1; r < data.cur.length; r++) {
            let index = ARR_search_in_list(data.log_cat[0], data.cur[r][ind.cat]);
            if (index >= 0) {data.cur[r][ind.cat] = data.log_cat[1][index]}
        }
    }

    data.cur       = ARR_add_RC(data.cur, 'columns', 0);
    data.cur[0][0] = 'Комментарий';
    let exclude = [ // чтобы потом эти столбцы не удалялись
        ARR_search_in_list(data.cur[0], 'Авито-аккаунт'),
        ARR_search_in_list(data.cur[0], 'Категория'),
        ARR_search_in_list(data.cur[0], 'Комментарий'),
        ARR_search_in_list(data.cur[0], 'Название компании'),
        ARR_search_in_list(data.cur[0], 'Основной телефон'),
        ARR_search_in_list(data.cur[0], 'Рабочий e-mail'),
        ARR_search_in_list(data.cur[0], 'Регион и город'),
        ARR_search_in_list(data.cur[0], 'priority')
    ]
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
                if (data.cur[0][c] === 'transactions_30d') {
                    data.cur[r][c] = data.cur[r][c].toString().replace('.00000', '');
                }
                data.cur[r][0] += data.cur[0][c] + ': ' + data.cur[r][c].toString();
            }
        }
        if (data.cur[r][0].length) {data.cur[r][0] += '.'}
    }

    for (var c = data.cur[0].length-1; c >= 0; c-=1) {
        if (!ARR_search_in_list(exclude, c, 'bool')) {data.cur = ARR_rm_RC(data.cur, 'columns', c)}
    }

    data.cur       = ARR_add_RC(data.cur, 'columns', 0, 4);
    data.cur[0][0] = 'Источник';
    data.cur[0][1] = 'Название лида';
    data.cur[0][2] = 'Наименование проекта';
    data.cur[0][3] = 'Направление клиента';

    let      Pindx = ARR_search_in_list(data.cur[0], 'priority');
    let     rmRows = [];
    for (let r=1; r < data.cur.length; r++) {
        let projLabel = types[type];
        if (type === 'white/grey') {
            if (Pindx >= 0) {
                if (data.cur[r][Pindx] > 0 && data.cur[r][Pindx] < 4) {
                    projLabel = 'White ' + data.cur[r][Pindx];
                }
                else if (data.cur[r][Pindx] === '4') {projLabel = 'Grey 4'}
                else                               {rmRows.push(r)}
            }
            else {
                UI_show_msg('Выполнение скрипта отменено', 'В таблице отсутствует столбец "priority".');
                return;
            }
        }

        if (data.cur[r][4] !== '') {
            data.cur[r][0] = 'CRM маркетинг';
            data.cur[r][1] = 'GE CRMmrkg '     + projLabel + ' Hunter ' + Utilities.formatDate(new Date(), 'GMT+3', 'dd.MM.yyyy');
            data.cur[r][2] = 'GE | CRMmrkg | ' + projLabel + ' | Hunter';
            data.cur[r][3] = 'Core';
        }
    }

    for (let i = rmRows.length-1; i >= 0; i--) {data.cur = ARR_rm_RC(data.cur, 'rows', rmRows[i])}
    if  (Pindx >= 0)                           {data.cur = ARR_rm_RC(data.cur, 'columns',  Pindx)}

    // write the final data
    SH_set_values(data.cur, data.cur_sheet);

    // launch the basic checker
    MM_launch_all(false, true);
}
