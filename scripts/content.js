/*global Cursores, $, KeyboardEvent*/
(function () {
    'use strict';
    var cursores = new Cursores(),
        working = false,
        predictions = [],
        cache = Object.create(null),
        selector = [
            'input[type="text"]',
            'textarea'
        ];
    function caretDestroyed() {
        $(this).tooltip('destroy');
        predictions.length = 0;
    }
    function caretMoved(event) {
        var node = this,
            xhr = new XMLHttpRequest(),
            caretWord = cursores.token(this).value;
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var phrases = JSON.parse(xhr.responseText);
                if (phrases instanceof Array && phrases.length) {
                    var title = '',
                        tooltip,
                        i;
                    for (i = 0; i < phrases.length && i < 3; i += 1) {
                        if (phrases[i].phrase === caretWord) {
                            phrases.splice(i, 1);
                            i -= 1;
                        } else {
                            title += phrases[i].phrase + ' (Shift+' + i + ')<br>';
                            predictions.push(phrases[i].phrase);
                        }
                    }
                    $(node).tooltip({
                        animation: false,
                        container: 'body',
                        html: 'true',
                        placement: 'auto',
                        title: title,
                        trigger: 'manual',
                        viewport: {selector: 'body', padding: 100}
                    });
                    $(node).tooltip('show');
                    tooltip = $('.tooltip');
                    tooltip.offset({left: $(node).caret('offset').left - (tooltip.width() / 2)});
                    cache[caretWord] = xhr.responseText;
                }
            }
            if (xhr.readyState === 4) {
                working = false;
            }
        };
        if (working) {
            return false;
        }
        if (caretWord) {
            if (predictions.length && event.type === 'keyup' && event.shiftKey === true) {
                if (predictions[0] && event.which === 96) {
                    cursores.replace(this, predictions[0]);
                } else if (predictions[1] && event.which === 97) {
                    cursores.replace(this, predictions[1]);
                } else if (predictions[2] && event.which === 98) {
                    cursores.replace(this, predictions[1]);
                }
                caretDestroyed.call(this);
                return true;
            }
            working = true;
            caretDestroyed.call(this);
            xhr.open('GET', 'https://ac.duckduckgo.com/ac/?q=' + caretWord, true);
            xhr.send();
        } else {
            caretDestroyed.call(this);
            working = false;
        }
    }
    selector = selector.join(',');
    $('body').on('mouseup', selector, caretMoved);
    $('body').on('keyup', selector, caretMoved);
    $('body').on('blur', selector, caretDestroyed);
}());