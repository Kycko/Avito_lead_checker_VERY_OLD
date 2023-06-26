// G  = global vars
function Gcolors() {
    var G = {};
    G.hl_green = '#93dfaf'; // hl = highlight
    G.hl_red   = '#ea9999'; // hl = highlight
    G.black    = '#000000'; // i.e. default font color
    G.brd_grey = '#cccccc'; // brd = cell borders
    return G;
}
function Greq_sheets() {
    var G = {};
    G.col_reqs = '[script] столбцы';
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
