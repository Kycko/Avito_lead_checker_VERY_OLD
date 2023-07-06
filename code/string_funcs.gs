function STR_find_sub(string, sub, type='index') {
    const index = string.toLowerCase().indexOf(sub.toLowerCase());
    if (index >= 0) {
        if (type === 'index') {return index}
        else                  {return true}
    }
}
function STR_check_email(string) {
    if ((string.match(/@/g)||[]).length != 1) {return false}
    else {
        const domain = ARR_last_item(string.split('@'));
        if      (!STR_find_sub(domain, '.', 'bool')) {return false}
        else if ( STR_find_sub(string, '|', 'bool')) {return false}
        else if ( STR_find_sub(string, ' ', 'bool')) {return false}
    }
    return true;
}
