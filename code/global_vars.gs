// G  = global vars
function Gcolors() {
    var G = {};
    G.hl_green = '#93dfaf'; // hl = highlight
    G.hl_red   = '#ea9999'; // hl = highlight
    G.black    = '#000000'; // i.e. default font color
    G.brd_grey = '#cccccc'; // brd = cell borders
    return G;
}
function Gno_sheet_msgs() {
    var G = {};
    G.launch_all = {
        title  : 'Невозможно выполнить некоторые проверки',
        sheets : ['col_reqs', 'autocorr']
    }
    G.check_column_names = {
        title  : 'Невозможно проверить названия столбцов',
        sheets : ['col_reqs', 'autocorr']
    }
    G.hl_bad_titles = {
        title  : 'Невозможно подсветить неправильные названия столбцов',
        sheets : ['col_reqs']
    }
    G.sheet_text_formatting = {
        title  : 'Невозможно выполнить форматирование ячеек',
        sheets : ['col_reqs']
    }
    return G;
}
function Greq_sheets() {
    var G = {};
    G.col_reqs = '[script] столбцы';
    G.col_vars = '[script] варианты столбцов';
    G.autocorr = '[script] автоисправления';
    return G;
}
function Gtext() {
    var G = {};

    // MM = main menu
    G.MM_title      = 'Проверка лидов перед загрузкой';
    G.MM_launch_all = ['🚀 Запустить все проверки', 'MM_launch_all'];
    G.MM_items      = [['▥ Проверить столбцы (наличие и названия)',       'MM_check_column_names'],
                       ['▟ Удалить пустые строки и столбцы',              'MM_rm_empty_RC'],
                       ['▦ Исправить стиль ячеек и текста на всём листе', 'MM_sheet_text_formatting']];

    return G;
}
