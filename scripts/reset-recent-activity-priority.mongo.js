db.recentactivities.update( {priority: 0}, { $set: { priority : 1  }});
db.recentactivities.update( {priority: 4}, { $set: { priority : 2  }});