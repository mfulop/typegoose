import { Genders } from '__tests__/enums/genders';
import { Car as CarType, model as Car } from '__tests__/models/car';
import { AddressNested, PersonNested, PersonNestedModel } from '__tests__/models/nested-object';
import { model as Person } from '__tests__/models/person';
import { User as UserType, model as User } from '__tests__/models/user';
import { initDatabase, closeDatabase } from '__tests__/utils/mongoConnect';
import { Decimal128 } from 'bson';
import * as mongoose from 'mongoose';
import { getClassForDocument } from 'src/utils';
import * as _ from 'lodash';

describe('utils', () => {
  beforeEach(() => initDatabase());
  afterEach(() => closeDatabase());

  it('should return correct class type for document', async () => {
    const car = await Car.create({
      model: 'Tesla',
      price: Decimal128.fromString('50123.25'),
    });
    const carReflectedType = getClassForDocument(car);
    expect(carReflectedType).toEqual(CarType);

    const user = await User.create({
      _id: mongoose.Types.ObjectId(),
      firstName: 'John2',
      lastName: 'Doe2',
      gender: Genders.MALE,
      languages: ['english2', 'typescript2'],
    });
    const userReflectedType = getClassForDocument(user);
    expect(userReflectedType).toEqual(UserType);

    // assert negative to be sure (false positive)
    expect(carReflectedType).not.toEqual(UserType);
    expect(userReflectedType).not.toEqual(CarType);
  });

  it('should use inherited schema', async () => {
    let user = await Person.create({
      email: 'my@email.com',
    });

    const car = await Car.create({
      model: 'Tesla',
      price: Decimal128.fromString('50123.25'),
    });

    await user.addCar(car);

    user = await Person.findById(user.id).populate('cars');

    // verify properties
    expect(user).toHaveProperty('createdAt');
    expect(user.email).toEqual('my@email.com');

    expect(user.cars.length).toBeGreaterThan(0);
    _.map(user.cars, (currentCar: CarType) => {
      expect(currentCar.model).toBeTruthy();
    });

    // verify methods
    expect(user.getClassName()).toEqual('Person');
    expect(Person.getStaticName()).toEqual('Person');
  });

  it('Should store nested address', async () => {
    const personInput = new PersonNested();
    personInput.name = 'Person, Some';
    personInput.address = new AddressNested('A Street 1');
    personInput.moreAddresses = [
      new AddressNested('A Street 2'),
      new AddressNested('A Street 3'),
    ];

    const person = await PersonNestedModel.create(personInput);

    expect(person).toBeDefined();
    expect(person.name).toEqual('Person, Some');
    expect(person.address).toBeDefined();
    expect(person.address.street).toEqual('A Street 1');
    expect(person.moreAddresses).toBeDefined();
    expect(person.moreAddresses.length).toEqual(2);
    expect(person.moreAddresses[0].street).toEqual('A Street 2');
    expect(person.moreAddresses[1].street).toEqual('A Street 3');
  });

  it('Should validate Decimal128', async () => {
    try {
      await Car.create({
        model: 'Tesla',
        price: 'NO DECIMAL',
      });
      fail('Validation must fail.');
    } catch (e) {
      expect(e).toBeInstanceOf((mongoose.Error as any).ValidationError);
    }
    const car = await Car.create({
      model: 'Tesla',
      price: Decimal128.fromString('123.45'),
    });
    const foundCar = await Car.findById(car._id).exec();
    expect(foundCar.price).toBeInstanceOf(Decimal128);
    expect(foundCar.price.toString()).toEqual('123.45');
  });
});
