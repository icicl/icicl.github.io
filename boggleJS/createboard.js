b=document.getElementsByClassName("board")[0];
for (y=0;y<sz;y++){
    r=b.appendChild(document.createElement("div"));
    r.className="row";
    for (x=0;x<sz;x++){
        t=r.appendChild(document.createElement("div"));
        t.style.width=(320/sz)+"px";
        t.style.height=(320/sz)+"px";
        t.style.fontSize=(80-8*sz)+"px";
        t.style.margin=(20/sz)+"px";
        t.style.lineHeight=(8+320/sz)+"px";
        t.className="tile";
    }
}
width=window.innerWidth;
document.getElementsByClassName("textbox")[0].style.left=(width-360)/2+"px";
document.getElementsByClassName("board")[0].style.left=(width-360)/2+"px";

