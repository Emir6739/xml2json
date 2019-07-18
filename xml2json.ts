//xml2json is a recursive function that takes the document node
//and returns a json in a string

//due to the recursive solution the depth of the xml document is irrelevant
//we recursively call the function on any node that has a child

function xml2json(xml:any, pad:number=1, type: number=1):string
{
    //we will use tabular indentation to format our json
    var indent: string = "";

    //we add tabs according to the number passed as argument
    for(var t: number=0;t<pad;++t)
        indent += "\t";

    //a string where we will store json
    var txt: string="";

    //same as indent but one tab bigger and used to indent key/value pairs
    var padding: string = indent + "\t";
    

    //output formatting along with formatting corner cases
    if(pad === 1)
    txt=`{\n${indent}"${xml.nodeName}": {\n`;
    else
    {
        if(type===2)
        txt=`${indent}"${xml.nodeName}": [\n${indent}     {\n`;
        else if(type===3 || type===4)
        txt=`${indent}     {\n`
        else
        txt=`${indent}"${xml.nodeName}": {\n`;
    }
    
    //any node attribute gets appended as a child node (element node) for easier conversion
    if(xml.attributes.length>0)
    {
        for(var j: number = 0; j<xml.attributes.length; ++j)
        {
            //underscore is used to seperate attributes from nodes
            var attChar: string = "_";
            var node = document.createElement(attChar+xml.attributes[j].nodeName);
            node.appendChild(document.createTextNode(xml.attributes[j].nodeValue))
            xml.appendChild(node);
        }
    }

    //two arrays first and last that will hold indexes of first and last repeating nodes in a group respectively
    //example: for nodes {book,book,pen,pen,pen,paper} first will hold {0,2} while last will hold {1,4}
    var first: number[] = new Array;
    var last: number[] = new Array;

    //passedType will be used for outputting repeating nodes that are grouped in squared brackets
    var passedType: number;

    //looping through every child node
    for (var i: number = 0; i < xml.childNodes.length ;i++) {
        //in case there are repeating nodes we rearange them so we can more easily
        //group them in squared brackets
        if(xml.childNodes.length>1 && i==0)
        {
            var state:boolean;
            var firstIndex:number;
            var lastIndex:number;
            //looping through every node to se if one repeates itself
            for(var k: number = 0; k<xml.childNodes.length-1; k++)
            {
                state = false;
                for(var z: number = k+1; z<xml.childNodes.length;z++)
                { 
                    if(xml.childNodes[k].nodeName === xml.childNodes[z].nodeName && z-k>1)
                    {
                        //a repeating node is found and is placed immediately after the first accurance
                        if(state===false)
                        firstIndex=k;
                        state = true;
                        xml.childNodes[k+1].parentNode.insertBefore(xml.childNodes[z], xml.childNodes[k+1]);      
                        k++;
                        lastIndex=k;
                    }
                    else if(xml.childNodes[k].nodeName === xml.childNodes[z].nodeName && z-k==1)
                    {
                        if(state===false)
                        firstIndex=k;
                        state = true;
                        lastIndex=z;
                        k++;
                    }
                }
                if(state===true)
                {
                    first.push(firstIndex);
                    last.push(lastIndex);
                }
            }
        }
        
        //if passedType is 1 it means that the node is unique
        //if passedType is 2, 3 or 4 the node is repeated x amount of times and is grouped
        //if passedType is 2, node is the first in the group
        //if passedType is 4, node is the last in the group
        //if passedType is 3, node is somewhere in between
        //with group holding all nodes of the same name
        
        passedType=1;
        if(first.length>0)
        {
            for(var temp:number = 0;temp<first.length;++temp)
                if(first[temp]===i)
                passedType=2;
            for(var temp:number = 0;temp<last.length;++temp)
                if(last[temp]===i)
                passedType=4;
            for(var temp:number = 0;temp<last.length;++temp)
                if(first[temp]<i && last[temp]>i)
                passedType=3;  
        }

        //we recursively call xml2json in these two cases:
        //1. node has an attribute 
        //2. node has more than one child or only has an element node
  
        //for each level of depth another tab is added hence the pad+1
        if(xml.childNodes[i].nodeType===1 && xml.childNodes[i].attributes.length>0)
        {
            txt += xml2json(xml.childNodes[i],pad+1,passedType);
        }
        else if(xml.childNodes[i].childNodes.length>1 || (xml.childNodes[i].childNodes.length==1 && xml.childNodes[i].childNodes[0].nodeType === 1))
        {
            txt += xml2json(xml.childNodes[i],pad+1,passedType);
        }
        else  
        {
            //if recursive cases have not been met the node is either a text node or an element node
            if(xml.childNodes[i].nodeType === 3)
            {
                //whitespaces get filtered as text so we check if the text node actually has text
                //we remove all new lines and spaces and if the resulting string is empty we skip this node
                var str:string = xml.childNodes[i].nodeValue;
                str = str.replace(/\r?\n|\r/g, '');
                str = str.replace(/\s+/g, '');
                if(str === '')
                continue
                
                txt+= padding;
                
                switch(passedType)
                {
                    case 2:
                    {
                        txt +=`"${xml.childNodes[i].nodName}": [\n${padding}\t"${xml.childNodes[i].nodeValue}"`;
                        break;
                    }

                    case 3:
                    {
                        txt +=`\t"${xml.childNodes[i].nodeValue}"`
                        break;   
                    }

                    case 4:
                    {
                        txt += `\t"${xml.childNodes[i].nodeValue}"\n${padding}]`
                        break;
                    }

                    default:
                    {
                        txt += `"${xml.childNodes[i].nodeName}": "${xml.childNodes[i].nodeValue}"`
                        break;
                    }
                }
            }

            if(xml.childNodes[i].nodeType === 1)
            {
                txt+=padding;
                
                switch(passedType)
                {
                    case 2:
                    {
                        txt += `"${xml.childNodes[i].nodeName}": [\n${padding}\t"${xml.childNodes[i].childNodes[0].nodeValue}"`
                        break;
                    }

                    case 3:
                    {
                        txt += `\t"${xml.childNodes[i].childNodes[0].nodeValue}"`
                        break;   
                    }

                    case 4:
                    {
                        txt += `\t"${xml.childNodes[i].childNodes[0].nodeValue}"\n${padding}]`
                        break;
                    }

                    default:
                    {
                        txt += `"${xml.childNodes[i].nodeName}": "${xml.childNodes[i].childNodes[0].nodeValue}"`
                        break;
                    }
                }
                
            }
                //if the current node isn't the last node and is either an element or a text node we add a comma
                if(i<xml.childNodes.length-1 && (xml.childNodes[i].nodeType === 1 || xml.childNodes[i].nodeType === 3))
                    txt+=",";
                
                //newline for format
                if(xml.childNodes[i].nodeType === 1 || xml.childNodes[i].nodeType===3)
                    txt+="\n";
            }
        
    }
    
    //output formating along with formating corner cases
    txt += `${indent}`;
    if(type!=1)
    txt += "     ";
    txt += "}";

    if(type===2 || type===3 || (pad!=1 && type===1 && xml.nodeName!=xml.parentNode.lastChild.nodeName))
    txt+=`,`;
    txt+="\n"

    if(type===4)
    {
      txt+= `${indent}]`
      if(xml.nodeName!=xml.parentNode.lastChild.nodeName)
      txt+=`,`;
      txt+= "\n";
    }
    
    if(pad===1)
    txt += "}"

    return txt;      
}