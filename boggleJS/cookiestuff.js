function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
bkg = getCookie("back");
txt = getCookie("text");
doc = getCookie("docc");
if (bkg == "") {
    bkg = "EEEEEE";
    setCookie("back", "EEEEEE", 66);
}
if (txt == "") {
    txt = "002937";
    setCookie("text", "002937", 66);
}
if (doc == "") {
    doc = "abc";
    setCookie("docc", "7bc", 66);
}


var sheet = document.createElement('style')
sheet.innerHTML = "body{background-color: " + doc +";}\ndiv {color: " + txt + "; background-color: " + bkg + ";} div.word.score {background-color:" + bkg + ";} div.word.text {background-color:" + bkg + ";}";
document.body.appendChild(sheet);
//body {background-color: #abc;}

