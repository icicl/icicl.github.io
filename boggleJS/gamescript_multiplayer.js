let cword='';
let kc;
let found=[];
let tscore=0;
let finished=false;
//let rng_seed=3782919//Math.floor(Math.random()*1000000007);
//let rng=mulberry32(rng_seed);
textbox=document.getElementsByClassName("textbox")[0];
wordbox=document.getElementsByClassName("words")[0];
ubox=document.getElementsByClassName("words")[1];
ucount=document.getElementsByClassName("word score")[0];
scorebox=document.getElementsByClassName("scorebox")[0];
timer=document.getElementsByClassName("timer")[0];
boardelement=document.getElementsByClassName("board")[0];
boardelement.hidden=true;
timer.hidden=true;
scorebox.hidden=true;

if (!host) hnbox=document.getElementsByClassName("textbox")[1];//hostname
function resize(){
    height=window.innerHeight;
    width=window.innerWidth;
    textbox.style.left=(width-360)/2+"px";
    if (!host){
        hnbox.style.left=(width-360)/2+"px";
        hnbox.style.top="484px";
    }
    boardelement.style.left=(width-360)/2+"px";
}
resize();
textbox.innerHTML='WAITING...';
if (host){
    textbox.innerHTML='[SPACE] TO START';
}

let peer = new Peer("bog-"+hostS+"-"+uname, {
    debug: 0
});

function hostSend(datatype,data=null){
    for (c of conns){
        c.send([datatype,data]);
    }
}
function hostRecieve(p,[dtype,data]){
    console.log(dtype);
    console.log(data);
    if (dtype=='WORD_COUNT'){
        hostSend('WORD_COUNT',data);
        update_word_count(data[0], data[1]);
    } else if (dtype=='PEER_QUERY'){
        hostSend('PRIOR_PEERS',users);
    } else if (dtype=='FOUND_WORDS'){
        if (!(uname in found_all)){// todo move into length check
            found_all[uname]=found;
        }
        found_all[data[0]]=data[1];
        if (users.length==Object.keys(found_all).length){
            hostSend('ENDGAME',found_all);
            endgame();
        }
    } else {
        console.log('Unknown data type: '+dtype+' from '+p);
        console.log(data)
    }
}
function peerSend(datatype,data=null){
    hostc.send([datatype,data]);
}
function peerRecieve([dtype, data]){
    if (dtype=='GAME_PARAMS'){
        seconds=data[1];
        begin(data[0]);
    } else if (dtype=='PEER_DC'){
        rem_user(data);
    } else if (dtype=='PEER_JOIN'){
        if (data!=uname) add_user(data);
    } else if (dtype=='WORD_COUNT'){
        if (data[0]!=uname) update_word_count(data[0], data[1]);
    } else if (dtype=='ENDGAME'){
        found_all=data;
        endgame();
    } else if (dtype=='PRIOR_PEERS'){
        for (u of data){
            console.log(data);
            if (users.indexOf(u)==-1){
                add_user(u);
            }
        }
    } else {
        console.log('Unknown data type: '+dtype+' from host');
        console.log(data)
    }
}
function addHost(c){
    hostc=c;
    c.on('data', function (data) {
        peerRecieve(data);
        //console.log("Data recieved: "+data);
    });
    c.on('close', function (e) {
        textbox.innerHTML = "HOST DISCONNECTED :(";
        rem_user(c.peer.slice(9));
    });
    window.onkeydown = null;
    peerSend('PEER_QUERY');
}
function seekPeers(){
    peer.on('connection', function (c) {
        conns=conns.concat(c);
        add_user(c.peer.slice(9));
        hostSend('PEER_JOIN',c.peer.slice(9));// TODO dont send to user
        c.on('data', function (data) {
            hostRecieve(c.peer.slice(9),data);
            //console.log("Data recieved: "+data);
        });
        c.on('close', function () {
            rem_user(c.peer.slice(9));
            hostSend('PEER_DC',c.peer.slice(9));
        });
    })
}
function seekHost(){
    peer.on('error', function (err) {
        if (err.type=="peer-unavailable"){
            textbox.innerHTML="HOST NOT FOUND";
            cword='';
        }
    });
    window.onkeydown=function(k){
        //k.preventDefault();
        kc=k.keyCode;
        if (!k.repeat && !k.ctrlKey){
            if (((kc>64&&kc<91)||(kc>47&&kc<58))&&cword.length<16){
                cword+="0123456789-------ABCDEFGHIJKLMNOPQRSTUVWXYZ"[kc-48];
            } else if (kc==32 || kc==13){
                conn = peer.connect("bog-host-"+cword, {
                    reliable: true
                });
                textbox.innerHTML="SEEKING HOST...";
                conn.on('open', function () {
                    add_user(cword,'h')
                    textbox.innerHTML="CONNECTED TO HOST";
                    hnbox.remove()
                    cword='';
                    addHost(conn)
                });
            } else if (kc==8){
                k.preventDefault();
                if (cword.length<2){
                    cword='';
                } else {
                    cword=cword.slice(0,-1);
                }
            }
            hnbox.innerHTML=cword;
        }
    }
}
if (host) {
    let conns=[];
    seekPeers();

}
if (!host) seekHost();
function setTile(x,y,t){
    document.getElementsByClassName("row")[y].children[x].innerHTML=t;
}
function det_rand_int(){//mulberry32
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0);
}
function mulberry32(a) {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}
function shuffle(a, rng) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(rng() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
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
    score=[1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765, 10946, 17711, 28657, 46368][w.length-sz+1];
    sDiv.innerHTML=score;
    tscore+=score;
    scorebox.innerHTML=tscore;
    if (host){
        hostSend('WORD_COUNT',[uname,found.length]);
    } else {
        peerSend('WORD_COUNT',[uname, found.length]);
    }
    update_word_count(uname,found.length);
}

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

