require(data.table)

albums.dt = data.table()

scrapeAlbum = function(url) {
  
#   print(c("scraping: ",url))
  
  raw.data = readLines(as.character(url),warn=F)
  
  #locate relevant metadata on page
  metaLoc = sapply('twitter:description', function(y) grep(y,raw.data)[1])
#   artistLoc = sapply('.*span class="item', function(y) grep(y,raw.data)[1])
#   albumLoc = sapply('.*span class="fn', function(y) grep(y,raw.data)[1])
#   releasedLoc = sapply('RELEASED:', function(y) grep(y,raw.data)[1])
#   labelLoc = sapply('LABEL:', function(y) grep(y,raw.data)[1])
#   genreLoc = sapply('GENRE:', function(y) grep(y,raw.data)[1])
#   websiteLoc = sapply('WEBSITE:', function(y) grep(y,raw.data)[1])
  coverLoc = sapply('og:image', function(y) grep(y,raw.data)[1])

  #clean the html off of the metadata
  artist = gsub(".*by (.*) released on.*","\\1",raw.data[metaLoc])
  artist = gsub(" *$","",artist) #remove trailing white space
  album = gsub(".*Reviews: (.*) by .* released on .*","\\1",raw.data[metaLoc])
  album = gsub(" *$","",album) #remove trailing white space
  releaseDate = gsub(".*released on (.*), 2015.*","\\1, 2015",raw.data[metaLoc])
  releaseDate = gsub(" *$","",releaseDate) #remove trailing white space
  label = gsub(".*via (.*)\\. Genre: .*","\\1",raw.data[metaLoc])
  label = gsub(" *$","",label) #remove trailing white space
  genre = gsub(".*\\. Genre: (.*\\.).*","\\1",raw.data[metaLoc])
  genre = gsub("\\..* *$","",genre) #remove trailing white space


#   website = gsub(".*WEBSITE:.*>(.*) *<img.*</a></div><div style.*","\\1",raw.data[websiteLoc])
#   website = gsub(" *$","",website) #remove trailing white space
  
  cover = gsub(".*http://(.*)jpg.*","http://\\1jpg",raw.data[coverLoc])
  cover = gsub(" *$","",cover) #remove trailing white space
  
  print(c("scraping: ",album,artist,releaseDate,label,genre))
  
  #genre scraping depends on presence / absence of website
#   if (is.na(website)) {
#     genre = gsub(".*GENRE.*>(.*)</a>.*TAGS*","\\1",raw.data[genreLoc])
#     genre = gsub("([A-Z]*,* *[A-Z]*)<.*","\\1",genre)
#   }
#     website = gsub("^","http://",website)
#   if (!is.na(website)) {
#   }
  
  
  remove(metaLoc,coverLoc,raw.data)
  
  return (data.table(artist,album,releaseDate,label,genre,cover,url))
  
}

#scrape album metadata from scores table
albums.dt = do.call("rbind", lapply(X=scores.dt$Album_url,FUN = scrapeAlbum))
setnames(albums.dt, c("Artist","Album","ReleaseDate","Label","Genre","Cover","Album_url"))
setkey(albums.dt,Album_url)