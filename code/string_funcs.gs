function STR_find_sub(string, sub, type='index') {
    const index = string.toString().toLowerCase().indexOf(sub.toString().toLowerCase());
    if (index >= 0) {
        if (type === 'index') {return index}
        else                  {return true}
    }
}
function STR_check_email(string) {
    if      (string == '')                         {return true}
    else if ((string.match(/@/g)||[]).length != 1) {return false}
    else {
        const domain = ARR_last_item(string.split('@'));
        if      (!STR_find_sub(domain, '.', 'bool')) {return false}
        else if ( STR_find_sub(string, '|', 'bool')) {return false}
        else if ( STR_find_sub(string, '’', 'bool')) {return false}
        else if ( STR_find_sub(string, ' ', 'bool')) {return false}
    }
    return true;
}
function STR_format_phone(phone) {
    phone = phone.replace(/\D+/g, '');
    return phone;
}
function STR_trim_city(city) {
    const search = ['г. ', 'г ', 'г.'];
    for (i=0; i < search.length; i+=1) {
        if (STR_find_sub(city, search[i]) === 0) {return city.replace(search[i], '')}
    }
    return city;
}
