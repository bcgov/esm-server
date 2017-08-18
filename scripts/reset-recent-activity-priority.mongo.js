db.recentactivities.update( {priority: 0}, { $set: { priority : 1  }}, multi: true);
db.recentactivities.update( {priority: 4}, { $set: { priority : 2  }}, multi: true);