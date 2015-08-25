{
	"translatorID":"e5b21f35-6aa8-4da8-ab95-eb11c679fe07",
	"translatorType":4,
	"label":"AIS Electronic Library (AISeL)",
	"creator":"Wei Chen <icecowoo@gmail.com>",
	"target":"http://aisel.aisnet.org/(((cais|jais)/vol([0-9]+)/iss([0-9]+))|((am|i)cis([0-9]+)))/([0-9]+)/",
	"minVersion":"1.0.0b1",
	"maxVersion":"",
	"priority":100,
	"inRepository": true,
	"lastUpdated":"2009-06-27 17:15:00"
}
 
function detectWeb(doc, url) {
	//I only matched the journal articles and conferece proceedings of AMCIS and ICIS.
	var urlReg = /(am|i)cis([0-9]+)\/([0-9]+)/;
	var s = urlReg.exec(url);
	
	if(s){
		return "conferencePaper";
	}else{
		return "journalArticle";
	}
}

function doWeb(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
	if (prefix == 'x') return namespace; else return null;
	} : null;
	
	var itemType = detectWeb(doc,url);
	Zotero.debug("Item Type: " + itemType);
	
	var xpath = '//p[@class="citation"]';
	var citationTag = doc.evaluate(xpath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
	var citation = Zotero.Utilities.trimInternal(citationTag.textContent);
	Zotero.debug("citation:" + citation);
	
	
	if(itemType == "conferencePaper"){
		var searchRe = /(.*?)\s"(.*?)"\s\(([0-9]+)\)\.\s(.*?)\.\sPaper\s([0-9]+)\.(.*?)/
		var m = searchRe.exec(citation);
		if(m){
			var authors = RegExp['$1'];
			var title = RegExp['$2'];
			var year = RegExp['$3'];
			var confName = RegExp['$4'];
			var paperNum = RegExp['$5'];
			
			var authorArr = authors.split(";")
			
			var item = new Zotero.Item(itemType);
			item.title = title;
			item.conferenceName = confName;
			item.date = year;
			item.url = url;
			item.number = paperNum;
			for(var i = 0; i < authorArr.length - 1; i++){
				item.creators.push(Zotero.Utilities.cleanAuthor(authorArr[i],"author",true));
			}
			var lastAuthor = authorArr[authorArr.length - 1];
			lastAuthor = lastAuthor.substring(4, lastAuthor.length - 1);
			item.creators.push(Zotero.Utilities.cleanAuthor(lastAuthor, "author", true));
			Zotero.debug(item);
			item.complete();
		}
	}else{
		var urlReg = /vol([0-9]+)\/iss([0-9]+)\/([0-9]+)/;
		var s = urlReg.exec(url);
		if(s){
			var volume = RegExp['$1'];
			var issue = RegExp['$2'];
			var articleId = RegExp['$3'];
		}
		
		var searchRe = /(.*?) \(([0-9]+)\) "(.*?)," (.*?): Vol\. ([0-9]+)(: Iss\. ([0-9]+))?, Article ([0-9]+)\. Available at: (.*?)/
		var m = searchRe.exec(citation);
		if(m){
			var authors = RegExp['$1'];
			var year = RegExp['$2'];
			var title = RegExp['$3'];
			var journal = RegExp['$4'];
			var authorArr = authors.split(";")
			
			var item = new Zotero.Item(itemType);
			item.title = title;
			item.date = year;
			item.publicationTitle = journal;
			item.volume = volume;
			item.issue = issue;
			item.number = articleId;
			for(var i = 0; i < authorArr.length - 1; i++){
				item.creators.push(Zotero.Utilities.cleanAuthor(authorArr[i],"author",true));
			}
			var lastAuthor = authorArr[authorArr.length - 1];
			lastAuthor = lastAuthor.substring(4);
			item.creators.push(Zotero.Utilities.cleanAuthor(lastAuthor, "author", true));
			Zotero.debug(item);
			item.complete();
		}
	}
	
}

