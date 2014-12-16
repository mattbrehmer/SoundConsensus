#main pre-processing script

#change eyar as necessary
yr = 2014

source("aoty-table-parse.R")
source("aoty-scrape.R")
source("aoty-combine.R")

# require(data.table)

#preprocess from previously cleaned csv files

# list_urls.dt = as.data.table(read.csv(file="aoty-list-urls.csv",header = T))
# setkey(list_urls.dt,name)
# 
# ranks.dt = as.data.table(read.csv(file="aoty-w-links.csv",header = T))
# setkey(ranks.dt,Album_url)