// G  = global vars
function Gcolors() {
    var G = {};
    G.hl_light_green  = '#e4ffed'; // hl = highlight
    G.hl_green        = '#93dfaf'; // hl = highlight
    G.hl_light_orange = '#fce5cd'; // hl = highlight
    G.hl_red          = '#ea9999'; // hl = highlight
    G.hl_yellow       = '#ffe599'; // hl = highlight
    G.black           = '#000000'; // i.e. default font color
    G.brd_grey        = '#cccccc'; // brd = cell borders
    return G;
}
function Gno_sheet_msgs() {
    var G = {};
    G.launch_all            = {title : 'Невозможно выполнить некоторые проверки',
                              sheets : ['col_reqs', 'autocorr', 'sugg', 'cities', 'cat', 'man', 'sources']}
    G.check_column_names    = {title : 'Невозможно проверить названия столбцов',
                              sheets : ['col_reqs', 'autocorr', 'sugg']}
    G.check_cities          = {title : 'Невозможно проверить города',
                              sheets : ['cities', 'autocorr']}
    G.check_categories      = {title : 'Невозможно проверить категории и вертикали',
                              sheets : ['cat', 'autocorr']}
    G.check_log_cat         = {title : 'Невозможно проверить категории',
                              sheets : ['log_cat', 'autocorr']}
    G.check_managers        = {title : 'Невозможно проверить менеджеров',
                              sheets : ['cat', 'man', 'cities']}
    G.check_sources         = {title : 'Невозможно проверить источники',
                              sheets : ['sources', 'autocorr']}
    G.hl_bad_titles         = {title : 'Невозможно подсветить неправильные названия столбцов',
                              sheets : ['col_reqs']}
    G.empty_req             = {title : '',
                              sheets : []}
    G.autocorr              = {title : 'Невозможно проверить',
                              sheets : ['autocorr']}
    G.sheet_text_formatting = {title : 'Невозможно выполнить форматирование ячеек',
                              sheets : ['col_reqs']}
    return G;
}
function Greq_sheets() {
    var G = {};
    G.col_reqs = '[script] столбцы';
    G.cities   = '[script] регионы и города';
    G.cat      = '[script] категории';
    G.log_cat  = '[script] logical category';
    G.man      = '[script] менеджеры';
    G.sources  = '[script] источники';
    G.sugg     = '[script] предложения исправлений';    // sugg = suggestions
    G.autocorr = '[script] автоисправления';
    return G;
}
function Gtext() {
    var G = {};

    // MM = main menu
    G.MM_title      = 'Проверка лидов перед загрузкой';
    G.MM_items      = [['🚀 Запустить все проверки, кроме менеджеров',                            'MM_launch_all_no_man'],
                       ['↻ Пересчитать ошибки и уникальные значения в столбцах (не меняет сами значения ячеек)', 'MM_count_errors'],
                       ['separator'],   // разделительная линия
                       ['▥ Проверить столбцы (наличие и названия)',                               'MM_check_column_names'],
                       ['▟ Удалить пустые строки и столбцы',                                      'MM_rm_empty_RC'],
                       ['▦ Исправить стиль ячеек и текста на всём листе',                         'MM_sheet_text_formatting'],
                       ['🔸 Подсветить пустые ячейки в выделенном диапазоне',                      'MM_highlight_blanks'],
                       ['🔸 Подсветить в выделенном диапазоне ячейки, в которых есть что-то кроме цифр', 'MM_highlight_not_numbers'],
                       ['❓ Вписать "Unknown" во все пустые ячейки выделенного диапазона',         'MM_add_Unknown'],
                       ['💬 Добавить выделенный диапазон в начало комментариев',                  'MM_add_comment_start'],
                       ['💬 Добавить выделенный диапазон в конец комментариев',                   'MM_add_comment_end'],
                       ['separator'],   // разделительная линия
                       ['[Аа Аа] Сделать в выделенном диапазоне первые буквы каждого слова прописными, остальные строчными', 'MM_fontcase_default_each'],
                       ['[Аа аа] Сделать в выделенном диапазоне первые буквы прописными, остальные строчными', 'MM_fontcase_default'],
                       ['[Аа аА] Сделать в выделенном диапазоне первую букву прописной, остальные не трогать', 'MM_fontcase_up_first'],
                       ['[АА АА] Сделать все буквы в выделенном диапазоне прописными',                'MM_fontcase_upper'],
                       ['[аа аа] Сделать все буквы в выделенном диапазоне строчными',                 'MM_fontcase_lower'],
                       ['separator'],   // разделительная линия
                       ['🏠 Проверить города в выделенном диапазоне',                             'MM_check_cities'],
                       ['🛠 Проверить категории в выделенном диапазоне',                           'MM_check_categories'],
                       ['💢 Проверить вертикали в выделенном диапазоне',                          'MM_check_verticals'],
                       ['💢 Проверить вертикали только в пустых ячейках выделенного диапазона',   'MM_check_verticals_blank'],
                       ['📘 Проверить источники в выделенном диапазоне',                           'MM_check_sources'],
                       ['📞 Проверить телефоны в выделенном диапазоне (менять неправильные на 79999999999)', 'MM_check_phones_main'],
                       ['📞 Проверить телефоны в выделенном диапазоне (удалять неправильные)',    'MM_check_phones_sec'],
                       ['👔 Сократить названия должностей в выделенном диапазоне',                'MM_check_job_titles'],
                       ['@ Проверить e-mail в выделенном диапазоне',                               'MM_check_emails'],
                       ['🌐 Проверить сайты в выделенном диапазоне',                              'MM_check_websites'],
                       ['📆 Проверить формат дат в выделенном диапазоне',                          'MM_check_dates']];

    G.MM_title_2    = 'Скрипты по проектам'
    G.MM_items_2    = [['Big Data Technology [обновлено 16.10.2023]',             'SCR_Big_Data_Technology'],
                       ['Retention ASD (товары и услуги) [обновлено 21.08.2023]', 'SCR_retention_ASD'],
                       ['separator'],   // разделительная линия
                       ['CRMmrkg grey [обновлено 16.10.2023]',                    'SCR_CRMmrkg_grey'],
                       ['CRMmrkg white [обновлено 16.10.2023]',                   'SCR_CRMmrkg_white'],
                       ['separator'],   // разделительная линия
                       ['Выгрузки TAM из Redash для КЦ (любой отчёт) [пока не работает]', 'SCR_redash_TAM'],
                       ['Вечерние базы КЦ (товары и услуги) [обновлено 15.11.2023]', 'SCR_evening_СС']]

    // others
    G.SCR_redash_TAM_confirm = '1. Скопировать выгруженные ID в таблицы отчётов Redash;\n2. Проверить категории и указать в заголовке нужного столбца "Категория"; другие столбцы категорий будут удалены;\n3. Разделить таблицу на отдельные по 5-6 тысяч строк.\n\nНажмите "Да", чтобы запустить скрипт, или "Нет", чтобы отменить выполнение.';

    return G;
}
function Gru_symbols() {
    return ['а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я'];
}
