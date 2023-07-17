// ищет в строке каждый элемент списка
function STR_find_sub_list(string, list, type='index') {
    for (var i=0; i < list.length; i+=1) {
        const result = STR_find_sub(string, list[i], type);
        if (result === true || result >= 0) {return result}
    }
}
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
    var phones = phone.split(',');
    for (var i=0; i < phones.length; i+=1) {
        phones[i] = phones[i].toString().replace(/\D+/g, '');
        if      (phones[i].toString().length === 10) {phones[i] = '7' + phones[i].toString()}
        else if (phones[i].toString().length === 11) {
            if (phones[i].toString().charAt(0) == '8') {phones[i] = '7' + phones[i].toString().slice(1)}
        }
        else if (phones[i].toString().length < 10) {phones[i] = '79999999999'}
    }

    for (var i=0; i < phones.length; i+=1) {
        if (phones.length > 1 && phones[i] === '79999999999') {phones.splice(i,1)}
    }
    return phones.join();
}
function STR_trim_city(city) {
    const search = ['г. ', 'г ', 'г.'];
    for (i=0; i < search.length; i+=1) {
        if (STR_find_sub(city, search[i]) === 0) {return city.replace(search[i], '')}
    }
    return city;
}
