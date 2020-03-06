const fs = require("fs");
const crypto = require("crypto");
const util = require('util');

// Promisify converts a callback based function into a fxn that return promise
const scrypt = util.promisify(crypto.scrypt);

class UsersRepository {
  constructor(filename) {
    if (!filename) {
      throw new Error("Creating a repository requires a filename");
    }

    this.filename = filename;

    try {
      fs.accessSync(this.filename); // To Check whether the file exists
    } catch (err) {
      fs.writeFileSync(this.filename, "[]"); // If the file is not present it will create a new file with the filename
    }
  }

  async getAll() {
    // Open the file named this.filename
    // Read the contents of this file
    // Parse the contents
    // Return the parsed data
    return JSON.parse(
      await fs.promises.readFile(this.filename, {
        encoding: "utf8"
      })
    );
  }

  async writeAll(records) {
    // write the updated data back to this.filename
    await fs.promises.writeFile(
      this.filename,
      JSON.stringify(records, null, 2)
    );

    // 2nd argument(null) -> Custom formatter on how the file should be evaluated

    // 3rd argument (2) -> level of indentation in the file
    //  ( If we dont provide this argument everyhting will be printed in one file)
  }

  async create(attributes) {
    attributes.id = this.randomId();

    // Converting normal password to hashed password
    const salt = crypto.randomBytes(8).toString('hex');
    const hashed = await scrypt(attributes.password, salt, 64);

    const records = await this.getAll();
    const record =  {
      ...attributes,
      password: `${hashed.toString('hex')}.${salt}` // . -> tells where the hashed password ends
                                              // and where the salt starts(We can use anything not necessarily .)
    }
    records.push(record);

    await this.writeAll(records);

    return record;
  }

  async getOne(id) {
    const records = await this.getAll();
    return records.find(record => record.id === id);
  }

  async update(is, attributes) {
    const records = await this.getAll();
    const record = recods.find(record => record.id === id);

    if (!record) {
      throw new Error(`Record with id ${id} not found`);
    }

    Object.assign(record, attributes);
    await this.writeAll(records);
  }

  async getOneBy(filters) {
    const records = await this.getAll();

    for (let record of records) {
      let found = true;

      for (let key in filters) {
        if (record[key] != filters[key]) {
          found = false;
        }
      }
      if (found) {
        return record;
      }
    }
  }

  async delete(id) {
    const records = await this.getAll();
    const filteredRecords = records.filter(record => record.id !== id);
    await this.writeAll(filteredRecords);
  }

  randomId() {
    return crypto.randomBytes(4).toString('hex');
  }

  async comparePasswords(savedPassword, suppliedPassword){
    // savedPassword -> password saved in out database. 'hashed.salt'
    // suppliedPassword -> password given to us by the user trying to sign in

    // Destructuring
    const [hashed, salt] = savedPassword.split('.');

    const hashedSupplied = await scrypt(suppliedPassword, salt, 64);

    return hashed === hashedSupplied.toString('hex');  // As scrypt returns a buffer
  }

}



// Exporting an instance of the class instead of the class itself
// (As in all the importing files we have to make a new instance and ourself
// and could accidently write the name of file(users.json wrong)
module.exports = new UsersRepository("users.json");
