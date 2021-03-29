let cword='';
let kc;
let found=[];
let tscore=0;
let finished=false;
textbox=document.getElementsByClassName("textbox")[0];
wordbox=document.getElementsByClassName("words")[0];
scorebox=document.getElementsByClassName("scorebox")[0];
timer=document.getElementsByClassName("timer")[0];
boardelement=document.getElementsByClassName("board")[0];
function resize(){
    height=window.innerHeight;
    width=window.innerWidth;
    textbox.style.left=(width-360)/2+"px";
    boardelement.style.left=(width-360)/2+"px";
}
resize();
function setTile(x,y,t){
    document.getElementsByClassName("row")[y].children[x].innerHTML=t;
}
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
let sarr=[];
for (i=0;i<sz*sz;i++){
    sarr.push(i);
}
let si=shuffle(sarr);
let board=[]
for (var i=0;i<sz;i++){
    for (var j=0;j<sz;j++){
        lt=dice[si[i*sz+j]][Math.floor(Math.random()*6)];
        board=board.concat(lt)
        setTile(i,j,lt.replace('Q','Qu'));
    }
}
window.onkeydown=function(k){
    k.preventDefault();
    kc=k.keyCode;
    if (!finished && !k.repeat && !k.ctrlKey){
        if (kc>64&&kc<91&&cword.replace('QU','Q').length<16){
            cword+="ABCDEFGHIJKLMNOPQRSTUVWXYZ"[kc-65];
        } else if (kc==32 || kc==13){
            if (cword.length>sz-2){
                if (onBoard(cword)){
                    if (isWord(cword)){
                        if (found.indexOf(cword)!=-1){
                            colorfadein('#a7f')
                        } else {
                            found=found.concat(cword);
                            colorfadein('#5f3')
                            addWord(cword);
                            wordbox.style.height=26*found.length;
                        }
                    } else {
                        colorfadein('#ff7')
                    }
                } else {
                    colorfadein('#faa');
                }
            }
            cword='';
        } else if (kc==8){
            if (cword.length<2){
                cword='';
            } else {
                cword=cword.slice(0,-1);
            }
        }
        textbox.innerHTML=cword;
    }
}
function colorfadein(hx){
    textbox.style.backgroundColor = hx;
    setTimeout(function(){textbox.style.backgroundColor=bkg},160)
}
function onBoard(w){
    for (let x=0;x<sz;x++){
        for (let y=0;y<sz;y++){
            if (adj(x,y,w.replace('QU','Q'),[])){
                return true;
            }
        }
    }
    return false;
}
function isWord(w){
    return w.toLowerCase() in words;
}
function adj(x,y,rem,prev){
    if (rem==""){
        return true;
    }
    if (prev.indexOf(sz*x+y)!=-1){
        return false;
    }
    if (x>=0&&x<sz&&y>=0&&y<sz&&rem[0]==board[x*sz+y]){
        for (let dx=-1;dx<2;dx++){
            for (let dy=-1;dy<2;dy++){
                if (dx!=0||dy!=0){
                    if (adj(x+dx,y+dy,rem.slice(1),prev.concat(x*sz+y))){
                        return true;
                    }
                }
            }
        }
    }
    return false;
}
function addWord(w){
    var wDiv = wordbox.appendChild(document.createElement("div"));
    wDiv.className="word";
    var tDiv = wDiv.appendChild(document.createElement("div"));
    tDiv.className="word text";
    var sDiv = wDiv.appendChild(document.createElement("div"));
    sDiv.className="word score";
    tDiv.innerHTML=w;
    score=[0,0,0,0,0,0,1,2,4,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10][w.length]+1;
    sDiv.innerHTML=score;
    tscore+=score;
    scorebox.innerHTML=tscore;
}
timer.innerHTML=time(seconds);
var x=setInterval(function(){
    seconds-=1;
    timer.innerHTML=time(seconds);
    if (seconds==0){
        clearInterval(x);
        finished=true;
        textbox.innerHTML="TIME'S UP!";
    }
}, 1000)
function time(s){
    var mins=Math.floor(s/60);
    var secs=s%60;
    o="";
    if (mins<10){
        o+="0";
    }
    o+=mins+":";
    if (secs<10){
        o+="0";
    }
    o+=secs;
    return o;
}
window.onresize=function(){resize()};
