FEATURE: grouping sections - let's start a new branch in divine and explorer for this work. 

divine module has several functions for grouping a collection of sections by size or by finding chanins or ranges - we should also create a new function to group sections by point (so we can see all the sections that a point is participating in.

we want to bring this ability to review sections groupings to our new UI - I would like to create a top level third panel call "Groups" in the aside - much like the "by category" panel, it should have the three lists I mentioned:

all lists should have a column for the count for that group - tables are sorted by the count descending

- sizes list - when highlighting a size entry in table, all sections with that size are highlighted in the svg
- chains list - list of individual chains with count of sections
- points list - list of all points participating in sections - hover highlights all those sections

the model won't contain this info - we may need to create api calls to get the groups - perhaps call to refresh after new sections are added


