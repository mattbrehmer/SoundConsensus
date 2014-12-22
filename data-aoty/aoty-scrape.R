require(data.table)

albums.dt = data.table()

scrapeAlbum = function(url) {
  
  print(c("scraping: ",url))
  
  raw.data = readLines(as.character(url),warn=F)
  
  #locate relevant metadata on page
  artistLoc = sapply('.*span class="item', function(y) grep(y,raw.data)[1])
  albumLoc = sapply('.*span class="fn', function(y) grep(y,raw.data)[1])
  releasedLoc = sapply('RELEASED:', function(y) grep(y,raw.data)[1])
  labelLoc = sapply('LABEL:', function(y) grep(y,raw.data)[1])
  genreLoc = sapply('GENRE:', function(y) grep(y,raw.data)[1])
  websiteLoc = sapply('WEBSITE:', function(y) grep(y,raw.data)[1])
  
  #clean the html off of the metadata
  artist = gsub(".*>(.*)</a> - <span class=\"fn\">.*","\\1",raw.data[artistLoc])
  artist = gsub(" *$","",artist) #remove trailing white space
  album = gsub(".*<span class=\"fn\">(.*)</span></span>.*","\\1",raw.data[albumLoc])
  album = gsub(" *$","",album) #remove trailing white space
  releaseDate = gsub(".*RELEASED: *</span> *(.*)</div>","\\1",raw.data[releasedLoc])
  releaseDate = gsub(" *$","",releaseDate) #remove trailing white space
  label = gsub(".*LABEL: *</span>(.*)</div>","\\1",raw.data[labelLoc])
  label = gsub(" *$","",label) #remove trailing white space
  
  website = gsub(".*WEBSITE:.*>(.*) *<img.*</a></div><div style.*","\\1",raw.data[websiteLoc])
  website = gsub(" *$","",website) #remove trailing white space
  
  #genre scraping depends on presence / absence of website
  if (is.na(website)) {
    genre = gsub(".*GENRE.*>(.*)</a>.*TAGS*","\\1",raw.data[genreLoc])
    genre = gsub("([A-Z]*,* *[A-Z]*)<.*","\\1",genre)
  }
  if (!is.na(website)) {
    genre = gsub(".*GENRE.*>(.*)</a>.*WEBSITE.*","\\1",raw.data[genreLoc])
    website = gsub("^","http://",website)
  }
  
  genre = gsub(" *$","",genre) #remove trailing white space
  
  remove(artistLoc,albumLoc,releasedLoc,labelLoc,genreLoc,websiteLoc,raw.data)
  
  return (data.table(artist,album,releaseDate,label,genre,website,url))
  
}

#scrape album metadata from scores table
albums.dt = do.call("rbind", lapply(X=scores.dt$Album_url,FUN = scrapeAlbum))
setnames(albums.dt, c("Artist","Album","ReleaseDate","Label","Genre","url","Album_url"))
setkey(albums.dt,Album_url)