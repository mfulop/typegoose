import { Car as CarType, model as Car } from '__tests__/models/car';
import { AddressNested, PersonNested, PersonNestedModel } from '__tests__/models/nested-object';
import { model as Person } from '__tests__/models/person';
import { User as UserType, model as User } from '__tests__/models/user';
import { initDatabase, closeDatabase } from '__tests__/utils/mongoConnect';
import { Decimal128 } from 'bson';
import * as mongoose from 'mongoose';
import { getClassForDocument } from 'src/utils';
import * as _ from 'lodash';
import { DogModel, GermanShepherdModel, GermanShepherd, Dog } from '__tests__/models/animals';
import { Genders } from '__tests__/enums/genders';
import { Role } from '__tests__/enums/role';
import { InstanceType } from 'src/typegoose';
import 'jest-extended';

describe('Typegoose', () => {
  beforeEach(async () => {
    await initDatabase();
  });
  afterEach(async () => {
    await closeDatabase();
  });

  it('should work with findOrCreate', async () => {
      const createdUser = await User.findOrCreate({
        firstName: 'Jane',
        lastName: 'Doe',
        gender: Genders.FEMALE,
      });

      expect(createdUser).toBeTruthy();
      expect(createdUser).toHaveProperty('created');
      expect(createdUser.created).toEqual(true);
      expect(createdUser).toHaveProperty('doc');
      expect(createdUser.doc.firstName).toEqual('Jane');

      const foundUser = await User.findOrCreate({
        firstName: 'Jane',
        lastName: 'Doe',
      });

      expect(foundUser).toBeTruthy();
      expect(foundUser).toHaveProperty('created');
      expect(foundUser.created).toEqual(false);
      expect(foundUser).toHaveProperty('doc');
      expect(foundUser.doc.firstName).toEqual('Jane');

  })

  it ('should create a user with references to cars', async () => {
    const car = await Car.create({
      model: 'Tesla',
      price: Decimal128.fromString('50123.25'),
    });

    const [trabant, zastava] = await Car.create([{
      model: 'Trabant',
      price: Decimal128.fromString('28189.25'),
    }, {
      model: 'Zastava',
      price: Decimal128.fromString('1234.25'),
    }]);

    const user = await User.create({
      _id: mongoose.Types.ObjectId(),
      firstName: 'John',
      lastName: 'Doe',
      age: 20,
      uniqueId: 'john-doe-20',
      gender: Genders.MALE,
      role: Role.User,
      job: {
        title: 'Developer',
        position: 'Lead',
        jobType: {
          salary: 5000,
          field: "IT",
        },
      },
      car: car.id,
      languages: ['english', 'typescript'],
      previousJobs: [{
        title: 'Janitor',
      }, {
        title: 'Manager',
      }],
      previousCars: [trabant.id, zastava.id],
    });

    const foundUser = await User
        .findById(user.id)
        .populate('car previousCars')
        .exec();

    expect(foundUser.nick).toEqual('Nothing');
    expect(foundUser.firstName).toEqual( 'John');
    expect(foundUser.lastName).toEqual('Doe');
    expect(foundUser.uniqueId).toEqual('john-doe-20');
    expect(foundUser.age).toEqual(20);
    expect(foundUser.gender).toEqual(Genders.MALE);
    expect(foundUser.role).toEqual(Role.User);
    expect(foundUser.job).toBeDefined();
    expect(foundUser.car).toBeDefined();
    expect(foundUser.languages).toHaveLength(2);
    expect(foundUser.languages).toIncludeAllMembers(['english', 'typescript']);
    expect(foundUser.job.title).toEqual('Developer');
    expect(foundUser.job.position).toEqual('Lead');
    expect(foundUser.job.startedAt).toBeNumber();
    expect(foundUser.job.jobType).not.toHaveProperty('_id');
    expect(foundUser.job.jobType.salary).toEqual(5000);
    expect(foundUser.job.jobType.field).toEqual('IT');
    expect(foundUser.job.jobType.salary).toBeNumber();
    expect((foundUser.car as CarType).model).toEqual('Tesla');
    expect(foundUser.previousJobs).toHaveLength(2);

    expect(foundUser.fullName).toEqual('John Doe');

    const [janitor, manager] = _.sortBy(foundUser.previousJobs, ((job) => job.title));
    expect(janitor.title).toEqual('Janitor');
    expect(manager.title).toEqual('Manager');

    expect(foundUser.previousCars).toHaveLength(2);
    const [foundTrabant, foundZastava] =
        _.sortBy(foundUser.previousCars, (previousCar) => (previousCar as CarType).model);
    expect((foundTrabant as CarType).model).toEqual('Trabant');
    expect((foundTrabant as CarType).isSedan).toEqual(true);
    expect((foundZastava as CarType).model).toEqual('Zastava');
    expect((foundZastava as CarType).isSedan).toBeUndefined();
  });

  it ('should set the first name and last name', async () => {
      const user = await User.create({
        firstName: 'Jane',
        lastName: 'Doe',
        gender: Genders.FEMALE,
        age: 10,
      });
      user.fullName = 'Sherlock Holmes';
      expect(user.firstName).toEqual('Sherlock');
      expect(user.lastName).toEqual('Holmes');
  });

  it ('should increment the age', async () => {
    const user = await User.create({
      firstName: 'Jane',
      lastName: 'Doe',
      gender: Genders.FEMALE,
      age: 10,
    });
    await user.incrementAge();
    expect(user.age).toEqual(11);
  });

  it('should fail to save because of duplicate unique key', async () => {
    let err;
    const uniqueId = 'test';

    await User.ensureIndexes();

    try {
      await User.create({
        _id: mongoose.Types.ObjectId(),
        firstName: 'Bill',
        lastName: 'Z',
        gender: Genders.MALE,
        uniqueId,
      });
      await User.create({
        _id: mongoose.Types.ObjectId(),
        firstName: 'Bill',
        lastName: 'Z',
        gender: Genders.MALE,
        uniqueId,
      });
    } catch (e) {
      err = e;
    }

    expect(err).toBeDefined();
    expect(err.name).toEqual('MongoError');
    expect(err.code).toEqual(11000);
  });

  it('should add a language and job using instance methods', async () => {
    const user = await User.create({
      firstName: 'harry',
      lastName: 'potter',
      gender: Genders.MALE,
      languages: ['english'],
      uniqueId: 'unique-id',
    });
    await user.addJob({ position: 'Dark Wizzard', title: 'Archmage' });
    await user.addJob();
    const savedUser = await user.addLanguage();

    expect(savedUser.languages).toInclude('Hungarian');
    expect(savedUser.previousJobs.length).toBeGreaterThan(0);
    _.map(savedUser.previousJobs, (prevJob) => {
      expect(prevJob.startedAt).toBeTruthy();
    });
  });
});
