SoundConsensus
========
![SoundConsensus](screenshots/14.12.28-about-panel.png "SoundConsensus")

__SoundConsensus__ is an interactive visualization by [@mattbrehmer](https://twitter.com/mattbrehmer) for comparing multiple ranked lists of record reviews from 19 prominent music publications. The data visualized here represents the 105 most-reviewed records released in 2014, according to the music publication aggregator site [albumoftheyear.org](http://www.albumoftheyear.org/ratings/overall/2014/15).

[Experience SoundConsensus](http://bl.ocks.org/mattbrehmer/raw/9004f31b95a192af18df/).

Each column is associated with a music publication. Each cell containing a bar corresponds to a review score. The vertical position of a cell encodes its rank among other reviews from that publication. The bars in each cell encode the score itself.

The first column is unique in that it encodes the overall rank and score calculated by [albumoftheyear.org](http://www.albumoftheyear.org/ratings/overall/2014/15). 

The columns are of unequal size because: (1) not all of the music publications reviewed all of the records; and (2) some music publications use a 10-point scale when rating a record, resulting in more ties than those using a 100-point or decimal scale. 

Hover over a record's artist or name to highlight the ranks and scores across all of the music publications who reviewed the record, and to see details about the record (such as genre, record label, and release date) in the panel at the lower left. 

You can also hover over any cell. Clicking on a cell makes the highlighting persist, which can facilitate comparisons between records. Clicking again removes the highlight. 

Click on an artist name or album name to visit corresponding [albumoftheyear.org](http://www.albumoftheyear.org/) artist and album profile pages, which contain links to the original reviews. 

Hover over a column header to see the corresponding music publication's full name in a tooltip, along with details about the publication in the panel at the lower left. 

Select a musical genre and / or record label from the dropdown boxes in the lower left to filter the list of records (filtering maintains the relative rank positions of review scores). 

![SoundConsensus](screenshots/14.12.28-consensus-filtering.png "SoundConsensus")

Select a consensus level from the dropdown box in the lower left to filter based on a record's standard deviation of review scores, where a high standard deviation corresponds to a low consensus, and vice versa (consensus ranges are at 20% quantiles).
