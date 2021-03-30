function solve(){
    r=[];
    for (x=0;x<sz;x++){
        for (y=0;y<sz;y++){
//            r=r.concat(solve_(board[x*sz+y],x,y,[sz*x+y],1));
            r=r.concat(solve_(x,y,[],""));
        }
    }
    rf=[]
    for (i in r){
        if (rf.indexOf(r[i])==-1){
            rf=rf.concat(r[i])
        }
    }
    return rf.sort(function(a, b) {
        return b.length - a.length || // sort by length, if equal then
               a>b;    // sort by dictionary order
      });
}

function solve_(x,y,p,w){
//    console.log(x,y,p);
    r=[];
    if (x>=0&&x<sz&&y>=0&&y<sz&&p.indexOf(sz*x+y)==-1){
        w+=board[x*sz+y];
        if (w in prefs[w.length]){
            for (let dx=-1;dx<2;dx++){
                for (let dy=-1;dy<2;dy++){
                    if (dx!=0||dy!=0){
                        r=r.concat(solve_(x+dx,y+dy,p.concat(x*sz+y),w));
                    }
                }
            }
        }
        if (w.length>sz-2&&w.toLowerCase().replace('q','qu') in words){
            r=r.concat(w.replace('Q','Qu'))
        }
    }
    return r;
}
/*function solve_(w,x,y,p,l){
    //console.log(w,x,y,p,l)
    r=[];
    for (dx=-1;dx<2;dx++){
        for (dy=-1;dy<2;dy++){
            bi=sz*(x+dx)+y+dy;
            console.log(bi,dx,dy,p);
            if (p.indexOf(bi)==-1){
                if (x+dx>=0&&x+dx<sz&&y+dy>=0&&y+dy<sz){
                    tw=w+board[bi];
                    if (l<4){
                        solve_(tw,x+dx,y+dy,p.concat(bi),l+1);
                    }
                    console.log(p);
                    console.log(tw,dx,dy);
                    if (tw in prefs[l+1]){
                        r=r.concat(solve_(tw,x+dx,y+dy,p.concat(bi),l+1))
                    }
                    if (tw.toLowerCase() in words){
                        r=r.concat(tw);
                    }
                }
            }
        }
    }
    return r;
}*/