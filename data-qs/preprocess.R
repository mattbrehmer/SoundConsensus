require(data.table)

#load files
qs2012 = as.data.table(read.csv(file = "qs12.csv",stringsAsFactors=TRUE))
qs2013 = as.data.table(read.csv(file = "qs13.csv",stringsAsFactors=TRUE))
qs2014 = as.data.table(read.csv(file = "qs14.csv",stringsAsFactors=TRUE))

#throw out unecessary attributes
qs2012 = subset(qs2012, select=-c(age,rank_11))
qs2013 = subset(qs2013, select=-c(age,rank_12))
qs2014 = subset(qs2014, select=-c(rank_13))

qs2012$research = gsub("^$",NA,qs2012$research)
qs2012$research = as.factor(qs2012$research)
qs2013$research = gsub("^$",NA,qs2013$research)
qs2013$research = as.factor(qs2013$research)
qs2014$research = gsub("^$",NA,qs2014$research)
qs2014$research = as.factor(qs2014$research)

#set institution metadata as multi-attribute key for each table
setkey(qs2012,institution,country,size,focus,research,status)
setkey(qs2013,institution,country,size,focus,research,status)
setkey(qs2014,institution,country,size,focus,research,status)

#join
qsJoined = qs2012[qs2013[qs2014]]

#subset to attributes of interest
qsScores = subset(qsJoined, select=c(
  institution,
  country,
  size,
  focus,
  research,
  status,
  age,
  overall_score_14,
  overall_score_13,
  overall_score_12
  ))

setnames(qsScores,"overall_score_14","2014")
setnames(qsScores,"overall_score_13","2013")
setnames(qsScores,"overall_score_12","2012")

#subset to attributes of interest
qsRanks = subset(qsJoined, select=c(
  institution,
  country,
  size,
  focus,
  research,
  status,
  age,
  rank_14,
  rank_13,
  rank_12
))

setnames(qsRanks,"rank_14","2014")
setnames(qsRanks,"rank_13","2013")
setnames(qsRanks,"rank_12","2012")

write.csv(qsScores,file="qsScores.csv",quote=F,row.names=F,na="")
write.csv(qsRanks,file="qsRanks.csv",quote=F,row.names=F,na="")