let users=[];
let uwordcounts={};
function add_user(name,host='p'){
    users=users.concat(name);
    ucount.innerHTML=users.length;
    ubox.style.height=(26*(1+users.length))+"px";
    var wDiv = ubox.appendChild(document.createElement("div"));
    wDiv.className="word";
    var tDiv = wDiv.appendChild(document.createElement("div"));
    tDiv.className="word text";
    tDiv.style.width="198px";
    var sDiv = wDiv.appendChild(document.createElement("div"));
    sDiv.className="word score";
    sDiv.style.width="30px";
    uwordcounts[name]=sDiv;
    tDiv.innerHTML=name;
    sDiv.innerHTML=host;
    wordbox.style.top=(66+users.length*26)+"px";
}
function rem_user(name){
    i=users.indexOf(name);
    if (i>-1){
        ubox.removeChild(ubox.childNodes[i+3]);
        users.splice(i,1);
        ucount.innerHTML=users.length;
    }
    wordbox.style.top=(66+users.length*26)+"px";
}
function update_word_count(name,count){
    uwc=uwordcounts[name];
    uwc.innerHTML=count;
    uwc.style.backgroundColor = '00ff00';
    setTimeout(function(){uwc.style.backgroundColor=bkg},160)
}
add_user(uname,hostS[0])

