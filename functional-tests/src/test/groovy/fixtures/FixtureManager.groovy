package fixtures

import groovy.json.JsonSlurper

import com.mongodb.*

class FixtureManager {
  private static String fixtureDataFolderPath = new File("src/test/groovy/fixtures/data").absolutePath;

  private MongoClient client;
  private DB db;

  // Default connection values
  private String host = 'localhost';
  private int port = 27017;
  private String databaseName = 'esm-dev-func';
  private String username;
  private char[] password;

  // Stores fixture data that is inserted via this manager.
  private List fixtureDataInserted = [];

  /**
   * A data fixture manager.
   *
   * This manager handles connecting to the mongo database and contains helper methods for inserting and
   * removing data fixtures.
   *
   * When finished with this manager, it is recommneded that you call FixtureManager#removeAll() which will
   * remove any fixture data that was added by this instance of the manager.
   */
  FixtureManager(final String host = null, final Integer port = null, final String databaseName = null) {
    def env = System.getenv()
    if(host) {
      this.host = host;
    } else if (env['MONGODB_FUNC_HOST']) {
      this.host = env['MONGODB_FUNC_HOST'];
    }

    if (port) {
      this.port = port;
    } else if (env['MONGODB_FUNC_PORT']) {
      this.port = env['MONGODB_FUNC_PORT'] as int;
    }

    if (databaseName) {
      this.databaseName = databaseName;
    } else if (env['MONGODB_FUNC_DATABASE'] ) {
      this.databaseName = env['MONGODB_FUNC_DATABASE'];
    }

    this.username = env['MONGODB_USER'];
    this.password = env['MONGODB_PASSWORD'];
    
    if(this.username != null && this.password != null){
      println "Authenticating..."
      String connectionString = "mongodb://" + this.username + ":" + this.password + "@" + this.host + "/?authSource=" + this.databaseName;
      MongoClientURI uri = new MongoClientURI(connectionString);
      println connectionString
      this.client = new MongoClient(uri);
      println "Authenticated successfully!"
    } else {
      this.client = new MongoClient(this.host, this.port);
    }

    this.db = client.getDB(this.databaseName);
  }

  /**
   * @return the database instance used by this manager.
   */
  public getDB() {
    return this.db;
  }

  /**
   * Gets the fixture and returns the json object.
   * @param fixture file name (required).
   * @return a List of the fixture data or null if no data file is found.
   */
  public List getFixture(String fixtureName) {
    if(!fixtureName.endsWith(".json")) {
      fixtureName += ".json";
    }

    try {
      def String fixtureFilePath = [fixtureDataFolderPath, fixtureName].join('/');
      def File fixtureFile = new File(fixtureFilePath);
      return new JsonSlurper().parseText(fixtureFile.getText());
    } catch (FileNotFoundException e) {
      println("Could not find fixture data file: ${fixtureFile.absolutePath}");
      return null;
    }
  }

  /**
   * Inserts all fixture data contained within the matching data file, if one exists.
   * @param fixtureName the name of the json data file.  Specifying the ".json" file extension is optional.
   */
  public insertFixture(final String fixtureName) {
    insert(getFixture(fixtureName));
  }

  /**
   * Inserts all fixture data contained within the passed fixtureData parameter.
   * @param fixtureData a List of fixture data elements.
   *
   * Example:
   *  fixtureData = [
   *    [
   *      "collection": "someCollection",
   *      "records": [
   *        [
   *          "firstName": "jon",
   *          "lastName": "smith",
   *          "address": [
   *            "street": "123 fake street",
   *            "postal": "A1A 1A1"
   *          ]
   *        ]
   *      ]
   *    ]
   *  ]
   */
  public insertFixture(final List fixtureData) {
    insert(fixtureData);
  }

  /**
   * Removes all fixture data contained within the matching data file, if one exists.
   * @param fixtureName the name of the json data file.  Specifying the ".json" file extension is optional.
   */
  public removeFixture(final String fixtureName) {
    remove(getFixture(fixtureName));
  }

  /**
   * Removes the fixture data contained within the passed fixtureData parameter.
   * @param fixtureData a List of fixture data elements.
   *
   * Example:
   *  fixtureData = [
   *    [
   *      "collection": "someCollection",
   *      "records": [
   *        [
   *          "firstName": "jon",
   *          "lastName": "smith",
   *          "address": [
   *            "street": "123 fake street",
   *            "postal": "A1A 1A1"
   *          ]
   *        ]
   *      ]
   *    ]
   *  ]
   */
  public removeFixture(final List fixtureData) {
    remove(fixtureData);
  }

  /**
   * Removes all fixture data that was inserted via the FixtureManager#insertFixture methods and
   * which has not already been removed via the FixtureManager#removeFixture methods.
   */
  public removeAll() {
    fixtureDataInserted.each {
      item ->
        item.records.each {
          record ->
            BasicDBObject basicObject = new BasicDBObject()
            record.each {
              key, value -> basicObject.put(key, value)
            }
            db.getCollection(item.collection).remove(basicObject, WriteConcern.SAFE)
        }
    }
    fixtureDataInserted.clear();
  }

  private insert(final List fixtureData) {
    fixtureData.each {
      item ->
        item.records.each {
          record ->
            BasicDBObject basicObject = new BasicDBObject()
            record.each {
              key, value -> basicObject.put(key, value)
            }
            db.getCollection(item.collection).insert(basicObject, WriteConcern.SAFE)
            fixtureDataInserted.add([collection: item.collection, records: [record]]);
        }
    }
  }

  private remove(final String fixtureData) {
    fixtureData.each {
      item ->
        item.records.each {
          record ->
            BasicDBObject basicObject = new BasicDBObject()
            record.each {
              key, value -> basicObject.put(key, value)
            }
            db.getCollection(item.collection).remove(basicObject, WriteConcern.SAFE)
            if(fixtureDataInserted.contains(item)) {
              fixtureDataInserted.remove(item);
            }
        }
    }
  }
}
