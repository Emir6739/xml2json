
//we take the text from xml textarea, remove whitespaces and pass it to xml2json
//the returned string from xml2json is displayed in json textarea
document.getElementById("convert").addEventListener("click", function(){
    var text: string = document.getElementById("xml").value;
    text = text.replace(/\r?\n|\r/g, ' ');
    while(text.indexOf("> ")!=-1 && text.indexOf("> ")!=-1)
    {
      text = text.replace(/>\s*/g, '>'); 
      text = text.replace(/\s*</g, '<');
    }
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(text,"text/xml");
    document.getElementById("json").value = xml2json(xmlDoc.documentElement);
});

document.getElementById("download").addEventListener("click", function()
{
    var text:string = document.getElementById("json").value;
    download("xml2json.json",text);
});


//we create a hyperlink element and simulate a click on it
function download(filename:string, text:string) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}