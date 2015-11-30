require(data.table)

albumscores.dt = scores.dt[albums.dt,allow.cartesian=T] #combine the data tables
albumscores.dt = unique(albumscores.dt) #remove duplicate rows

#remove duplicate columns
albumscores.dt[,Artist.1:=NULL]
albumscores.dt[,Album.1:=NULL]

#coerce classes on columns, remove commas from character columns
albumscores.dt$ReleaseDate = as.Date(albumscores.dt$ReleaseDate,format = "%B %d, %Y")
# albumscores.dt$url = as.factor(albumscores.dt$url)
# setnames(albumscores.dt,"url","Artist_url")
albumscores.dt$Label = gsub(",","",albumscores.dt$Label)
albumscores.dt$Label = as.factor(albumscores.dt$Label)
albumscores.dt$Genre = gsub(",","",albumscores.dt$Genre)
albumscores.dt$Genre = as.factor(albumscores.dt$Genre)
albumscores.dt$Artist = gsub(",","",albumscores.dt$Artist)
albumscores.dt$Artist = as.factor(albumscores.dt$Artist)
albumscores.dt$Album = gsub(",","",albumscores.dt$Album)
albumscores.dt$Album = as.factor(albumscores.dt$Album)

#sort by artist, album
setkey(albumscores.dt,Artist,Album)

# albumscores.dt = albumscores.dt[order(-rank(AoTY))]
# 
# albumscores.dt = albumscores.dt[1:100]

albumscores.dt = transform(albumscores.dt, SD=apply(albumscores.dt[,3:21, with = F],1, sd, na.rm = TRUE))

#duplicate table for storing ranks
albumranks.dt = albumscores.dt

#ranking function applied to a numeric column
convertToRank = function(col) {
  
  if(is.numeric(col)){
    col = rank(-col,na.last = "keep",ties.method = "min")
    col = findInterval(col, sort(unique(col)))
  }
  
  return(col)
}
#rank within numeric columns and replace with ranks
albumranks.dt = albumranks.dt[, lapply(.SD, convertToRank)]

#sort ranked table by artist, album
setkey(albumranks.dt,Artist,Album)

#copy rank column from score table to rank table
albumranks.dt$rank = albumscores.dt$rank

#remove rank column from score table
albumscores.dt[,rank:=NULL]

#remove AoTY rank from rank table (rank = AoTY rank)
albumranks.dt[,AoTY:=NULL]

#write to csv
write.csv(albumranks.dt,file="albumranks.csv",quote=F,row.names=F,na="")
write.csv(albumscores.dt,file="albumscores.csv",quote=F,row.names=F,na="")
write.csv(list_urls.dt,file="list_urls.csv",quote=F,row.names=F,na="")
