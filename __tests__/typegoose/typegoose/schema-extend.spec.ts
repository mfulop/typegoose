import { Dog, GermanShepherd, GermanShepherdModel } from '__tests__/models/animals';
import { closeDatabase, initDatabase } from '__tests__/utils/mongoConnect';
import { InstanceType } from 'src/typegoose';

describe('Extending schemas', () => {
  beforeEach(async () => await initDatabase());
  afterEach(async () => await closeDatabase());

  it('should save mongoose-schema-extend classes under one collection with _type', async () => {
    const germanShepherd = new GermanShepherdModel({ tailLength: 4, furColor: 'blue' });
    await germanShepherd.save();
    expect(germanShepherd._type).toEqual('GermanShepherd');

    const dogs: InstanceType<GermanShepherd> = await GermanShepherdModel.findOne({ tailLength: 4 });

    expect(dogs.getSound());
  });

  it('should use the extended instance method', async () => {
    const germanShepherd = new GermanShepherdModel({ tailLength: 4, furColor: 'blue' });
    await germanShepherd.save();
    const dog: InstanceType<GermanShepherd | Dog> = await GermanShepherdModel.findOne({ tailLength: 4 });

    expect(dog.getSound()).toEqual('im a shepherd');
  });
});
