function $(node){
    if(typeof node=="string"){
        var nodeArry = [],
            nodeList = document.querySelectorAll(node);
        var nodeArry = Array.prototype.slice.call(nodeList);
        if(nodeArry.length == 1){
            node = document.querySelector(node);
        }else{
            node = nodeList;
        }
    }else{
        node = node;
    }
    return node;
}
