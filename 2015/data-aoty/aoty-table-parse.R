require(data.table)

#scrape the aggregate score table for the specified year
scrapeTable = function(year){
  
  url = paste("http://www.albumoftheyear.org/ratings/overall/",year,"/16",sep = "")
  
  raw.data = readLines(url,warn=F)
  
  #trim everything but the table
  tableBegin = sapply('<TABLE', function(y) grep(y,raw.data)[1])
  tableEnd = sapply('</TABLE>', function(y) grep(y,raw.data)[1])
  
  table = raw.data[tableBegin:tableEnd]
  
  return(table)
  
}

#change X in scrapeTable(X) to specify the year e.g. 2014
table = scrapeTable(2015)

table = unique(table) #remove duplicate header rows
table = table[-26] #remove first duplicate header row

#remove first list item from header
header = gsub(".*(<tr class=\"white-font\".*)</a></td></tr><tr.*","\\1",table[1])

#trim html from header
header = gsub("</td>",",",header)
header = gsub("<td>","",header)
header = gsub("<tr class=\"white-font\" align=\"center\" bgcolor=\"#58808b\">","",header)
header = gsub("<a class=\"white\" href=\"","",header,)
header = gsub("</a>","",header,)
header = gsub("\">",",",header,)

header = strsplit(header,",") #split string into list
colNames = c("rank","AoTY")
reviewNames = header[[1]][((1:length(header[[1]]))%%2==0)]
reviewNames = reviewNames[3:length(reviewNames)]
aotyUrls = header[[1]][((1:length(header[[1]]))%%2==1)]
aotyUrls = aotyUrls[3:length(aotyUrls)]
colNames = c(colNames,reviewNames,"Artist","Profile_url","Album","Album_url")

#remove header from row 1
table[1] = gsub(".*(<tr bgcolor=\"#......\">.*)","\\1",table[1])

#coerce chacacters to numeric
numericFromChar = function(chr) {
  
  return (as.numeric(as.character(chr)))
  
}

#parse a single row of the table
parseRow = function(str) {
  
  cols = t(as.data.table(strsplit(str,"<td")))
  cols = gsub(".*n/a.*",NA,cols)
  cols = gsub(".*>([0-9]+\\.*[0-9]*)<.*","\\1",cols)
  cols = cols[2:length(cols)]
  meta = t(as.data.table(strsplit(cols[3],"<div")))
  cols = as.data.table(t(as.data.table(cols[-3])))
  cols = cols[, lapply(.SD, numericFromChar)]
  artist = gsub(".*>(.*)</a.*","\\1",meta[2],)
  artist_url = gsub(".*a href=\"(.*/)\">.*","http://albumoftheyear.org\\1",meta[2],)
  album = gsub(".*>(.*)</a.*","\\1",meta[3],)
  album_url = gsub(".*a href=\"(.*php)\">.*","http://albumoftheyear.org\\1",meta[3],)
  
  meta = t(as.data.table(c(artist,artist_url,album,album_url)))
  
  row = as.data.table(cbind(cols,meta))
  
  setnames(row,colNames)
  
  return(row)
  
}

#parse the table
scores.dt = do.call("rbind", lapply(table[1:length(table)-1], FUN = parseRow))
setkey(scores.dt,Album_url)

#remove rows with missing data
scores.dt = unique(scores.dt[!"NA"])

#clean review urls
list_urls.dt = as.data.table(cbind(reviewNames,aotyUrls))
list_urls.dt$aotyUrls = gsub("/ratings/","http://albumoftheyear.org/ratings/",list_urls.dt$aotyUrls)
setkey(list_urls.dt,reviewNames)

remove(colNames,reviewNames,table,header,aotyUrls)