let board=[]
let found_all={}
let rng;
function begin(rng_seed){
    boardelement.hidden=false;
    timer.hidden=false;
    scorebox.hidden=false;
    rng=mulberry32(rng_seed);
    let sarr=[];
    for (i=0;i<sz*sz;i++){
        sarr.push(i);
    }
    let si=shuffle(sarr, rng);
    for (var i=0;i<sz;i++){
        for (var j=0;j<sz;j++){
            lt=dice[si[i*sz+j]][Math.floor(rng()*6)];
            board=board.concat(lt)
            setTile(i,j,lt.replace('Q','Qu'));
        }
    }
    textbox.innerHTML='';
    window.onkeydown=function(k){
        //k.preventDefault();
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
                k.preventDefault();
                if (cword.length<2){
                    cword='';
                } else {
                    cword=cword.slice(0,-1);
                }
            }
            textbox.innerHTML=cword;
        }
    }
    timer.innerHTML=time(seconds);
    var xxi=setInterval(function(){
        seconds-=1;
        if (seconds>=-10){
            timer.innerHTML=time(seconds);
        }
        if (seconds==0){
            finished=true;
            textbox.innerHTML="TIME'S UP!";
            if (!host){
                peerSend('FOUND_WORDS',[uname,found]);
            } else {
                if (users.length==1){
                    found_all[uname]=found;
                    endgame();
                }
            }
            clearInterval(xxi);
        }
    }, 1000)
}
let tt;
let tt2;
function endgame(){
    divs=document.getElementsByTagName('div');
    while (divs.length>0) divs[0].remove();
    wcount = {};
    dw=[];
    dwo={};
    for (i in found_all){
        for (w of found_all[i]){
            if (!(w in wcount)){
                wcount[w]=0;
            }
            wcount[w]+=1;
            if (wcount[w]==2){
                dw=dw.concat(w);
                dwo[w]=[];
            }
            shuffle(dw,rng);
        }
    }
    var ii=-1;
    var uscores=[]
    for (u in found_all){
        ii+=1;
        udiv=document.body.appendChild(document.createElement("div"));
        udiv.className="words";
        udiv.style.height="26px";
        udiv.style.left=(16+256*ii)+"px";
        uw=udiv.appendChild(document.createElement("div"));
        uw.className="word";
        uwt = uw.appendChild(document.createElement("div"));
        uwt.className="word text";
        uws_ = uw.appendChild(document.createElement("div"));
        uws_.className="word score";
        uwt.innerHTML=u;
        uws_.innerHTML=0;
        uwt.style.width="198px";
        uws_.style.width="30px";
        uscores=uscores.concat([[0,uws_]]);
    }

    var fai=0;
    var si=0;
    var u=Object.keys(found_all)[fai];
    var udiv=document.body.appendChild(document.createElement("div"));
    udiv.className="words";
    udiv.style.left=(16)+"px";
    udiv.style.top="48px";
    udiv.style.height="0px";
    if (Object.keys(wcount).length>0){
        var addw_i=setInterval(function(){
            w=found_all[u][si];
            if(w){
                udiv.style.height=(26*(si+1))+"px";
                uw=udiv.appendChild(document.createElement("div"));
                uw.className="word";
                uwt = uw.appendChild(document.createElement("div"));
                uwt.className="word text";
                uws = uw.appendChild(document.createElement("div"));
                uws.className="word score";
                uwt.innerHTML=w;
                score=[1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765, 10946, 17711, 28657, 46368][w.length-sz+1];
                uws.innerHTML=score;
                uscores[fai][0]+=score;
                console.log(uscores);
                uscores[fai][1].innerHTML=uscores[fai][0];
                si+=1;
                if (wcount[w]>1){
                    dwo[w]=dwo[w].concat([[fai,uw]]);
                }
            }
            while (si==found_all[u].length){
                fai+=1;
                u=Object.keys(found_all)[fai];
                udiv=document.body.appendChild(document.createElement("div"));
                udiv.className="words";
                udiv.style.left=(16+256*fai)+"px";
                udiv.style.top="48px";
                udiv.style.height="0px";        
                if (fai==Object.keys(found_all).length){
                    clearInterval(addw_i);
                    var delw_i=setInterval(function(){
                        if (dw.length>0){
                            for (aa of dwo[dw.pop()]){
                                uscores[aa[0]][1].innerHTML-=aa[1].childNodes[1].innerHTML;
                                uscores[aa[0]][0]-=aa[1].childNodes[1].innerHTML;
                                aa[1].style.backgroundColor='ff6666';
                                aa[1].childNodes[0].style.backgroundColor='dd9999';
                                aa[1].childNodes[1].style.backgroundColor='dd9999';
                                tt=aa;
                                tt2=uscores;
                            }
                        }
                        if (dw.length==0){
                            clearInterval(delw_i);
                            m=0
                            for (ud of uscores){
                                if (ud[0]>m)m=ud[0];
                            }
                            for (ud of uscores){
                                if (ud[0]==m){
                                    var par=ud[1].parentElement;
                                    par.style.backgroundColor='aaffaa';
                                    par.childNodes[0].style.backgroundColor='ccffcc';
                                    par.childNodes[1].style.backgroundColor='ccffcc';
                                }
                            }
                        }
                    }, 1000);            
                    break;
                    console.log(111);
                }
                si=0;
                console.log(u+' '+fai);
            }
        }, 100);
    }
    /*for (u in found_all){
        ii+=1;
        udiv=document.body.appendChild(document.createElement("div"));
        udiv.className="words";
        udiv.style.left=(16+256*ii)+"px";
        udiv.style.top="48px";
        udiv.style.height=(26*found_all[u].length)+"px";
        for (w of found_all[u]){
            uw=udiv.appendChild(document.createElement("div"));
            uw.className="word";
            uwt = uw.appendChild(document.createElement("div"));
            uwt.className="word text";
            uws = uw.appendChild(document.createElement("div"));
            uws.className="word score";
            uwt.innerHTML=w;
            score=[1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765, 10946, 17711, 28657, 46368][w.length-sz+1];
            uws.innerHTML=score;
        }
    }*/
}

window.onresize=function(){resize()};
//clearInterval(x)