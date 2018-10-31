var string = '\
def bla(user, name, passord):\n\
\tif user == "Bateau":\n\
\t\tprint("Bateau")\n\
bla()'
var i = 0;
function hack(){
    i++
    i++
    i++
    document.getElementById("hacking_zone").innerText = string.substr(0,i)
    $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
      });
}
function yo() {
}